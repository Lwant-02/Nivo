import { contextBridge, ipcRenderer, shell } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  // Media control (routed through unified media-control channel)
  playPause: () => ipcRenderer.invoke('media-control', 'playPause'),
  mediaNext: () => ipcRenderer.invoke('media-control', 'next'),
  mediaPrevious: () => ipcRenderer.invoke('media-control', 'previous'),

  // Volume
  setVolume: (level: number) => ipcRenderer.invoke('set-system-volume', level),

  // Events & Windows
  openSettings: () => ipcRenderer.invoke('open-settings'),
  getAppVersion: () => ipcRenderer.invoke('get-version'),

  // License activation
  activateLicense: (key: string) => ipcRenderer.invoke('activate-license', key),
  getLicenseState: () => ipcRenderer.invoke('get-license-state'),

  // Events
  onMediaUpdate: (callback: (data: any) => void) => {
    const wrapper = (_: any, data: any) => callback(data)
    ipcRenderer.on('media-update', wrapper)
    return () => ipcRenderer.removeListener('media-update', wrapper)
  },

  // Audio output
  onAudioOutputUpdate: (callback: (data: any) => void) => {
    const wrapper = (_: any, data: any) => callback(data)
    ipcRenderer.on('audio-output-update', wrapper)
    return () => ipcRenderer.removeListener('audio-output-update', wrapper)
  },

  getAudioOutput: () => ipcRenderer.invoke('get-audio-output'),

  // Calendar
  getCalendarEvents: () => ipcRenderer.invoke('get-calendar-events'),

  // Haptic
  triggerHaptic: () => ipcRenderer.invoke('trigger-haptic'),

  // Navigation
  openExternal: (url: string) => shell.openExternal(url)
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
