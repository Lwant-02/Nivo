import cn from 'clsx'
import type { CSSProperties } from 'react'

interface MusicVisualizerProps {
  isPlaying?: boolean
  className?: string
}

const bars = [
  { duration: 0.8, heights: [0.2, 1.0, 0.4, 0.8] },
  { duration: 0.6, heights: [0.3, 1.0, 0.5, 0.9] },
  { duration: 0.9, heights: [0.25, 0.75, 0.45, 0.95] },
  { duration: 0.7, heights: [0.4, 0.9, 0.2, 1.0] },
  { duration: 0.85, heights: [0.2, 1.0, 0.4, 0.8] }
]

export const MusicVisualizer = ({ isPlaying = false, className = '' }: MusicVisualizerProps) => {
  return (
    <div className={cn('flex items-center gap-[2px] h-3', className)}>
      {bars.map((bar, i) => {
        const style = {
          '--bar-0': bar.heights[0],
          '--bar-1': bar.heights[1],
          '--bar-2': bar.heights[2],
          '--bar-3': bar.heights[3],
          animationDuration: `${bar.duration}s`,
          animationDelay: `-${i * 0.07}s`,
          animationPlayState: isPlaying ? 'running' : 'paused',
          transform: isPlaying ? undefined : 'scaleY(0.2)',
          opacity: isPlaying ? 1 : 0.4,
          transformOrigin: 'center',
          willChange: 'transform, opacity',
          transition: isPlaying ? undefined : 'opacity 0.3s ease, transform 0.3s ease'
        } as CSSProperties

        return (
          <div
            key={i}
            style={style}
            className={cn(
              'w-[3px] h-full bg-white rounded-full',
              isPlaying && 'music-bar-animate'
            )}
          />
        )
      })}
    </div>
  )
}
