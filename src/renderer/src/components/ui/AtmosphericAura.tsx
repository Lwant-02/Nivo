import React, { useMemo } from 'react'
import cn from 'clsx'

import rainIcon from '../../assets/weather/rain.png'
import nightIcon from '../../assets/weather/night.png'
import goldenHourIcon from '../../assets/weather/golden_hour.png'
import snowIcon from '../../assets/weather/snow.png'
import sunnyIcon from '../../assets/weather/sunny.png'
import cloudyIcon from '../../assets/weather/cloudy.png'

export type WeatherState = 'SUNNY' | 'RAIN' | 'NIGHT' | 'GOLDEN_HOUR' | 'SNOW' | 'CLOUDY'

interface Props {
  weatherState: WeatherState
  variant?: 'background' | 'notch' | 'mini'
  className?: string
}

const PALETTES: Record<
  WeatherState,
  { glow: string; tint: string; ring: string; iconColor: string }
> = {
  SUNNY: {
    glow: 'radial-gradient(120% 80% at 50% -10%, rgba(255,205,120,0.22) 0%, rgba(255,180,90,0.10) 35%, transparent 70%)',
    tint: 'rgba(255,196,120,0.06)',
    ring: 'rgba(255,210,140,0.55)',
    iconColor: '#FFD27A'
  },
  GOLDEN_HOUR: {
    glow: 'radial-gradient(140% 90% at 50% -10%, rgba(255,150,90,0.28) 0%, rgba(255,110,140,0.12) 40%, transparent 75%)',
    tint: 'rgba(255,140,100,0.07)',
    ring: 'rgba(255,170,120,0.6)',
    iconColor: '#FF9A66'
  },
  NIGHT: {
    glow: 'radial-gradient(120% 80% at 50% -10%, rgba(90,130,220,0.22) 0%, rgba(60,90,180,0.10) 40%, transparent 75%)',
    tint: 'rgba(80,120,200,0.06)',
    ring: 'rgba(140,170,230,0.55)',
    iconColor: '#9CB7F2'
  },
  RAIN: {
    glow: 'radial-gradient(120% 80% at 50% -10%, rgba(140,170,210,0.22) 0%, rgba(90,120,160,0.10) 40%, transparent 75%)',
    tint: 'rgba(120,150,190,0.07)',
    ring: 'rgba(180,200,230,0.5)',
    iconColor: '#B6CCEA'
  },
  SNOW: {
    glow: 'radial-gradient(120% 80% at 50% -10%, rgba(220,235,255,0.20) 0%, rgba(180,210,240,0.08) 40%, transparent 75%)',
    tint: 'rgba(200,220,240,0.06)',
    ring: 'rgba(220,235,255,0.55)',
    iconColor: '#E8F1FF'
  },
  CLOUDY: {
    glow: 'radial-gradient(120% 80% at 50% -10%, rgba(255,255,255,0.15) 0%, rgba(200,200,200,0.05) 40%, transparent 75%)',
    tint: 'rgba(255,255,255,0.04)',
    ring: 'rgba(255,255,255,0.4)',
    iconColor: '#fff'
  }
}

const HARDWARE_ACCEL: React.CSSProperties = {
  willChange: 'transform, opacity',
  transform: 'translate3d(0,0,0)',
  backfaceVisibility: 'hidden'
}

const WEATHER_3D_ICONS: Record<WeatherState, string> = {
  SUNNY: sunnyIcon,
  CLOUDY: cloudyIcon,
  RAIN: rainIcon,
  NIGHT: nightIcon,
  GOLDEN_HOUR: goldenHourIcon,
  SNOW: snowIcon
}

// Deterministic pseudo-random so drops stay put across renders.
function seeded(n: number, salt = 1): number {
  const x = Math.sin(n * 9301.7 + salt * 49297) * 233280
  return x - Math.floor(x)
}

const RainDrops: React.FC = () => {
  const drops = useMemo(
    () =>
      Array.from({ length: 28 }, (_, i) => ({
        left: seeded(i, 1) * 100,
        delay: -seeded(i, 2) * 1.2,
        duration: 0.9 + seeded(i, 3) * 0.6,
        opacity: 0.35 + seeded(i, 4) * 0.45,
        height: 4 + seeded(i, 5) * 4
      })),
    []
  )

  return (
    <div
      aria-hidden
      className="absolute inset-0 overflow-hidden pointer-events-none"
      style={HARDWARE_ACCEL}
    >
      {drops.map((d, i) => (
        <span
          key={i}
          style={{
            position: 'absolute',
            left: `${d.left}%`,
            top: -10,
            width: 2,
            height: d.height,
            borderRadius: 999,
            background:
              'linear-gradient(180deg, rgba(190,215,255,0) 0%, rgba(190,215,255,0.95) 100%)',
            opacity: d.opacity,
            animation: `aura-rain-drop ${d.duration}s linear ${d.delay}s infinite`,
            ...HARDWARE_ACCEL
          }}
        />
      ))}
      <style>{`
        @keyframes aura-rain-drop {
          0%   { transform: translate3d(0, 0, 0); opacity: 0; }
          12%  { opacity: 1; }
          100% { transform: translate3d(0, 500px, 0); opacity: 0.1; }
        }
      `}</style>
    </div>
  )
}

const SnowFlakes: React.FC = () => {
  const flakes = useMemo(
    () =>
      Array.from({ length: 18 }, (_, i) => ({
        left: seeded(i, 11) * 100,
        delay: -seeded(i, 12) * 6,
        duration: 4.5 + seeded(i, 13) * 4,
        size: 2.5 + seeded(i, 14) * 2.5,
        opacity: 0.45 + seeded(i, 15) * 0.45,
        sway: seeded(i, 16) > 0.5 ? 'aura-snow-sway-a' : 'aura-snow-sway-b'
      })),
    []
  )

  return (
    <div
      aria-hidden
      className="absolute inset-0 overflow-hidden pointer-events-none"
      style={HARDWARE_ACCEL}
    >
      {flakes.map((f, i) => (
        <span
          key={i}
          style={{
            position: 'absolute',
            left: `${f.left}%`,
            top: -8,
            width: f.size,
            height: f.size,
            borderRadius: 999,
            background: 'rgba(245,250,255,0.95)',
            boxShadow: '0 0 4px rgba(220,235,255,0.7)',
            opacity: f.opacity,
            animation: `aura-snow-fall ${f.duration}s linear ${f.delay}s infinite, ${f.sway} ${
              2.4 + seeded(i, 17) * 1.6
            }s ease-in-out infinite`,
            ...HARDWARE_ACCEL
          }}
        />
      ))}
      <style>{`
        @keyframes aura-snow-fall {
          0%   { transform: translate3d(0, 0, 0); opacity: 0; }
          15%  { opacity: 1; }
          100% { transform: translate3d(0, 500px, 0); opacity: 0.1; }
        }
        @keyframes aura-snow-sway-a {
          0%, 100% { margin-left: -4px; }
          50%      { margin-left: 4px; }
        }
        @keyframes aura-snow-sway-b {
          0%, 100% { margin-left: 5px; }
          50%      { margin-left: -5px; }
        }
      `}</style>
    </div>
  )
}

const SunRays: React.FC = () => {
  const motes = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => ({
        left: seeded(i, 21) * 100,
        top: 10 + seeded(i, 22) * 70,
        delay: -seeded(i, 23) * 4,
        duration: 4 + seeded(i, 24) * 3,
        size: 2 + seeded(i, 25) * 2.5
      })),
    []
  )

  return (
    <div
      aria-hidden
      className="absolute inset-0 overflow-hidden pointer-events-none"
      style={HARDWARE_ACCEL}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(60% 40% at 50% -20%, rgba(255,210,120,0.35) 0%, rgba(255,180,80,0.12) 40%, transparent 75%)',
          ...HARDWARE_ACCEL
        }}
      />
      {motes.map((m, i) => (
        <span
          key={i}
          style={{
            position: 'absolute',
            left: `${m.left}%`,
            top: `${m.top}%`,
            width: m.size,
            height: m.size,
            borderRadius: 999,
            background: 'rgba(255,225,160,0.85)',
            boxShadow: '0 0 6px rgba(255,210,140,0.9)',
            animation: `aura-sun-float ${m.duration}s ease-in-out ${m.delay}s infinite`,
            ...HARDWARE_ACCEL
          }}
        />
      ))}
      <style>{`
        @keyframes aura-sun-float {
          0%, 100% { transform: translate3d(0, 0, 0); opacity: 0.4; }
          50%      { transform: translate3d(0, -10px, 0); opacity: 1; }
        }
      `}</style>
    </div>
  )
}

const Stars: React.FC = () => {
  const stars = useMemo(
    () =>
      Array.from({ length: 22 }, (_, i) => ({
        left: seeded(i, 31) * 100,
        top: seeded(i, 32) * 90,
        delay: -seeded(i, 33) * 3,
        duration: 1.6 + seeded(i, 34) * 2.6,
        size: 1.5 + seeded(i, 35) * 1.8
      })),
    []
  )

  return (
    <div
      aria-hidden
      className="absolute inset-0 overflow-hidden pointer-events-none"
      style={HARDWARE_ACCEL}
    >
      {stars.map((s, i) => (
        <span
          key={i}
          style={{
            position: 'absolute',
            left: `${s.left}%`,
            top: `${s.top}%`,
            width: s.size,
            height: s.size,
            borderRadius: 999,
            background: 'rgba(220,232,255,0.95)',
            boxShadow: '0 0 4px rgba(180,205,255,0.85)',
            animation: `aura-star-twinkle ${s.duration}s ease-in-out ${s.delay}s infinite`,
            ...HARDWARE_ACCEL
          }}
        />
      ))}
      <style>{`
        @keyframes aura-star-twinkle {
          0%, 100% { opacity: 0.2; transform: scale(0.85); }
          50%      { opacity: 1;   transform: scale(1.1); }
        }
      `}</style>
    </div>
  )
}

const GoldenDrift: React.FC = () => {
  const motes = useMemo(
    () =>
      Array.from({ length: 16 }, (_, i) => ({
        top: seeded(i, 41) * 100,
        delay: -seeded(i, 42) * 8,
        duration: 6 + seeded(i, 43) * 5,
        size: 2 + seeded(i, 44) * 3,
        opacity: 0.45 + seeded(i, 45) * 0.4
      })),
    []
  )

  return (
    <div
      aria-hidden
      className="absolute inset-0 overflow-hidden pointer-events-none"
      style={HARDWARE_ACCEL}
    >
      {motes.map((m, i) => (
        <span
          key={i}
          style={{
            position: 'absolute',
            left: -10,
            top: `${m.top}%`,
            width: m.size,
            height: m.size,
            borderRadius: 999,
            background: 'rgba(255,170,110,0.85)',
            boxShadow: '0 0 8px rgba(255,150,90,0.85)',
            opacity: m.opacity,
            animation: `aura-golden-drift ${m.duration}s linear ${m.delay}s infinite`,
            ...HARDWARE_ACCEL
          }}
        />
      ))}
      <style>{`
        @keyframes aura-golden-drift {
          0%   { transform: translate3d(0, 0, 0); opacity: 0; }
          15%  { opacity: 1; }
          100% { transform: translate3d(120vw, -8px, 0); opacity: 0; }
        }
      `}</style>
    </div>
  )
}

const SoftGlow: React.FC<{ state: WeatherState }> = ({ state }) => {
  const { glow, tint } = PALETTES[state]
  return (
    <div
      aria-hidden
      className="absolute inset-0 pointer-events-none"
      style={{
        ...HARDWARE_ACCEL,
        backgroundImage: glow,
        backgroundColor: tint,
        backdropFilter: 'blur(14px) saturate(115%)',
        WebkitBackdropFilter: 'blur(14px) saturate(115%)'
      }}
    />
  )
}

const ParticlesFor: React.FC<{ state: WeatherState }> = ({ state }) => {
  switch (state) {
    case 'RAIN':
      return <RainDrops />
    case 'SNOW':
      return <SnowFlakes />
    case 'SUNNY':
      return <SunRays />
    case 'NIGHT':
      return <Stars />
    case 'GOLDEN_HOUR':
      return <GoldenDrift />
    default:
      return null
  }
}

const AuraBackground: React.FC<{ state: WeatherState; className?: string }> = ({
  state,
  className
}) => (
  <div
    aria-hidden
    className={cn('absolute inset-0 overflow-hidden pointer-events-none', className)}
    style={HARDWARE_ACCEL}
  >
    <SoftGlow state={state} />
    <ParticlesFor state={state} />
  </div>
)

const AuraNotchIcon: React.FC<{ state: WeatherState; className?: string }> = ({
  state,
  className
}) => {
  return (
    <div
      className={cn('relative inline-flex items-center justify-center', className)}
      style={{
        ...HARDWARE_ACCEL
      }}
    >
      <img
        src={WEATHER_3D_ICONS[state]}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover'
        }}
        alt=""
      />
    </div>
  )
}

const MiniRain: React.FC = () => {
  const drops = useMemo(
    () =>
      Array.from({ length: 6 }, (_, i) => ({
        left: 12 + seeded(i, 51) * 70,
        delay: -seeded(i, 52) * 1,
        duration: 0.7 + seeded(i, 53) * 0.5
      })),
    []
  )
  return (
    <>
      {drops.map((d, i) => (
        <span
          key={i}
          style={{
            position: 'absolute',
            left: `${d.left}%`,
            top: -3,
            width: 1.5,
            height: 4,
            borderRadius: 999,
            background: 'linear-gradient(180deg, rgba(190,215,255,0) 0%, rgba(210,225,255,1) 100%)',
            animation: `aura-mini-rain ${d.duration}s linear ${d.delay}s infinite`,
            ...HARDWARE_ACCEL
          }}
        />
      ))}
      <style>{`
        @keyframes aura-mini-rain {
          0%   { transform: translate3d(0, 0, 0); opacity: 0; }
          20%  { opacity: 1; }
          100% { transform: translate3d(0, 26px, 0); opacity: 0.2; }
        }
      `}</style>
    </>
  )
}

const MiniSnow: React.FC = () => {
  const flakes = useMemo(
    () =>
      Array.from({ length: 5 }, (_, i) => ({
        left: 10 + seeded(i, 61) * 75,
        delay: -seeded(i, 62) * 4,
        duration: 3.4 + seeded(i, 63) * 1.8,
        size: 2 + seeded(i, 64) * 1.4
      })),
    []
  )
  return (
    <>
      {flakes.map((f, i) => (
        <span
          key={i}
          style={{
            position: 'absolute',
            left: `${f.left}%`,
            top: -2,
            width: f.size,
            height: f.size,
            borderRadius: 999,
            background: 'rgba(245,250,255,0.95)',
            boxShadow: '0 0 3px rgba(220,235,255,0.8)',
            animation: `aura-mini-snow ${f.duration}s linear ${f.delay}s infinite`,
            ...HARDWARE_ACCEL
          }}
        />
      ))}
      <style>{`
        @keyframes aura-mini-snow {
          0%   { transform: translate3d(0, 0, 0); opacity: 0; }
          20%  { opacity: 1; }
          50%  { transform: translate3d(2px, 14px, 0); }
          100% { transform: translate3d(-2px, 28px, 0); opacity: 0.2; }
        }
      `}</style>
    </>
  )
}

const MiniSun: React.FC = () => {
  const motes = useMemo(
    () =>
      Array.from({ length: 5 }, (_, i) => ({
        left: 14 + seeded(i, 71) * 70,
        top: 18 + seeded(i, 72) * 50,
        delay: -seeded(i, 73) * 3,
        duration: 2.2 + seeded(i, 74) * 1.6
      })),
    []
  )
  return (
    <>
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(60% 80% at 50% 110%, rgba(255,210,120,0.55) 0%, transparent 70%)'
        }}
      />
      {motes.map((m, i) => (
        <span
          key={i}
          style={{
            position: 'absolute',
            left: `${m.left}%`,
            top: `${m.top}%`,
            width: 2,
            height: 2,
            borderRadius: 999,
            background: 'rgba(255,225,160,0.95)',
            boxShadow: '0 0 4px rgba(255,210,140,0.95)',
            animation: `aura-mini-sun ${m.duration}s ease-in-out ${m.delay}s infinite`,
            ...HARDWARE_ACCEL
          }}
        />
      ))}
      <style>{`
        @keyframes aura-mini-sun {
          0%, 100% { transform: translate3d(0, 0, 0); opacity: 0.4; }
          50%      { transform: translate3d(0, -3px, 0); opacity: 1; }
        }
      `}</style>
    </>
  )
}

const MiniStars: React.FC = () => {
  const stars = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => ({
        left: 10 + seeded(i, 81) * 80,
        top: 14 + seeded(i, 82) * 65,
        delay: -seeded(i, 83) * 2,
        duration: 1.4 + seeded(i, 84) * 1.6
      })),
    []
  )
  return (
    <>
      {stars.map((s, i) => (
        <span
          key={i}
          style={{
            position: 'absolute',
            left: `${s.left}%`,
            top: `${s.top}%`,
            width: 1.6,
            height: 1.6,
            borderRadius: 999,
            background: 'rgba(220,232,255,0.95)',
            boxShadow: '0 0 3px rgba(180,205,255,0.9)',
            animation: `aura-mini-twinkle ${s.duration}s ease-in-out ${s.delay}s infinite`,
            ...HARDWARE_ACCEL
          }}
        />
      ))}
      <style>{`
        @keyframes aura-mini-twinkle {
          0%, 100% { opacity: 0.2; transform: scale(0.85); }
          50%      { opacity: 1;   transform: scale(1.15); }
        }
      `}</style>
    </>
  )
}

const MiniGolden: React.FC = () => {
  const motes = useMemo(
    () =>
      Array.from({ length: 5 }, (_, i) => ({
        top: 15 + seeded(i, 91) * 60,
        delay: -seeded(i, 92) * 4,
        duration: 3 + seeded(i, 93) * 2
      })),
    []
  )
  return (
    <>
      {motes.map((m, i) => (
        <span
          key={i}
          style={{
            position: 'absolute',
            left: -4,
            top: `${m.top}%`,
            width: 2,
            height: 2,
            borderRadius: 999,
            background: 'rgba(255,170,110,0.9)',
            boxShadow: '0 0 4px rgba(255,150,90,0.9)',
            animation: `aura-mini-golden ${m.duration}s linear ${m.delay}s infinite`,
            ...HARDWARE_ACCEL
          }}
        />
      ))}
      <style>{`
        @keyframes aura-mini-golden {
          0%   { transform: translate3d(0, 0, 0); opacity: 0; }
          20%  { opacity: 1; }
          100% { transform: translate3d(48px, -2px, 0); opacity: 0; }
        }
      `}</style>
    </>
  )
}

const MiniParticles: React.FC<{ state: WeatherState }> = ({ state }) => {
  switch (state) {
    case 'RAIN':
      return <MiniRain />
    case 'SNOW':
      return <MiniSnow />
    case 'SUNNY':
      return <MiniSun />
    case 'NIGHT':
      return <MiniStars />
    case 'GOLDEN_HOUR':
      return <MiniGolden />
    default:
      return null
  }
}

const AuraMini: React.FC<{ state: WeatherState; className?: string }> = ({ state, className }) => {
  const { iconColor, ring, tint } = PALETTES[state]

  return (
    <div
      aria-label={`Weather: ${state.toLowerCase()}`}
      className={cn('relative overflow-hidden inline-flex items-center', className)}
      style={{
        width: 42,
        height: 22,
        borderRadius: 999,
        background: `linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(0,0,0,0.30) 100%), ${tint}`,
        boxShadow: `inset 0 0 0 1px ${ring}, 0 0 10px ${ring}`,
        ...HARDWARE_ACCEL
      }}
    >
      <div
        aria-hidden
        className="absolute inset-0 overflow-hidden"
        style={{ borderRadius: 999, ...HARDWARE_ACCEL }}
      >
        <MiniParticles state={state} />
      </div>
      <span
        className="relative inline-flex items-center justify-center"
        style={{ width: 22, height: 22, marginLeft: 0 }}
      >
        <img
          src={WEATHER_3D_ICONS[state]}
          style={{
            width: 14,
            height: 14,
            objectFit: 'contain',
            filter: `drop-shadow(0 0 4px ${iconColor})`
          }}
          alt=""
        />
      </span>
    </div>
  )
}

export const AtmosphericAura: React.FC<Props> = ({
  weatherState,
  variant = 'background',
  className
}) => {
  if (variant === 'notch') {
    return <AuraNotchIcon state={weatherState} className={className} />
  }
  if (variant === 'mini') {
    return <AuraMini state={weatherState} className={className} />
  }
  return <AuraBackground state={weatherState} className={className} />
}

export default AtmosphericAura
