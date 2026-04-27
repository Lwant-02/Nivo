import { useCallback, useRef } from 'react'
import notificationSound from '../assets/sounds/notification.mp3'

export const useSound = () => {
  const lastHapticRef = useRef(0)
  const notificationAudio = useRef<HTMLAudioElement | null>(null)

  const playHover = useCallback(() => {
    // Sound disabled by user request
  }, [])

  const playExpand = useCallback(() => {
    // Prevent double-firing within a short window (fix for fullscreen hover)
    const now = Date.now()
    if (now - lastHapticRef.current < 150) return
    lastHapticRef.current = now

    // Trigger haptic feedback via IPC
    window.api.triggerHaptic?.()
  }, [])

  const playNotification = useCallback(() => {
    if (!notificationAudio.current) {
      notificationAudio.current = new Audio(notificationSound)
    }
    notificationAudio.current.currentTime = 0
    notificationAudio.current.play().catch((e) => console.error('Error playing sound:', e))
  }, [])

  return { playHover, playExpand, playNotification }
}
