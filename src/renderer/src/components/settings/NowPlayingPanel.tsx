import { useSettings } from '../../hooks/useSettings'
import { PauseCircle, Image as ImageIcon, Waves } from 'lucide-react'
import { SettingCard } from './SettingCard'
import { SectionLabel } from './SectionLabel'
import { SettingRow } from './SettingRow'

export function NowPlayingPanel() {
  const { settings, update } = useSettings()

  const hideWhenPaused = settings.hideWhenPaused
  const showAlbumArt = settings.showAlbumArt
  const showVisualizer = settings.showVisualizer

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
          Now Playing
        </h1>
        <p
          style={{
            marginTop: 6,
            fontSize: 13,
            color: 'rgba(255,255,255,0.48)',
            letterSpacing: -0.1
          }}
        >
          Customize how media appears and behaves inside the Island.
        </p>
      </div>

      <SectionLabel text="Island Behaviour" />
      <SettingCard>
        <SettingRow
          icon={<PauseCircle {...iconStyle} />}
          label="Hide when paused"
          description="Auto-shrink the Island when playback stops."
          enabled={hideWhenPaused}
          onToggle={() => update('hideWhenPaused', !hideWhenPaused)}
          isFirst
        />
        <SettingRow
          icon={<ImageIcon {...iconStyle} />}
          label="Show album art"
          description="Use cover artwork instead of a generic play icon."
          enabled={showAlbumArt}
          onToggle={() => update('showAlbumArt', !showAlbumArt)}
        />
        <SettingRow
          icon={<Waves {...iconStyle} />}
          label="Live visualizer"
          description="Animated waveform while music is playing."
          enabled={showVisualizer}
          onToggle={() => update('showVisualizer', !showVisualizer)}
        />
      </SettingCard>
    </>
  )
}
