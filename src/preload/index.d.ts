import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      playPause: () => Promise<void>
      mediaNext: () => Promise<void>
      mediaPrevious: () => Promise<void>
      setVolume: (level: number) => Promise<void>
      openSettings: () => Promise<void>
      getAppVersion: () => Promise<string>
      activateLicense: (key: string) => Promise<{ ok: boolean; error?: string }>
      getLicenseState: () => Promise<{
        licenseKey: string | null
        isActivated: boolean
        instanceId: string | null
      }>
      onMediaUpdate: (
        callback: (data: {
          title: string
          artist: string
          isPlaying: boolean
          playbackRate: number
          progress: number
          volume: number
          albumArt: string | null
          duration: number
          position: number
          source: string
        }) => void
      ) => () => void
      onAudioOutputUpdate: (
        callback: (data: { device: string; kind: 'airpods' | 'headset' | 'speakers' }) => void
      ) => () => void
      getAudioOutput: () => Promise<{ device: string; kind: 'airpods' | 'headset' | 'speakers' }>
      getCalendarEvents: () => Promise<
        Array<{
          title: string
          time: string
          progress: number
          startMs: number
          endMs: number
        }>
      >
      triggerHaptic: () => Promise<void>
      getSettings: () => Promise<AppSettings | null>
      updateSetting: <K extends keyof AppSettings>(
        key: K,
        value: AppSettings[K]
      ) => Promise<AppSettings | null>
      onSettingsUpdate: (callback: (settings: AppSettings) => void) => () => void
      openExternal: (url: string) => Promise<void>
    }
  }

  type ThemeId = 'midnight' | 'graphite' | 'ocean' | 'forest' | 'sunset' | 'berry'
  type BatteryThreshold = 10 | 20

  interface AppSettings {
    theme: ThemeId
    launchAtLogin: boolean
    hideInFullscreen: boolean
    hideFromScreenCapture: boolean
    hapticFeedback: boolean
    hideWhenPaused: boolean
    showAlbumArt: boolean
    showVisualizer: boolean
  }
}

export {}
