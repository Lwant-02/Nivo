import { useState } from 'react'
import { BatteryWarning, BatteryCharging, Clock3, Zap, Gauge } from 'lucide-react'
import { SettingCard } from './SettingCard'
import { SectionLabel } from './SectionLabel'
import { SettingRow } from './SettingRow'
import { Pill } from './Pill'

export function BatteryPanel() {
  const [enabled, setEnabled] = useState(true)
  const [lowBatteryAlert, setLowBatteryAlert] = useState(true)
  const [criticalThreshold, setCriticalThreshold] = useState<10 | 20>(20)
  const [chargingPulse, setChargingPulse] = useState(true)
  const [showTimeRemaining, setShowTimeRemaining] = useState(true)

  const iconStyle = { size: 15, strokeWidth: 2 }
  const thresholds: (10 | 20)[] = [20, 10]

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
          Battery
        </h1>
        <p
          style={{
            marginTop: 6,
            fontSize: 13,
            color: 'rgba(255,255,255,0.48)',
            letterSpacing: -0.1
          }}
        >
          A smarter battery indicator that reacts to what's happening, not just the number.
        </p>
      </div>

      {/* Master */}
      <SectionLabel text="Battery on Lume" />
      <SettingCard>
        <SettingRow
          icon={<Zap {...iconStyle} />}
          label="Show battery on Lume"
          description="Let the Island react to charging and low-power states."
          enabled={enabled}
          onToggle={() => setEnabled((v) => !v)}
          isFirst
        />
      </SettingCard>

      {/* Alerts */}
      <SectionLabel text="Alerts" />
      <SettingCard
        style={{ opacity: enabled ? 1 : 0.5, pointerEvents: enabled ? 'auto' : 'none' }}
      >
        <SettingRow
          icon={<BatteryWarning {...iconStyle} />}
          label="Low battery alert"
          description="Expand the Island into an amber / red shape when power runs low."
          enabled={lowBatteryAlert}
          onToggle={() => setLowBatteryAlert((v) => !v)}
          isFirst
        />
        <SettingRow
          icon={<Gauge {...iconStyle} />}
          label="Alert threshold"
          description="Trigger the glow when the battery drops below this level."
          right={
            <div
              style={{
                display: 'flex',
                gap: 4,
                padding: 3,
                background: 'rgba(0,0,0,0.22)',
                borderRadius: 999,
                border: '1px solid rgba(255,255,255,0.05)'
              }}
            >
              {thresholds.map((n) => {
                const active = criticalThreshold === n
                const accent = n === 10 ? '#FF453A' : '#FF9F0A'
                return (
                  <button
                    key={n}
                    onClick={(e) => {
                      e.stopPropagation()
                      setCriticalThreshold(n)
                    }}
                    className="cursor-pointer"
                    style={{
                      paddingLeft: 10,
                      paddingRight: 10,
                      paddingTop: 3,
                      paddingBottom: 3,
                      fontSize: 11,
                      fontWeight: 600,
                      letterSpacing: 0.1,
                      borderRadius: 999,
                      border: 'none',
                      color: active ? '#fff' : 'rgba(255,255,255,0.45)',
                      background: active
                        ? `linear-gradient(180deg, ${accent}CC 0%, ${accent}88 100%)`
                        : 'transparent',
                      boxShadow: active ? `inset 0 0 0 1px ${accent}55` : 'none',
                      transition: 'all 150ms ease'
                    }}
                  >
                    {n}%
                  </button>
                )
              })}
            </div>
          }
        />
        <SettingRow
          icon={<BatteryCharging {...iconStyle} />}
          label="Charging animation"
          description='Pulse the Island green for 3 seconds when the charger connects.'
          enabled={chargingPulse}
          onToggle={() => setChargingPulse((v) => !v)}
        />
      </SettingCard>

      {/* Display */}
      <SectionLabel text="Readout" />
      <SettingCard
        style={{ opacity: enabled ? 1 : 0.5, pointerEvents: enabled ? 'auto' : 'none' }}
      >
        <SettingRow
          icon={<Clock3 {...iconStyle} />}
          label="Show time remaining"
          description={
            showTimeRemaining
              ? 'Displays “2h 30m left” instead of a percentage.'
              : 'Displays the current charge as a percentage.'
          }
          enabled={showTimeRemaining}
          onToggle={() => setShowTimeRemaining((v) => !v)}
          right={<Pill variant="soft">{showTimeRemaining ? '2h 30m' : '78%'}</Pill>}
          isFirst
        />
      </SettingCard>
    </>
  )
}
