import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      setIgnoreMouseEvents: (ignore: boolean, options?: any) => void
      getBatteryInfo: () => Promise<{ level: number; isCharging: boolean; timeRemaining?: string }>
      getSystemStats: () => Promise<{ cpu: number; memory: number }>
      getClipboard: () => Promise<string>
      getMediaState: () => Promise<{ isPlaying: boolean; title: string; artist: string; source: string }>
      playPause: () => Promise<void>
      validateLicense: (key: string) => Promise<{ valid: boolean; message?: string }>
      getLicenseStatus: () => Promise<{ isPro: boolean }>
      onBatteryUpdate: (callback: (info: unknown) => void) => void
      onClipboardUpdate: (callback: (text: string) => void) => void
    }
  }
}
