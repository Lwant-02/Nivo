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
    // Prioritize Homebrew binary on M-series Macs for better metadata stability
    const homebrewPath = '/opt/homebrew/bin/nowplaying-cli'
    this.binaryPath = fs.existsSync(homebrewPath)
      ? homebrewPath
      : app.isPackaged
        ? join(process.resourcesPath, 'bin', 'nowplaying-cli')
        : join(process.cwd(), 'resources', 'bin', 'nowplaying-cli')

    this.ensurePermissions()
  }

  private lastReportedTitle = ''
  private lastReportedDuration = 0

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

  private isFetchingState = false

  public startPolling(window: BrowserWindow) {
    if (this.pollingInterval) clearInterval(this.pollingInterval)
    this.mainWindow = window
    this.ensurePermissions()

    const doPoll = async () => {
      if (!window || window.isDestroyed()) return

      // Debounce: Skip polling if user just interacted (allow system to settle)
      if (Date.now() - this.lastInteractionTime < 2000) return

      // Reentrancy guard
      if (this.isFetchingState) return
      this.isFetchingState = true

      try {
        const pollStart = Date.now()
        const { payload, snapshot } = await this.fetchState()

        if (this.lastInteractionTime > pollStart) return
        if (!window || window.isDestroyed()) return

        this.lastState = snapshot
        window.webContents.send('media-update', payload)
      } finally {
        this.isFetchingState = false
      }
    }

    // Zero-latency initial fetch: fetch immediately on app start
    doPoll()

    this.pollingInterval = setInterval(doPoll, 500)
  }

  private setInteraction() {
    this.lastInteractionTime = Date.now()
  }

  // Single source of truth: nowplaying-cli get-raw dumps the full
  // kMRMediaRemoteNowPlayingInfo dictionary as JSON (including bundleId and
  // base64 artwork). One exec per poll covers every field we need.
  private async fetchRawNowPlaying(): Promise<Record<string, string>> {
    const cmd = `"${this.binaryPath}" get-raw`
    const opts = { maxBuffer: 10 * 1024 * 1024, timeout: 2000 }

    const { stdout } = await execAsync(cmd, opts).catch(() => ({ stdout: '' }))
    const trimmed = stdout.trim()

    if (!trimmed || trimmed === '{}' || trimmed === '{\n}') return {}

    try {
      // 1. JSON path (Modern/Homebrew nowplaying-cli)
      const obj = JSON.parse(trimmed)
      if (obj && typeof obj === 'object') {
        const result: Record<string, string> = {}
        for (const [k, v] of Object.entries(obj)) {
          if (v === null || v === undefined) continue
          result[k] = String(v)
        }
        return result
      }
    } catch {
      // 2. Legacy key = value path fallback
      const result: Record<string, string> = {}
      const pattern = /([A-Za-z_][\w]*)\s*=\s*(?:"((?:[^"\\]|\\.)*)"|([^;]+?))\s*;/g
      let match: RegExpExecArray | null
      while ((match = pattern.exec(trimmed)) !== null) {
        const val = match[2] !== undefined ? match[2].replace(/\\"/g, '"') : match[3].trim()
        result[match[1]] = val
      }
      return result
    }
    return {}
  }

  // Fallback artwork fetch used only if get-raw didn't include base64 art
  // (some nowplaying-cli builds omit it). Cached per track.
  private cliArtCache = new Map<string, string>()
  private async getCliArtwork(trackKey: string): Promise<string | null> {
    if (this.cliArtCache.has(trackKey)) return this.cliArtCache.get(trackKey) || null

    const cmd = `"${this.binaryPath}" get artworkData`
    const opts = { maxBuffer: 4 * 1024 * 1024, timeout: 2000 }
    const { stdout } = await execAsync(cmd, opts).catch(() => ({ stdout: '' }))
    const data = stdout.trim()
    if (!data || data === 'null' || data === '(null)') return null

    const art = `data:image/jpeg;base64,${data}`
    this.cliArtCache.set(trackKey, art)
    return art
  }

  private async fetchState(): Promise<{ payload: MediaState; snapshot: MediaState }> {
    try {
      const raw = await this.fetchRawNowPlaying()

      const title = raw['kMRMediaRemoteNowPlayingInfoTitle'] || ''
      const artist = raw['kMRMediaRemoteNowPlayingInfoArtist'] || ''
      const durationRaw = raw['kMRMediaRemoteNowPlayingInfoDuration'] || ''
      const elapsedRaw = raw['kMRMediaRemoteNowPlayingInfoElapsedTime'] || ''
      const playbackRateStr = raw['kMRMediaRemoteNowPlayingInfoPlaybackRate'] || ''

      const playbackRate = playbackRateStr ? parseFloat(playbackRateStr) || 0 : 0
      const isPlaying = playbackRate > 0

      // Browser Correction: Chrome often reports incorrect durations or "stuck" end-times
      let duration = Math.round((parseFloat(durationRaw) || 0) * 100) / 100
      let elapsed = Math.round((parseFloat(elapsedRaw) || 0) * 100) / 100

      const bundleId = (
        raw['kMRMediaRemoteNowPlayingInfoClientBundleIdentifier'] || ''
      ).toLowerCase()
      const isBrowser =
        bundleId.includes('chrome') || bundleId.includes('brave') || bundleId.includes('safari')

      if (isBrowser) {
        // The "Magic 5:45" (345.136458s) is a known macOS/Chrome stale session artifact.
        const JUNK_VAL = 345.14
        const isChrome = bundleId.includes('chrome')

        // Transition detection: If the title changed but the duration is exactly the same as the previous song's duration,
        // the system dictionary is likely stale (Partial Update).
        const isFirstTrack = this.lastReportedTitle === ''
        const titleChanged = !isFirstTrack && title !== this.lastReportedTitle
        const durationUnchanged = Math.abs(duration - this.lastReportedDuration) < 0.1

        // Sanity Check: If isPlaying but position is stuck at the end OR magic junk values
        const isStuckAtEnd = isPlaying && duration > 0 && Math.abs(duration - elapsed) < 0.1
        const matchesJunk = isChrome && Math.abs(duration - JUNK_VAL) < 0.01

        if ((titleChanged && durationUnchanged && duration > 0) || matchesJunk || isStuckAtEnd) {
          console.log(
            '[MediaService] Suspicious timing detected (Stale/Junk/Stuck). Probing fallback...'
          )
          const fallbackTiming = await this.getBrowserTimingFallback()
          if (fallbackTiming.duration > 0) {
            duration = fallbackTiming.duration
            elapsed = fallbackTiming.elapsed
          } else if (matchesJunk || isStuckAtEnd) {
            // Invalidate if it's clearly broken and we have no fallback
            duration = 0
            elapsed = 0
          }
        }

        this.lastReportedTitle = title
        this.lastReportedDuration = duration
      }
      const progress = duration > 0 ? (elapsed / duration) * 100 : 0

      // 2. Engine Selection: If CLI returns junk or nothing, try Fallback (Brave, Spotify, etc.)
      const isJunk = !title || title === '-' || title === 'null' || title === '(null)'
      let finalState: MediaState

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
            // Reached only when CLI failed entirely (MediaRemote didn't register
            // the browser tab, e.g. site without MediaSession). Use tracked state,
            // toggled when the user clicks play/pause inside Lume.
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
        const artistName = artist
        console.log('[MediaService] CLI found media:', title, 'isPlaying:', isPlaying)

        const trackKey = `${title}-${artistName}`
        const bundleId = (
          raw['kMRMediaRemoteNowPlayingInfoClientBundleIdentifier'] || ''
        ).toLowerCase()

        let source = 'system'
        if (bundleId.includes('music')) source = 'music'
        else if (bundleId.includes('spotify')) source = 'spotify'
        else if (bundleId.includes('brave')) source = 'brave'
        else if (bundleId.includes('chrome')) source = 'chrome'
        else if (bundleId.includes('safari')) source = 'safari'

        // Artwork: prefer raw data from kMRMediaRemoteNowPlayingInfoArtworkData
        // (Cleaned of escaped slashes if they exist)
        let albumArt: string | null = null
        const rawArt = raw['kMRMediaRemoteNowPlayingInfoArtworkData']
        if (rawArt && rawArt.length > 100) {
          const cleanB64 = rawArt.replace(/\\\//g, '/')
          albumArt = `data:image/jpeg;base64,${cleanB64}`
        } else {
          albumArt = await this.getCliArtwork(trackKey)
        }

        // Source Refinement: Check if browser tab is actually YouTube or other specific media sites
        if (this.BROWSER_SOURCES.includes(source)) {
          const url = await this.getBrowserURL(source)
          if (url) {
            if (url.includes('youtube.com')) source = 'youtube'
            else if (url.includes('music.apple.com')) source = 'music'
            else if (url.includes('open.spotify.com')) source = 'spotify'

            // If we still don't have artwork, try to get it from the URL
            if (!albumArt) {
              albumArt = await this.getBetterBrowserArtwork(url)
            }
          }
        }

        if (!albumArt) {
          if (source === 'music') {
            albumArt = await this.getMusicAlbumArt(trackKey)
          } else if (source === 'spotify') {
            albumArt = await this.getSpotifyArtworkUrl(trackKey)
          }
        }

        const volume = await this.getVolume()

        finalState = {
          title,
          artist,
          isPlaying,
          playbackRate,
          progress: Math.min(progress, 100),
          volume,
          albumArt,
          duration,
          position: Math.min(elapsed, duration),
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

  private async getBrowserTimingFallback(): Promise<{ duration: number; elapsed: number }> {
    const script = `
tell application "System Events"
	set chromeRunning to (count of (processes whose name is "Google Chrome")) > 0
	set braveRunning to (count of (processes whose name is "Brave Browser")) > 0
end tell

if chromeRunning then
	tell application "Google Chrome"
		try
			set tabName to title of active tab of front window
			return tabName
		end try
	end tell
else if braveRunning then
	tell application "Brave Browser"
		try
			set tabName to title of active tab of front window
			return tabName
		end try
	end tell
end if
return ""
`
    try {
      const title = await this.runAppleScript(script)
      // Extract (M:SS) or (MM:SS) or (H:MM:SS) from title
      const match = title.match(/\((\d+:)?(\d+):(\d+)\)/)
      if (match) {
        const h = match[1] ? parseInt(match[1].replace(':', '')) : 0
        const m = parseInt(match[2])
        const s = parseInt(match[3])
        return { duration: h * 3600 + m * 60 + s, elapsed: 0 }
      }
    } catch {}
    return { duration: 0, elapsed: 0 }
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
return ""
`
    try {
      let url = await this.runAppleScript(script)
      if (!url) return null

      if (url.startsWith('spotify:image:')) {
        const id = url.replace('spotify:image:', '')
        url = `https://i.scdn.co/image/${id}`
      }

      if (!url.startsWith('http')) return null

      // Pre-fetch to base64 for CSP compliance
      const b64 = await this.fetchImageAsBase64(url)
      if (b64 && trackKey) {
        this.spotifyArtCache.set(trackKey, b64)
      }
      return b64
    } catch (err: any) {
      console.error('[MediaService] Spotify artwork fetch failed:', err.message)
      return null
    }
  }
}
