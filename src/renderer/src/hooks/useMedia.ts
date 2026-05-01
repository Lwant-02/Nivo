import { useState, useEffect } from 'react'

export interface MediaUpdate {
  title: string
  artist: string
  isPlaying: boolean
  playbackRate: number
  progress: number
  albumArt: string | null
  duration: number
  position: number
  source: string
}

const DEFAULT_STATE: MediaUpdate = {
  title: '',
  artist: '',
  isPlaying: false,
  playbackRate: 0,
  progress: 0,
  albumArt: null,
  duration: 0,
  position: 0,
  source: 'system'
}

export function useMedia() {
  const [media, setMedia] = useState<MediaUpdate>(DEFAULT_STATE)

  useEffect(() => {
    // Subscribe to backend push events
    const unsubscribe = window.api.onMediaUpdate((data: MediaUpdate) => {
      setMedia(data)
    })

    return () => {
      if (unsubscribe) unsubscribe()
    }
  }, [])

  return media
}
