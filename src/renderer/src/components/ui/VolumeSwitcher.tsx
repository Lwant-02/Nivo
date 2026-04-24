import { motion } from 'framer-motion'
import { Volume, Volume2 } from 'lucide-react'

export const VolumeSwitcher = ({
  showVolume,
  volumeLevel,
  handleVolumeChange
}: {
  showVolume: boolean
  volumeLevel: number
  handleVolumeChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}) => {
  if (!showVolume) return null

  return (
    <motion.div
      key="volume-panel"
      initial={{ opacity: 0, scale: 0.98, y: 5 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98, y: 5 }}
      className="flex items-center gap-3 text-text-dim px-1 mt-4"
    >
      <Volume size={16} />
      <input
        type="range"
        min="0"
        max="100"
        value={volumeLevel}
        onChange={handleVolumeChange}
        className="flex-1 h-[5px] rounded-full appearance-none outline-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-md transition-all duration-75"
        style={{
          background: `linear-gradient(to right, var(--lume-accent, rgba(255,255,255,0.9)) ${volumeLevel}%, var(--color-gray) ${volumeLevel}%)`
        }}
      />
      <Volume2 size={16} />
    </motion.div>
  )
}
