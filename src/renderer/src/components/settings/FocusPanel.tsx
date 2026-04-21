import { useState } from 'react'
import { Moon, EyeOff, BellOff, Sparkles } from 'lucide-react'
import { SettingCard } from './SettingCard'
import { SectionLabel } from './SectionLabel'
import { SettingRow } from './SettingRow'
import { Pill } from './Pill'

export function FocusPanel() {
  const [statusIndicator, setStatusIndicator] = useState(true)
  const [autoHide, setAutoHide] = useState(false)
  const [muteNotifications, setMuteNotifications] = useState(true)
  const [breatheOnEnter, setBreatheOnEnter] = useState(true)

  const iconStyle = { size: 15, strokeWidth: 2 }

  return (
    <>
      {/* Hero */}
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
          Focus
        </h1>
        <p
          style={{
            marginTop: 6,
            fontSize: 13,
            color: 'rgba(255,255,255,0.48)',
            letterSpacing: -0.1
          }}
        >
          How Lume behaves while macOS Do Not Disturb is on.
        </p>
      </div>

      {/* Status */}
      <SectionLabel text="Status" />
      <SettingCard>
        <SettingRow
          icon={<Moon {...iconStyle} />}
          label="Show status indicator"
          description="A small purple moon sits on the Island while Focus is on."
          enabled={statusIndicator}
          onToggle={() => setStatusIndicator((v) => !v)}
          right={
            <Pill
              variant="default"
              style={{
                background: 'rgba(94,92,230,0.16)',
                border: '1px solid rgba(94,92,230,0.4)',
                color: 'rgba(180,178,255,0.95)'
              }}
            >
              <Moon size={11} style={{ marginRight: 5, verticalAlign: -1 }} />
              Focus
            </Pill>
          }
          isFirst
        />
        <SettingRow
          icon={<Sparkles {...iconStyle} />}
          label="Breathe on enter"
          description="Briefly glow purple when Focus turns on, then fade."
          enabled={breatheOnEnter}
          onToggle={() => setBreatheOnEnter((v) => !v)}
        />
      </SettingCard>

      {/* Behaviour */}
      <SectionLabel text="Behaviour" />
      <SettingCard>
        <SettingRow
          icon={<EyeOff {...iconStyle} />}
          label="Hide Lume in Focus Mode"
          description="Completely hide the Island so nothing breaks your flow."
          enabled={autoHide}
          onToggle={() => setAutoHide((v) => !v)}
          isFirst
        />
        <SettingRow
          icon={<BellOff {...iconStyle} />}
          label="Mute notifications"
          description="Suppress non-essential Island alerts until Focus ends."
          enabled={muteNotifications}
          onToggle={() => setMuteNotifications((v) => !v)}
        />
      </SettingCard>
    </>
  )
}
