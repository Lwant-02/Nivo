import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      setIgnoreMouseEvents: (ignore: boolean, options?: any) => void
      getBatteryInfo: () => Promise<{ level: number; isCharging: boolean; timeRemaining?: string }>
      getSystemStats: () => Promise<{ cpu: number; memory: number }>
      getClipboard: () => Promise<string>
      getMediaState: () => Promise<{
        isPlaying: boolean
        title: string
        artist: string
        album: string
        source: string
        position: number
        duration: number
        albumArt: string | null
      }>
      playPause: () => Promise<void>
      mediaNext: () => Promise<void>
      mediaPrevious: () => Promise<void>
      getVolume: () => Promise<number>
      setVolume: (level: number) => Promise<void>
      validateLicense: (key: string) => Promise<{ valid: boolean; message?: string }>
      getLicenseStatus: () => Promise<{ isPro: boolean }>
      openSettings: () => Promise<void>
      closeOnboarding: () => Promise<void>
      onBatteryUpdate: (callback: (info: unknown) => void) => void
      onClipboardUpdate: (callback: (text: string) => void) => void
      getPillHover: () => Promise<boolean>
      sendPillState: (expanded: boolean) => void
    }
  }
}
