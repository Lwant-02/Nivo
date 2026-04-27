import type { JSX } from 'react'
import { Maximize2, ShieldOff, Vibrate, LogIn, ChevronRight, ChevronLeft } from 'lucide-react'
import { SettingCard } from './SettingCard'
import { SectionLabel } from './SectionLabel'
import { SettingRow } from './SettingRow'
import { useSettings } from '../../hooks/useSettings'

const ICON_STYLE = { size: 15, strokeWidth: 2 }

export function GeneralPanel(): JSX.Element {
  const { settings, update } = useSettings()

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
          General
        </h1>
        <p
          style={{
            marginTop: 6,
            fontSize: 13,
            color: 'rgba(255,255,255,0.48)',
            letterSpacing: -0.1
          }}
        >
          System-wide preferences for how nivo behaves on your Mac.
        </p>
      </div>

      <SectionLabel text="System" />
      <SettingCard>
        <SettingRow
          icon={<LogIn {...ICON_STYLE} />}
          label="Launch at login"
          description="Open nivo automatically when you sign in."
          enabled={settings.launchAtLogin}
          onToggle={() => update('launchAtLogin', !settings.launchAtLogin)}
          isFirst
        />
      </SettingCard>

      <SectionLabel text="Visibility" />
      <SettingCard>
        <SettingRow
          icon={<Maximize2 {...ICON_STYLE} />}
          label="Hide in fullscreen"
          enabled={settings.hideInFullscreen}
          onToggle={() => update('hideInFullscreen', !settings.hideInFullscreen)}
          isFirst
        />
        <SettingRow
          icon={<ShieldOff {...ICON_STYLE} />}
          label="Hide from screen capture"
          enabled={settings.hideFromScreenCapture}
          onToggle={() => update('hideFromScreenCapture', !settings.hideFromScreenCapture)}
        />
      </SettingCard>

      <SectionLabel text="Gestures" />
      <SettingCard>
        <div className="grid grid-cols-2" style={{ gap: 10, padding: 12 }}>
          <GestureCard direction="right" label="Swipe Right" description="Next Track" />
          <GestureCard direction="left" label="Swipe Left" description="Prev Track" />
        </div>
      </SettingCard>

      <SectionLabel text="Behaviour" />
      <SettingCard>
        <SettingRow
          icon={<Vibrate {...ICON_STYLE} />}
          label="Haptic feedback"
          description="Subtle taps on interaction via Force Touch trackpads."
          enabled={settings.hapticFeedback}
          onToggle={() => update('hapticFeedback', !settings.hapticFeedback)}
        />
      </SettingCard>
    </>
  )
}

function GestureCard({
  direction,
  label,
  description
}: {
  direction: 'left' | 'right'
  label: string
  description: string
}): JSX.Element {
  const isRight = direction === 'right'
  const Chevron = isRight ? ChevronRight : ChevronLeft

  return (
    <div
      className="relative rounded-xl border border-white/[0.07] overflow-hidden"
      style={{
        background:
          'linear-gradient(180deg, rgba(255,255,255,0.045) 0%, rgba(255,255,255,0.012) 100%)',
        padding: '14px 14px 12px'
      }}
    >
      <div
        className="relative h-11 rounded-lg overflow-hidden flex items-center justify-center"
        style={{
          background: 'rgba(0,0,0,0.35)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.03), inset 0 0 0 1px rgba(255,255,255,0.04)'
        }}
      >
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background: isRight
              ? 'linear-gradient(90deg, transparent 30%, var(--nivo-accent-glow, rgba(168,85,247,0.35)) 100%)'
              : 'linear-gradient(90deg, var(--nivo-accent-glow, rgba(168,85,247,0.35)) 0%, transparent 70%)',
            opacity: 0.55
          }}
        />

        <div className="flex items-center gap-[3px] relative z-10">
          {[0, 1, 2, 3].map((i) => {
            const order = isRight ? i : 3 - i
            return (
              <span
                key={i}
                className="animate-gesture-arrow"
                style={{
                  color: 'var(--nivo-accent, #a855f7)',
                  filter: 'drop-shadow(0 0 4px var(--nivo-accent-glow, rgba(168,85,247,0.5)))',
                  animationDelay: `${order * 0.13}s`
                }}
              >
                <Chevron size={14} strokeWidth={2.6} />
              </span>
            )
          })}
        </div>
      </div>

      <div className="flex flex-col items-center text-center" style={{ marginTop: 12 }}>
        <span className="text-white text-[13px] font-semibold tracking-tight">{label}</span>
        <span
          className="text-white/45 text-[11px] tracking-tight"
          style={{ marginTop: 2, letterSpacing: -0.05 }}
        >
          {description}
        </span>
      </div>
    </div>
  )
}
