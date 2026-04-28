import type { JSX } from 'react'
import { Vibrate, Keyboard } from 'lucide-react'
import { SettingCard } from './SettingCard'
import { SectionLabel } from './SectionLabel'
import { SettingRow } from './SettingRow'
import { useSettings } from '../../hooks/useSettings'

const ICON_STYLE = { size: 15, strokeWidth: 2 }

export function FeedbackPanel(): JSX.Element {
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
          Feedback
        </h1>
        <p
          style={{
            marginTop: 6,
            fontSize: 13,
            color: 'rgba(255,255,255,0.48)',
            letterSpacing: -0.1
          }}
        >
          Customise how nivo communicates with you through touch and sound.
        </p>
      </div>

      <SectionLabel text="Haptics" />
      <SettingCard>
        <SettingRow
          icon={<Vibrate {...ICON_STYLE} />}
          label="Haptic feedback"
          description="Subtle taps on interaction via Force Touch trackpads."
          enabled={settings.hapticFeedback}
          onToggle={() => update('hapticFeedback', !settings.hapticFeedback)}
          isFirst
        />
      </SettingCard>

      <SectionLabel text="Audio" />
      <SettingCard>
        <SettingRow
          icon={<Keyboard {...ICON_STYLE} />}
          label="Sonic Feedback"
          description="Play a mechanical keyboard click on every keystroke, system-wide."
          enabled={settings.sonicFeedback}
          onToggle={() => update('sonicFeedback', !settings.sonicFeedback)}
          isFirst
        />
      </SettingCard>
    </>
  )
}
