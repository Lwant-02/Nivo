import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      playPause: () => Promise<void>
      mediaNext: () => Promise<void>
      mediaPrevious: () => Promise<void>
      joinMeeting: (title: string) => Promise<void>
      showNotification: (title: string, body: string) => void
      showLumeToast: (title: string, body: string) => void
      onLumeToast: (callback: (data: { title: string; body: string }) => void) => () => void
      setVolume: (level: number) => Promise<void>
      setNotchActive: (active: boolean) => void
      openSettings: () => Promise<void>
      getAppVersion: () => Promise<string>
      activateLicense: (key: string) => Promise<{ ok: boolean; error?: string }>
      startTrial: () => Promise<{
        ok: boolean
        error?: string
        trialStartedAt?: number
        trialEndsAt?: number
      }>
      getLicenseState: () => Promise<LicenseState>
      onLicenseUpdate: (callback: (state: LicenseState) => void) => () => void
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
          url: string
          description: string
        }>
      >
      triggerHaptic: () => Promise<void>
      getWeather: () => Promise<Atmosphere | null>
      getSettings: () => Promise<AppSettings | null>
      updateSetting: <K extends keyof AppSettings>(
        key: K,
        value: AppSettings[K]
      ) => Promise<AppSettings | null>
      onSettingsUpdate: (callback: (settings: AppSettings) => void) => () => void
      openExternal: (url: string) => Promise<void>
    }
  }

  type WeatherCondition = 'sunny' | 'rainy' | 'cloudy' | 'snowy'
  interface Atmosphere {
    temp: number
    isDay: boolean
    condition: WeatherCondition
    location?: string
  }

  type ThemeId = 'midnight' | 'graphite' | 'ocean' | 'forest' | 'sunset' | 'berry'
  type NotchThemeId = 'obsidian' | 'frost' | 'aurora' | 'sand' | 'lavender' | 'crimson' | 'emerald' | 'amber'
  type BatteryThreshold = 10 | 20

  interface LicenseState {
    licenseKey: string | null
    isActivated: boolean
    instanceId: string | null
    trialStartedAt: number | null
    trialEndsAt: number | null
    isInTrial: boolean
    hasAccess: boolean
  }

  interface AppSettings {
    theme: ThemeId
    notchTheme: NotchThemeId
    launchAtLogin: boolean
    hideInFullscreen: boolean
    hideFromScreenCapture: boolean
    hapticFeedback: boolean
    hideWhenPaused: boolean
    showAlbumArt: boolean
    showVisualizer: boolean
    enableCalendar: boolean
    calendarNextEventOnly: boolean
    calendarClickToJoin: boolean
    calendarReminderMin: number
    showLottieOnPause: boolean
    lottieStyle: number
    focusDuration: number
    showWeather: boolean
    hasSeenWelcome: boolean
  }
}

export {}
