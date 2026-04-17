import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  setIgnoreMouseEvents: (ignore: boolean, options?: any) => ipcRenderer.send('set-ignore-mouse-events', ignore, options),
  
  // System battery info
  getBatteryInfo: () => ipcRenderer.invoke('get-battery-info'),

  // System stats (CPU/Memory)
  getSystemStats: () => ipcRenderer.invoke('get-system-stats'),

  // Clipboard content
  getClipboard: () => ipcRenderer.invoke('get-clipboard'),

  // Media control
  getMediaState: () => ipcRenderer.invoke('get-media-state'),
  playPause: () => ipcRenderer.invoke('media-play-pause'),

  // License management
  validateLicense: (key: string) => ipcRenderer.invoke('validate-license', key),
  getLicenseStatus: () => ipcRenderer.invoke('get-license-status'),

  // Events
  onBatteryUpdate: (callback: (info: unknown) => void) => {
    ipcRenderer.on('battery-update', (_, info) => callback(info))
  },
  onClipboardUpdate: (callback: (text: string) => void) => {
    ipcRenderer.on('clipboard-update', (_, text) => callback(text))
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled
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
