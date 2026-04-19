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
  playbackRate: number
  progress: number
  volume: number
  albumArt: string | null
  duration: number
  position: number
  source: string
}

const EMPTY_STATE: MediaState = {
  title: '',
  artist: '',
  isPlaying: false,
  playbackRate: 0,
  progress: 0,
  volume: 0,
  albumArt: null,
  duration: 0,
  position: 0,
  source: 'system'
}

export class MediaService {
  private binaryPath: string
  private pollingInterval: NodeJS.Timeout | null = null
  private lastState: MediaState = { ...EMPTY_STATE }
  private cachedArt: string | null = null
  private mainWindow: BrowserWindow | null = null
  private lastInteractionTime: number = 0
  private browserArtCache = new Map<string, string>()
  private musicArtCache = new Map<string, string>()
  private spotifyArtCache = new Map<string, string>()
  // For browser sources: track the last known playing state since AppleScript
  // always returns 'unknown' — we toggle it ourselves on user interaction.
  private lastBrowserIsPlaying: boolean = true
  private readonly BROWSER_SOURCES = ['brave', 'chrome', 'safari', 'youtube']

  private cleanBrowserTitle(title: string): { title: string; artist?: string } {
    let cleanTitle = title
      .replace(/^\(\d+\)\s*/, '') // Remove (N) notification
      .replace(/\s*-\s*YouTube$/i, '') // Remove YouTube suffix
      .replace(/\s*-\s*Google Chrome$/i, '')
      .replace(/\s*-\s*Brave$/i, '')
      .trim()

    if (cleanTitle.includes(' - ')) {
      const parts = cleanTitle.split(' - ')
      const potentialArtist = parts[0].trim()
      const potentialTitle = parts.slice(1).join(' - ').trim()
      if (potentialTitle) {
        return { title: potentialTitle, artist: potentialArtist }
      }
    }

    return { title: cleanTitle }
  }

  private async getBrowserURL(source: string): Promise<string | null> {
    const appName =
      source === 'brave' ? 'Brave Browser' : source === 'chrome' ? 'Google Chrome' : 'Safari'
    const script = `tell application "${appName}" to return URL of active tab of front window`
    try {
      return await this.runAppleScript(script)
    } catch {
      return null
    }
  }

  private async getBetterBrowserArtwork(url: string): Promise<string | null> {
    const youtubeId = this.extractYouTubeId(url)
    const artQuery = youtubeId || new URL(url).hostname

    if (this.browserArtCache.has(artQuery)) {
      return this.browserArtCache.get(artQuery) || null
    }

    let artUrl: string | null = null
    if (youtubeId) {
      // Use higher quality thumbnail (hqdefault is 480x360, stable)
      artUrl = `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`
    } else {
      const hostname = new URL(url).hostname
      artUrl = `https://www.google.com/s2/favicons?domain=${hostname}&sz=128`
    }

    if (artUrl) {
      const b64 = await this.fetchImageAsBase64(artUrl)
      if (b64) {
        this.browserArtCache.set(artQuery, b64)
        return b64
      }
    }

    return 'https://img.icons8.com/ios-filled/100/ffffff/music-record.png'
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
    this.ensurePermissions()

    this.pollingInterval = setInterval(async () => {
      if (!window || window.isDestroyed()) return

      // Debounce: Skip polling if user just interacted (allow system to settle)
      if (Date.now() - this.lastInteractionTime < 2000) return

      const pollStart = Date.now()
      const { payload, snapshot } = await this.fetchState()

      // Discard stale in-flight polls: if an interaction happened after this
      // poll started, its snapshot is older than the user's action.
      if (this.lastInteractionTime > pollStart) return
      if (!window || window.isDestroyed()) return

      this.lastState = snapshot
      window.webContents.send('media-update', payload)
    }, 1000)
  }

  private setInteraction() {
    this.lastInteractionTime = Date.now()
  }

  private async runCLI(): Promise<string> {
    const cmd = `"${this.binaryPath}" get title artist playbackRate duration elapsedPlaybackTime bundleIdentifier artworkData volume`
    const opts = { maxBuffer: 1024 * 1024, timeout: 500 }

    const { stdout } = await execAsync(cmd, opts).catch(() => ({ stdout: '' }))
    console.log('[MediaService] Raw CLI stdout:', JSON.stringify(stdout))

    if (!stdout.trim()) {
      console.log('[MediaService] CLI returned empty — retrying in 200ms')
      await new Promise((r) => setTimeout(r, 200))
      const { stdout: retry } = await execAsync(cmd, opts).catch(() => ({ stdout: '' }))
      console.log('[MediaService] Raw CLI stdout (retry):', JSON.stringify(retry))
      return retry
    }

    return stdout
  }

  private async fetchState(): Promise<{ payload: MediaState; snapshot: MediaState }> {
    try {
      // 1. Primary Engine: nowplaying-cli
      const stdout = await this.runCLI()

      const lines = stdout.trim().split('\n')
      const val = (s: string) => {
        if (!s) return ''
        const trimmed = s.trim()
        if (trimmed === 'null' || trimmed === '(null)') return ''
        return trimmed
      }

      const title = val(lines[0])
      const durationRaw = val(lines[3])
      const elapsedRaw = val(lines[4])
      const cliVolumeRaw = val(lines[7])

      // Debugging: Log if duration is missing but we have a title
      if (title && !durationRaw) {
        console.log(`[MediaService] Missing duration for: ${title}. CLI Output:`, lines)
      }

      // 2. Engine Selection: If CLI returns junk or nothing, try Fallback (Brave, Spotify, etc.)
      const isJunk = !title || title === '-' || title === 'null' || title === '(null)'
      let finalState: MediaState

      const playbackRateStr = val(lines[2])
      const playbackRate = playbackRateStr ? parseFloat(playbackRateStr) || 0 : 0
      const duration = parseFloat(durationRaw) || 0
      const elapsed = parseFloat(elapsedRaw) || 0
      const isPlaying = playbackRate > 0
      const progress = duration > 0 ? (elapsed / duration) * 100 : 0

      if (isJunk) {
        const fallback = await this.getFallbackState()
        console.log('[MediaService] CLI is junk. Fallback title:', fallback?.title)

        if (fallback) {
          // 2a. Stitch system timing only if CLI reported any
          if (duration > 0 || elapsed > 0) {
            console.log('[MediaService] CLI has timing data:', { duration, elapsed, playbackRate })
            fallback.duration = duration
            fallback.position = elapsed
            fallback.progress = progress
          }

          // 2b. Only trust CLI playback state when the CLI actually reported something.
          // If stdout was empty, playbackRate=0 is a parsing default, not a real signal —
          // so we'd wrongly flip Spotify/Music to paused.
          const cliHasSignal = playbackRateStr !== '' || durationRaw !== '' || elapsedRaw !== ''
          const isBrowserSource = this.BROWSER_SOURCES.includes(fallback.source)

          if (isBrowserSource) {
            // Browsers don't expose player state via AppleScript (always 'unknown').
            // Use our tracked state, toggled only when user clicks play/pause in Lume.
            const titleChanged = fallback.title && fallback.title !== this.lastState?.title
            if (titleChanged) {
              console.log('[MediaService] Browser: new title detected, resetting to playing')
              this.lastBrowserIsPlaying = true
            }
            console.log(
              '[MediaService] Browser: using tracked isPlaying:',
              this.lastBrowserIsPlaying
            )
            fallback.isPlaying = this.lastBrowserIsPlaying
            fallback.playbackRate = this.lastBrowserIsPlaying ? 1 : 0
          } else if (cliHasSignal) {
            console.log('[MediaService] CLI has playback signal — syncing:', {
              playbackRate,
              isPlaying
            })
            fallback.isPlaying = isPlaying
            fallback.playbackRate = playbackRate
          } else {
            console.log(
              '[MediaService] CLI empty — trusting fallback isPlaying:',
              fallback.isPlaying
            )
          }

          finalState = fallback
        } else {
          finalState = { ...EMPTY_STATE, volume: await this.getVolume() }
        }
      } else {
        const artist = val(lines[1])
        console.log('[MediaService] CLI found media:', title, 'isPlaying:', isPlaying)
        const bundleId = val(lines[5]).toLowerCase()
        const artworkData = val(lines[6])

        const volume = cliVolumeRaw ? parseFloat(cliVolumeRaw) * 100 : await this.getVolume()

        let source = 'system'
        if (bundleId.includes('music')) source = 'music'
        else if (bundleId.includes('spotify')) source = 'spotify'
        else if (bundleId.includes('brave')) source = 'brave'
        else if (bundleId.includes('chrome')) source = 'chrome'
        else if (bundleId.includes('safari')) source = 'safari'

        let albumArt: string | null = null
        if (artworkData) {
          console.log('[MediaService] Found system artwork (Base64)')
          albumArt = `data:image/png;base64,${artworkData}`
        } else if (source === 'music') {
          console.log('[MediaService] Fetching Music artwork fallback...')
          albumArt = await this.getMusicAlbumArt(`${title}-${artist}`)
        } else if (source === 'spotify') {
          console.log('[MediaService] Fetching Spotify URL fallback...')
          albumArt = await this.getSpotifyArtworkUrl(`${title}-${artist}`)
        } else if (this.BROWSER_SOURCES.includes(source)) {
          // If CLI finds browser media but no artwork (common), try to get URL and Artwork from fallback logic
          const url = await this.getBrowserURL(source)
          if (url) {
            if (url.includes('youtube.com')) source = 'youtube'
            albumArt = await this.getBetterBrowserArtwork(url)
          }
        }

        finalState = {
          title,
          artist,
          isPlaying,
          playbackRate,
          progress: Math.min(progress, 100),
          volume,
          albumArt,
          duration,
          position: elapsed,
          source
        }
      }

      // Remember the full state (with artwork) before delta-update strips it.
      const snapshot = { ...finalState }

      // 3. Unified Artwork Caching (Delta Update)
      // Only send the b64/url over IPC if it changed, to save bandwidth.
      if (finalState.albumArt === this.cachedArt) {
        finalState.albumArt = null
      } else if (finalState.albumArt) {
        this.cachedArt = finalState.albumArt
      } else {
        this.cachedArt = null
      }

      return { payload: finalState, snapshot }
    } catch (err: any) {
      const fallback = { ...EMPTY_STATE, volume: await this.getVolume() }
      return { payload: fallback, snapshot: fallback }
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
      set mediaSites to {"youtube.com", "spotify.com", "soundcloud.com", "vimeo.com", "twitch.tv", "netflix.com", "music.apple.com", "bilibili.com", "music.amazon.com"}
      
      -- 1. Check current active tab first (high priority)
      set t to active tab of front window
      set u to URL of t
      repeat with s in mediaSites
        if u contains s then
          set sName to "brave"
          if u contains "youtube.com" then set sName to "youtube"
          return sName & "@@@unknown@@@" & (title of t) & "@@@Web Browser@@@0@@@0@@@" & u
        end if
      end repeat

      -- 2. Scan all other windows/tabs
      repeat with w in windows
        repeat with t in tabs of w
          set u to URL of t
          repeat with s in mediaSites
            if u contains s then
              set sName to "brave"
              if u contains "youtube.com" then set sName to "youtube"
              return sName & "@@@unknown@@@" & (title of t) & "@@@Web Browser@@@0@@@0@@@" & u
            end if
          end repeat
        end repeat
      end repeat
    on error
    end try
  end tell
end if

if chromeRunning then
  tell application "Google Chrome"
    try
      set mediaSites to {"youtube.com", "spotify.com", "soundcloud.com", "vimeo.com", "twitch.tv", "netflix.com", "music.apple.com", "bilibili.com", "music.amazon.com"}

      -- 1. Check current active tab first
      set t to active tab of front window
      set u to URL of t
      repeat with s in mediaSites
        if u contains s then
          set sName to "chrome"
          if u contains "youtube.com" then set sName to "youtube"
          return sName & "@@@unknown@@@" & (title of t) & "@@@Web Browser@@@0@@@0@@@" & u
        end if
      end repeat

      -- 2. Scan all other windows/tabs
      repeat with w in windows
        repeat with t in tabs of w
          set u to URL of t
          repeat with s in mediaSites
            if u contains s then
              set sName to "chrome"
              if u contains "youtube.com" then set sName to "youtube"
              return sName & "@@@unknown@@@" & (title of t) & "@@@Web Browser@@@0@@@0@@@" & u
            end if
          end repeat
        end repeat
      end repeat
    on error
    end try
  end tell
end if

if safariRunning then
  tell application "Safari"
    try
      set mediaSites to {"youtube.com", "spotify.com", "soundcloud.com", "vimeo.com", "twitch.tv", "netflix.com", "music.apple.com", "bilibili.com", "music.amazon.com"}
      repeat with w in windows
        repeat with t in tabs of w
          set u to URL of t
          repeat with s in mediaSites
            if u contains s then
              set sName to "safari"
              if u contains "youtube.com" then set sName to "youtube"
              return sName & "@@@unknown@@@" & (name of t) & "@@@Web Browser@@@0@@@0@@@" & u
            end if
          end repeat
        end repeat
      end repeat
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

      // Clean browser titles and map artist
      if (this.BROWSER_SOURCES.includes(source)) {
        const cleaned = this.cleanBrowserTitle(title)
        title = cleaned.title
        if (cleaned.artist) artist = cleaned.artist
      }

      // State Stability Logic:
      const isPlaying = pState.toLowerCase().includes('playing')

      const position = parseFloat(pos) || 0
      const duration = parseFloat(dur) || 0
      const progress = duration > 0 ? (position / duration) * 100 : 0
      const volume = await this.getVolume()

      let albumArt: string | null = null
      if (source === 'music') albumArt = await this.getMusicAlbumArt(`${title}-${artist}`)
      else if (source === 'spotify')
        albumArt = await this.getSpotifyArtworkUrl(`${title}-${artist}`)
      else if (this.BROWSER_SOURCES.includes(source) && url) {
        albumArt = await this.getBetterBrowserArtwork(url)
      }

      return {
        title: title || 'Unknown Title',
        artist: artist || 'Anonymous',
        isPlaying,
        playbackRate: isPlaying ? 1 : 0,
        progress: Math.min(progress, 100),
        volume,
        albumArt,
        duration,
        position,
        source
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
      this.setInteraction()
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
      console.log('[MediaService] Triggering play/pause — source:', this.lastState?.source)
      this.setInteraction()

      const isBrowser = this.BROWSER_SOURCES.includes(this.lastState?.source)

      // For browser sources, track the toggle ourselves since AppleScript can't tell us
      if (isBrowser) {
        this.lastBrowserIsPlaying = !this.lastBrowserIsPlaying
      }

      // Optimistic Update
      if (this.lastState && this.mainWindow) {
        this.lastState.isPlaying = !this.lastState.isPlaying
        this.mainWindow.webContents.send('media-update', this.lastState)
      }

      await this.dispatchControl('playpause')
    } catch (err: any) {
      console.error('[MediaService] Play/Pause failed:', err.message)
    }
  }

  public async next() {
    try {
      console.log('[MediaService] Triggering next — source:', this.lastState?.source)
      this.setInteraction()
      await this.dispatchControl('next')
    } catch (err: any) {
      console.error('[MediaService] Next track failed:', err.message)
    }
  }

  public async previous() {
    try {
      console.log('[MediaService] Triggering previous — source:', this.lastState?.source)
      this.setInteraction()
      await this.dispatchControl('previous')
    } catch (err: any) {
      console.error('[MediaService] Previous track failed:', err.message)
    }
  }

  private async dispatchControl(action: 'playpause' | 'next' | 'previous') {
    const source = this.lastState?.source

    // App-specific: single authoritative command, no double-firing.
    if (source === 'spotify' || source === 'music') {
      const appName = source === 'spotify' ? 'Spotify' : 'Music'
      const cmd =
        action === 'playpause' ? 'playpause' : action === 'next' ? 'next track' : 'previous track'
      await execAsync(`osascript -e 'tell application "${appName}" to ${cmd}'`).catch((err) =>
        console.error(`[MediaService] ${appName} ${cmd} failed:`, err.message)
      )
      return
    }

    // Generic / browser path: try nowplaying-cli first, then system media key fallback.
    const cliCmd =
      action === 'playpause' ? 'togglePlayPause' : action === 'next' ? 'next' : 'previous'
    try {
      await execAsync(`"${this.binaryPath}" ${cliCmd}`)
      console.log(`[MediaService] CLI ${cliCmd} succeeded`)
    } catch {
      console.log('[MediaService] CLI control failed, sending system media key')
      const keyMap = { playpause: 16, next: 17, previous: 19 }
      const keyCode = keyMap[action]
      const mediaKeyScript = `
tell application "System Events"
  key code ${keyCode}
end tell`
      await execAsync(`osascript -e '${mediaKeyScript}'`).catch(() => {})
    }
  }

  private async runAppleScript(script: string): Promise<string> {
    const tmpFile = join(
      os.tmpdir(),
      `lume_service_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.applescript`
    )
    try {
      fs.writeFileSync(tmpFile, script)
      const { stdout } = await execAsync(`osascript "${tmpFile}"`)
      return stdout.trim()
    } finally {
      try {
        fs.unlinkSync(tmpFile)
      } catch {}
    }
  }

  private async getMusicAlbumArt(trackKey: string): Promise<string | null> {
    if (this.musicArtCache.has(trackKey)) return this.musicArtCache.get(trackKey) || null

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
        this.musicArtCache.set(trackKey, art)
        return art
      }
    } catch (err: any) {
      console.error('[MediaService] Music artwork fetch failed:', err.message)
    }
    return null
  }

  private async getSpotifyArtworkUrl(trackKey?: string): Promise<string | null> {
    if (trackKey && this.spotifyArtCache.has(trackKey)) {
      return this.spotifyArtCache.get(trackKey) || null
    }

    const script = `
tell application "System Events"
  set spotifyRunning to (count of (processes whose name is "Spotify")) > 0
end tell
if spotifyRunning then
  tell application "Spotify"
    try
      return (artwork url of current track) as string
    end try
  end tell
end if
return ""`
    try {
      let url = await this.runAppleScript(script)
      console.log('[MediaService] Spotify artwork raw:', JSON.stringify(url))

      if (!url) return null

      if (url.startsWith('spotify:image:')) {
        const id = url.replace('spotify:image:', '')
        url = `https://i.scdn.co/image/${id}`
      }

      if (!url.startsWith('http')) return null

      // Pre-fetch to base64 — the renderer CSP (img-src 'self' data:) blocks
      // direct https URLs, so we inline the artwork as a data URI.
      const b64 = await this.fetchImageAsBase64(url)
      if (!b64) {
        console.log('[MediaService] Spotify artwork fetch returned no bytes for', url)
        return null
      }

      if (trackKey) this.spotifyArtCache.set(trackKey, b64)
      return b64
    } catch (err: any) {
      console.error('[MediaService] Spotify artwork fetch failed:', err.message)
      return null
    }
  }
}
