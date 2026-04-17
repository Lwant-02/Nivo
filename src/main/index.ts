import {
  app,
  BrowserWindow,
  screen,
  globalShortcut,
  ipcMain,
  powerMonitor,
  clipboard
} from 'electron'
import { join } from 'path'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

let mainWindow: BrowserWindow | null = null
let isPro = false
let licenseKey: string | null = null

// Get battery info
async function getBatteryInfo() {
  try {
    const { exec } = await import('child_process')
    const { promisify } = await import('util')
    const execAsync = promisify(exec)

    const result = await execAsync('pmset -g batt | grep -Eo "[0-9]+%" | head -1')
    const level = parseInt(result.stdout.replace('%', '').trim())

    const chargingResult = await execAsync('pmset -g batt | grep "charging"')
    const isCharging = chargingResult.stdout.includes('charging')

    return { level, isCharging }
  } catch {
    return { level: 100, isCharging: true }
  }
}

// Get system stats
async function getSystemStats() {
  try {
    const { exec } = await import('child_process')
    const { promisify } = await import('util')
    const execAsync = promisify(exec)

    // Get CPU usage
    const cpuResult = await execAsync(
      "top -l 1 | grep 'CPU usage' | awk '{print $3}' | sed 's/%//'"
    )
    const cpu = parseFloat(cpuResult.stdout.trim()) || 0

    // Get memory usage
    const memResult = await execAsync(
      "vm_stat | grep 'Pages active' | awk '{print $3}' | sed 's/\\.//'"
    )
    const memInfo = await execAsync('sysctl hw.memsize')
    const totalMem = parseInt(memInfo.stdout.split(':')[1].trim())
    const activePages = parseInt(memResult.stdout.trim()) * 4096
    const memory = Math.round((activePages / totalMem) * 100) || 0

    return { cpu: Math.min(100, Math.round(cpu)), memory: Math.min(100, memory) }
  } catch {
    return { cpu: 15, memory: 45 }
  }
}

// Get clipboard content
function getClipboardContent() {
  try {
    return clipboard.readText('clipboard')
  } catch {
    return ''
  }
}

// Mock media state (will be integrated with actual media players later)
let mediaState = {
  isPlaying: false,
  title: 'Starboy',
  artist: 'The Weeknd, Daft Punk',
  source: 'Spotify'
}

// Simulate song change every 30 seconds if playing
const mockSongs = [
  { title: 'Starboy', artist: 'The Weeknd, Daft Punk' },
  { title: 'Anti-Hero', artist: 'Taylor Swift' },
  { title: 'As It Was', artist: 'Harry Styles' }
]
let songIndex = 0

setInterval(() => {
  if (mediaState.isPlaying) {
    songIndex = (songIndex + 1) % mockSongs.length
    mediaState.title = mockSongs[songIndex].title
    mediaState.artist = mockSongs[songIndex].artist
  }
}, 30000)

function createWindow(): void {
  const { width } = screen.getPrimaryDisplay().bounds

  mainWindow = new BrowserWindow({
    width: 500,
    height: 400,
    x: Math.floor(width / 2 - 250),
    y: 0,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: false,
    movable: false,
    skipTaskbar: true,
    hasShadow: false,
    focusable: false,
    // Helps it float correctly over other apps
    type: 'panel',
    webPreferences: {
      preload: join(__dirname, '../preload/index.mjs'),
      sandbox: false,
      nodeIntegration: false,
      contextIsolation: true
    }
  })

  mainWindow.setWindowButtonVisibility(false)
  mainWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true })

  // 'main-menu' + 1 ensures it sits exactly where the notch/menu bar is
  mainWindow.setAlwaysOnTop(true, 'screen-saver', 1)

  mainWindow.setBackgroundColor('#00000000')

  // Start with ignore on
  mainWindow.setIgnoreMouseEvents(true, { forward: true })

  // --- IPC Listeners for Interaction ---
  ipcMain.on('set-ignore-mouse-events', (event, ignore, options) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    win?.setIgnoreMouseEvents(ignore, options)
  })

  if (process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

// IPC Handlers
ipcMain.on('set-ignore-mouse-events', (event, ignore, options) => {
  BrowserWindow.fromWebContents(event.sender)?.setIgnoreMouseEvents(ignore, options)
})
ipcMain.handle('get-battery-info', getBatteryInfo)
ipcMain.handle('get-system-stats', getSystemStats)
ipcMain.handle('get-clipboard', getClipboardContent)
ipcMain.handle('get-media-state', () => mediaState)
ipcMain.handle('media-play-pause', () => {
  mediaState.isPlaying = !mediaState.isPlaying
  return mediaState
})
ipcMain.handle('validate-license', (event, key: string) => {
  // Mock validation - replace with actual Lemon Squeezy API
  if (key.length >= 16 && key.includes('-')) {
    isPro = true
    licenseKey = key
    return { valid: true, message: 'License activated successfully' }
  }
  return { valid: false, message: 'Invalid license key' }
})
ipcMain.handle('get-license-status', () => ({ isPro }))

app.whenReady().then(() => {
  createWindow()

  // Toggle visibility shortcut
  globalShortcut.register('CommandOrControl+Shift+L', () => {
    if (mainWindow) {
      mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show()
    }
  })

  // Update battery status periodically
  setInterval(async () => {
    if (mainWindow) {
      const batteryInfo = await getBatteryInfo()
      mainWindow.webContents.send('battery-update', batteryInfo)
    }
  }, 30000)

  // Update system stats periodically
  setInterval(async () => {
    if (mainWindow) {
      const stats = await getSystemStats()
      mainWindow.webContents.send('system-stats-update', stats)
    }
  }, 2000)
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.on('quit', () => {
  globalShortcut.unregisterAll()
})
