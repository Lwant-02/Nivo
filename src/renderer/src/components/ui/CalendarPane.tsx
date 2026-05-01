import { useEffect, useState } from 'react'
import { Video } from 'lucide-react'
import { IconCalendarEvent } from '@tabler/icons-react'
import { BentoEmptyState } from './BentoEmptyState'
import { useSettings } from '@renderer/hooks/useSettings'

interface CalendarEvent {
  title: string
  time: string
  progress: number
  startMs: number
  endMs: number
  url: string
  description: string
  isAllDay: boolean
  calendarName: string
}

const REFRESH_MS = 300_000 // 5 minutes

interface CalendarPaneProps {
  accentColor: string
}

export const CalendarPane = ({ accentColor }: CalendarPaneProps) => {
  const [events, setEvents] = useState<CalendarEvent[] | null>(null)
  const { settings } = useSettings()
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const data = await window.api.getCalendarEvents()
        if (!cancelled) setEvents(data)
      } catch (err) {
        if (!cancelled) setEvents(null)
      }
    }
    load()
    const id = setInterval(load, REFRESH_MS)
    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [])

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  if (events === null || !settings.enableCalendar) {
    return (
      <BentoEmptyState
        title="Calendar Unavailable"
        description="Please check permissions or sync settings."
      />
    )
  }

  return (
    <div
      style={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        borderRadius: '30px',
        border: '1px solid rgba(255,255,255,0.08)',
        background: 'rgba(255,255,255,0.05)',
        padding: '16px',
        boxSizing: 'border-box'
      }}
    >
      {/* ── Top Header Row (Calendar Icon + Date Text + Clock) ── */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          height: '54px',
          alignItems: 'center',
          padding: '0 4px'
        }}
      >
        {/* Calendar "Icon" Card */}
        <div
          style={{
            width: '44px',
            height: '44px',
            background: 'rgba(255,255,255,0.08)',
            borderRadius: '10px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
          }}
        >
          <div
            style={{
              background: accentColor || '#FF9500',
              height: '14px',
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '7px',
              fontWeight: '900',
              color: '#fff',
              textTransform: 'uppercase'
            }}
          >
            {now.toLocaleDateString([], { month: 'short' })}
          </div>
          <div
            style={{
              flex: 1,
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              fontWeight: '800',
              color: '#fff',
              marginTop: '-2px'
            }}
          >
            {now.getDate()}
          </div>
        </div>

        {/* Date Labels */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0px' }}>
          <span
            style={{
              fontSize: '14px',
              fontWeight: '800',
              color: '#fff',
              letterSpacing: '-0.1px'
            }}
          >
            {now.toLocaleDateString([], { weekday: 'long' })}
          </span>
          <span
            style={{
              fontSize: '10px',
              fontWeight: '700',
              color: 'rgba(255,255,255,0.4)',
              textTransform: 'uppercase'
            }}
          >
            {now.toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' })}
          </span>
        </div>

        {/* Clock */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '3px', paddingBottom: '15px' }}>
          <span style={{ fontSize: '14px', fontWeight: '700', color: '#fff' }}>
            {
              now
                .toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                  hour12: true
                })
                .split(' ')[0]
            }
          </span>
          <span style={{ fontSize: '8px', fontWeight: '800', color: 'rgba(255,255,255,0.4)' }}>
            {now.toLocaleTimeString([], { hour12: true }).split(' ')[1]}
          </span>
        </div>
      </div>

      <div
        style={{
          flex: 1,
          background: 'transparent',
          borderRadius: '16px',
          padding: '8px',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          minHeight: 0,
          overflowY: 'auto'
        }}
      >
        {events && events.length > 0 ? (
          events.map((event, i) => {
            const isDone = event.endMs < now.getTime()
            const isHoliday =
              event.calendarName.toLowerCase().includes('holiday') ||
              event.calendarName.toLowerCase().includes('วันหยุด') || // Thai for holiday
              event.isAllDay

            if (isHoliday) {
              return (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '6px 12px',
                    background: 'rgba(139, 92, 246, 0.2)', // Purple/Violet pill
                    borderRadius: '20px',
                    border: '1px solid rgba(139, 92, 246, 0.2)',
                    opacity: isDone ? 0.4 : 1,
                    marginBottom: '4px'
                  }}
                >
                  <div
                    style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      background: 'rgba(139, 92, 246, 0.5)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    <svg
                      width="10"
                      height="10"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      style={{ color: '#C084FC' }}
                    >
                      <path d="M12 1.7L15 8.3L22.3 9.4L17 14.5L18.3 21.7L12 18.3L5.7 21.7L7 14.5L1.7 9.4L9 8.3L12 1.7Z" />
                    </svg>
                  </div>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: '700',
                      color: '#C084FC',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                  >
                    {event.title}
                  </span>
                </div>
              )
            }

            return (
              <div
                key={i}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '4px 0',
                  opacity: isDone ? 0.35 : 1
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0px',
                    flex: 1,
                    minWidth: 0
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div
                      style={{
                        width: '5px',
                        height: '5px',
                        background: accentColor || '#fff',
                        borderRadius: '1.2px'
                      }}
                    />
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: '700',
                        color: '#fff',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        textDecoration: isDone ? 'line-through' : 'none'
                      }}
                    >
                      {event.title}
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: '9px',
                      color: 'rgba(255,255,255,0.4)',
                      fontWeight: '600',
                      marginLeft: '11px'
                    }}
                  >
                    {event.time}
                  </span>
                </div>

                {event.url && !isDone && (
                  <button
                    onClick={() => window.api.openExternal(event.url)}
                    style={{
                      background: accentColor || '#FF9500',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '4px 8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      cursor: 'pointer',
                      flexShrink: 0,
                      transition: 'opacity 0.2s'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.8')}
                    onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                  >
                    <Video size={10} color="#fff" />
                    <span style={{ fontSize: '9px', fontWeight: '800', color: '#fff' }}>Join</span>
                  </button>
                )}
              </div>
            )
          })
        ) : (
          <div className="flex justify-center items-center text-text h-full gap-1">
            <IconCalendarEvent size={20} />
            <p className="text-xs">No Upcoming Events</p>
          </div>
        )}
      </div>
    </div>
  )
}
