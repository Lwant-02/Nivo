import { motion } from 'framer-motion'
import cn from 'clsx'

interface MusicVisualizerProps {
  isPlaying?: boolean
  className?: string
}

const bars = [
  { duration: 0.8, heights: ['20%', '100%', '40%', '80%', '20%'] },
  { duration: 0.6, heights: ['30%', '100%', '50%', '90%', '30%'] },
  { duration: 0.9, heights: ['25%', '75%', '45%', '95%', '25%'] },
  { duration: 0.7, heights: ['40%', '90%', '20%', '100%', '40%'] },
  { duration: 0.85, heights: ['20%', '100%', '40%', '80%', '20%'] }
]

export const MusicVisualizer = ({ isPlaying = false, className = '' }: MusicVisualizerProps) => {
  return (
    <div className={cn('flex items-center gap-[2px] h-4', className)}>
      {bars.map((bar, i) => (
        <motion.div
          key={i}
          initial={false}
          animate={{
            height: isPlaying ? bar.heights : '2px'
          }}
          transition={{
            duration: isPlaying ? bar.duration : 0.3,
            repeat: isPlaying ? Infinity : 0,
            ease: 'easeInOut',
            times: [0, 0.25, 0.5, 0.75, 1]
          }}
          className="w-[3px] bg-white/50 rounded-full"
        />
      ))}
    </div>
  )
}
