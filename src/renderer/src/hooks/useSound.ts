import { useCallback } from 'react'

export const useSound = () => {
  const playHover = useCallback(() => {
    // Sound disabled by user request
  }, [])

  const playExpand = useCallback(() => {
    // Trigger haptic feedback via IPC
    window.api.triggerHaptic?.()
  }, [])

  return { playHover, playExpand }
}
