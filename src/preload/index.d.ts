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
      setNotchActive: (active: boolean) => void
      setNotchEditing: (editing: boolean) => void
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
          isAllDay: boolean
          calendarName: string
        }>
      >
      triggerHaptic: () => Promise<void>
      onSonicKey: (callback: (keycode: number) => void) => () => void
      getWeather: () => Promise<Atmosphere | null>
      getSettings: () => Promise<AppSettings | null>
      updateSetting: <K extends keyof AppSettings>(
        key: K,
        value: AppSettings[K]
      ) => Promise<AppSettings | null>
      onSettingsUpdate: (callback: (settings: AppSettings) => void) => () => void
      getNotes: () => Promise<Note[]>
      createNote: (patch?: NoteInput) => Promise<Note | null>
      updateNote: (id: string, patch: NoteInput) => Promise<Note | null>
      deleteNote: (id: string) => Promise<boolean>
      getClipboard: () => Promise<ClipboardItem[]>
      copyClipboardItem: (id: string) => Promise<ClipboardItem | null>
      toggleClipboardPin: (id: string) => Promise<ClipboardItem | null>
      deleteClipboardItem: (id: string) => Promise<boolean>
      clearClipboard: () => Promise<boolean>
      onClipboardUpdate: (callback: (items: ClipboardItem[]) => void) => () => void
      getBeamTiles: () => Promise<BeamTile[]>
      createBeamTile: (input: BeamTileInput) => Promise<BeamTile | null>
      updateBeamTile: (
        id: string,
        patch: { label?: string; target?: string; icon?: string | null }
      ) => Promise<BeamTile | null>
      deleteBeamTile: (id: string) => Promise<boolean>
      reorderBeamTiles: (ids: string[]) => Promise<BeamTile[]>
      launchBeamTile: (id: string) => Promise<boolean>
      listInstalledApps: () => Promise<InstalledApp[]>
      pickBeamFile: () => Promise<{ path: string; label: string; icon: string | null } | null>
      getFileIcon: (path: string) => Promise<string | null>
      openExternal: (url: string) => Promise<void>
    }
  }

  type BeamKind = 'app' | 'url' | 'file'

  interface BeamTile {
    id: string
    kind: BeamKind
    label: string
    target: string
    icon: string | null
    position: number
    createdAt: number
  }

  interface BeamTileInput {
    kind: BeamKind
    label: string
    target: string
    icon?: string | null
  }

  interface InstalledApp {
    name: string
    path: string
    icon: string | null
  }

  interface ClipboardItem {
    id: string
    content: string
    pinned: boolean
    createdAt: number
  }

  type NoteIconId =
    | 'clipboard-text'
    | 'home'
    | 'book'
    | 'bell'
    | 'soup'
    | 'target'
    | 'note'
    | 'bulb'
    | 'heart'
    | 'star'
    | 'briefcase'
    | 'flag'

  interface Note {
    id: string
    title: string
    content: string
    icon: NoteIconId
    createdAt: number
    updatedAt: number
  }

  interface NoteInput {
    title?: string
    content?: string
    icon?: NoteIconId
  }

  type WeatherCondition = 'sunny' | 'rainy' | 'cloudy' | 'snowy'
  interface Atmosphere {
    temp: number
    isDay: boolean
    condition: WeatherCondition
    location?: string
  }

  type ThemeId =
    | 'midnight'
    | 'graphite'
    | 'ocean'
    | 'forest'
    | 'sunset'
    | 'berry'
    | 'indigo'
    | 'rose'
    | 'teal'
    | 'gold'
    | 'mint'
    | 'sky'
    | 'lavender'
    | 'coral'
    | 'silver'
    | 'plum'
  type NotchThemeId = 'glass'
  type SonicSoundPackId =
    | 'cherrymx-black-abs'
    | 'cherrymx-black-pbt'
    | 'cherrymx-blue-abs'
    | 'cherrymx-blue-pbt'
    | 'cherrymx-brown-abs'
    | 'cherrymx-brown-pbt'
    | 'cherrymx-red-abs'
    | 'cherrymx-red-pbt'
    | 'eg-crystal-purple'
    | 'eg-oreo'
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
    showWeather: boolean
    sonicFeedback: boolean
    sonicSoundPack: SonicSoundPackId
    hasSeenWelcome: boolean
    enableClipboardHistory: boolean
    enableBeam: boolean
  }
}

export {}
