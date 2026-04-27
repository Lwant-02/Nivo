import type { JSX } from 'react'
import { useSettings } from '../../hooks/useSettings'
import { SettingCard } from './SettingCard'
import { SectionLabel } from './SectionLabel'

interface DurationOption {
  minutes: number
  label: string
  hint: string
}

const DURATION_OPTIONS: DurationOption[] = [
  { minutes: 1, label: '1 min', hint: 'Test' },
  { minutes: 15, label: '15 min', hint: 'Quick' },
  { minutes: 25, label: '25 min', hint: 'Pomodoro' },
  { minutes: 45, label: '45 min', hint: 'Deep' },
  { minutes: 60, label: '60 min', hint: 'Hour' },
  { minutes: 90, label: '90 min', hint: 'Flow' }
]

export function ZenPanel(): JSX.Element {
  const { settings, update } = useSettings()
  const current = settings.focusDuration ?? 25

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
          Zen Bar
        </h1>
        <p
          style={{
            marginTop: 6,
            fontSize: 13,
            color: 'rgba(255,255,255,0.48)',
            letterSpacing: -0.1
          }}
        >
          A calm, glowing focus timer that lives at the base of the Notch.
        </p>
      </div>

      <SectionLabel text="Default Duration" />
      <SettingCard>
        <div style={{ padding: 14 }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
              gap: 8,
              padding: 8,
              background: 'rgba(0,0,0,0.22)',
              borderRadius: 14,
              border: '1px solid rgba(255,255,255,0.05)'
            }}
          >
            {DURATION_OPTIONS.map(({ minutes, label, hint }) => {
              const active = current === minutes
              return (
                <button
                  key={minutes}
                  onClick={() => update('focusDuration', minutes)}
                  className="cursor-pointer transition-all duration-150"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 4,
                    paddingTop: 12,
                    paddingBottom: 12,
                    paddingLeft: 6,
                    paddingRight: 6,
                    borderRadius: 10,
                    background: active
                      ? 'linear-gradient(180deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.06) 100%)'
                      : 'transparent',
                    border: active
                      ? '1px solid var(--lume-accent, #a855f7)'
                      : '1px solid transparent',
                    boxShadow: active
                      ? '0 0 0 2px var(--lume-accent-glow, rgba(168,85,247,0.18)), 0 6px 14px rgba(0,0,0,0.25)'
                      : 'none',
                    color: active ? '#fff' : 'rgba(255,255,255,0.55)'
                  }}
                >
                  <span
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      letterSpacing: -0.2,
                      color: active ? '#fff' : 'rgba(255,255,255,0.85)'
                    }}
                  >
                    {label}
                  </span>
                  <span
                    style={{
                      fontSize: 9.5,
                      fontWeight: 600,
                      letterSpacing: 1,
                      textTransform: 'uppercase',
                      color: active ? 'var(--lume-accent, #a855f7)' : 'rgba(255,255,255,0.35)'
                    }}
                  >
                    {hint}
                  </span>
                </button>
              )
            })}
          </div>
          <p
            style={{
              marginTop: 12,
              fontSize: 11.5,
              color: 'rgba(255,255,255,0.45)',
              letterSpacing: -0.05,
              lineHeight: 1.5
            }}
          >
            Used when starting a focus session from the Notch. The 1-minute option is for previewing
            the completion celebration.
          </p>
        </div>
      </SettingCard>

      <SectionLabel text="When the timer ends" />
      <SettingCard>
        <div style={{ padding: 14 }}>
          <div className="flex items-center gap-3">
            <div
              className="size-10 shrink-0 rounded-full flex items-center justify-center"
              style={{
                background: 'var(--lume-accent-glow, rgba(168,85,247,0.18))',
                border: '1px solid var(--lume-accent, #a855f7)'
              }}
            >
              <span
                className="size-2 rounded-full"
                style={{ background: 'var(--lume-accent, #a855f7)' }}
              />
            </div>
            <div className="flex flex-col">
              <span className="text-white text-[13px] font-semibold tracking-tight">
                Focus Complete toast
              </span>
              <span className="text-white/45 text-[11.5px] tracking-tight">
                Notch auto-expands with a celebration animation and a haptic tap.
              </span>
            </div>
          </div>
        </div>
      </SettingCard>
    </>
  )
}
