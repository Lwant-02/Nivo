import type { JSX } from 'react'
import { Keyboard, Check } from 'lucide-react'
import { SettingCard } from './SettingCard'
import { SectionLabel } from './SectionLabel'
import { SettingRow } from './SettingRow'
import { useSettings } from '../../hooks/useSettings'

const ICON_STYLE = { size: 15, strokeWidth: 2 }

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

export function SonicPanel(): JSX.Element {
  const { settings, update } = useSettings()
  const isEnabled = settings.sonicFeedback

  return (
    <>
      <div style={{ marginBottom: 18 }}>
        <h1
          style={{
            fontSize: 26,
            fontWeight: 700,
            letterSpacing: -0.6,
            color: '#fff',
            lineHeight: 1.1
          }}
        >
          Sonic Feedback
        </h1>
        <p
          style={{
            marginTop: 6,
            fontSize: 13,
            color: 'rgba(255,255,255,0.48)',
            letterSpacing: -0.1
          }}
        >
          Play a mechanical keyboard click on every keystroke, system-wide.
        </p>
      </div>

      <SectionLabel text="General" />
      <SettingCard>
        <SettingRow
          icon={<Keyboard {...ICON_STYLE} />}
          label="Sonic Feedback"
          description="Enable mechanical keyboard sounds as you type."
          enabled={isEnabled}
          onToggle={() => update('sonicFeedback', !settings.sonicFeedback)}
          isFirst
        />
      </SettingCard>

      <SectionLabel text="Sound Pack" />
      <div
        style={{
          opacity: isEnabled ? 1 : 0.5,
          pointerEvents: isEnabled ? 'auto' : 'none',
          transition: 'all 0.3s ease'
        }}
      >
        <SettingCard>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
              gap: 10,
              padding: 12
            }}
          >
            {SOUND_PACKS.map((pack) => {
              const active = settings.sonicSoundPack === pack.id
              return (
                <button
                  key={pack.id}
                  onClick={() => update('sonicSoundPack', pack.id)}
                  style={{
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    padding: 14,
                    borderRadius: 12,
                    border: '1px solid',
                    transition: 'all 200ms',
                    cursor: 'pointer',
                    textAlign: 'left',
                    background: active
                      ? 'linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)'
                      : 'rgba(255,255,255,0.02)',
                    borderColor: active ? 'var(--nivo-accent, #a855f7)' : 'rgba(255,255,255,0.06)',
                    boxShadow: active
                      ? '0 8px 20px -4px rgba(0,0,0,0.3), 0 0 0 1px var(--nivo-accent-glow, rgba(168,85,247,0.15))'
                      : 'none'
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                      marginBottom: 6
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Keyboard
                        size={12}
                        strokeWidth={2.5}
                        color={active ? 'var(--nivo-accent, #a855f7)' : 'rgba(255,255,255,0.3)'}
                      />
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: 0.8,
                          color: active ? 'var(--nivo-accent, #a855f7)' : 'rgba(255,255,255,0.3)'
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
                          width: 16,
                          height: 16,
                          borderRadius: '50%',
                          background: 'var(--nivo-accent, #a855f7)',
                          marginLeft: 'auto'
                        }}
                      >
                        <Check size={10} strokeWidth={4} color="#fff" />
                      </div>
                    )}
                  </div>
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: active ? '#fff' : 'rgba(255,255,255,0.7)',
                      letterSpacing: -0.1
                    }}
                  >
                    {pack.name}
                  </span>
                </button>
              )
            })}
          </div>
        </SettingCard>
      </div>
    </>
  )
}
