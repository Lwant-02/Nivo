import { AtmosphericAura } from './AtmosphericAura'
import { BentoEmptyState } from './BentoEmptyState'

interface WeatherPaneProps {
  weather: any | null
  weatherState: any
}

export const WeatherPane = ({ weather, weatherState }: WeatherPaneProps) => {
  if (!weather) {
    return (
      <BentoEmptyState
        title="Weather Unavailable"
        description="Check your connection or location settings."
      />
    )
  }

  const conditionLabel = (() => {
    if (!weather.isDay && weather.condition === 'sunny') return 'Clear'
    switch (weather.condition) {
      case 'sunny':
        return 'Sunny'
      case 'rainy':
        return 'Rainy'
      case 'cloudy':
        return 'Cloudy'
      case 'snowy':
        return 'Snowy'
      default:
        return 'Sunny'
    }
  })()

  const isCloudy = weather.condition?.toLowerCase().includes('cloud')
  const stateForAura = isCloudy ? 'CLOUDY' : (weatherState ?? (weather.isDay ? 'SUNNY' : 'NIGHT'))

  return (
    <div
      className="relative w-full h-full overflow-hidden"
      style={{
        borderRadius: '30px',
        border: '1px solid rgba(255,255,255,0.25)',
        background: 'rgba(255,255,255,0.04)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.20)',
        display: 'flex',
        flexDirection: 'column',
        padding: '16px 18px',
        boxSizing: 'border-box'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span
            style={{
              fontSize: '60px',
              fontWeight: '800',
              color: '#fff',
              lineHeight: 1,
              letterSpacing: '-2px'
            }}
          >
            {Math.round(weather.temp)}°
          </span>
          <div
            style={{
              display: 'flex',
              gap: '8px',
              fontSize: '13px',
              color: 'rgba(255,255,255,0.6)',
              marginTop: '6px',
              fontWeight: '700'
            }}
          >
            <span>H: {Math.round(weather.temp + 5)}°</span>
            <span>L: {Math.round(weather.temp - 5)}°</span>
          </div>
        </div>
        <div style={{ marginRight: '-10px', marginTop: '-10px' }}>
          <AtmosphericAura weatherState={stateForAura} variant="notch" className="size-20" />
        </div>
      </div>

      <div style={{ display: 'flex', gap: '6px', marginTop: 'auto' }}>
        <div
          style={{
            background: 'rgba(255,255,255,0.12)',
            padding: '4px 10px',
            borderRadius: '8px',
            fontSize: '12px',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontWeight: '600',
            backdropFilter: 'blur(4px)'
          }}
        >
          <span style={{ opacity: 0.6 }}>📍</span>
          {weather.location || 'Location'}
        </div>
        <div
          style={{
            background: 'rgba(255,255,255,0.12)',
            padding: '4px 10px',
            borderRadius: '8px',
            fontSize: '12px',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontWeight: '600',
            backdropFilter: 'blur(4px)'
          }}
        >
          <AtmosphericAura weatherState={stateForAura} variant="notch" className="size-4 mr-1" />
          {conditionLabel}
        </div>
      </div>
    </div>
  )
}
