import { app, BrowserWindow, screen, ipcMain, Tray, nativeImage, Menu } from 'electron'
import { join } from 'path'
import { exec } from 'child_process'
import { is } from '@electron-toolkit/utils'
import { MediaService } from './services/MediaService'
import { AudioService } from './services/AudioService'
import { fetchMacEvents } from './services/calendarService'
import { LicenseService } from './services/LicenseService'

let mediaService: MediaService | null = null
let audioService: AudioService | null = null
let licenseService: LicenseService | null = null

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

    const pw = hoverActive ? 651 : 270
    const ph = hoverActive ? 270 : 34
    const px = wx + Math.floor((ww - pw) / 2)

    const over =
      cursor.x >= px - 8 && cursor.x <= px + pw + 8 && cursor.y >= wy && cursor.y <= wy + ph + 8

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
      preload: join(__dirname, '../preload/index.js'),
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

  const activated = licenseService?.isActivated() ?? false

  const template: Electron.MenuItemConstructorOptions[] = [
    { label: `Version ${app.getVersion()}`, enabled: false },
    { type: 'separator' }
  ]

  if (activated) {
    template.push({
      label: 'Settings...',
      accelerator: 'Command+,',
      click: () => createSettingsWindow()
    })
  } else {
    template.push({
      label: 'Activate Lume...',
      click: () => createOnboardingWindow()
    })
  }

  template.push(
    { type: 'separator' },
    {
      label: 'Quit Lume',
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

  if (licenseService?.isActivated()) {
    createMainWindow()
  } else {
    createOnboardingWindow()
  }
})

ipcMain.handle('get-audio-output', () => audioService?.getState())

ipcMain.handle('get-version', () => app.getVersion())

ipcMain.handle('open-settings', () => {
  createSettingsWindow()
})

ipcMain.handle('activate-license', async (_event, key: string) => {
  if (!licenseService) {
    return { ok: false, error: 'License service unavailable. Please restart Lume.' }
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

  return { ok: true }
})

ipcMain.handle('get-license-state', () => {
  return licenseService?.getAuth() ?? { licenseKey: null, isActivated: false, instanceId: null }
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

ipcMain.handle('get-calendar-events', async () => {
  try {
    return await fetchMacEvents()
  } catch (err: any) {
    console.error('[main] get-calendar-events failed:', err.message)
    return []
  }
})

ipcMain.handle('trigger-haptic', () => {
  const binaryPath = app.isPackaged
    ? join(process.resourcesPath, 'bin', 'haptic-cli')
    : join(process.cwd(), 'resources', 'bin', 'haptic-cli')

  exec(`"${binaryPath}"`, (err) => {
    if (err) {
      console.error('[Haptic] Command failed:', err.message)
    } else {
      console.log('[Haptic] Triggered native feedback successfully')
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
