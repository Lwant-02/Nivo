import {
  app,
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
import { LicenseService } from './services/LicenseService'

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

let mediaService: MediaService | null = null
let audioService: AudioService | null = null
let licenseService: LicenseService | null = null
let settingsService: SettingsService | null = null

let mainWindow: BrowserWindow | null = null
let settingsWindow: BrowserWindow | null = null
let onboardingWindow: BrowserWindow | null = null
let tray: Tray | null = null

// Notch window
function createMainWindow(): void {
  if (mainWindow) {
    mainWindow.focus()
    return
  }
  const { width: screenWidth } = screen.getPrimaryDisplay().bounds

  mainWindow = new BrowserWindow({
    width: 800,
    height: 400,
    x: Math.floor(screenWidth / 2 - 400),
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

  const pollInterval = setInterval(() => {
    if (!mainWindow || mainWindow.isDestroyed()) return

    const cursor = screen.getCursorScreenPoint()
    const { x: wx, y: wy, width: ww } = mainWindow.getBounds()

    const pw = hoverActive ? 651 : 270
    const ph = hoverActive ? 270 : 34
    const px = wx + Math.floor((ww - pw) / 2)

    const over =
      cursor.x >= px - 8 && cursor.x <= px + pw + 8 && cursor.y >= wy && cursor.y <= wy + ph + 8

    if (over && !hoverActive) {
      hoverActive = true
      mainWindow.setIgnoreMouseEvents(false)
      // Always promote to front on hover so the user can interact
      mainWindow.setAlwaysOnTop(true, 'screen-saver', 1)
    } else if (!over && hoverActive) {
      hoverActive = false
      mainWindow.setIgnoreMouseEvents(true, { forward: true })
      // Restore level if we were popping over
      const hideFS = !!settingsService?.get('hideInFullscreen')
      const hidePaused = !!settingsService?.get('hideWhenPaused') && !mediaService?.isMediaPlaying()
      const level = hideFS || hidePaused ? 'floating' : 'screen-saver'
      mainWindow.setAlwaysOnTop(true, level, 1)
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

  // When hideInFullscreen or hideWhenPaused is on, drop to 'floating' so
  // fullscreen apps (or simply the desktop) cover the notch.
  const hidePaused = !!s?.hideWhenPaused && !mediaService?.isMediaPlaying()
  const shouldHide = !!s?.hideInFullscreen || hidePaused

  const level: 'screen-saver' | 'floating' = shouldHide ? 'floating' : 'screen-saver'
  win.setAlwaysOnTop(true, level, 1)

  win.setVisibleOnAllWorkspaces(true, {
    visibleOnFullScreen: true,
    skipTransformProcessType: true
  })
  win.setContentProtection(!!s?.hideFromScreenCapture)
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

// Onboarding window
function createOnboardingWindow(): void {
  if (onboardingWindow) {
    onboardingWindow.focus()
    return
  }
  const { width, height } = screen.getPrimaryDisplay().bounds

  onboardingWindow = new BrowserWindow({
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
    onboardingWindow.loadURL(`${process.env['ELECTRON_RENDERER_URL']}#/onboarding`)
  } else {
    onboardingWindow.loadFile(join(__dirname, '../renderer/index.html'), { hash: 'onboarding' })
  }

  onboardingWindow.once('ready-to-show', () => {
    onboardingWindow?.show()
    onboardingWindow?.focus()
  })

  onboardingWindow.webContents.on('did-fail-load', () => {
    console.error('[main] Onboarding window failed to load')
  })

  onboardingWindow.on('closed', () => {
    onboardingWindow = null
  })
}

function refreshTrayMenu(): void {
  if (!tray) return

  const auth = licenseService?.getAuth()
  const hasAccess = auth?.hasAccess ?? false

  const template: Electron.MenuItemConstructorOptions[] = [
    { label: `Nivo Settings`, enabled: false },
    { type: 'separator' }
  ]

  if (hasAccess) {
    template.push({
      label: 'Settings...',
      accelerator: 'Command+,',
      click: () => createSettingsWindow()
    })
  } else {
    template.push({
      label: 'Activate Nivo...',
      click: () => createOnboardingWindow()
    })
  }

  template.push(
    { type: 'separator' },
    {
      label: 'Quit Nivo',
      accelerator: 'Command+Q',
      click: () => app.quit()
    }
  )

  tray.setContextMenu(Menu.buildFromTemplate(template))
}

// App ready
app.whenReady().then(() => {
  try {
    licenseService = new LicenseService()
  } catch (err: any) {
    console.error('[main] Failed to initialize LicenseService:', err.message)
  }

  try {
    settingsService = new SettingsService()
    applyLaunchAtLogin(settingsService.get('launchAtLogin'))
    settingsService.on('change', (next: Settings) => {
      applyLaunchAtLogin(next.launchAtLogin)
      if (mainWindow) applyWindowSettings(mainWindow, next)
      broadcastSettings(next)
    })
  } catch (err: any) {
    console.error('[main] Failed to initialize SettingsService:', err.message)
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

  if (licenseService?.hasAccess()) {
    createMainWindow()
  } else {
    createOnboardingWindow()
  }

  // Monitor access (trial expiry) and switch windows if necessary
  setInterval(() => {
    const hasAccess = licenseService?.hasAccess() ?? false
    if (hasAccess && !mainWindow && !onboardingWindow) {
      createMainWindow()
    } else if (!hasAccess && (mainWindow || settingsWindow)) {
      if (mainWindow) {
        mainWindow.destroy()
        mainWindow = null
      }
      if (settingsWindow) {
        settingsWindow.destroy()
        settingsWindow = null
      }
      createOnboardingWindow()
      refreshTrayMenu()
    }
  }, 5000)
})

function broadcastLicenseUpdate(): void {
  const state = licenseService?.getAuth()
  if (!state) return
  for (const win of BrowserWindow.getAllWindows()) {
    if (!win.isDestroyed()) win.webContents.send('license-update', state)
  }
}

ipcMain.handle('get-audio-output', () => audioService?.getState())

ipcMain.handle('get-version', () => app.getVersion())

ipcMain.handle('open-settings', () => {
  createSettingsWindow()
})

ipcMain.handle('activate-license', async (_event, key: string) => {
  if (!licenseService) {
    return { ok: false, error: 'License service unavailable. Please restart Nivo.' }
  }

  // Simulate network round-trip so the UI's "Activating…" state is visible.
  await new Promise((resolve) => setTimeout(resolve, 3000))

  const result = licenseService.activate(key)
  if (!result.ok) return result

  if (onboardingWindow) {
    onboardingWindow.destroy()
    onboardingWindow = null
  }
  createMainWindow()
  refreshTrayMenu()
  broadcastLicenseUpdate()

  return { ok: true }
})

ipcMain.handle('start-trial', () => {
  if (!licenseService) {
    return { ok: false, error: 'License service unavailable. Please restart Nivo.' }
  }

  const result = licenseService.startTrial()
  if (!result.ok) return result

  if (onboardingWindow) {
    onboardingWindow.destroy()
    onboardingWindow = null
  }
  createMainWindow()
  refreshTrayMenu()
  broadcastLicenseUpdate()

  return result
})

ipcMain.handle('get-license-state', () => {
  return (
    licenseService?.getAuth() ?? {
      licenseKey: null,
      isActivated: false,
      instanceId: null,
      trialStartedAt: null,
      trialEndsAt: null,
      isInTrial: false,
      hasAccess: false
    }
  )
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

ipcMain.handle('set-system-volume', (_event, level: number) => mediaService?.setVolume(level))

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

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
