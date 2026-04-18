import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  // Media control
  playPause: () => ipcRenderer.invoke('media-play-pause'),
  mediaNext: () => ipcRenderer.invoke('media-next'),
  mediaPrevious: () => ipcRenderer.invoke('media-previous'),

  // Volume
  setVolume: (level: number) => ipcRenderer.invoke('set-volume', level),

  // Events & Windows
  openSettings: () => ipcRenderer.invoke('open-settings'),
  closeOnboarding: () => ipcRenderer.invoke('close-onboarding'),

  // Events
  onMediaUpdate: (callback: (data: any) => void) => {
    const wrapper = (_: any, data: any) => callback(data)
    ipcRenderer.on('media-update', wrapper)
    return () => ipcRenderer.removeListener('media-update', wrapper)
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
