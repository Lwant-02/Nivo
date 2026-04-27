import { net } from 'electron'

export type WeatherCondition = 'sunny' | 'rainy' | 'cloudy' | 'snowy'

export interface NivoAtmosphere {
  temp: number
  isDay: boolean
  condition: WeatherCondition
}

/**
 * Abstract provider interface to allow swapping between Open-Meteo,
 * Apple WeatherKit, or other sources without changing UI code.
 */
export interface AtmosphereProvider {
  fetchWeather(): Promise<NivoAtmosphere | null>
}

/**
 * Privacy-first Open-Meteo implementation.
 * Uses coarse IP-based geolocation (no GPS tracking) and free API (no keys).
 */
export class OpenMeteoProvider implements AtmosphereProvider {
  private mapCondition(code: number): WeatherCondition {
    // WMO Weather interpretation codes (WW)
    // https://open-meteo.com/en/docs
    if (code <= 1) return 'sunny' // Clear
    if (code <= 3) return 'cloudy' // Partly cloudy / Overcast
    if (code >= 45 && code <= 48) return 'cloudy' // Fog
    if (code >= 51 && code <= 67) return 'rainy' // Drizzle / Rain
    if (code >= 71 && code <= 77) return 'snowy' // Snow
    if (code >= 80 && code <= 82) return 'rainy' // Rain showers
    if (code >= 85 && code <= 86) return 'snowy' // Snow showers
    if (code >= 95) return 'rainy' // Thunderstorm
    return 'sunny'
  }

  async fetchWeather(): Promise<NivoAtmosphere | null> {
    try {
      // 1. Get coarse location via IP (No API key, anonymous)
      const locData = await this.requestJSON('http://ip-api.com/json/?fields=lat,lon')
      if (!locData?.lat || !locData?.lon) return null

      // 2. Fetch weather data from Open-Meteo
      const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${locData.lat}&longitude=${locData.lon}&current=temperature_2m,is_day,weather_code&timezone=auto`
      const data = await this.requestJSON(weatherUrl)

      if (!data?.current) return null

      return {
        temp: Math.round(data.current.temperature_2m),
        isDay: data.current.is_day === 1,
        condition: this.mapCondition(data.current.weather_code)
      }
    } catch (err) {
      console.error('[OpenMeteoProvider] Failed to fetch weather:', err)
      return null
    }
  }

  private requestJSON(url: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const request = net.request(url)
      request.on('response', (response) => {
        let body = ''
        response.on('data', (chunk) => {
          body += chunk.toString()
        })
        response.on('end', () => {
          try {
            resolve(JSON.parse(body))
          } catch (e) {
            reject(e)
          }
        })
      })
      request.on('error', (err) => reject(err))
      request.end()
    })
  }
}

/**
 * Main Orchestrator for Weather/Atmospheric data
 */
export class WeatherService {
  private provider: AtmosphereProvider

  constructor(provider: AtmosphereProvider = new OpenMeteoProvider()) {
    this.provider = provider
  }

  public async getAtmosphere(): Promise<NivoAtmosphere | null> {
    return this.provider.fetchWeather()
  }

  /**
   * Helper to swap providers at runtime (e.g. when user upgrades to WeatherKit)
   */
  public setProvider(provider: AtmosphereProvider) {
    this.provider = provider
  }
}
