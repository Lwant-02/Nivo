import React, { useState } from 'react'
import {
  IconPlayerPlayFilled,
  IconPlayerPauseFilled,
  IconClock,
  IconHourglass,
  IconRotate
} from '@tabler/icons-react'

interface PresetCardProps {
  time: string
  onClick?: () => void
  accentColor: string
  isSelected?: boolean
}

const PresetCard: React.FC<PresetCardProps> = ({ time, onClick, accentColor, isSelected }) => (
  <div
    onClick={onClick}
    style={{
      background: isSelected ? `${accentColor}15` : 'rgba(255,255,255,0.03)',
      border: isSelected ? `1px solid ${accentColor}40` : '1px solid rgba(255,255,255,0.08)',
      borderRadius: '20px',
      padding: '6px 10px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    }}
  >
    <div
      style={{
        color: isSelected ? accentColor : '#fff',
        fontSize: '20px',
        fontWeight: '800'
      }}
    >
      {time}
    </div>
  </div>
)

interface ZenBarViewProps {
  accentColor: string
}

export const ZenBarView: React.FC<ZenBarViewProps> = ({ accentColor }) => {
  const [mode, setMode] = useState<'countdown' | 'stopwatch'>('countdown')
  const [isActive, setIsActive] = useState(false)
  const [displayTime, setDisplayTime] = useState('10:00')

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        gap: '12px',
        padding: '0px 0px',
        height: '100%',
        boxSizing: 'border-box'
      }}
    >
      {/* Left Pane - Main Display */}
      <div
        style={{
          flex: 1,
          background: 'rgba(255,255,255,0.04)',
          borderRadius: '30px',
          display: 'flex',
          flexDirection: 'column',
          padding: '10px',
          border: '1px solid rgba(255,255,255,0.05)',
          justifyContent: 'space-between',
          overflow: 'hidden'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
          <div
            style={{
              fontSize: mode === 'countdown' ? '56px' : '52px',
              fontWeight: '900',
              color: '#fff',
              letterSpacing: '-0.04em',
              fontFamily: 'system-ui'
            }}
          >
            {displayTime}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          <div
            onClick={() => setIsActive(!isActive)}
            style={{
              flex: 1,
              background: isActive ? `${accentColor}30` : `${accentColor}20`,
              height: '38px',
              borderRadius: '30px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              border: isActive ? `1px solid ${accentColor}60` : `1px solid ${accentColor}40`
            }}
          >
            {isActive ? (
              <>
                <IconPlayerPauseFilled size={16} style={{ color: accentColor }} />
                <span style={{ fontSize: '12px', fontWeight: '800', color: accentColor }}>
                  Pause
                </span>
              </>
            ) : (
              <>
                <IconPlayerPlayFilled size={16} style={{ color: accentColor }} />
                <span style={{ fontSize: '12px', fontWeight: '800', color: accentColor }}>
                  Play
                </span>
              </>
            )}
          </div>
          <div
            onClick={() => {
              setIsActive(false)
              // Here you might reset the actual timer logic later
            }}
            style={{
              flex: 1,
              background: 'rgba(255,255,255,0.06)',
              height: '38px',
              borderRadius: '30px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <IconRotate size={16} stroke={2.5} style={{ color: '#fff' }} />
            <span style={{ fontSize: '12px', fontWeight: '800', color: '#fff' }}>Restart</span>
          </div>
        </div>
      </div>

      {/* Right Pane - Presets & Tabs */}
      <div style={{ flex: 1.5, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {/* Custom Tabs */}
        <div
          style={{
            background: 'rgba(255,255,255,0.03)',
            borderRadius: '100px',
            padding: '3px',
            display: 'flex',
            gap: '2px',
            border: '1px solid rgba(255,255,255,0.05)'
          }}
        >
          <div
            onClick={() => {
              setMode('countdown')
              setDisplayTime('10:00')
              setIsActive(false)
            }}
            style={{
              flex: 1,
              background:
                mode === 'countdown'
                  ? 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.03) 100%)'
                  : 'transparent',
              border:
                mode === 'countdown' ? '1px solid rgba(255,255,255,0.1)' : '1px solid transparent',
              borderRadius: '100px',
              height: '30px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              color: mode === 'countdown' ? '#fff' : 'rgba(255,255,255,0.4)',
              fontSize: '11px',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <IconHourglass size={14} stroke={2} />
            Countdown
          </div>
          <div
            onClick={() => {
              setMode('stopwatch')
              setDisplayTime('00:00.00')
              setIsActive(false)
            }}
            style={{
              flex: 1,
              background:
                mode === 'stopwatch'
                  ? 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.03) 100%)'
                  : 'transparent',
              border:
                mode === 'stopwatch' ? '1px solid rgba(255,255,255,0.1)' : '1px solid transparent',
              borderRadius: '100px',
              height: '30px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              color: mode === 'stopwatch' ? '#fff' : 'rgba(255,255,255,0.4)',
              fontSize: '11px',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <IconClock size={14} stroke={2} />
            Stopwatch
          </div>
        </div>

        {/* Presets Grid */}
        <div
          style={{
            flex: 1,
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gridTemplateRows: 'repeat(2, 1fr)',
            gap: '6px'
          }}
        >
          {(mode === 'countdown'
            ? ['02:00', '10:00', '15:00', '30:00', '01:00:00', '02:00:00']
            : ['02:00', '05:00', '10:00', '15:00', '30:00', '01:00:00']
          ).map((time) => (
            <PresetCard
              key={time}
              time={time}
              accentColor={accentColor}
              isSelected={displayTime === time}
              onClick={() => {
                setDisplayTime(time)
                setIsActive(false)
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
