import { useEffect, useState, useRef } from 'react'
import { useSettings } from './useSettings'

interface CalendarEvent {
  title: string
  startMs: number
}

export function useCalendarReminders() {
  const { settings } = useSettings()
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const remindedEvents = useRef(new Set<string>())
  const lastFetch = useRef(0)

  useEffect(() => {
    if (!settings.enableCalendar) return

    const check = async () => {
      // Fetch every 30s for reminders
      if (Date.now() - lastFetch.current < 30000) return
      
      try {
        const data = await window.api.getCalendarEvents()
        setEvents(data)
        lastFetch.current = Date.now()
      } catch (err) {
        console.error('Failed to fetch events for reminders', err)
      }
    }

    check()
    const id = setInterval(check, 10000) // Check status every 10s
    return () => clearInterval(id)
  }, [settings.enableCalendar])

  useEffect(() => {
    if (!settings.enableCalendar || events.length === 0) return

    const id = setInterval(() => {
      const nowMs = Date.now()
      const reminderMs = settings.calendarReminderMin * 60000

      events.forEach((event) => {
        const key = `${event.title}-${event.startMs}`
        if (event.startMs <= nowMs) return
        if (remindedEvents.current.has(key)) return

        const timeUntilStart = event.startMs - nowMs
        
        if (timeUntilStart <= reminderMs && timeUntilStart > 0) {
          remindedEvents.current.add(key)
          const mins = Math.round(timeUntilStart / 60000)
          window.api.showLumeToast(
            'Upcoming Meeting',
            `${event.title} starts in ${mins === 0 ? 'less than a minute' : `${mins}m`}`
          )
        }
      })
    }, 1000)

    return () => clearInterval(id)
  }, [events, settings.enableCalendar, settings.calendarReminderMin])
}
