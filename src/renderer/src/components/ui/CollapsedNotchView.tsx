import React from 'react'
import { motion } from 'framer-motion'
import { Thumbnail } from './Thumbnail'
import { MusicVisualizer } from './MusicVisualizer'

interface CollapsedNotchViewProps {
  focusTimer: {
    isActive: boolean
    isPaused: boolean
    progress: number
  }
  settings: any
  displayArt: string | null
  title: string
  isPlaying: boolean
  showLottie: boolean
  accentColor: string
}

export const CollapsedNotchView: React.FC<CollapsedNotchViewProps> = ({
  focusTimer,
  settings,
  displayArt,
  title,
  isPlaying,
  showLottie,
  accentColor
}) => {
  return (
    <div className="relative flex items-center px-6 h-full justify-between w-full">
      {focusTimer.isActive ? (
        <div
          className="relative z-10 flex items-center w-full justify-between h-full"
          style={{ paddingLeft: '16px', paddingRight: '12px' }}
        >
          <div className="flex items-center" style={{ gap: '10px' }}>
            <span
              className="text-[10px] font-bold uppercase tracking-[0.24em]"
              style={{ color: 'var(--lume-accent, #a855f7)' }}
            >
              {focusTimer.isPaused ? 'Paused' : 'Focus'}
            </span>
          </div>

          <div className="relative size-6 flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 20 20" className="-rotate-90">
              <circle
                cx="10"
                cy="10"
                r="8"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="2"
                fill="transparent"
              />
              <motion.circle
                cx="10"
                cy="10"
                r="8"
                stroke="var(--lume-accent, #a855f7)"
                strokeWidth="2"
                strokeDasharray={2 * Math.PI * 8}
                initial={false}
                animate={{
                  strokeDashoffset: 2 * Math.PI * 8 - focusTimer.progress * 2 * Math.PI * 8
                }}
                transition={{ duration: 0.9, ease: 'linear' }}
                strokeLinecap="round"
                fill="transparent"
                style={{
                  filter: 'drop-shadow(0 0 4px var(--lume-accent))'
                }}
              />
            </svg>
          </div>
        </div>
      ) : (
        !showLottie && (
          <div className="relative z-10 flex items-center justify-between w-full">
            <Thumbnail
              src={settings.showAlbumArt ? displayArt : null}
              alt={title}
              size="pill"
              isPlaying={isPlaying}
              accentColor={accentColor}
            />
            <MusicVisualizer isPlaying={isPlaying} isStatic={!settings.showVisualizer} />
          </div>
        )
      )}
    </div>
  )
}
