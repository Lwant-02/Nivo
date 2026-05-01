import { useCallback, useEffect, useRef, useState } from 'react'

export type ZenMode = 'countdown' | 'stopwatch'
export type ZenCompleteReason = 'countdown' | 'target'

export const COUNTDOWN_PRESETS_SEC = [120, 600, 900, 1800, 3600]

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
  // Stopwatch-only: lap list and an optional target time (ms). When the
  // stopwatch crosses the target, onComplete('target') fires exactly once.
  laps: number[]
  recordLap: () => void
  targetMs: number | null
  setTarget: (ms: number | null) => void
}

interface UseZenTimerOptions {
  onComplete?: (reason: ZenCompleteReason) => void
}

export function useZenTimer({ onComplete }: UseZenTimerOptions = {}): ZenTimerApi {
  const [mode, setModeState] = useState<ZenMode>('countdown')
  const [presetSec, setPresetSec] = useState(DEFAULT_PRESET_SEC)
  const [countdownMs, setCountdownMs] = useState(DEFAULT_PRESET_SEC * 1000)
  const [stopwatchMs, setStopwatchMs] = useState(0)
  const [isActive, setIsActive] = useState(false)
  const [laps, setLaps] = useState<number[]>([])
  const [targetMs, setTargetMsState] = useState<number | null>(null)

  // Wall-clock anchors: prefer absolute timestamps over decrement loops so
  // the timer stays accurate even if the renderer interval is throttled.
  const countdownEndsAt = useRef<number | null>(null)
  const stopwatchStartedAt = useRef<number | null>(null)
  const completedRef = useRef(false)
  const targetFiredRef = useRef(false)

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
          onCompleteRef.current?.('countdown')
        }
      } else {
        const startedAt = stopwatchStartedAt.current
        if (startedAt === null) return
        const elapsed = now - startedAt
        setStopwatchMs(elapsed)
        if (targetMs !== null && elapsed >= targetMs && !targetFiredRef.current) {
          targetFiredRef.current = true
          onCompleteRef.current?.('target')
        }
      }
    }, tickMs)
    return () => clearInterval(id)
  }, [isActive, mode, targetMs])

  const toggle = useCallback(() => {
    const now = Date.now()
    if (mode === 'countdown') {
      if (isActive) {
        if (countdownEndsAt.current !== null) {
          setCountdownMs(Math.max(0, countdownEndsAt.current - now))
        }
        countdownEndsAt.current = null
        setIsActive(false)
      } else {
        const startMs = countdownMs > 0 ? countdownMs : presetSec * 1000
        setCountdownMs(startMs)
        countdownEndsAt.current = now + startMs
        completedRef.current = false
        setIsActive(true)
      }
    } else {
      if (isActive) {
        if (stopwatchStartedAt.current !== null) {
          setStopwatchMs(now - stopwatchStartedAt.current)
        }
        stopwatchStartedAt.current = null
        setIsActive(false)
      } else {
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
      setLaps([])
      targetFiredRef.current = false
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
        stopwatchStartedAt.current = null
        setStopwatchMs(0)
        setLaps([])
        targetFiredRef.current = false
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
        setLaps([])
        targetFiredRef.current = false
      }
    },
    [mode, presetSec]
  )

  const recordLap = useCallback(() => {
    if (mode !== 'stopwatch') return
    const now = Date.now()
    const elapsed =
      stopwatchStartedAt.current !== null ? now - stopwatchStartedAt.current : stopwatchMs
    if (elapsed <= 0) return
    setLaps((prev) => [elapsed, ...prev].slice(0, 50))
  }, [mode, stopwatchMs])

  const setTarget = useCallback((ms: number | null) => {
    setTargetMsState(ms)
    targetFiredRef.current = false
  }, [])

  return {
    mode,
    setMode,
    isActive,
    countdownMs,
    stopwatchMs,
    presetSec,
    selectPreset,
    toggle,
    restart,
    laps,
    recordLap,
    targetMs,
    setTarget
  }
}
