import { useSettings } from '../../hooks/useSettings'
import { CalendarDays, Hourglass, Video, Bell } from 'lucide-react'
import { SettingCard } from './SettingCard'
import { SectionLabel } from './SectionLabel'
import { SettingRow } from './SettingRow'

export function CalendarPanel() {
  const { settings, update } = useSettings()

  const enabled = settings.enableCalendar
  const nextOnly = settings.calendarNextEventOnly
  const clickToJoin = settings.calendarClickToJoin
  const reminderBeforeMin = settings.calendarReminderMin

  const iconStyle = { size: 15, strokeWidth: 2 }
  const reminderOptions: (5 | 10 | 15)[] = [5, 10, 15]

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
          Calendar
        </h1>
        <p
          style={{
            marginTop: 6,
            fontSize: 13,
            color: 'rgba(255,255,255,0.48)',
            letterSpacing: -0.1
          }}
        >
          Turn your Mac notch into a quiet, always-on meeting assistant.
        </p>
      </div>

      {/* Master */}
      <SectionLabel text="Calendar" />
      <SettingCard>
        <SettingRow
          icon={<CalendarDays {...iconStyle} />}
          label="Enable Calendar on Lume"
          description="Pull events from macOS Calendar and show them in the Island."
          enabled={enabled}
          onToggle={() => update('enableCalendar', !enabled)}
          isFirst
        />
      </SettingCard>

      {/* Display */}
      <SectionLabel text="Display" />
      <SettingCard style={{ opacity: enabled ? 1 : 0.5, pointerEvents: enabled ? 'auto' : 'none' }}>
        <SettingRow
          icon={<Hourglass {...iconStyle} />}
          label="Show next event only"
          description="Keep the Island compact — only what's happening now or in the next 30 minutes."
          enabled={nextOnly}
          onToggle={() => update('calendarNextEventOnly', !nextOnly)}
          isFirst
        />
      </SettingCard>

      {/* Meeting */}
      <SectionLabel text="Meetings" />
      <SettingCard style={{ opacity: enabled ? 1 : 0.5, pointerEvents: enabled ? 'auto' : 'none' }}>
        <SettingRow
          icon={<Video {...iconStyle} />}
          label="Click to join"
          description="Open Zoom, Meet, or Teams links when you click the Island."
          enabled={clickToJoin}
          onToggle={() => update('calendarClickToJoin', !clickToJoin)}
          isFirst
        />
        <SettingRow
          icon={<Bell {...iconStyle} />}
          label="Remind me before"
          description="A gentle nudge so you're never late to a meeting."
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
              {reminderOptions.map((n) => {
                const active = reminderBeforeMin === n
                return (
                  <button
                    key={n}
                    onClick={(e) => {
                      e.stopPropagation()
                      update('calendarReminderMin', n)
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
                        ? 'linear-gradient(180deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.06) 100%)'
                        : 'transparent',
                      boxShadow: active ? 'inset 0 0 0 1px rgba(255,255,255,0.08)' : 'none',
                      transition: 'all 150ms ease'
                    }}
                  >
                    {n}m
                  </button>
                )
              })}
            </div>
          }
        />
      </SettingCard>
    </>
  )
}
