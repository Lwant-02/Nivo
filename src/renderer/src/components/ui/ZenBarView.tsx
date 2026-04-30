import React from 'react'
import {
  IconPlayerPlayFilled,
  IconPlayerPauseFilled,
  IconClock,
  IconHourglass,
  IconRotate
} from '@tabler/icons-react'
import { COUNTDOWN_PRESETS_SEC, STOPWATCH_PRESETS_SEC, ZenTimerApi } from '../../hooks/useZenTimer'

function pad(n: number, width = 2): string {
  return String(n).padStart(width, '0')
}

function formatCountdown(ms: number, presetSec: number): string {
  const total = Math.ceil(ms / 1000)
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  if (presetSec >= 3600) return `${pad(h)}:${pad(m)}:${pad(s)}`
  return `${pad(m)}:${pad(s)}`
}

function formatStopwatch(ms: number): string {
  const totalCs = Math.floor(ms / 10)
  const cs = totalCs % 100
  const totalSec = Math.floor(totalCs / 100)
  const s = totalSec % 60
  const totalMin = Math.floor(totalSec / 60)
  const m = totalMin % 60
  const h = Math.floor(totalMin / 60)
  if (h > 0) return `${pad(h)}:${pad(m)}:${pad(s)}`
  return `${pad(m)}:${pad(s)}.${pad(cs)}`
}

function formatPresetLabel(sec: number): string {
  if (sec >= 3600) {
    const h = Math.floor(sec / 3600)
    const m = Math.floor((sec % 3600) / 60)
    const s = sec % 60
    return `${pad(h)}:${pad(m)}:${pad(s)}`
  }
  return `${pad(Math.floor(sec / 60))}:${pad(sec % 60)}`
}

interface PresetCardProps {
  label: string
  onClick?: () => void
  accentColor: string
  isSelected?: boolean
}

const PresetCard: React.FC<PresetCardProps> = ({ label, onClick, accentColor, isSelected }) => (
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
        fontSize: '16px',
        fontWeight: '700'
      }}
    >
      {label}
    </div>
  </div>
)

interface ZenBarViewProps {
  accentColor: string
  zen: ZenTimerApi
}

export const ZenBarView: React.FC<ZenBarViewProps> = ({ accentColor, zen }) => {
  const presets = zen.mode === 'countdown' ? COUNTDOWN_PRESETS_SEC : STOPWATCH_PRESETS_SEC

  const displayTime =
    zen.mode === 'countdown'
      ? formatCountdown(zen.countdownMs, zen.presetSec)
      : formatStopwatch(zen.stopwatchMs)

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
          borderRadius: '20px',
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
              fontSize: '56px',
              fontWeight: '900',
              color: '#fff',
              letterSpacing: '-0.04em',
              fontFamily: 'system-ui',
              fontVariantNumeric: 'tabular-nums'
            }}
          >
            {displayTime}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          <div
            onClick={zen.toggle}
            style={{
              flex: 1,
              background: zen.isActive ? `${accentColor}30` : `${accentColor}20`,
              height: '38px',
              borderRadius: '30px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              border: zen.isActive ? `1px solid ${accentColor}60` : `1px solid ${accentColor}40`
            }}
          >
            {zen.isActive ? (
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
            onClick={zen.restart}
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
            onClick={() => zen.setMode('countdown')}
            style={{
              flex: 1,
              background: zen.mode === 'countdown' ? `${accentColor}15` : 'transparent',
              border:
                zen.mode === 'countdown' ? `1px solid ${accentColor}30` : '1px solid transparent',
              borderRadius: '100px',
              height: '30px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              color: zen.mode === 'countdown' ? accentColor : 'rgba(255,255,255,0.4)',
              fontSize: '11px',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <IconHourglass size={14} stroke={zen.mode === 'countdown' ? 2.5 : 2} />
            Countdown
          </div>
          <div
            onClick={() => zen.setMode('stopwatch')}
            style={{
              flex: 1,
              background: zen.mode === 'stopwatch' ? `${accentColor}15` : 'transparent',
              border:
                zen.mode === 'stopwatch' ? `1px solid ${accentColor}30` : '1px solid transparent',
              borderRadius: '100px',
              height: '30px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              color: zen.mode === 'stopwatch' ? accentColor : 'rgba(255,255,255,0.4)',
              fontSize: '11px',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <IconClock size={14} stroke={zen.mode === 'stopwatch' ? 2.5 : 2} />
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
          {presets.map((sec) => (
            <PresetCard
              key={sec}
              label={formatPresetLabel(sec)}
              accentColor={accentColor}
              isSelected={zen.mode === 'countdown' && zen.presetSec === sec}
              onClick={() => zen.selectPreset(sec)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
