import { useState, useEffect, useRef, useCallback } from 'react'

interface UseFocusTimerOptions {
  defaultMinutes: number
  onComplete?: () => void
}

export function useFocusTimer({ defaultMinutes, onComplete }: UseFocusTimerOptions) {
  const [isActive, setIsActive] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(defaultMinutes * 60)
  const [totalDuration, setTotalDuration] = useState(defaultMinutes * 60)

  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const onCompleteRef = useRef(onComplete)
  const defaultMinutesRef = useRef(defaultMinutes)

  useEffect(() => {
    onCompleteRef.current = onComplete
  }, [onComplete])

  useEffect(() => {
    defaultMinutesRef.current = defaultMinutes
    if (!isActive) setTimeRemaining(defaultMinutes * 60)
  }, [defaultMinutes, isActive])

  const start = useCallback((minutes?: number) => {
    const duration = (minutes ?? defaultMinutesRef.current) * 60
    setTotalDuration(duration)
    setTimeRemaining(duration)
    setIsActive(true)
    setIsPaused(false)
  }, [])

  const pause = useCallback(() => setIsPaused(true), [])
  const resume = useCallback(() => setIsPaused(false), [])

  const stop = useCallback(() => {
    setIsActive(false)
    setIsPaused(false)
    setTimeRemaining(defaultMinutesRef.current * 60)
    if (timerRef.current) clearInterval(timerRef.current)
  }, [])

  useEffect(() => {
    if (isActive && !isPaused && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            setIsActive(false)
            if (timerRef.current) clearInterval(timerRef.current)
            onCompleteRef.current?.()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else if (timerRef.current) {
      clearInterval(timerRef.current)
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isActive, isPaused, timeRemaining])

  const progress = totalDuration > 0 ? (totalDuration - timeRemaining) / totalDuration : 0

  return {
    isActive,
    isPaused,
    timeRemaining,
    totalDuration,
    progress,
    start,
    pause,
    resume,
    stop
  }
}
