import { useCallback, useRef } from 'react'

export const useSound = () => {
  const lastHapticRef = useRef(0)

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

  return { playHover, playExpand }
}
