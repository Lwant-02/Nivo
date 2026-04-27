import { useEffect, useState } from 'react'
import type { WeatherState } from '../components/ui/AtmosphericAura'

const REFRESH_MS = 15 * 60 * 1000

export function deriveWeatherState(a: Atmosphere | null): WeatherState | null {
  if (!a) return null
  if (a.condition === 'snowy') return 'SNOW'
  if (a.condition === 'rainy') return 'RAIN'
  if (!a.isDay) return 'NIGHT'

  const h = new Date().getHours()
  // Dawn (06–08) and dusk (17–20) on clear/partly-clear days.
  const isGolden = (h >= 6 && h < 8) || (h >= 17 && h < 20)
  if (isGolden && (a.condition === 'sunny' || a.condition === 'cloudy')) return 'GOLDEN_HOUR'

  return 'SUNNY'
}

export function useWeather(): {
  weather: Atmosphere | null
  weatherState: WeatherState | null
} {
  const [weather, setWeather] = useState<Atmosphere | null>(null)

  useEffect(() => {
    let cancelled = false

    const load = async (): Promise<void> => {
      try {
        const data = await window.api.getWeather()
        if (!cancelled) setWeather(data)
      } catch {
        if (!cancelled) setWeather(null)
      }
    }

    load()
    const id = setInterval(load, REFRESH_MS)
    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [])

  return { weather, weatherState: deriveWeatherState(weather) }
}
