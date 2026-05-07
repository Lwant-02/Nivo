import React from 'react'
import { IconKeyboard, IconPlus, IconCheck } from '@tabler/icons-react'
import { useSettings } from '../../hooks/useSettings'
import keyboardImg from '../../../../../resources/keyboard.png'

interface SoundPack {
  id: SonicSoundPackId
  name: string
  type: string
  color: string
}

const SOUND_PACKS: SoundPack[] = [
  { id: 'cherrymx-blue-abs', name: 'CherryMX Blue', type: 'ABS', color: '#60a5fa' },
  { id: 'cherrymx-blue-pbt', name: 'CherryMX Blue', type: 'PBT', color: '#2563eb' },
  { id: 'cherrymx-brown-abs', name: 'CherryMX Brown', type: 'ABS', color: '#d97706' },
  { id: 'cherrymx-brown-pbt', name: 'CherryMX Brown', type: 'PBT', color: '#92400e' },
  { id: 'cherrymx-red-abs', name: 'CherryMX Red', type: 'ABS', color: '#f87171' },
  { id: 'cherrymx-red-pbt', name: 'CherryMX Red', type: 'PBT', color: '#dc2626' },
  { id: 'cherrymx-black-abs', name: 'CherryMX Black', type: 'ABS', color: '#4b5563' },
  { id: 'cherrymx-black-pbt', name: 'CherryMX Black', type: 'PBT', color: '#1f2937' },
  { id: 'eg-crystal-purple', name: 'Crystal Purple', type: 'EG', color: '#c084fc' },
  { id: 'eg-oreo', name: 'Oreo', type: 'EG', color: '#fde68a' }
]

interface SonicViewProps {
  accentColor: string
}

export const SonicView: React.FC<SonicViewProps> = ({ accentColor }) => {
  const { settings, update } = useSettings()
  const isEnabled = settings.sonicFeedback
  const activePackId = settings.sonicSoundPack
  const activePack = SOUND_PACKS.find((p) => p.id === activePackId) ?? SOUND_PACKS[0]
  const tint = activePack.color

  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        padding: '0px',
        boxSizing: 'border-box',
        gap: '8px'
      }}
    >
      {/* Mini Toggle Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 4px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <IconKeyboard size={14} style={{ color: 'rgba(255,255,255,0.4)' }} />
          <span
            style={{
              color: 'rgba(255,255,255,0.4)',
              fontSize: '11px',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}
          >
            Sonic Feedback
          </span>
        </div>

        <div
          onClick={() => update('sonicFeedback', !isEnabled)}
          style={{
            background: isEnabled ? `${accentColor}20` : 'rgba(255,255,255,0.04)',
            padding: '4px 10px',
            borderRadius: '20px',
            border: `1px solid ${isEnabled ? accentColor + '40' : 'rgba(255,255,255,0.25)'}`,
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.20)',
            color: isEnabled ? accentColor : 'rgba(255,255,255,0.4)',
            fontSize: '10px',
            fontWeight: '800',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            textTransform: 'uppercase',
            letterSpacing: '0.02em'
          }}
        >
          {isEnabled ? 'ON' : 'OFF'}
        </div>
      </div>

      {/* Body: keyboard + list */}
      <div
        style={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: '1fr 1.15fr',
          gap: '10px',
          opacity: isEnabled ? 1 : 0.4,
          pointerEvents: isEnabled ? 'auto' : 'none',
          transition: 'opacity 0.3s ease',
          minHeight: 0
        }}
      >
        {/* Left: stylized 3D keyboard (transparent SVG) */}
        <div
          style={{
            position: 'relative',
            background:
              'linear-gradient(160deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.01) 60%, rgba(0,0,0,0.25) 100%)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '18px',
            overflow: 'hidden',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08)',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {/* Floor / contact shadow */}
          <div
            style={{
              position: 'absolute',
              left: '10%',
              right: '10%',
              bottom: '14%',
              height: '14%',
              background:
                'radial-gradient(ellipse at center, rgba(0,0,0,0.6) 0%, transparent 70%)',
              filter: 'blur(10px)',
              pointerEvents: 'none'
            }}
          />
          {/* Tinted ambient glow */}
          <div
            style={{
              position: 'absolute',
              left: '20%',
              right: '20%',
              bottom: '18%',
              height: '12%',
              background: `radial-gradient(ellipse at center, ${tint}55, transparent 75%)`,
              filter: 'blur(14px)',
              transition: 'background 400ms ease',
              pointerEvents: 'none'
            }}
          />

          {/* Keyboard image fills the container */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '8px 10px 18px',
              position: 'relative'
            }}
          >
            <img
              src={keyboardImg}
              alt="Keyboard"
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                width: 'auto',
                height: 'auto',
                objectFit: 'contain',
                display: 'block',
                pointerEvents: 'none',
                filter: `drop-shadow(0 6px 14px rgba(0,0,0,0.55)) drop-shadow(0 0 14px ${tint}33)`,
                transition: 'filter 400ms ease'
              }}
            />
          </div>

          {/* subtle bottom label */}
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 6,
              textAlign: 'center',
              fontSize: '9px',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.45)',
              pointerEvents: 'none'
            }}
          >
            {activePack.name} · {activePack.type}
          </div>
        </div>

        {/* Right: sound pack list */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '3px',
            overflowY: 'auto',
            paddingRight: '2px'
          }}
        >
          {SOUND_PACKS.map((pack) => {
            const active = activePackId === pack.id
            return (
              <button
                key={pack.id}
                onClick={() => update('sonicSoundPack', pack.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '5px 8px',
                  borderRadius: '10px',
                  border: '1px solid',
                  borderColor: active ? `${accentColor}55` : 'transparent',
                  background: active
                    ? `linear-gradient(135deg, ${accentColor}22, ${accentColor}08)`
                    : 'transparent',
                  cursor: 'pointer',
                  transition: 'background 180ms, border-color 180ms',
                  textAlign: 'left',
                  color: 'inherit',
                  width: '100%'
                }}
              >
                <div
                  style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '7px',
                    background: `linear-gradient(180deg, ${pack.color}, ${pack.color}cc)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    boxShadow: `0 2px 5px ${pack.color}55, inset 0 1px 0 rgba(255,255,255,0.35)`
                  }}
                >
                  {active ? (
                    <IconCheck size={12} stroke={3.5} style={{ color: '#fff' }} />
                  ) : (
                    <IconPlus size={12} stroke={3.5} style={{ color: '#fff' }} />
                  )}
                </div>
                <span
                  style={{
                    fontSize: '12px',
                    fontWeight: active ? 700 : 500,
                    color: active ? '#fff' : 'rgba(255,255,255,0.72)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    flex: 1,
                    letterSpacing: '-0.1px'
                  }}
                >
                  {pack.name}
                </span>
                <span
                  style={{
                    fontSize: '8.5px',
                    fontWeight: 800,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    padding: '2px 5px',
                    borderRadius: '6px',
                    color: active ? accentColor : 'rgba(255,255,255,0.35)',
                    background: active ? `${accentColor}18` : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${active ? accentColor + '30' : 'rgba(255,255,255,0.08)'}`
                  }}
                >
                  {pack.type}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
