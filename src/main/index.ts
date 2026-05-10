import {
  app,
  // Triggering rebuild for theme expansion
  BrowserWindow,
  screen,
  ipcMain,
  Tray,
  nativeImage,
  Menu,
  powerMonitor,
  shell,
  Notification
} from 'electron'
import { join } from 'path'
import { existsSync, chmodSync } from 'fs'
import { execFile } from 'child_process'
import { is } from '@electron-toolkit/utils'
import { MediaService } from './services/MediaService'
import { AudioService } from './services/AudioService'
import { SettingsService, Settings } from './services/SettingsService'
import { fetchMacEvents } from './services/calendarService'
import { WeatherService } from './services/WeatherService'
import { SonicFeedbackService } from './services/SonicFeedbackService'
import { NotesService, NoteUpdate } from './services/NotesService'
import { ClipboardService } from './services/ClipboardService'
import { BeamService, BeamTileInput } from './services/BeamService'

// Keep the renderer running full-speed even though the notch window is
// non-focusable + always-on-top. Without these, Chromium throttles rAF and
// the music visualizer / drag animations stall in packaged builds.
app.commandLine.appendSwitch('disable-renderer-backgrounding')
app.commandLine.appendSwitch('disable-background-timer-throttling')
app.commandLine.appendSwitch('disable-backgrounding-occluded-windows')
app.commandLine.appendSwitch('disable-features', 'CalculateNativeWinOcclusion')

// Force GPU acceleration for the transparent always-on-top surface.
app.commandLine.appendSwitch('ignore-gpu-blocklist')
app.commandLine.appendSwitch('enable-gpu-rasterization')
app.commandLine.appendSwitch('enable-accelerated-video-decode')
app.commandLine.appendSwitch('enable-zero-copy')

// Sonic Feedback plays Web Audio without an explicit user gesture in the
// non-focusable notch window — Chromium would otherwise suspend the context.
app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required')

let mediaService: MediaService | null = null
let audioService: AudioService | null = null
let settingsService: SettingsService | null = null
let weatherService: WeatherService | null = null
let sonicFeedbackService: SonicFeedbackService | null = null
let notesService: NotesService | null = null
let clipboardService: ClipboardService | null = null
let beamService: BeamService | null = null

let mainWindow: BrowserWindow | null = null
let settingsWindow: BrowserWindow | null = null
let welcomeWindow: BrowserWindow | null = null
let tray: Tray | null = null
let isNotchActive = false

// Notch window
function createMainWindow(): void {
  if (mainWindow) {
    mainWindow.focus()
    return
  }
  const { width: screenWidth } = screen.getPrimaryDisplay().bounds

  mainWindow = new BrowserWindow({
    width: 900,
    height: 400,
    x: Math.floor(screenWidth / 2 - 450),
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
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      backgroundThrottling: false
    }
  })

  mainWindow.setWindowButtonVisibility(false)

  mainWindow.setIgnoreMouseEvents(true, { forward: true })

  applyWindowSettings(mainWindow, settingsService?.getAll() ?? null)

  let hoverActive = false

  ipcMain.on('set-notch-active', (_event, active: boolean) => {
    isNotchActive = active
    if (mainWindow) applyWindowSettings(mainWindow, settingsService?.getAll())
  })

  ipcMain.on('set-notch-editing', (_event, editing: boolean) => {
    if (!mainWindow || mainWindow.isDestroyed()) return
    // The notch is normally non-focusable so it doesn't steal focus from
    // the user's app. Inputs need keyboard focus, so flip it while editing.
    mainWindow.setFocusable(editing)
    if (editing) mainWindow.focus()
  })

  const pollInterval = setInterval(() => {
    if (!mainWindow || mainWindow.isDestroyed()) return

    const cursor = screen.getCursorScreenPoint()
    const { x: wx, y: wy, width: ww } = mainWindow.getBounds()

    // Detect if we are over the notch.
    // The notch is centered in the 800px window.
    // We use a slightly larger area than the actual UI for better UX.
    const pw = hoverActive ? 850 : 300 // Tightened for 816px UI
    const ph = hoverActive ? 260 : 35 // Maintains 230px UI height safety
    const px = wx + Math.floor((ww - pw) / 2)

    const over =
      cursor.x >= px - 5 && cursor.x <= px + pw + 5 && cursor.y >= wy && cursor.y <= wy + ph + 3

    if (over) {
      if (!hoverActive) {
        hoverActive = true
        mainWindow.setAlwaysOnTop(true, 'screen-saver', 1)
        mainWindow.setIgnoreMouseEvents(false)
        mainWindow.setOpacity(1)
      }
    } else {
      hoverActive = false
      if (isNotchActive) {
        mainWindow.setIgnoreMouseEvents(false)
        mainWindow.setOpacity(1)
        mainWindow.setAlwaysOnTop(true, 'screen-saver', 1)
      } else {
        mainWindow.setIgnoreMouseEvents(true, { forward: true })
        const s = settingsService?.getAll()
        const hideFS = !!s?.hideInFullscreen
        const isMediaActive = !!mediaService?.isMediaPlaying()
        const hidePaused = !!s?.hideWhenPaused && !isMediaActive
        const level = hideFS ? 'floating' : 'screen-saver'
        mainWindow.setAlwaysOnTop(true, level, 1)
        mainWindow.setOpacity(hidePaused ? 0 : 1)
      }
    }
  }, 16)

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  // Start media service push model
  if (mediaService) {
    mediaService.startPolling(mainWindow)
  }

  if (audioService) {
    audioService.start(mainWindow)
  }

  mainWindow.on('closed', () => {
    clearInterval(pollInterval)
    mainWindow = null
  })
}

function applyWindowSettings(win: BrowserWindow, settings: Settings | null | undefined): void {
  if (win.isDestroyed()) return
  const s = settings ?? null

  const hideFS = !!s?.hideInFullscreen
  const hidePaused = !!s?.hideWhenPaused && !mediaService?.isMediaPlaying() && !isNotchActive

  // Maintain screen-saver level unless hideInFullscreen is enabled.
  // If the notch is active (expanded due to event), always use screen-saver level
  // so it's visible over fullscreen apps.
  const level: 'screen-saver' | 'floating' = hideFS && !isNotchActive ? 'floating' : 'screen-saver'
  win.setAlwaysOnTop(true, level, 1)

  win.setOpacity(hidePaused ? 0 : 1)

  win.setVisibleOnAllWorkspaces(true, {
    visibleOnFullScreen: true,
    skipTransformProcessType: true
  })
  win.setContentProtection(!!s?.hideFromScreenCapture)
}

function applySonicFeedback(enabled: boolean): void {
  if (!sonicFeedbackService) return
  if (enabled) sonicFeedbackService.start()
  else sonicFeedbackService.stop()
}

function applyClipboardHistory(enabled: boolean): void {
  if (!clipboardService) return
  if (enabled) clipboardService.start()
  else clipboardService.stop()
}

function applyLaunchAtLogin(enabled: boolean): void {
  if (process.platform !== 'darwin' && process.platform !== 'win32') return
  if (is.dev) return
  app.setLoginItemSettings({ openAtLogin: enabled, openAsHidden: true })
}

function broadcastSettings(settings: Settings): void {
  for (const win of BrowserWindow.getAllWindows()) {
    if (!win.isDestroyed()) win.webContents.send('settings-update', settings)
  }
}

// Settings window
function createSettingsWindow(): void {
  if (settingsWindow) {
    settingsWindow.focus()
    return
  }

  settingsWindow = new BrowserWindow({
    width: 650,
    height: 600,
    center: true,
    resizable: true,
    show: false,
    titleBarStyle: 'hiddenInset',
    vibrancy: 'under-window',
    visualEffectState: 'active',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      backgroundThrottling: false
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
  })

  settingsWindow.webContents.on('did-fail-load', () => {
    console.error('[main] Settings window failed to load')
  })

  settingsWindow.on('closed', () => {
    settingsWindow = null
  })
}

// Welcome window
function createWelcomeWindow(): void {
  if (welcomeWindow) {
    welcomeWindow.focus()
    return
  }
  const { width, height } = screen.getPrimaryDisplay().bounds

  welcomeWindow = new BrowserWindow({
    width: 500,
    height: 510,
    x: Math.floor(width / 2 - 250),
    y: Math.floor(height / 2 - 255),
    resizable: false,
    show: false,
    frame: false,
    transparent: true,
    titleBarStyle: 'hiddenInset',
    hasShadow: false,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      backgroundThrottling: false
    }
  })

  if (process.env['ELECTRON_RENDERER_URL']) {
    welcomeWindow.loadURL(`${process.env['ELECTRON_RENDERER_URL']}#/welcome`)
  } else {
    welcomeWindow.loadFile(join(__dirname, '../renderer/index.html'), { hash: 'welcome' })
  }

  welcomeWindow.once('ready-to-show', () => {
    welcomeWindow?.show()
    welcomeWindow?.focus()
  })

  welcomeWindow.webContents.on('did-fail-load', () => {
    console.error('[main] Welcome window failed to load')
  })

  welcomeWindow.on('closed', () => {
    welcomeWindow = null
  })
}

function refreshTrayMenu(): void {
  if (!tray) return

  const template: Electron.MenuItemConstructorOptions[] = [
    { label: `Nivo`, enabled: false },
    { type: 'separator' },
    {
      label: 'Settings...',
      accelerator: 'Command+,',
      click: () => createSettingsWindow()
    },
    { type: 'separator' },
    {
      label: 'Quit Nivo',
      accelerator: 'Command+Q',
      click: () => app.quit()
    }
  ]

  tray.setContextMenu(Menu.buildFromTemplate(template))
}

// App ready
app.whenReady().then(() => {
  try {
    settingsService = new SettingsService()
    applyLaunchAtLogin(settingsService.get('launchAtLogin'))
    settingsService.on('change', (next: Settings) => {
      applyLaunchAtLogin(next.launchAtLogin)
      if (mainWindow) applyWindowSettings(mainWindow, next)
      applySonicFeedback(next.sonicFeedback)
      applyClipboardHistory(next.enableClipboardHistory)
      broadcastSettings(next)
    })
  } catch (err: any) {
    console.error('[main] Failed to initialize SettingsService:', err.message)
  }

  try {
    sonicFeedbackService = new SonicFeedbackService(() => mainWindow)
    if (settingsService?.get('sonicFeedback')) {
      sonicFeedbackService.start()
    }
  } catch (err: any) {
    console.error('[main] Failed to initialize SonicFeedbackService:', err.message)
  }

  try {
    mediaService = new MediaService()
  } catch (err: any) {
    console.error('[main] Failed to initialize MediaService:', err.message)
  }

  try {
    audioService = new AudioService()
  } catch (err: any) {
    console.error('[main] Failed to initialize AudioService:', err.message)
  }

  try {
    weatherService = new WeatherService(() => {
      const s = settingsService?.getAll()
      if (!s?.weatherLocation || (s.weatherLat === 0 && s.weatherLon === 0)) return null
      return { name: s.weatherLocation, lat: s.weatherLat, lon: s.weatherLon }
    })
  } catch (err: any) {
    console.error('[main] Failed to initialize WeatherService:', err.message)
  }

  try {
    notesService = new NotesService()
  } catch (err: any) {
    console.error('[main] Failed to initialize NotesService:', err.message)
  }

  try {
    clipboardService = new ClipboardService()
    if (settingsService?.get('enableClipboardHistory') ?? true) {
      clipboardService.start()
    }
  } catch (err: any) {
    console.error('[main] Failed to initialize ClipboardService:', err.message)
  }

  try {
    beamService = new BeamService()
  } catch (err: any) {
    console.error('[main] Failed to initialize BeamService:', err.message)
  }

  if (app.dock) {
    app.dock.hide()
  }

  const iconPath = join(__dirname, '../../resources/icon.png')
  const trayIcon = nativeImage.createFromPath(iconPath).resize({ width: 18, height: 18 })

  tray = new Tray(trayIcon)
  tray.setToolTip('Lume')
  refreshTrayMenu()

  // Dim the notch while the Mac is locked so it sits quietly on the
  // lock screen, then restore full opacity on unlock.
  const DIMMED_OPACITY = 0.55
  const setNotchOpacity = (opacity: number): void => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.setOpacity(opacity)
    }
  }
  powerMonitor.on('lock-screen', () => {
    setNotchOpacity(DIMMED_OPACITY)
  })
  powerMonitor.on('unlock-screen', () => {
    setNotchOpacity(1)
  })

  const hasSeenWelcome = settingsService?.get('hasSeenWelcome') ?? false
  if (hasSeenWelcome) {
    createMainWindow()
  } else {
    createWelcomeWindow()
  }
})

ipcMain.handle('get-audio-output', () => audioService?.getState())

ipcMain.handle('get-version', () => app.getVersion())

ipcMain.handle('open-settings', () => {
  createSettingsWindow()
})

ipcMain.handle('welcome:start', () => {
  if (welcomeWindow) {
    welcomeWindow.destroy()
    welcomeWindow = null
  }
  createMainWindow()
  refreshTrayMenu()
  return { ok: true }
})

type MediaCommand = 'playPause' | 'next' | 'previous'

ipcMain.handle('media-control', (_event, command: MediaCommand) => {
  if (!mediaService) return
  switch (command) {
    case 'playPause':
      return mediaService.playPause()
    case 'next':
      return mediaService.next()
    case 'previous':
      return mediaService.previous()
    default:
      console.warn('[main] Unknown media-control command:', command)
      return
  }
})


ipcMain.handle('get-settings', () => {
  return settingsService?.getAll() ?? null
})

ipcMain.handle('update-setting', (_event, key: keyof Settings, value: Settings[keyof Settings]) => {
  if (!settingsService) return null
  return settingsService.set(key, value)
})

ipcMain.handle('get-calendar-events', async () => {
  try {
    const events = await fetchMacEvents()

    return events
  } catch (err: any) {
    console.error('[main] get-calendar-events failed:', err.message)
    return []
  }
})

ipcMain.handle('get-weather', async () => {
  return weatherService?.getAtmosphere() ?? null
})

ipcMain.handle('weather:set-location', async (_event, query: string) => {
  if (!weatherService || !settingsService) {
    return { ok: false, error: 'Weather service unavailable.' }
  }

  const trimmed = (query || '').trim()
  if (!trimmed) {
    settingsService.set('weatherLocation', '')
    settingsService.set('weatherLat', 0)
    settingsService.set('weatherLon', 0)
    return { ok: true, cleared: true }
  }

  const result = await weatherService.geocode(trimmed)
  if (!result) {
    return { ok: false, error: `Couldn't find "${trimmed}". Try a city or province name.` }
  }

  const label = result.admin1 && result.admin1 !== result.name
    ? `${result.name}, ${result.admin1}`
    : result.name

  settingsService.set('weatherLocation', label)
  settingsService.set('weatherLat', result.lat)
  settingsService.set('weatherLon', result.lon)

  return { ok: true, location: label, lat: result.lat, lon: result.lon }
})

ipcMain.on('calendar:join', (_event, url: string) => {
  if (!url) return
  shell.openExternal(url)
})

ipcMain.on('show-notification', (_event, title: string, body: string) => {
  const n = new Notification({ title, body, silent: false })
  n.show()
})

ipcMain.on('lume-toast', (_event, title: string, body: string) => {
  mainWindow?.webContents.send('lume-toast', { title, body })
})

let hapticBinaryPath: string | null = null
let hapticBinaryResolved = false
let hapticPermissionWarned = false

function resolveHapticBinary(): string | null {
  if (hapticBinaryResolved) return hapticBinaryPath
  hapticBinaryResolved = true

  if (process.platform !== 'darwin') return null

  const candidate = app.isPackaged
    ? join(process.resourcesPath, 'bin', 'haptic-cli')
    : join(app.getAppPath(), 'resources', 'bin', 'haptic-cli')

  if (!existsSync(candidate)) {
    console.warn('[Haptic] binary not found at', candidate)
    return null
  }

  // Packaging / notarization occasionally strips the executable bit from
  // extraResources. Re-apply it defensively — silent if already set.
  try {
    chmodSync(candidate, 0o755)
  } catch {
    // fall through; execFile will surface a clearer error if it matters
  }

  hapticBinaryPath = candidate
  return hapticBinaryPath
}

ipcMain.handle('trigger-haptic', () => {
  if (settingsService && !settingsService.get('hapticFeedback')) return

  const binary = resolveHapticBinary()
  if (!binary) return

  execFile(binary, [], { timeout: 1000 }, (err) => {
    if (!err) return
    const msg = err.message || ''
    if (msg.includes('not permitted') || msg.includes('Operation not permitted')) {
      if (!hapticPermissionWarned) {
        hapticPermissionWarned = true
        console.warn(
          '[Haptic] Taptic Engine unavailable (accessibility/entitlements). Feedback disabled.'
        )
      }
      return
    }
    console.warn('[Haptic] invocation failed:', msg)
  })
})

ipcMain.on('quit-app', () => {
  app.quit()
})

ipcMain.handle('notes:list', () => notesService?.list() ?? [])

ipcMain.handle('notes:create', (_event, patch?: NoteUpdate) => {
  return notesService?.create(patch ?? {}) ?? null
})

ipcMain.handle('notes:update', (_event, id: string, patch: NoteUpdate) => {
  return notesService?.update(id, patch) ?? null
})

ipcMain.handle('notes:delete', (_event, id: string) => {
  return notesService?.delete(id) ?? false
})

ipcMain.handle('clipboard:list', () => clipboardService?.list() ?? [])

ipcMain.handle('clipboard:copy', (_event, id: string) => {
  return clipboardService?.copy(id) ?? null
})

ipcMain.handle('clipboard:toggle-pin', (_event, id: string) => {
  return clipboardService?.togglePin(id) ?? null
})

ipcMain.handle('clipboard:delete', (_event, id: string) => {
  return clipboardService?.delete(id) ?? false
})

ipcMain.handle('clipboard:clear', () => {
  clipboardService?.clear()
  return true
})

ipcMain.handle('beam:list', () => beamService?.list() ?? [])

ipcMain.handle('beam:create', (_event, input: BeamTileInput) => {
  return beamService?.create(input) ?? null
})

ipcMain.handle('beam:update', (_event, id: string, patch: Partial<BeamTileInput>) => {
  return beamService?.update(id, patch) ?? null
})

ipcMain.handle('beam:delete', (_event, id: string) => {
  return beamService?.delete(id) ?? false
})

ipcMain.handle('beam:reorder', (_event, ids: string[]) => {
  return beamService?.reorder(ids) ?? []
})

ipcMain.handle('beam:launch', (_event, id: string) => {
  return beamService?.launch(id) ?? false
})

ipcMain.handle('beam:list-apps', async () => {
  return (await beamService?.listInstalledApps()) ?? []
})

ipcMain.handle('beam:pick-file', async () => {
  return (await beamService?.pickFile()) ?? null
})

ipcMain.handle('beam:get-file-icon', async (_event, path: string) => {
  return (await beamService?.getFileIcon(path)) ?? null
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('before-quit', () => {
  sonicFeedbackService?.dispose()
  clipboardService?.dispose()
})
