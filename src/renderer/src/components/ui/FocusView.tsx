import { motion } from 'framer-motion'
import { Pause, Play, Square } from 'lucide-react'
import { formatTime } from '@renderer/util'

interface FocusViewProps {
  timeRemaining: number
  totalDuration: number
  progress: number
  isPaused: boolean
  onPause: () => void
  onResume: () => void
  onStop: () => void
}

export function FocusView({
  timeRemaining,
  totalDuration,
  progress,
  isPaused,
  onPause,
  onResume,
  onStop
}: FocusViewProps) {
  const size = 110
  const stroke = 5
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - progress * circumference
  const elapsedMin = Math.floor((totalDuration - timeRemaining) / 60)
  const totalMin = Math.round(totalDuration / 60)

  return (
    <div
      className="flex items-center justify-between h-full w-full"
      style={{ paddingLeft: '24px', paddingRight: '24px' }}
    >
      <div className="flex items-center" style={{ gap: '28px' }}>
        <div
          className="relative shrink-0 flex items-center justify-center"
          style={{ width: size, height: size }}
        >
          <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            className="-rotate-90 absolute inset-0"
          >
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="rgba(255,255,255,0.06)"
              strokeWidth={stroke}
              fill="transparent"
            />
            <motion.circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="var(--lume-accent, #a855f7)"
              strokeWidth={stroke}
              strokeDasharray={circumference}
              initial={false}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              strokeLinecap="round"
              fill="transparent"
              style={{
                filter: 'drop-shadow(0 0 8px var(--lume-accent-glow, rgba(168,85,247,0.55)))',
                opacity: isPaused ? 0.55 : 1
              }}
            />
          </svg>
          <div className="flex flex-col items-center justify-center z-10 leading-none">
            <span
              className="text-[9px] font-bold uppercase tracking-[0.24em]"
              style={{
                color: isPaused ? 'rgba(255,255,255,0.45)' : 'var(--lume-accent, #a855f7)',
                marginBottom: '4px'
              }}
            >
              {isPaused ? 'Paused' : 'Focus'}
            </span>
            <span className="text-[26px] font-bold tracking-tighter tabular-nums text-white">
              {formatTime(timeRemaining)}
            </span>
            <span
              className="text-[10px] font-medium tabular-nums text-white/40"
              style={{ marginTop: '4px' }}
            >
              {elapsedMin}m of {totalMin}m
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <h1 className="text-[13px] text-center font-bold tracking-[0.24em] text-text uppercase">
          Zen Bar
        </h1>
        <div className="flex items-center" style={{ gap: '16px' }}>
          <div className="flex flex-col items-center justify-center gap-1">
            <button
              onClick={onStop}
              className="flex flex-col gap-2 items-center justify-center size-14 rounded-full bg-white/8 hover:bg-white/14 border border-white/8 transition-all active:scale-95 shadow-lg"
              aria-label="End session"
            >
              <Square size={20} className="text-text" fill="currentColor" />
            </button>
            <p className="text-xs font-bold tracking-tight text-text">Cancel</p>
          </div>

          <div className="flex flex-col items-center justify-center gap-1">
            <button
              onClick={isPaused ? onResume : onPause}
              className="flex items-center justify-center size-14 rounded-full transition-all active:scale-95 shadow-xl"
              style={{
                background: 'var(--lume-accent, #a855f7)',
                boxShadow: '0 8px 24px var(--lume-accent-glow, rgba(168,85,247,0.5))'
              }}
              aria-label={isPaused ? 'Resume' : 'Pause'}
            >
              {isPaused ? (
                <Play size={20} fill="currentColor" className="text-text translate-x-px" />
              ) : (
                <Pause size={20} fill="currentColor" className="text-text" />
              )}
            </button>
            <p className="text-xs font-bold tracking-tight text-text">
              {isPaused ? 'Resume' : 'Pause'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
