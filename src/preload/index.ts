import { contextBridge, ipcRenderer, shell } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  // Media control (routed through unified media-control channel)
  playPause: () => ipcRenderer.invoke('media-control', 'playPause'),
  mediaNext: () => ipcRenderer.invoke('media-control', 'next'),
  mediaPrevious: () => ipcRenderer.invoke('media-control', 'previous'),
  joinMeeting: (title: string) => ipcRenderer.send('calendar:join', title),
  showNotification: (title: string, body: string) => ipcRenderer.send('show-notification', title, body),
  showLumeToast: (title: string, body: string) => ipcRenderer.send('lume-toast', title, body),
  onLumeToast: (callback: (data: any) => void) => {
    const wrapper = (_: any, data: any) => callback(data)
    ipcRenderer.on('lume-toast', wrapper)
    return () => ipcRenderer.removeListener('lume-toast', wrapper)
  },

  setNotchActive: (active: boolean) => ipcRenderer.send('set-notch-active', active),
  setNotchEditing: (editing: boolean) => ipcRenderer.send('set-notch-editing', editing),

  // Events & Windows
  openSettings: () => ipcRenderer.invoke('open-settings'),
  getAppVersion: () => ipcRenderer.invoke('get-version'),
  quitApp: () => ipcRenderer.send('quit-app'),

  // License activation
  activateLicense: (key: string) => ipcRenderer.invoke('activate-license', key),
  startTrial: () => ipcRenderer.invoke('start-trial'),
  getLicenseState: () => ipcRenderer.invoke('get-license-state'),
  onLicenseUpdate: (callback: (data: any) => void) => {
    const wrapper = (_: any, data: any) => callback(data)
    ipcRenderer.on('license-update', wrapper)
    return () => ipcRenderer.removeListener('license-update', wrapper)
  },

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

  // Sonic Feedback — global keydown stream from libuiohook
  onSonicKey: (callback: (keycode: number) => void) => {
    const wrapper = (_: unknown, keycode: number) => callback(keycode)
    ipcRenderer.on('sonic-key', wrapper)
    return () => ipcRenderer.removeListener('sonic-key', wrapper)
  },

  // Weather
  getWeather: () => ipcRenderer.invoke('get-weather'),

  // Settings
  getSettings: () => ipcRenderer.invoke('get-settings'),
  updateSetting: (key: string, value: unknown) =>
    ipcRenderer.invoke('update-setting', key, value),
  onSettingsUpdate: (callback: (data: any) => void) => {
    const wrapper = (_: any, data: any) => callback(data)
    ipcRenderer.on('settings-update', wrapper)
    return () => ipcRenderer.removeListener('settings-update', wrapper)
  },

  // Notes
  getNotes: () => ipcRenderer.invoke('notes:list'),
  createNote: (patch?: { title?: string; content?: string; icon?: string }) =>
    ipcRenderer.invoke('notes:create', patch),
  updateNote: (
    id: string,
    patch: { title?: string; content?: string; icon?: string }
  ) => ipcRenderer.invoke('notes:update', id, patch),
  deleteNote: (id: string) => ipcRenderer.invoke('notes:delete', id),

  // Clipboard history
  getClipboard: () => ipcRenderer.invoke('clipboard:list'),
  copyClipboardItem: (id: string) => ipcRenderer.invoke('clipboard:copy', id),
  toggleClipboardPin: (id: string) => ipcRenderer.invoke('clipboard:toggle-pin', id),
  deleteClipboardItem: (id: string) => ipcRenderer.invoke('clipboard:delete', id),
  clearClipboard: () => ipcRenderer.invoke('clipboard:clear'),
  onClipboardUpdate: (callback: (items: unknown[]) => void) => {
    const wrapper = (_: unknown, items: unknown[]): void => callback(items)
    ipcRenderer.on('clipboard:update', wrapper)
    return () => ipcRenderer.removeListener('clipboard:update', wrapper)
  },

  // Beam (quick launcher)
  getBeamTiles: () => ipcRenderer.invoke('beam:list'),
  createBeamTile: (input: {
    kind: 'app' | 'url' | 'file'
    label: string
    target: string
    icon?: string | null
  }) => ipcRenderer.invoke('beam:create', input),
  updateBeamTile: (
    id: string,
    patch: { label?: string; target?: string; icon?: string | null }
  ) => ipcRenderer.invoke('beam:update', id, patch),
  deleteBeamTile: (id: string) => ipcRenderer.invoke('beam:delete', id),
  reorderBeamTiles: (ids: string[]) => ipcRenderer.invoke('beam:reorder', ids),
  launchBeamTile: (id: string) => ipcRenderer.invoke('beam:launch', id),
  listInstalledApps: () => ipcRenderer.invoke('beam:list-apps'),
  pickBeamFile: () => ipcRenderer.invoke('beam:pick-file'),
  getFileIcon: (path: string) => ipcRenderer.invoke('beam:get-file-icon', path),


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
