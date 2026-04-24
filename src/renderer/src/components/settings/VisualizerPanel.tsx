import { useSettings } from '../../hooks/useSettings'
import { Sparkles, Footprints } from 'lucide-react'
import { SettingCard } from './SettingCard'
import { SectionLabel } from './SectionLabel'
import { SettingRow } from './SettingRow'
import { LOTTIE_STYLES } from '../ui/LottieVisualizer'
import { DotLottieReact } from '@lottiefiles/dotlottie-react'

export function VisualizerPanel() {
  const { settings, update } = useSettings()

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
          Idle Visualizer
        </h1>
        <p
          style={{
            marginTop: 6,
            fontSize: 13,
            color: 'rgba(255,255,255,0.48)',
            letterSpacing: -0.1
          }}
        >
          Add some life to your notch when no music is playing.
        </p>
      </div>

      <SectionLabel text="Behaviour" />
      <SettingCard>
        <SettingRow
          icon={<Footprints {...iconStyle} />}
          label="Show Lottie on Pause"
          description="Display a walking animation when music is paused."
          enabled={settings.showLottieOnPause}
          onToggle={() => update('showLottieOnPause', !settings.showLottieOnPause)}
          isFirst
        />
      </SettingCard>

      {settings.showLottieOnPause && (
        <>
          <SectionLabel text="Animation Style" />
          <div className="grid grid-cols-2 gap-3">
            {LOTTIE_STYLES.map((style, index) => (
              <button
                key={index}
                onClick={() => update('lottieStyle', index)}
                className={`relative h-24 rounded-2xl bg-white/5 border-2 transition-all flex items-center justify-center overflow-hidden cursor-pointer ${
                  settings.lottieStyle === index
                    ? 'border-(--lume-accent) bg-(--lume-accent-soft)'
                    : 'border-white/5 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center justify-center w-full h-full p-2">
                  <DotLottieReact
                    src={style.src}
                    loop
                    autoplay
                    style={{ width: '100%', height: '100%' }}
                  />
                </div>
                {settings.lottieStyle === index && (
                  <div className="absolute top-2 right-2">
                    <Sparkles size={14} className="text-(--lume-accent)" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </>
  )
}
