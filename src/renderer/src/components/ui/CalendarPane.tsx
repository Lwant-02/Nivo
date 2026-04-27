import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import cn from 'clsx'
import { CalendarIcon } from './CalendarIcon'
import { Spinner } from './Spinner'
import { useSettings } from '../../hooks/useSettings'
import { useWeather, deriveWeatherState } from '../../hooks/useWeather'
import { AtmosphericAura } from './AtmosphericAura'
import { Video, CalendarDays, CloudSun } from 'lucide-react'

interface CalendarEvent {
  title: string
  time: string
  progress: number
  startMs: number
  endMs: number
  url: string
  description: string
}

const PANE_WIDTH = 300
const REFRESH_MS = 300_000 // 5 minutes

type PaneTab = 'events' | 'weather'

export const CalendarPane = () => {
  const { settings } = useSettings()
  const { weather, weatherState } = useWeather()
  const [events, setEvents] = useState<CalendarEvent[] | null>(null)
  const [now, setNow] = useState(() => new Date())
  const [tab, setTab] = useState<PaneTab>('events')

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      try {
        const data = await window.api.getCalendarEvents()
        if (!cancelled) setEvents(data)
      } catch {
        if (!cancelled) setEvents([])
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

  const weekday = now.toLocaleDateString([], { weekday: 'long' })
  const fullDate = now.toLocaleDateString([], {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })
  const clock = now.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  })
  const [timePart, amPmPart] = clock.split(' ')

  return (
    <motion.div
      initial={{ opacity: 0, x: 8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 8 }}
      transition={{ duration: 0.2 }}
      className="shrink-0 h-full flex flex-col overflow-hidden border-l border-white/10 relative"
      style={{
        width: PANE_WIDTH,
        paddingTop: 30,
        paddingLeft: 20,
        paddingRight: 20,
        paddingBottom: 16
      }}
    >
      <div
        style={{
          marginBottom: 12,
          paddingBottom: 0,
          borderBottom: '1px solid rgba(255,255,255,0.10)'
        }}
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <CalendarIcon className="size-10" date={now.getDate()} />
          </div>
          <div className="flex flex-col w-full">
            <span className="text-text font-bold text-lg leading-tight tracking-tight">
              {weekday}
            </span>
            <div
              className="text-text-dim text-[11px] font-medium uppercase"
              style={{ paddingBottom: 4 }}
            >
              {fullDate}
            </div>
          </div>
          <div className="ml-auto flex items-center justify-end gap-1 text-text w-full">
            <span className="text-base font-semibold tabular-nums tracking-wider">{timePart}</span>
            <span className="text-[10px] font-bold text-text-dim uppercase tracking-wider">
              {amPmPart}
            </span>
          </div>
        </div>
        <PaneTabs active={tab} onChange={setTab} weatherEnabled={!!weather} />
      </div>

      <div className="flex-1 min-h-0 relative" style={{ marginTop: 3 }}>
        <AnimatePresence mode="wait">
          {tab === 'events' ? (
            <motion.div
              key="events"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.18 }}
              className="absolute inset-0"
            >
              <EventsTab
                events={events}
                nextEventOnly={settings.calendarNextEventOnly}
                clickToJoin={settings.calendarClickToJoin}
              />
            </motion.div>
          ) : (
            <motion.div
              key="weather"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.18 }}
              className="absolute inset-0"
            >
              <WeatherTab weather={weather} weatherState={weatherState} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

const PaneTabs = ({
  active,
  onChange,
  weatherEnabled
}: {
  active: PaneTab
  onChange: (id: PaneTab) => void
  weatherEnabled: boolean
}) => {
  const tabs: { id: PaneTab; label: string; Icon: typeof CalendarDays; disabled?: boolean }[] = [
    { id: 'events', label: 'Events', Icon: CalendarDays },
    { id: 'weather', label: 'Weather', Icon: CloudSun, disabled: !weatherEnabled }
  ]

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
        gap: 6,
        padding: 4
      }}
    >
      {tabs.map(({ id, label, Icon, disabled }) => {
        const isActive = active === id
        return (
          <button
            key={id}
            onClick={() => !disabled && onChange(id)}
            disabled={disabled}
            className={cn(
              'flex items-center justify-center gap-1.5 transition-all',
              !disabled && 'cursor-pointer',
              disabled && 'opacity-40 cursor-not-allowed'
            )}
            style={{
              height: 26,
              borderRadius: 999,
              background: isActive
                ? 'linear-gradient(180deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.08) 100%)'
                : 'transparent',
              border: isActive ? '1px solid rgba(255,255,255,0.20)' : '1px solid transparent',
              boxShadow: isActive ? '0 4px 12px rgba(0,0,0,0.30)' : 'none',
              color: isActive ? '#fff' : 'rgba(255,255,255,0.55)'
            }}
          >
            <Icon size={11.5} strokeWidth={2.4} />
            <span style={{ fontSize: 11, fontWeight: isActive ? 700 : 600, letterSpacing: -0.1 }}>
              {label}
            </span>
          </button>
        )
      })}
    </div>
  )
}

const EventsTab = ({
  events,
  nextEventOnly,
  clickToJoin
}: {
  events: CalendarEvent[] | null
  nextEventOnly: boolean
  clickToJoin: boolean
}) => {
  if (events === null) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <Spinner size="size-12" />
      </div>
    )
  }

  if (events.length === 0) {
    return (
      <div
        className="text-text-dim flex justify-center items-center w-full h-full text-xs text-center"
        style={{ padding: 10 }}
      >
        No events scheduled.
      </div>
    )
  }

  let filtered = events
  if (nextEventOnly) {
    const current = events.find((e) => e.progress > 0 && e.progress < 100)
    if (current) {
      filtered = [current]
    } else {
      const upcoming = events.find((e) => e.progress <= 0)
      filtered = upcoming ? [upcoming] : []
    }
  }

  return (
    <div
      className="flex flex-col overflow-y-auto"
      style={{ gap: 10, paddingRight: 4, height: '100%' }}
    >
      {filtered.map((e, idx) => (
        <EventRow key={`${e.startMs}-${idx}`} event={e} clickToJoin={clickToJoin} />
      ))}
    </div>
  )
}

const WeatherTab = ({
  weather,
  weatherState
}: {
  weather: Atmosphere | null
  weatherState: ReturnType<typeof deriveWeatherState>
}) => {
  if (!weather) {
    return (
      <div
        className="text-text-dim flex justify-center items-center w-full h-full text-xs text-center"
        style={{ padding: 12 }}
      >
        Weather unavailable.
      </div>
    )
  }

  const conditionLabel = (() => {
    if (!weather.isDay && weather.condition === 'sunny') return 'Clear Night'
    switch (weather.condition) {
      case 'sunny':
        return 'Sunny'
      case 'rainy':
        return 'Rainy'
      case 'cloudy':
        return 'Cloudy'
      case 'snowy':
        return 'Snowy'
      default:
        return 'Sunny'
    }
  })()

  const stateForAura = weatherState ?? (weather.isDay ? 'SUNNY' : 'NIGHT')

  return (
    <div
      className="relative w-full h-full overflow-hidden"
      style={{
        borderRadius: 16,
        border: '1px solid rgba(255,255,255,0.08)',
        background: 'linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(0,0,0,0.30) 100%)'
      }}
    >
      <AtmosphericAura weatherState={stateForAura} variant="background" />
      <div
        className="relative h-full flex flex-col"
        style={{ padding: '7px 12px 12px 12px', boxSizing: 'border-box' }}
      >
        <div className="flex items-start justify-between">
          <div className="flex flex-col">
            <span
              className="text-white/55 text-[9px] font-bold uppercase tracking-[0.24em]"
              style={{ marginBottom: 1 }}
            >
              Now
            </span>
            <span
              className="text-white font-bold tabular-nums tracking-tight"
              style={{ fontSize: 32, lineHeight: 1 }}
            >
              {Math.round(weather.temp)}°
            </span>
          </div>
          <div style={{ marginTop: 2 }}>
            <AtmosphericAura weatherState={stateForAura} variant="notch" />
          </div>
        </div>

        <div className="flex flex-col" style={{ marginTop: 'auto' }}>
          <span
            className="text-white text-[13px] font-semibold tracking-tight"
            style={{ marginBottom: 0 }}
          >
            {conditionLabel}
          </span>
          <span
            className="text-white/45 text-[10px] tracking-tight"
            style={{ whiteSpace: 'nowrap' }}
          >
            {weather.isDay ? 'Daylight' : 'After dark'} · live in your area
          </span>
        </div>
      </div>
    </div>
  )
}

const EventRow = ({ event, clickToJoin }: { event: CalendarEvent; clickToJoin: boolean }) => {
  const isCurrent = event.progress > 0 && event.progress < 100
  const isPast = event.progress >= 100

  const findLink = (text: string) => {
    const regex = /(https?:\/\/[^\s]+)/g
    const matches = text.match(regex)
    if (!matches) return null
    return (
      matches.find(
        (m) =>
          m.includes('zoom.us') ||
          m.includes('meet.google.com') ||
          m.includes('teams.microsoft.com')
      ) || matches[0]
    )
  }

  const link = event.url || findLink(event.description)

  const handleJoin = () => {
    if (!clickToJoin) return
    if (link) window.api.joinMeeting(link)
  }

  return (
    <div
      className={cn(
        'flex items-stretch transition-all',
        clickToJoin && !isPast && 'cursor-pointer hover:bg-white/5 active:scale-[0.98]'
      )}
      style={{ gap: 12 }}
      onClick={handleJoin}
    >
      <div className="relative w-[3px] rounded-full bg-white/10 overflow-hidden">
        <div
          className={cn(
            'absolute inset-x-0 top-0 rounded-full transition-all duration-500',
            isCurrent
              ? 'bg-(--lume-accent) shadow-[0_0_8px_(--lume-accent-glow)] animate-pulse'
              : isPast
                ? 'bg-white/20'
                : 'bg-white/40'
          )}
          style={{
            height: isCurrent ? `${Math.max(event.progress, 8)}%` : isPast ? '100%' : '100%'
          }}
        />
      </div>
      <div className="flex-1 min-w-0" style={{ paddingTop: 2, paddingBottom: 2 }}>
        <div
          className={cn(
            'text-sm font-medium truncate',
            isPast ? 'text-text-dim line-through' : 'text-text'
          )}
        >
          {event.title}
        </div>
        <div className="text-[11px] text-text-dim tracking-wide">{event.time}</div>
      </div>

      {link && clickToJoin && !isPast && (
        <div className="flex items-center justify-center" style={{ paddingRight: 10 }}>
          <div className="size-6 rounded-full bg-(--lume-accent) shadow-[0_0_8px_(--lume-accent-glow)] flex items-center justify-center text-white">
            <Video size={12} strokeWidth={2.5} />
          </div>
        </div>
      )}
    </div>
  )
}
