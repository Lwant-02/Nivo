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
      onMediaUpdate: (
        callback: (data: {
          title: string
          artist: string
          isPlaying: boolean
          progress: number
          volume: number
          albumArt: string | null
          duration: number
          position: number
          source: string
        }) => void
      ) => () => void
    }
  }
}
