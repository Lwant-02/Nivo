import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  setIgnoreMouseEvents: (ignore: boolean, options?: any) =>
    ipcRenderer.send('set-ignore-mouse-events', ignore, options),

  // System battery info
  getBatteryInfo: () => ipcRenderer.invoke('get-battery-info'),

  // System stats (CPU/Memory)
  getSystemStats: () => ipcRenderer.invoke('get-system-stats'),

  // Clipboard content
  getClipboard: () => ipcRenderer.invoke('get-clipboard'),

  // Media control
  getMediaState: () => ipcRenderer.invoke('get-media-state'),
  playPause: () => ipcRenderer.invoke('media-play-pause'),
  mediaNext: () => ipcRenderer.invoke('media-next'),
  mediaPrevious: () => ipcRenderer.invoke('media-previous'),

  // Volume
  getVolume: () => ipcRenderer.invoke('get-volume'),
  setVolume: (level: number) => ipcRenderer.invoke('set-volume', level),

  // License management
  validateLicense: (key: string) => ipcRenderer.invoke('validate-license', key),
  getLicenseStatus: () => ipcRenderer.invoke('get-license-status'),

  // Events & Windows
  openSettings: () => ipcRenderer.invoke('open-settings'),
  closeOnboarding: () => ipcRenderer.invoke('close-onboarding'),

  // Events
  onBatteryUpdate: (callback: (info: unknown) => void) => {
    ipcRenderer.on('battery-update', (_, info) => callback(info))
  },
  onClipboardUpdate: (callback: (text: string) => void) => {
    ipcRenderer.on('clipboard-update', (_, text) => callback(text))
  },

  // Pill hover — renderer polls main for current hover state
  getPillHover: () => ipcRenderer.invoke('get-pill-hover') as Promise<boolean>,
  sendPillState: (expanded: boolean) => {
    ipcRenderer.send('pill-state', expanded)
  }
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
