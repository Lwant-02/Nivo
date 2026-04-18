import { app, BrowserWindow } from 'electron'
import { join } from 'path'
import { exec } from 'child_process'
import { promisify } from 'util'
import fs from 'fs'
import os from 'os'
import https from 'https'

const execAsync = promisify(exec)

export interface MediaState {
  title: string
  artist: string
  isPlaying: boolean
  progress: number
  volume: number
  albumArt: string | null
  duration: number
  position: number
}

const EMPTY_STATE: MediaState = {
  title: '',
  artist: '',
  isPlaying: false,
  progress: 0,
  volume: 0,
  albumArt: null,
  duration: 0,
  position: 0
}

export class MediaService {
  private binaryPath: string
  private pollingInterval: NodeJS.Timeout | null = null
  private lastState: MediaState = { ...EMPTY_STATE }
  private lastArtKey: string = ''
  private cachedArt: string | null = null
  private mainWindow: BrowserWindow | null = null
  private lastInteractionTime: number = 0
  private browserArtCache = new Map<string, string>()

  constructor() {
    this.binaryPath = app.isPackaged
      ? join(process.resourcesPath, 'bin', 'nowplaying-cli')
      : join(process.cwd(), 'resources', 'bin', 'nowplaying-cli')

    this.ensurePermissions()
  }

  private async ensurePermissions() {
    if (!fs.existsSync(this.binaryPath)) {
      console.error('[MediaService] Binary not found at:', this.binaryPath)
      return
    }

    try {
      await execAsync(`xattr -d com.apple.quarantine "${this.binaryPath}"`)
    } catch {}

    try {
      await execAsync(`chmod +x "${this.binaryPath}"`)
    } catch (err: any) {
      console.error('[MediaService] Failed to set permissions:', err.message)
    }
  }

  public startPolling(window: BrowserWindow) {
    if (this.pollingInterval) clearInterval(this.pollingInterval)
    this.mainWindow = window

    this.pollingInterval = setInterval(async () => {
      if (!window || window.isDestroyed()) return

      // Debounce: Skip polling if user just interacted (allow system to settle)
      if (Date.now() - this.lastInteractionTime < 2000) return

      const state = await this.fetchState()
      window.webContents.send('media-update', state)
    }, 1000)
  }

  private setInteraction() {
    this.lastInteractionTime = Date.now()
  }

  private async fetchState(): Promise<MediaState> {
    try {
      // 1. Primary Engine: nowplaying-cli
      const { stdout } = await execAsync(
        `"${this.binaryPath}" get title artist playbackRate duration elapsedPlaybackTime bundleIdentifier artworkData`,
        { maxBuffer: 10 * 1024 * 1024 }
      ).catch(() => ({ stdout: '' }))

      const lines = stdout.trim().split('\n')
      const val = (s: string) => {
        if (!s) return ''
        const trimmed = s.trim()
        if (trimmed === 'null' || trimmed === '(null)') return ''
        return trimmed
      }

      const title = val(lines[0])

      // 2. Engine Selection: If CLI returns junk or nothing, try Fallback (Brave, Spotify, etc.)
      const isJunk = !title || title === '-' || title === 'null' || title === '(null)'
      let finalState: MediaState

      if (isJunk) {
        const fallback = await this.getFallbackState()
        if (fallback) {
          finalState = fallback
        } else {
          finalState = { ...EMPTY_STATE, volume: await this.getVolume() }
        }
      } else {
        const artist = val(lines[1])
        const playbackRateStr = val(lines[2])
        const playbackRate = playbackRateStr ? parseFloat(playbackRateStr) || 0 : 0
        const duration = parseFloat(val(lines[3])) || 0
        const elapsed = parseFloat(val(lines[4])) || 0
        const bundleId = val(lines[5]).toLowerCase()
        const artworkData = val(lines[6])

        const isPlaying = playbackRate > 0
        const progress = duration > 0 ? (elapsed / duration) * 100 : 0
        const volume = await this.getVolume()

        let source = 'system'
        if (bundleId.includes('music')) source = 'music'
        else if (bundleId.includes('spotify')) source = 'spotify'

        let albumArt: string | null = null
        if (artworkData) {
          albumArt = `data:image/png;base64,${artworkData}`
        } else if (source === 'music') {
          albumArt = await this.getMusicAlbumArt(`${title}-${artist}`)
        } else if (source === 'spotify') {
          albumArt = await this.getSpotifyArtworkUrl()
        }

        finalState = {
          title,
          artist,
          isPlaying,
          progress: Math.min(progress, 100),
          volume,
          albumArt,
          duration,
          position: elapsed
        }
      }

      // 3. Unified Artwork Caching (Delta Update)
      // Only send the b64/url if it has changed to save bandwidth
      if (finalState.albumArt === this.cachedArt) {
        finalState.albumArt = null
      } else if (finalState.albumArt) {
        this.cachedArt = finalState.albumArt
      } else {
        this.cachedArt = null
      }

      this.lastState = finalState
      return finalState
    } catch (err: any) {
      return { ...EMPTY_STATE, volume: await this.getVolume() }
    }
  }

  private async getFallbackState(): Promise<MediaState | null> {
    const script = `
tell application "System Events"
  set musicRunning to (count of (processes whose name is "Music")) > 0
  set spotifyRunning to (count of (processes whose name is "Spotify")) > 0
  set braveRunning to (count of (processes whose name is "Brave Browser")) > 0
  set chromeRunning to (count of (processes whose name is "Google Chrome")) > 0
  set safariRunning to (count of (processes whose name is "Safari")) > 0
end tell

if musicRunning then
  tell application "Music"
    if player state is playing or player state is paused then
      set t to current track
      return "music@@@" & (player state as string) & "@@@" & (name of t) & "@@@" & (artist of t) & "@@@" & (player position as string) & "@@@" & (duration of t as string) & "@@@"
    end if
  end tell
end if

if spotifyRunning then
  tell application "Spotify"
    if player state is playing or player state is paused then
      set t to current track
      return "spotify@@@" & (player state as string) & "@@@" & (name of t) & "@@@" & (artist of t) & "@@@" & (player position as string) & "@@@" & (duration of t / 1000 as string) & "@@@"
    end if
  end tell
end if

if braveRunning then
  tell application "Brave Browser"
    try
      set t to title of active tab of front window
      set u to URL of active tab of front window
      set pState to "paused"
      try
        if audible of active tab of front window then set pState to "playing"
      on error
        set pState to "static"
      end try
      return "browser@@@" & pState & "@@@" & t & "@@@Web Browser@@@0@@@0@@@" & u
    on error
    end try
  end tell
end if

if chromeRunning then
  tell application "Google Chrome"
    try
      set t to title of active tab of front window
      set u to URL of active tab of front window
      set pState to "paused"
      try
        if audible of active tab of front window then set pState to "playing"
      on error
        set pState to "static"
      end try
      return "browser@@@" & pState & "@@@" & t & "@@@Web Browser@@@0@@@0@@@" & u
    on error
    end try
  end tell
end if

if safariRunning then
  tell application "Safari"
    try
      set t to name of front document
      set u to URL of front document
      return "browser@@@static@@@" & t & "@@@Web Browser@@@0@@@0@@@" & u
    on error
    end try
  end tell
end if

return "none"`

    try {
      const result = await this.runAppleScript(script)
      if (!result || result === 'none') return null

      // eslint-disable-next-line prefer-const
      let [source, pState, title, artist, pos, dur, url] = result.split('@@@')

      // Clean browser titles: "(326) Artist - Title - YouTube" -> "Artist - Title"
      if (source === 'browser') {
        title = title.replace(/^\(\d+\)\s*/, '') // Remove (N) notification
        title = title.replace(/\s*-\s*YouTube$/i, '') // Remove YouTube suffix

        // Try splitting by " - ", but keep whole title if split fails
        if (title.includes(' - ')) {
          const parts = title.split(' - ')
          artist = parts[0].trim()
          title = parts.slice(1).join(' - ').trim()
        } else {
          artist = 'Anonymous'
        }
      }

      // State Stability Logic:
      // If pState is 'static', we trust the last known state instead of flipping it.
      let isPlaying = pState.toLowerCase().includes('playing')
      if (pState.toLowerCase() === 'static' && this.lastState) {
        isPlaying = this.lastState.isPlaying
      }

      const position = parseFloat(pos) || 0
      const duration = parseFloat(dur) || 0
      const progress = duration > 0 ? (position / duration) * 100 : 0
      const volume = await this.getVolume()

      let albumArt: string | null = null
      if (source === 'music') albumArt = await this.getMusicAlbumArt(`${title}-${artist}`)
      else if (source === 'spotify') albumArt = await this.getSpotifyArtworkUrl()
      else if (source === 'browser' && url) {
        // Intelligent YouTube Artwork
        const youtubeId = this.extractYouTubeId(url)

        if (youtubeId) {
          const thumbnailUrl = `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`

          if (this.browserArtCache.has(youtubeId)) {
            albumArt = this.browserArtCache.get(youtubeId) || null
          } else {
            const b64 = await this.fetchImageAsBase64(thumbnailUrl)
            if (b64) {
              albumArt = b64
              this.browserArtCache.set(youtubeId, b64)
            }
          }
        }

        if (!albumArt) {
          albumArt = 'https://img.icons8.com/ios-filled/100/ffffff/music-record.png'
        }
      }

      return {
        title: title || 'Unknown Title',
        artist: artist || 'Anonymous',
        isPlaying,
        progress: Math.min(progress, 100),
        volume,
        albumArt,
        duration,
        position
      }
    } catch {
      return null
    }
  }

  private extractYouTubeId(url: string): string | null {
    if (!url) return null
    const patterns = [/(?:v=|\/v\/|embed\/|youtu\.be\/|shorts\/)([^#&?/]*)/]
    for (const pattern of patterns) {
      const match = url.match(pattern)
      if (match && match[1].length === 11) {
        return match[1]
      }
    }
    return null
  }

  private async getVolume(): Promise<number> {
    try {
      const { stdout } = await execAsync('osascript -e "output volume of (get volume settings)"')
      return parseInt(stdout.trim()) || 0
    } catch {
      return 0
    }
  }

  public async setVolume(level: number) {
    try {
      console.log(`[MediaService] Setting volume to: ${level}`)
      await execAsync(`osascript -e "set volume output volume ${Math.round(level)}"`)
      if (this.lastState && this.mainWindow) {
        this.lastState.volume = level
        this.mainWindow.webContents.send('media-update', this.lastState)
      }
    } catch (err: any) {
      console.error('[MediaService] Volume set failed:', err.message)
    }
  }

  public async playPause() {
    try {
      console.log('[MediaService] Triggering play/pause (Hybrid + Debounce)')
      this.setInteraction()

      // Optimistic Update
      if (this.lastState && this.mainWindow) {
        this.lastState.isPlaying = !this.lastState.isPlaying
        this.mainWindow.webContents.send('media-update', this.lastState)
      }

      await execAsync(`"${this.binaryPath}" togglePlayPause`).catch(() => {})

      // Fallback Scripts
      const fallbackScript = `
        tell application "System Events"
          if (count of (processes whose name is "Music")) > 0 then tell application "Music" to playpause
          if (count of (processes whose name is "Spotify")) > 0 then tell application "Spotify" to playpause
          if (count of (processes whose name is "Brave Browser")) > 0 then 
            tell process "Brave Browser" to keystroke (ASCII character 32)
          end if
          if (count of (processes whose name is "Google Chrome")) > 0 then 
            tell process "Google Chrome" to keystroke (ASCII character 32)
          end if
        end tell`
      await execAsync(`osascript -e '${fallbackScript}'`).catch(() => {})
    } catch (err: any) {
      console.error('[MediaService] Play/Pause failed:', err.message)
    }
  }

  public async next() {
    try {
      console.log('[MediaService] Triggering next (Hybrid + Debounce)')
      this.setInteraction()

      await execAsync(`"${this.binaryPath}" next`).catch(() => {})
      const nextScript = `
        tell application "System Events"
          if (count of (processes whose name is "Music")) > 0 then tell application "Music" to next track
          if (count of (processes whose name is "Spotify")) > 0 then tell application "Spotify" to next track
        end tell`
      await execAsync(`osascript -e '${nextScript}'`).catch(() => {})
    } catch (err: any) {
      console.error('[MediaService] Next track failed:', err.message)
    }
  }

  public async previous() {
    try {
      this.setInteraction()

      await execAsync(`"${this.binaryPath}" previous`).catch(() => {})
      const prevScript = `
        tell application "System Events"
          if (count of (processes whose name is "Music")) > 0 then tell application "Music" to previous track
          if (count of (processes whose name is "Spotify")) > 0 then tell application "Spotify" to previous track
        end tell`
      await execAsync(`osascript -e '${prevScript}'`).catch(() => {})
    } catch (err: any) {
      console.error('[MediaService] Previous track failed:', err.message)
    }
  }

  private async runAppleScript(script: string): Promise<string> {
    const tmpFile = join(os.tmpdir(), 'lume_service.applescript')
    fs.writeFileSync(tmpFile, script)
    const { stdout } = await execAsync(`osascript "${tmpFile}"`)
    return stdout.trim()
  }

  private async getMusicAlbumArt(trackKey: string): Promise<string | null> {
    if (trackKey === this.lastArtKey && this.cachedArt !== null) return this.cachedArt
    const artPath = join(os.tmpdir(), 'lume_service_art.png')
    const script = `
tell application "Music"
  try
    set t to current track
    set artData to data of artwork 1 of t
    set artFile to "${artPath}"
    set fileRef to open for access POSIX file artFile with write permission
    set eof fileRef to 0
    write artData to fileRef
    close access fileRef
    return artFile
  on error
    return ""
  end try
end tell`
    try {
      const result = await this.runAppleScript(script)
      if (result && fs.existsSync(result)) {
        const data = fs.readFileSync(result)
        const art = `data:image/jpeg;base64,${data.toString('base64')}`
        this.lastArtKey = trackKey
        this.cachedArt = art
        return art
      }
    } catch {}
    return null
  }

  private async getSpotifyArtworkUrl(): Promise<string | null> {
    const script = `
tell application "System Events"
  set spotifyRunning to (count of (processes whose name is "Spotify")) > 0
end tell
if spotifyRunning then
  tell application "Spotify"
    try
      return artwork url of current track
    end try
  end tell
end if
return ""`
    try {
      const result = await this.runAppleScript(script)
      return result || null
    } catch {
      return null
    }
  }

  private fetchImageAsBase64(url: string): Promise<string | null> {
    return new Promise((resolve) => {
      https
        .get(url, (res) => {
          if (res.statusCode !== 200) {
            resolve(null)
            return
          }

          const data: Buffer[] = []
          res.on('data', (chunk) => data.push(chunk))
          res.on('end', () => {
            const buffer = Buffer.concat(data)
            const type = res.headers['content-type'] || 'image/jpeg'
            resolve(`data:${type};base64,${buffer.toString('base64')}`)
          })
        })
        .on('error', (err) => {
          console.error('[MediaService] Image fetch failed:', err.message)
          resolve(null)
        })
    })
  }
}
