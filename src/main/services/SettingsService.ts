import type Database from 'better-sqlite3'
import { EventEmitter } from 'node:events'
import { getDatabase } from './database'

export type ThemeId = 'midnight' | 'graphite' | 'ocean' | 'forest' | 'sunset' | 'berry'
export type NotchThemeId = 'obsidian' | 'frost' | 'aurora' | 'sand' | 'lavender' | 'crimson' | 'emerald' | 'amber'
export type BatteryThreshold = 10 | 20

export interface Settings {
  // General
  theme: ThemeId
  notchTheme: NotchThemeId
  launchAtLogin: boolean
  hideInFullscreen: boolean
  hideFromScreenCapture: boolean
  hapticFeedback: boolean
  hideWhenPaused: boolean
  showAlbumArt: boolean
  showVisualizer: boolean
  enableCalendar: boolean
  calendarNextEventOnly: boolean
  calendarClickToJoin: boolean
  calendarReminderMin: number
  showLottieOnPause: boolean
  lottieStyle: number
  focusDuration: number
  hasSeenWelcome: boolean
}

export const DEFAULT_SETTINGS: Settings = {
  theme: 'midnight',
  notchTheme: 'obsidian',
  launchAtLogin: false,
  hideInFullscreen: true,
  hideFromScreenCapture: false,
  hapticFeedback: true,
  hideWhenPaused: true,
  showAlbumArt: true,
  showVisualizer: true,
  enableCalendar: false,
  calendarNextEventOnly: true,
  calendarClickToJoin: true,
  calendarReminderMin: 5,
  showLottieOnPause: false,
  lottieStyle: 0,
  focusDuration: 25,
  hasSeenWelcome: false
}

const VALID_THEMES: ReadonlySet<ThemeId> = new Set([
  'midnight',
  'graphite',
  'ocean',
  'forest',
  'sunset',
  'berry'
])

const VALID_NOTCH_THEMES: ReadonlySet<NotchThemeId> = new Set([
  'obsidian',
  'frost',
  'aurora',
  'sand',
  'lavender',
  'crimson',
  'emerald',
  'amber'
])

type Column =
  | 'theme'
  | 'notch_theme'
  | 'launch_at_login'
  | 'hide_in_fullscreen'
  | 'hide_from_screen_capture'
  | 'haptic_feedback'
  | 'hide_when_paused'
  | 'show_album_art'
  | 'show_visualizer'
  | 'enable_calendar'
  | 'calendar_next_event_only'
  | 'calendar_click_to_join'
  | 'calendar_reminder_min'
  | 'show_lottie_on_pause'
  | 'lottie_style'
  | 'focus_duration'
  | 'has_seen_welcome'

type Kind = 'bool' | 'int' | 'theme' | 'notchTheme'

interface FieldSpec {
  column: Column
  kind: Kind
}

const FIELDS: { [K in keyof Settings]: FieldSpec } = {
  theme: { column: 'theme', kind: 'theme' },
  notchTheme: { column: 'notch_theme', kind: 'notchTheme' },
  launchAtLogin: { column: 'launch_at_login', kind: 'bool' },
  hideInFullscreen: { column: 'hide_in_fullscreen', kind: 'bool' },
  hideFromScreenCapture: { column: 'hide_from_screen_capture', kind: 'bool' },
  hapticFeedback: { column: 'haptic_feedback', kind: 'bool' },
  hideWhenPaused: { column: 'hide_when_paused', kind: 'bool' },
  showAlbumArt: { column: 'show_album_art', kind: 'bool' },
  showVisualizer: { column: 'show_visualizer', kind: 'bool' },
  enableCalendar: { column: 'enable_calendar', kind: 'bool' },
  calendarNextEventOnly: { column: 'calendar_next_event_only', kind: 'bool' },
  calendarClickToJoin: { column: 'calendar_click_to_join', kind: 'bool' },
  calendarReminderMin: { column: 'calendar_reminder_min', kind: 'int' },
  showLottieOnPause: { column: 'show_lottie_on_pause', kind: 'bool' },
  lottieStyle: { column: 'lottie_style', kind: 'int' },
  focusDuration: { column: 'focus_duration', kind: 'int' },
  hasSeenWelcome: { column: 'has_seen_welcome', kind: 'bool' }
}

const SELECT_ALIASES = (Object.keys(FIELDS) as (keyof Settings)[])
  .map((key) => `${FIELDS[key].column} as ${key}`)
  .join(', ')

function toStored<K extends keyof Settings>(key: K, value: Settings[K]): string | number {
  const { kind } = FIELDS[key]
  if (kind === 'theme') {
    const v = value as ThemeId
    if (!VALID_THEMES.has(v)) throw new Error(`Invalid theme: ${v}`)
    return v
  }
  if (kind === 'notchTheme') {
    const v = value as NotchThemeId
    if (!VALID_NOTCH_THEMES.has(v)) throw new Error(`Invalid notch theme: ${v}`)
    return v
  }
  if (kind === 'bool') return value ? 1 : 0
  return Number(value)
}

function fromStored<K extends keyof Settings>(key: K, raw: unknown): Settings[K] {
  const { kind } = FIELDS[key]
  if (kind === 'theme') {
    const v = raw as string
    return (VALID_THEMES.has(v as ThemeId) ? v : DEFAULT_SETTINGS.theme) as Settings[K]
  }
  if (kind === 'notchTheme') {
    const v = raw as string
    return (VALID_NOTCH_THEMES.has(v as NotchThemeId)
      ? v
      : DEFAULT_SETTINGS.notchTheme) as Settings[K]
  }
  if (kind === 'bool') return (!!raw) as Settings[K]
  return Number(raw) as unknown as Settings[K]
}

export class SettingsService extends EventEmitter {
  private db: Database.Database

  constructor() {
    super()
    this.db = getDatabase()
    this.ensureRow()
  }

  private ensureRow(): void {
    const exists = this.db.prepare('SELECT 1 FROM settings WHERE id = 1').get()
    if (exists) return

    const keys = Object.keys(FIELDS) as (keyof Settings)[]
    const columns = keys.map((k) => FIELDS[k].column).join(', ')
    const placeholders = keys.map(() => '?').join(', ')
    const values = keys.map((k) => toStored(k, DEFAULT_SETTINGS[k]))

    this.db
      .prepare(`INSERT INTO settings (id, ${columns}) VALUES (1, ${placeholders})`)
      .run(...values)
  }

  getAll(): Settings {
    const row = this.db.prepare(`SELECT ${SELECT_ALIASES} FROM settings WHERE id = 1`).get() as
      | Record<keyof Settings, unknown>
      | undefined

    if (!row) return { ...DEFAULT_SETTINGS }

    const out = {} as Settings
    for (const key of Object.keys(FIELDS) as (keyof Settings)[]) {
      ;(out[key] as Settings[typeof key]) = fromStored(key, row[key])
    }
    return out
  }

  get<K extends keyof Settings>(key: K): Settings[K] {
    return this.getAll()[key]
  }

  set<K extends keyof Settings>(key: K, value: Settings[K]): Settings {
    const spec = FIELDS[key]
    if (!spec) throw new Error(`Unknown setting: ${String(key)}`)
    this.db.prepare(`UPDATE settings SET ${spec.column} = ? WHERE id = 1`).run(toStored(key, value))
    const next = this.getAll()
    this.emit('change', next)
    return next
  }
}
