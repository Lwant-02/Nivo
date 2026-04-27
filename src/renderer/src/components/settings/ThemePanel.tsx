import type { JSX } from 'react'
import { SettingCard } from './SettingCard'
import { SectionLabel } from './SectionLabel'
import { ThemePicker } from './ThemePicker'
import { useSettings } from '../../hooks/useSettings'
import { NOTCH_THEMES } from '../../util/notchThemes'

const NOTCH_THEME_OPTIONS = (Object.keys(NOTCH_THEMES) as NotchThemeId[]).map((id) => ({
  id,
  label: NOTCH_THEMES[id].label,
  gradient: NOTCH_THEMES[id].preview.gradient,
  ring: NOTCH_THEMES[id].preview.ring
}))

const THEME_OPTIONS = [
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

export function ThemePanel(): JSX.Element {
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
          Themes
        </h1>
        <p
          style={{
            marginTop: 6,
            fontSize: 13,
            color: 'rgba(255,255,255,0.48)',
            letterSpacing: -0.1
          }}
        >
          Customize the look and feel of your Notch and Accent colors.
        </p>
      </div>

      <SectionLabel text="Notch Style" />
      <SettingCard>
        <div style={{ padding: 14 }}>
          <ThemePicker
            value={settings.notchTheme}
            onChange={(id) => update('notchTheme', id)}
            options={NOTCH_THEME_OPTIONS}
            columns={4}
          />
        </div>
      </SettingCard>

      <SectionLabel text="App Accent" />
      <SettingCard>
        <div style={{ padding: 14 }}>
          <ThemePicker
            value={settings.theme}
            onChange={(id) => update('theme', id)}
            options={THEME_OPTIONS}
          />
        </div>
      </SettingCard>
    </>
  )
}
