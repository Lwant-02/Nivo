import { useState, useEffect } from 'react'

export type AudioDeviceKind = 'airpods' | 'headset' | 'speakers'

export interface AudioOutput {
  device: string
  kind: AudioDeviceKind
}

const DEFAULT: AudioOutput = { device: '', kind: 'speakers' }

export function useAudioOutput(): AudioOutput {
  const [audio, setAudio] = useState<AudioOutput>(DEFAULT)

  useEffect(() => {
    // Fetch initial state
    window.api.getAudioOutput().then((data) => {
      if (data) setAudio(data)
    })

    const unsubscribe = window.api.onAudioOutputUpdate((data) => {
      setAudio(data)
    })
    return () => {
      if (unsubscribe) unsubscribe()
    }
  }, [])

  return audio
}
