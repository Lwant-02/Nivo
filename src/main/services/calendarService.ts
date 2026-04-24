import { exec } from 'child_process'
import { promisify } from 'util'
import fs from 'fs'
import os from 'os'
import path from 'path'

const execAsync = promisify(exec)

export interface CalendarEvent {
  title: string
  time: string
  progress: number
  startMs: number
  endMs: number
  url: string
  description: string
}

// Clean single-path scanner. Avoids: (1) single-letter vars (`c`, `s`, `h`, `m`)
// that collide with AppleScript's class-abbreviation parsing → -2741; (2)
// `title of calendar` (property is `name`); (3) `as integer` precedence bugs.
const CALENDAR_SCRIPT = `
set todayStart to (current date) - (time of (current date))
set todayEnd to todayStart + (1 * days)
set output to ""

tell application "System Events"
    set isRunning to (count of (every process whose name is "Calendar")) > 0
end tell

if not isRunning then
    do shell script "open -a Calendar -j -g"
    delay 0.5
end if

tell application "Calendar"
    try
        set calList to every calendar
        repeat with aCal in calList
            try
                set calName to name of aCal
                if calName is not "Birthdays" and calName is not "Siri-found events" and calName is not "Holidays" then
                    set matchEvents to (every event of aCal whose start date < todayEnd and end date > todayStart)
                    repeat with anEvent in matchEvents
                        set summStr to summary of anEvent
                        set dStr to description of anEvent
                        if dStr is missing value then set dStr to ""
                        set uStr to url of anEvent
                        if uStr is missing value then set uStr to ""
                        set sStr to my formatDate(start date of anEvent)
                        set eStr to my formatDate(end date of anEvent)
                        set output to output & summStr & "|||" & sStr & "|||" & eStr & "|||" & dStr & "|||" & uStr & linefeed
                    end repeat
                end if
            end try
        end repeat
    on error errText number errNum
        if errNum is -1743 then return "PERMISSION_DENIED"
        return "ERROR: " & errNum & " — " & errText
    end try
end tell

return output

on formatDate(theDate)
    set yr to (year of theDate) as integer
    set mo to (month of theDate) as integer
    set dy to (day of theDate) as integer
    set hr to (hours of theDate) as integer
    set mn to (minutes of theDate) as integer
    set sc to (seconds of theDate) as integer
    return (yr as string) & "-" & my pad2(mo) & "-" & my pad2(dy) & " " & my pad2(hr) & ":" & my pad2(mn) & ":" & my pad2(sc)
end formatDate

on pad2(num)
    set txt to num as string
    if (length of txt) is 1 then return "0" & txt
    return txt
end pad2
`

function formatTimeRange(start: Date, end: Date): string {
  const isAllDay = end.getTime() - start.getTime() >= 24 * 60 * 60 * 1000 - 1000
  if (isAllDay) return 'All Day'
  const fmt = (d: Date) => d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
  return `${fmt(start)} – ${fmt(end)}`
}

function computeProgress(start: Date, end: Date, now: Date): number {
  const s = start.getTime()
  const e = end.getTime()
  const n = now.getTime()
  if (n <= s) return 0
  if (n >= e) return 100
  return Math.max(0, Math.min(100, ((n - s) / (e - s)) * 100))
}

async function runAppleScript(script: string): Promise<string> {
  const tmpFile = path.join(
    os.tmpdir(),
    `lume_calendar_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.applescript`
  )
  try {
    fs.writeFileSync(tmpFile, script)
    const { stdout, stderr } = await execAsync(`osascript "${tmpFile}"`, {
      timeout: 10000,
      maxBuffer: 8 * 1024 * 1024
    })

    if (stderr && stderr.trim().length > 0) {
      console.warn('[CalendarService] AppleScript Warning:', stderr)
    }

    return stdout
  } catch (err: any) {
    // Merge every diagnostic field osascript may have used. On permission
    // denial macOS sometimes writes to stderr, sometimes embeds the code in
    // the message, so we have to inspect all of them.
    const code = err.code
    const stderrOut = (err.stderr || '').toString().trim()
    const stdoutOut = (err.stdout || '').toString().trim()
    const combined = `${err.message || ''}\n${stderrOut}\n${stdoutOut}`

    const isPermissionError =
      combined.includes('-1743') ||
      combined.includes('-10004') ||
      combined.toLowerCase().includes('not authorized') ||
      combined.toLowerCase().includes("can't get") ||
      combined.toLowerCase().includes('access not allowed')

    if (isPermissionError) {
      console.error(
        '[CalendarService] Access denied by macOS.\n' +
          '  → Open System Settings → Privacy & Security → Automation\n' +
          '  → Enable "Calendar" under the Lume (or Electron) app.\n' +
          '  → Also check Privacy & Security → Calendars.\n' +
          `  stderr: ${stderrOut || '(empty)'}`
      )
      return 'PERMISSION_DENIED'
    }

    console.error('[CalendarService] AppleScript failed:', {
      code,
      signal: err.signal,
      message: err.message,
      stderr: stderrOut || '(empty)',
      stdout: stdoutOut || '(empty)'
    })
    throw err
  } finally {
    try {
      fs.unlinkSync(tmpFile)
    } catch {}
  }
}

// Dedupe overlapping calls + cache briefly. Hover in/out mounts/unmounts the
// pane rapidly; without this we'd spawn many osascript processes, each fighting
// for Calendar.app and producing random failures.
let inFlight: Promise<CalendarEvent[]> | null = null
let cache: { at: number; data: CalendarEvent[] } | null = null
const CACHE_MS = 30_000 // 30 seconds (reduced for better responsiveness)

export async function fetchMacEvents(): Promise<CalendarEvent[]> {
  if (cache && Date.now() - cache.at < CACHE_MS) return cache.data
  if (inFlight) return inFlight

  inFlight = (async () => {
    try {
      const events = await doFetch()
      return events
    } finally {
      inFlight = null
    }
  })()
  return inFlight
}

async function doFetch(): Promise<CalendarEvent[]> {
  try {
    const raw = await runAppleScript(CALENDAR_SCRIPT)
    if (!raw || raw.trim() === '') return []

    if (raw.trim() === 'PERMISSION_DENIED') {
      console.error('[CalendarService] Access denied. Grant permissions in System Settings.')
      return []
    }

    if (raw.startsWith('ERROR:')) {
      console.error('[CalendarService]', raw)
      return []
    }

    const now = new Date()
    const rawLines = raw.split(/\r?\n/).filter((l) => l.trim().length > 0)
    const seen = new Set<string>()
    const events: CalendarEvent[] = []

    for (const line of rawLines) {
      const parts = line.split('|||')
      if (parts.length < 3) continue
      const [rawTitle, startStr, endStr] = parts

      const key = `${rawTitle}-${startStr}-${endStr}`
      if (seen.has(key)) continue
      seen.add(key)

      // The AppleScript returns y-m-d h:m:s which Date() parses well
      const start = new Date(startStr.replace(/-/g, '/')) // '/' is more stable in many environments
      const end = new Date(endStr.replace(/-/g, '/'))

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        // Try without replacement
        const s2 = new Date(startStr)
        const e2 = new Date(endStr)
        if (isNaN(s2.getTime()) || isNaN(e2.getTime())) continue
        events.push({
          title: rawTitle.trim() || 'Untitled',
          time: formatTimeRange(s2, e2),
          progress: computeProgress(s2, e2, now),
          startMs: s2.getTime(),
          endMs: e2.getTime(),
          description: parts[3] || '',
          url: parts[4] || ''
        })
      } else {
        events.push({
          title: rawTitle.trim() || 'Untitled',
          time: formatTimeRange(start, end),
          progress: computeProgress(start, end, now),
          startMs: start.getTime(),
          endMs: end.getTime(),
          description: parts[3] || '',
          url: parts[4] || ''
        })
      }
    }

    events.sort((a, b) => a.startMs - b.startMs || a.endMs - b.endMs)
    cache = { at: Date.now(), data: events }
    return events
  } catch {
    return []
  }
}
