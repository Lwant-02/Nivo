import { useCallback, useEffect, useRef, useState } from 'react'

export type ZenMode = 'countdown' | 'stopwatch'

export const COUNTDOWN_PRESETS_SEC = [120, 600, 900, 1800, 3600, 7200]
export const STOPWATCH_PRESETS_SEC = [120, 300, 600, 900, 1800, 3600]

const DEFAULT_PRESET_SEC = 600 // 10:00

export interface ZenTimerApi {
  mode: ZenMode
  setMode: (m: ZenMode) => void
  isActive: boolean
  countdownMs: number
  stopwatchMs: number
  presetSec: number
  selectPreset: (sec: number) => void
  toggle: () => void
  restart: () => void
}

interface UseZenTimerOptions {
  onComplete?: () => void
}

export function useZenTimer({ onComplete }: UseZenTimerOptions = {}): ZenTimerApi {
  const [mode, setModeState] = useState<ZenMode>('countdown')
  const [presetSec, setPresetSec] = useState(DEFAULT_PRESET_SEC)
  const [countdownMs, setCountdownMs] = useState(DEFAULT_PRESET_SEC * 1000)
  const [stopwatchMs, setStopwatchMs] = useState(0)
  const [isActive, setIsActive] = useState(false)

  // Wall-clock anchors: prefer absolute timestamps over decrement loops so
  // the timer stays accurate even if the renderer interval is throttled.
  const countdownEndsAt = useRef<number | null>(null)
  const stopwatchStartedAt = useRef<number | null>(null)
  const completedRef = useRef(false)

  const onCompleteRef = useRef(onComplete)
  useEffect(() => {
    onCompleteRef.current = onComplete
  }, [onComplete])

  useEffect(() => {
    if (!isActive) return
    const tickMs = mode === 'stopwatch' ? 40 : 200 // Faster tick for stopwatch (25fps)
    const id = setInterval(() => {
      const now = Date.now()
      if (mode === 'countdown') {
        const endsAt = countdownEndsAt.current
        if (endsAt === null) return
        const remaining = Math.max(0, endsAt - now)
        setCountdownMs(remaining)
        if (remaining <= 0 && !completedRef.current) {
          completedRef.current = true
          countdownEndsAt.current = null
          setIsActive(false)
          onCompleteRef.current?.()
        }
      } else {
        const startedAt = stopwatchStartedAt.current
        if (startedAt === null) return
        setStopwatchMs(now - startedAt)
      }
    }, tickMs)
    return () => clearInterval(id)
  }, [isActive, mode])

  const toggle = useCallback(() => {
    const now = Date.now()
    if (mode === 'countdown') {
      if (isActive) {
        // Pause: capture current remaining time
        if (countdownEndsAt.current !== null) {
          setCountdownMs(Math.max(0, countdownEndsAt.current - now))
        }
        countdownEndsAt.current = null
        setIsActive(false)
      } else {
        // Resume/Start
        const startMs = countdownMs > 0 ? countdownMs : presetSec * 1000
        setCountdownMs(startMs)
        countdownEndsAt.current = now + startMs
        completedRef.current = false
        setIsActive(true)
      }
    } else {
      if (isActive) {
        // Pause: capture current elapsed time
        if (stopwatchStartedAt.current !== null) {
          setStopwatchMs(now - stopwatchStartedAt.current)
        }
        stopwatchStartedAt.current = null
        setIsActive(false)
      } else {
        // Resume/Start: anchor is now minus previously elapsed time
        stopwatchStartedAt.current = now - stopwatchMs
        setIsActive(true)
      }
    }
  }, [mode, isActive, countdownMs, stopwatchMs, presetSec])

  const restart = useCallback(() => {
    setIsActive(false)
    if (mode === 'countdown') {
      countdownEndsAt.current = null
      setCountdownMs(presetSec * 1000)
      completedRef.current = false
    } else {
      stopwatchStartedAt.current = null
      setStopwatchMs(0)
    }
  }, [mode, presetSec])

  const selectPreset = useCallback(
    (sec: number) => {
      setIsActive(false)
      if (mode === 'countdown') {
        setPresetSec(sec)
        countdownEndsAt.current = null
        setCountdownMs(sec * 1000)
        completedRef.current = false
      } else {
        // For stopwatch, presets act as a reset to 0
        stopwatchStartedAt.current = null
        setStopwatchMs(0)
      }
    },
    [mode]
  )

  const setMode = useCallback(
    (m: ZenMode) => {
      if (m === mode) return
      setIsActive(false)
      setModeState(m)
      if (m === 'countdown') {
        countdownEndsAt.current = null
        setCountdownMs(presetSec * 1000)
        completedRef.current = false
      } else {
        stopwatchStartedAt.current = null
        setStopwatchMs(0)
      }
    },
    [mode, presetSec]
  )

  return {
    mode,
    setMode,
    isActive,
    countdownMs,
    stopwatchMs,
    presetSec,
    selectPreset,
    toggle,
    restart
  }
}
