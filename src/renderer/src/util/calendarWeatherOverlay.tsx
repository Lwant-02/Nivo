import React from 'react'
import { Sun, Moon, Cloud, CloudRain, Snowflake } from 'lucide-react'

const ICON_COLOR: Record<WeatherCondition, string> = {
  sunny: '#FFB74D',
  rainy: '#7FA9D9',
  cloudy: '#B5C0CC',
  snowy: '#D9E6F2'
}

/**
 * Returns a small weather glyph to overlay on the current date of a calendar UI,
 * or null if the feature is disabled or weather is unavailable.
 *
 * Pure function (no hooks) so it can be called from any render path.
 */
export function getCalendarWeatherIcon(
  weather: Atmosphere | null,
  enabled: boolean,
  size = 12
): React.ReactNode {
  if (!enabled || !weather) return null

  const isNightClear = !weather.isDay && weather.condition === 'sunny'
  const Icon = isNightClear
    ? Moon
    : weather.condition === 'sunny'
      ? Sun
      : weather.condition === 'rainy'
        ? CloudRain
        : weather.condition === 'snowy'
          ? Snowflake
          : Cloud

  const color = isNightClear ? '#9CB7F2' : ICON_COLOR[weather.condition]

  return (
    <Icon
      size={size}
      strokeWidth={2.4}
      color={color}
      style={{ filter: `drop-shadow(0 0 3px ${color}66)` }}
      aria-label={`Weather: ${weather.condition}, ${weather.temp}°`}
    />
  )
}
