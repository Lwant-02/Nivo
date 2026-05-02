import React from 'react'
import { IconKeyboard, IconCheck } from '@tabler/icons-react'
import { useSettings } from '../../hooks/useSettings'

const SOUND_PACKS: Array<{ id: SonicSoundPackId; name: string; type: string }> = [
  { id: 'cherrymx-black-abs', name: 'CherryMX Black', type: 'ABS' },
  { id: 'cherrymx-black-pbt', name: 'CherryMX Black', type: 'PBT' },
  { id: 'cherrymx-blue-abs', name: 'CherryMX Blue', type: 'ABS' },
  { id: 'cherrymx-blue-pbt', name: 'CherryMX Blue', type: 'PBT' },
  { id: 'cherrymx-brown-abs', name: 'CherryMX Brown', type: 'ABS' },
  { id: 'cherrymx-brown-pbt', name: 'CherryMX Brown', type: 'PBT' },
  { id: 'cherrymx-red-abs', name: 'CherryMX Red', type: 'ABS' },
  { id: 'cherrymx-red-pbt', name: 'CherryMX Red', type: 'PBT' },
  { id: 'eg-crystal-purple', name: 'Crystal Purple', type: 'EG' },
  { id: 'eg-oreo', name: 'Oreo', type: 'EG' }
]

interface SonicViewProps {
  accentColor: string
}

export const SonicView: React.FC<SonicViewProps> = ({ accentColor }) => {
  const { settings, update } = useSettings()
  const isEnabled = settings.sonicFeedback
  const activePackId = settings.sonicSoundPack

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
            background: isEnabled ? `${accentColor}20` : 'rgba(255,255,255,0.05)',
            padding: '4px 10px',
            borderRadius: '20px',
            border: `1px solid ${isEnabled ? accentColor + '40' : 'rgba(255,255,255,0.08)'}`,
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

      {/* Sound Packs Grid */}
      <div
        style={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '8px',
          overflowY: 'auto',
          opacity: isEnabled ? 1 : 0.4,
          pointerEvents: isEnabled ? 'auto' : 'none',
          transition: 'opacity 0.3s ease',
          paddingBottom: '4px'
        }}
      >
        {SOUND_PACKS.map((pack) => {
          const active = activePackId === pack.id
          return (
            <button
              className="h-20 justify-center"
              key={pack.id}
              onClick={() => update('sonicSoundPack', pack.id)}
              style={{
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                padding: '10px 14px',
                borderRadius: '20px',
                border: '1px solid',
                transition: 'all 200ms',
                cursor: 'pointer',
                textAlign: 'left',
                background: active
                  ? 'linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)'
                  : 'rgba(255,255,255,0.02)',
                borderColor: active ? accentColor : `${accentColor}50`,
                boxShadow: active
                  ? `0 8px 20px -4px rgba(0,0,0,0.3), 0 0 0 1px ${accentColor}40`
                  : 'none',
                color: 'inherit'
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  marginBottom: '6px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <IconKeyboard
                    size={10}
                    stroke={2.5}
                    style={{ color: active ? accentColor : 'rgba(255,255,255,0.3)' }}
                  />
                  <span
                    style={{
                      fontSize: '9px',
                      fontWeight: '800',
                      textTransform: 'uppercase',
                      letterSpacing: '0.8px',
                      color: active ? accentColor : 'rgba(255,255,255,0.3)'
                    }}
                  >
                    {pack.type}
                  </span>
                </div>
                {active && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '14px',
                      height: '14px',
                      borderRadius: '50%',
                      background: accentColor
                    }}
                  >
                    <IconCheck size={10} stroke={4} style={{ color: '#fff' }} />
                  </div>
                )}
              </div>
              <span
                style={{
                  fontSize: '15px',
                  fontWeight: '600',
                  color: active ? '#fff' : 'rgba(255,255,255,0.7)',
                  letterSpacing: '-0.1px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  width: '100%'
                }}
              >
                {pack.name}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
