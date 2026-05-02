import type { JSX } from 'react'
import { Maximize2, ShieldOff, Vibrate, LogIn, CloudSun, ClipboardList, Zap } from 'lucide-react'
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

      <SectionLabel text="Behaviour" />
      <SettingCard>
        <SettingRow
          icon={<Vibrate {...ICON_STYLE} />}
          label="Haptic feedback"
          description="Subtle taps on interaction via Force Touch trackpads."
          enabled={settings.hapticFeedback}
          onToggle={() => update('hapticFeedback', !settings.hapticFeedback)}
          isFirst
        />
        <SettingRow
          icon={<ClipboardList {...ICON_STYLE} />}
          label="Clipboard history"
          description="Keep a searchable history of recent text you copy. Stored locally."
          enabled={settings.enableClipboardHistory}
          onToggle={() => update('enableClipboardHistory', !settings.enableClipboardHistory)}
        />
        <SettingRow
          icon={<Zap {...ICON_STYLE} />}
          label="Beam"
          description="Pin apps, URLs, and files for one-tap launch from the notch."
          enabled={settings.enableBeam}
          onToggle={() => update('enableBeam', !settings.enableBeam)}
        />
      </SettingCard>

      <SectionLabel text="Atmospheric" />
      <SettingCard>
        <SettingRow
          icon={<CloudSun {...ICON_STYLE} />}
          label="Ambient weather aura"
          description="Soft glows and rain when the notch is expanded."
          enabled={settings.showWeather}
          onToggle={() => update('showWeather', !settings.showWeather)}
          isFirst
        />
      </SettingCard>
    </>
  )
}
