import { useState } from 'react'
import { Maximize2, ShieldOff, Vibrate, LogIn } from 'lucide-react'
import { SettingCard } from './SettingCard'
import { SectionLabel } from './SectionLabel'
import { ThemePicker } from './ThemePicker'
import { SettingRow } from './SettingRow'

type ThemeId = 'midnight' | 'graphite' | 'ocean' | 'forest' | 'sunset' | 'berry'

export function GeneralPanel() {
  const [launchAtLogin, setLaunchAtLogin] = useState(false)
  const [hideFullscreen, setHideFullscreen] = useState(true)
  const [hideScreenCapture, setHideScreenCapture] = useState(false)
  const [theme, setTheme] = useState<ThemeId>('midnight')
  const [hapticFeedback, setHapticFeedback] = useState(true)

  const themeOptions = [
    {
      id: 'midnight' as const,
      label: 'Midnight',
      gradient: 'linear-gradient(135deg, #1a1d29 0%, #0a0a14 100%)',
      ring: '#6e7a99'
    },
    {
      id: 'graphite' as const,
      label: 'Graphite',
      gradient: 'linear-gradient(135deg, #48484a 0%, #1c1c1e 100%)',
      ring: '#98989d'
    },
    {
      id: 'ocean' as const,
      label: 'Ocean',
      gradient: 'linear-gradient(135deg, #64d2ff 0%, #0a84ff 100%)',
      ring: '#0a84ff'
    },
    {
      id: 'forest' as const,
      label: 'Forest',
      gradient: 'linear-gradient(135deg, #30d158 0%, #1d6b2d 100%)',
      ring: '#30d158'
    },
    {
      id: 'sunset' as const,
      label: 'Sunset',
      gradient: 'linear-gradient(135deg, #ff9f0a 0%, #ff375f 100%)',
      ring: '#ff9f0a'
    },
    {
      id: 'berry' as const,
      label: 'Berry',
      gradient: 'linear-gradient(135deg, #bf5af2 0%, #6f2cc9 100%)',
      ring: '#bf5af2'
    }
  ]

  const iconStyle = { size: 15, strokeWidth: 2 }

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
          System-wide preferences for how Lume behaves on your Mac.
        </p>
      </div>

      {/* System */}
      <SectionLabel text="System" />
      <SettingCard>
        <SettingRow
          icon={<LogIn {...iconStyle} />}
          label="Launch at login"
          description="Open Lume automatically when you sign in."
          enabled={launchAtLogin}
          onToggle={() => setLaunchAtLogin((v) => !v)}
          isFirst
        />
      </SettingCard>

      {/* Visibility */}
      <SectionLabel text="Visibility" />
      <SettingCard>
        <SettingRow
          icon={<Maximize2 {...iconStyle} />}
          label="Hide in fullscreen"
          enabled={hideFullscreen}
          onToggle={() => setHideFullscreen((v) => !v)}
          isFirst
        />
        <SettingRow
          icon={<ShieldOff {...iconStyle} />}
          label="Hide from screen capture"
          enabled={hideScreenCapture}
          onToggle={() => setHideScreenCapture((v) => !v)}
        />
      </SettingCard>

      {/* Theme */}
      <SectionLabel text="Theme" />
      <SettingCard>
        <div
          style={{
            paddingLeft: 14,
            paddingRight: 14,
            paddingTop: 14,
            paddingBottom: 14
          }}
        >
          <ThemePicker value={theme} onChange={setTheme} options={themeOptions} />
        </div>
      </SettingCard>

      {/* Behaviour */}
      <SectionLabel text="Behaviour" />
      <SettingCard>
        <SettingRow
          icon={<Vibrate {...iconStyle} />}
          label="Haptic feedback"
          description="Subtle taps on interaction via Force Touch trackpads."
          enabled={hapticFeedback}
          onToggle={() => setHapticFeedback((v) => !v)}
        />
      </SettingCard>
    </>
  )
}
