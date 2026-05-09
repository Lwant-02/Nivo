import { net } from 'electron'

export type WeatherCondition = 'sunny' | 'rainy' | 'cloudy' | 'snowy'

export interface NivoAtmosphere {
  temp: number
  isDay: boolean
  condition: WeatherCondition
  location?: string
}

export interface GeocodeResult {
  name: string
  lat: number
  lon: number
  country?: string
  admin1?: string
}

interface ManualLocation {
  name: string
  lat: number
  lon: number
}

function mapCondition(code: number): WeatherCondition {
  // WMO Weather interpretation codes
  if (code <= 1) return 'sunny'
  if (code <= 3) return 'cloudy'
  if (code >= 45 && code <= 48) return 'cloudy'
  if (code >= 51 && code <= 67) return 'rainy'
  if (code >= 71 && code <= 77) return 'snowy'
  if (code >= 80 && code <= 82) return 'rainy'
  if (code >= 85 && code <= 86) return 'snowy'
  if (code >= 95) return 'rainy'
  return 'sunny'
}

function requestJSON(url: string): Promise<any> {
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

export class WeatherService {
  private getOverride: () => ManualLocation | null

  constructor(getOverride: () => ManualLocation | null = () => null) {
    this.getOverride = getOverride
  }

  async getAtmosphere(): Promise<NivoAtmosphere | null> {
    const override = this.getOverride()
    if (override) {
      return this.fetchAt(override.lat, override.lon, override.name)
    }
    return this.fetchByIP()
  }

  /**
   * Geocode a city/place name to coordinates via Open-Meteo's free
   * geocoding API. Returns the top match or null.
   */
  async geocode(query: string): Promise<GeocodeResult | null> {
    const q = query.trim()
    if (!q) return null

    try {
      const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=1&language=en&format=json`
      const data = await requestJSON(url)
      const hit = data?.results?.[0]
      if (!hit?.latitude || !hit?.longitude) return null

      return {
        name: hit.name,
        lat: hit.latitude,
        lon: hit.longitude,
        country: hit.country,
        admin1: hit.admin1
      }
    } catch (err) {
      console.error('[WeatherService] Geocoding failed:', err)
      return null
    }
  }

  private async fetchAt(lat: number, lon: number, name: string): Promise<NivoAtmosphere | null> {
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,is_day,weather_code&timezone=auto`
      const data = await requestJSON(url)
      if (!data?.current) return null

      return {
        temp: Math.round(data.current.temperature_2m),
        isDay: data.current.is_day === 1,
        condition: mapCondition(data.current.weather_code),
        location: name
      }
    } catch (err) {
      console.error('[WeatherService] Failed to fetch weather at coords:', err)
      return null
    }
  }

  private async fetchByIP(): Promise<NivoAtmosphere | null> {
    try {
      const locData = await requestJSON('http://ip-api.com/json/?fields=lat,lon,city')
      if (!locData?.lat || !locData?.lon) return null
      return this.fetchAt(locData.lat, locData.lon, locData.city)
    } catch (err) {
      console.error('[WeatherService] IP geolocation failed:', err)
      return null
    }
  }
}
