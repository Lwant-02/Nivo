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
      closeOnboarding: () => Promise<void>
      pulseOnboarding: () => Promise<void>
      getAppVersion: () => Promise<string>
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
    }
  }
}
