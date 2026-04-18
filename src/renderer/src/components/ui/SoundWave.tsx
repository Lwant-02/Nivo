import { motion } from 'framer-motion'

interface SoundWaveProps {
  isPlaying?: boolean
  size?: 'md' | 'lg'
  className?: string
}

const sizeConfig = {
  md: { height: 'h-4', barWidth: 'w-[3px]', gap: 'gap-[2px]' },
  lg: { height: 'h-10', barWidth: 'w-[4px]', gap: 'gap-[3px]' }
}

const smallBars = [0.6, 0.9, 0.5, 0.8, 0.4]
const bigBars = [0.6, 0.9, 0.5, 0.8, 0.4, 0.6, 0.9, 0.5]

export const SoundWave = ({ isPlaying = false, size = 'md', className = '' }: SoundWaveProps) => {
  const { height, barWidth, gap } = sizeConfig[size]

  const bars = size === 'md' ? smallBars : bigBars

  return (
    <div className={`flex items-end ${gap} ${height} ${className}`}>
      {bars.map((h, i) => (
        <motion.div
          key={i}
          animate={{
            height: [`${h * 40}%`, `${h * 100}%`, `${h * 60}%`, `${h * 100}%`, `${h * 40}%`]
          }}
          transition={{
            repeat: Infinity,
            duration: isPlaying ? 0.6 + i * 0.15 : 1,
            ease: 'easeInOut',
            times: [0, 0.2, 0.5, 0.8, 1]
          }}
          className={`${barWidth} bg-purple rounded-full shadow-[0_0_8px_var(--color-purple-glow)]`}
        />
      ))}
    </div>
  )
}
