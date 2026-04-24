import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import cn from 'clsx'
import { CalendarIcon } from './CalendarIcon'
import { Spinner } from './Spinner'

interface CalendarEvent {
  title: string
  time: string
  progress: number
  startMs: number
  endMs: number
}

const PANE_WIDTH = 300
const REFRESH_MS = 300_000 // 5 minutes

export const CalendarPane = () => {
  const [events, setEvents] = useState<CalendarEvent[] | null>(null)
  const [now, setNow] = useState(() => new Date())

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
      className="shrink-0 h-full flex flex-col px-4 py-4 overflow-hidden border-l border-white/10"
      style={{ width: PANE_WIDTH, paddingTop: '30px', paddingLeft: '20px', paddingRight: '20px' }}
    >
      <div className="mb-4 pb-3 border-b border-white/10">
        <div className="flex items-center gap-3 mb-1.5">
          <CalendarIcon className="size-10" date={now.getDate()} />
          <div className="flex flex-col">
            <span className="text-text font-bold text-lg leading-tight tracking-tight">
              {weekday}
            </span>
          </div>
          <div className="ml-auto flex items-center justify-end gap-1 text-text w-full">
            <span className="text-base font-semibold tabular-nums tracking-wider">{timePart}</span>
            <span className="text-[10px] font-bold text-text-dim uppercase tracking-wider">
              {amPmPart}
            </span>
          </div>
        </div>
        <div
          style={{ paddingBottom: '5px' }}
          className="text-text-dim text-[11px] font-medium uppercase tracking-[0.15em]"
        >
          {fullDate}
        </div>
      </div>

      {events === null ? (
        <Spinner size="size-12" />
      ) : events.length === 0 ? (
        <div
          style={{ padding: '10px' }}
          className="text-text-dim flex justify-center items-center w-full h-full text-xs text-center"
        >
          A quiet day ahead.
        </div>
      ) : (
        <div className="flex flex-col gap-2.5 overflow-y-auto pr-1">
          {events.map((e, idx) => (
            <EventRow key={`${e.startMs}-${idx}`} event={e} />
          ))}
        </div>
      )}
    </motion.div>
  )
}

const EventRow = ({ event }: { event: CalendarEvent }) => {
  const isCurrent = event.progress > 0 && event.progress < 100
  const isPast = event.progress >= 100

  return (
    <div className="flex gap-3 items-stretch">
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
      <div className="flex-1 min-w-0 py-0.5">
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
    </div>
  )
}
