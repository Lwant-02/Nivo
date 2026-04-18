import { app, BrowserWindow, screen, ipcMain, Tray, nativeImage, Menu } from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'
import { exec } from 'child_process'
import { promisify } from 'util'
import fs from 'fs'
import os from 'os'

const execAsync = promisify(exec)

interface MediaState {
  isPlaying: boolean
  title: string
  artist: string
  album: string
  source: string
  position: number
  duration: number
  albumArt: string | null
}

async function runAppleScript(script: string): Promise<string> {
  const tmpFile = join(os.tmpdir(), 'lume_script.applescript')
  fs.writeFileSync(tmpFile, script)
  const { stdout } = await execAsync(`osascript "${tmpFile}"`)
  return stdout.trim()
}

let lastAlbumArtKey = ''
let cachedAlbumArt: string | null = null

async function getMusicAlbumArt(trackKey: string): Promise<string | null> {
  if (trackKey === lastAlbumArtKey && cachedAlbumArt !== null) return cachedAlbumArt

  const artPath = join(os.tmpdir(), 'lume_art.png')
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
    const result = await runAppleScript(script)
    if (result && fs.existsSync(result)) {
      const data = fs.readFileSync(result)
      const art = `data:image/jpeg;base64,${data.toString('base64')}`
      lastAlbumArtKey = trackKey
      cachedAlbumArt = art
      return art
    }
  } catch {}
  return null
}

const EMPTY_STATE: MediaState = {
  isPlaying: false,
  title: '',
  artist: '',
  album: '',
  source: 'none',
  position: 0,
  duration: 0,
  albumArt: null
}

async function getMediaInfoViaNowPlayingCli(): Promise<MediaState | null> {
  try {
    const { stdout } = await execAsync(
      'nowplaying-cli get title artist album playbackRate elapsedTime duration bundleIdentifier'
    )
    const lines = stdout.trim().split('\n')
    const val = (s: string) => (s && s !== '(null)' ? s : '')

    const title = val(lines[0])
    if (!title) return null

    const artist = val(lines[1])
    const album = val(lines[2])
    const playbackRate = parseFloat(lines[3]) || 0
    const position = parseFloat(lines[4]) || 0
    const duration = parseFloat(lines[5]) || 0
    const bundleId = val(lines[6]).toLowerCase()
    const isPlaying = playbackRate > 0

    let source = 'system'
    if (bundleId.includes('music')) source = 'music'
    else if (bundleId.includes('spotify')) source = 'spotify'

    let albumArt: string | null = null
    if (source === 'music') {
      albumArt = await getMusicAlbumArt(`${title}-${artist}`)
    } else if (source === 'spotify') {
      albumArt = await getSpotifyArtworkUrl()
    }

    return { isPlaying, title, artist, album, source, position, duration, albumArt }
  } catch {
    return null
  }
}

async function getSpotifyArtworkUrl(): Promise<string | null> {
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
    const result = await runAppleScript(script)
    return result || null
  } catch {
    return null
  }
}

async function getMediaInfo(): Promise<MediaState> {
  // Primary: nowplaying-cli reads macOS NowPlayingInfoCenter — works for all apps including browsers
  const fromCli = await getMediaInfoViaNowPlayingCli()
  if (fromCli) return fromCli

  // Fallback: AppleScript for Apple Music / Spotify desktop (when nowplaying-cli not installed)
  const script = `
tell application "System Events"
  set musicRunning to (count of (processes whose name is "Music")) > 0
  set spotifyRunning to (count of (processes whose name is "Spotify")) > 0
end tell

if musicRunning then
  tell application "Music"
    try
      set pState to player state
      if pState is playing or pState is paused then
        set t to current track
        set stateStr to "playing"
        if pState is paused then set stateStr to "paused"
        return "music|" & stateStr & "|" & (name of t) & "|" & (artist of t) & "|" & (album of t) & "|" & (player position as string) & "|" & (duration of t as string)
      end if
    end try
  end tell
end if

if spotifyRunning then
  tell application "Spotify"
    try
      set pState to player state
      if pState is playing or pState is paused then
        set t to current track
        set stateStr to "playing"
        if pState is paused then set stateStr to "paused"
        set artUrl to ""
        try
          set artUrl to artwork url of t
        end try
        return "spotify|" & stateStr & "|" & (name of t) & "|" & (artist of t) & "|" & (album of t) & "|" & (player position as string) & "|" & ((duration of t / 1000) as string) & "|" & artUrl
      end if
    end try
  end tell
end if

return "none"`

  try {
    const result = await runAppleScript(script)
    if (!result || result === 'none') return EMPTY_STATE

    const parts = result.split('|')
    const source = parts[0]
    const isPlaying = parts[1] === 'playing'
    const title = parts[2] || ''
    const artist = parts[3] || ''
    const album = parts[4] || ''
    const position = parseFloat(parts[5]) || 0
    const duration = parseFloat(parts[6]) || 0

    let albumArt: string | null = null
    if (source === 'music') albumArt = await getMusicAlbumArt(`${title}-${artist}`)
    else if (source === 'spotify' && parts[7]) albumArt = parts[7]

    return { isPlaying, title, artist, album, source, position, duration, albumArt }
  } catch {
    return EMPTY_STATE
  }
}

let mainWindow: BrowserWindow | null = null
let settingsWindow: BrowserWindow | null = null
let onboardingWindow: BrowserWindow | null = null
let tray: Tray | null = null

// Notch window
function createWindow(): void {
  const { width: screenWidth } = screen.getPrimaryDisplay().bounds

  mainWindow = new BrowserWindow({
    width: 500,
    height: 400,
    x: Math.floor(screenWidth / 2 - 250),
    y: 0,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    hasShadow: false,
    focusable: false,
    roundedCorners: false,
    titleBarStyle: 'hidden',
    enableLargerThanScreen: true,
    hiddenInMissionControl: true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.mjs'),
      sandbox: false
    }
  })

  mainWindow.setAlwaysOnTop(true, 'status', 21)

  mainWindow.setVisibleOnAllWorkspaces(true, {
    visibleOnFullScreen: true,
    skipTransformProcessType: true
  })

  mainWindow.setWindowButtonVisibility(false)

  mainWindow.setIgnoreMouseEvents(true, { forward: true })

  let hoverActive = false

  const pollInterval = setInterval(() => {
    if (!mainWindow || mainWindow.isDestroyed()) return

    const cursor = screen.getCursorScreenPoint()
    const { x: wx, y: wy, width: ww } = mainWindow.getBounds()

    const pw = hoverActive ? 350 : 270
    const ph = hoverActive ? 240 : 34
    const px = wx + Math.floor((ww - pw) / 2)

    const over =
      cursor.x >= px - 10 && cursor.x <= px + pw + 10 && cursor.y >= wy && cursor.y <= wy + ph + 10

    if (over && !hoverActive) {
      hoverActive = true
      mainWindow.setIgnoreMouseEvents(false)
    } else if (!over && hoverActive) {
      hoverActive = false
      mainWindow.setIgnoreMouseEvents(true, { forward: true })
    }
  }, 16)

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  mainWindow.on('closed', () => {
    clearInterval(pollInterval)
    mainWindow = null
  })
}

// Settings window
function createSettingsWindow(): void {
  if (settingsWindow) {
    settingsWindow.focus()
    return
  }

  const { width, height } = screen.getPrimaryDisplay().bounds

  settingsWindow = new BrowserWindow({
    width: 850,
    height: 600,
    x: Math.floor(width / 2 - 425),
    y: Math.floor(height / 2 - 300),
    resizable: true,
    show: false,
    titleBarStyle: 'hiddenInset',
    vibrancy: 'under-window',
    visualEffectState: 'active',
    webPreferences: {
      preload: join(__dirname, '../preload/index.mjs'),
      sandbox: false
    }
  })

  if (process.env['ELECTRON_RENDERER_URL']) {
    settingsWindow.loadURL(`${process.env['ELECTRON_RENDERER_URL']}#/settings`)
  } else {
    settingsWindow.loadFile(join(__dirname, '../renderer/index.html'), { hash: 'settings' })
  }

  settingsWindow.once('ready-to-show', () => {
    settingsWindow?.show()
    settingsWindow?.focus()
    settingsWindow?.moveTop()
  })

  settingsWindow.on('closed', () => {
    settingsWindow = null
  })
}

// Onboarding window
function createOnboardingWindow(): void {
  if (onboardingWindow) {
    onboardingWindow.focus()
    return
  }

  const { width, height } = screen.getPrimaryDisplay().bounds

  onboardingWindow = new BrowserWindow({
    width: 600,
    height: 500,
    x: Math.floor(width / 2 - 300),
    y: Math.floor(height / 2 - 250),
    resizable: false,
    show: false,
    titleBarStyle: 'hiddenInset',
    vibrancy: 'under-window',
    visualEffectState: 'active',
    webPreferences: {
      preload: join(__dirname, '../preload/index.mjs'),
      sandbox: false
    }
  })

  if (process.env['ELECTRON_RENDERER_URL']) {
    onboardingWindow.loadURL(`${process.env['ELECTRON_RENDERER_URL']}#/onboarding`)
  } else {
    onboardingWindow.loadFile(join(__dirname, '../renderer/index.html'), { hash: 'onboarding' })
  }

  onboardingWindow.once('ready-to-show', () => {
    onboardingWindow?.show()
    onboardingWindow?.focus()
    onboardingWindow?.moveTop()
  })

  onboardingWindow.on('closed', () => {
    onboardingWindow = null
  })
}

// App ready
app.whenReady().then(() => {
  if (app.dock) {
    app.dock.hide()
  }

  const iconPath = join(__dirname, '../../resources/icon.png')
  const trayIcon = nativeImage.createFromPath(iconPath).resize({ width: 18, height: 18 })

  tray = new Tray(trayIcon)

  const contextMenu = Menu.buildFromTemplate([
    { label: 'Settings', click: () => createSettingsWindow() },
    { type: 'separator' },
    { label: 'Quit Lume', click: () => app.quit() }
  ])

  tray.setToolTip('Lume')
  tray.setContextMenu(contextMenu)

  createWindow()

  createOnboardingWindow()
})

ipcMain.handle('open-settings', () => {
  createSettingsWindow()
})

ipcMain.handle('close-onboarding', () => {
  if (onboardingWindow) {
    onboardingWindow.close()
  }
})

ipcMain.handle('get-media-state', async () => {
  return await getMediaInfo()
})

ipcMain.handle('media-play-pause', async () => {
  const script = `
tell application "System Events"
  set musicRunning to (count of (processes whose name is "Music")) > 0
  set spotifyRunning to (count of (processes whose name is "Spotify")) > 0
end tell
if musicRunning then
  tell application "Music" to playpause
else if spotifyRunning then
  tell application "Spotify" to playpause
end if`
  try {
    await runAppleScript(script)
  } catch {}
})

ipcMain.handle('media-next', async () => {
  const script = `
tell application "System Events"
  set musicRunning to (count of (processes whose name is "Music")) > 0
  set spotifyRunning to (count of (processes whose name is "Spotify")) > 0
end tell
if musicRunning then
  tell application "Music" to next track
else if spotifyRunning then
  tell application "Spotify" to next track
end if`
  try {
    await runAppleScript(script)
  } catch {}
})

ipcMain.handle('media-previous', async () => {
  const script = `
tell application "System Events"
  set musicRunning to (count of (processes whose name is "Music")) > 0
  set spotifyRunning to (count of (processes whose name is "Spotify")) > 0
end tell
if musicRunning then
  tell application "Music" to previous track
else if spotifyRunning then
  tell application "Spotify" to previous track
end if`
  try {
    await runAppleScript(script)
  } catch {}
})

ipcMain.handle('get-volume', async () => {
  try {
    const { stdout } = await execAsync('osascript -e "output volume of (get volume settings)"')
    return parseInt(stdout.trim()) || 0
  } catch {
    return 0
  }
})

ipcMain.handle('set-volume', async (_event, level: number) => {
  try {
    await execAsync(`osascript -e "set volume output volume ${Math.round(level)}"`)
  } catch {}
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
