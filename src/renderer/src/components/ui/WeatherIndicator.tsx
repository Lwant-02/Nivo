import React from 'react'
import { Sun, Cloud, CloudRain, Snowflake, Moon } from 'lucide-react'
import { motion } from 'framer-motion'

interface WeatherIndicatorProps {
  weather: {
    temp: number
    isDay: boolean
    condition: 'sunny' | 'rainy' | 'cloudy' | 'snowy'
  } | null
}

export const WeatherIndicator: React.FC<WeatherIndicatorProps> = ({ weather }) => {
  if (!weather) return null

  const Icon = (() => {
    if (!weather.isDay && weather.condition === 'sunny') return Moon
    switch (weather.condition) {
      case 'sunny':
        return Sun
      case 'rainy':
        return CloudRain
      case 'cloudy':
        return Cloud
      case 'snowy':
        return Snowflake
      default:
        return Sun
    }
  })()

  const isRainy = weather.condition === 'rainy'

  return (
    <div className="relative flex items-center justify-center">
      {/* The Glow Effect seen in Image 1 */}
      {isRainy && (
        <motion.div
          initial={{ opacity: 0.4, scale: 0.8 }}
          animate={{ opacity: [0.3, 0.6, 0.3], scale: [0.9, 1.1, 0.9] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-0 rounded-full blur-md bg-blue-400/30"
        />
      )}
      
      <div className="relative size-7 rounded-full flex items-center justify-center bg-white/5 border border-white/10 shadow-lg backdrop-blur-sm">
        <Icon 
          size={14} 
          className={isRainy ? "text-blue-300" : "text-white/80"} 
          strokeWidth={2.5} 
        />
      </div>
    </div>
  )
}
