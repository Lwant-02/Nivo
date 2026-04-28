import Database from 'better-sqlite3'
import { app } from 'electron'
import { join } from 'path'
import { existsSync, mkdirSync, renameSync } from 'fs'

let dbInstance: Database.Database | null = null

export function getDatabase(): Database.Database {
  if (dbInstance) return dbInstance

  const dir = app.getPath('userData')
  mkdirSync(dir, { recursive: true })

  const dbPath = join(dir, 'nivo.db')
  const legacyPath = join(dir, 'lume.db')

  // Rename legacy DB (and its WAL/SHM siblings) from the pre-rename product name.
  if (!existsSync(dbPath) && existsSync(legacyPath)) {
    renameSync(legacyPath, dbPath)
    for (const suffix of ['-wal', '-shm']) {
      const legacy = legacyPath + suffix
      if (existsSync(legacy)) renameSync(legacy, dbPath + suffix)
    }
  }

  const db = new Database(dbPath)
  db.pragma('journal_mode = WAL')

  db.exec(`
    CREATE TABLE IF NOT EXISTS auth (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      license_key TEXT,
      validation_hash TEXT,
      instance_id TEXT,
      trial_started_at INTEGER
    );

    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      theme TEXT NOT NULL DEFAULT 'midnight',
      notch_theme TEXT NOT NULL DEFAULT 'obsidian',
      launch_at_login INTEGER NOT NULL DEFAULT 0,
      hide_in_fullscreen INTEGER NOT NULL DEFAULT 1,
      hide_from_screen_capture INTEGER NOT NULL DEFAULT 0,
      haptic_feedback INTEGER NOT NULL DEFAULT 1,
      hide_when_paused INTEGER NOT NULL DEFAULT 1,
      show_lottie_on_pause INTEGER NOT NULL DEFAULT 0,
      lottie_style INTEGER NOT NULL DEFAULT 0,
      focus_duration INTEGER NOT NULL DEFAULT 25,
      has_seen_welcome INTEGER NOT NULL DEFAULT 0
    );
  `)

  // Forward-migrate older `auth` schemas.
  const authCols = db.prepare('PRAGMA table_info(auth)').all() as { name: string }[]
  if (!authCols.some((c) => c.name === 'validation_hash')) {
    db.exec('ALTER TABLE auth ADD COLUMN validation_hash TEXT')
  }
  if (!authCols.some((c) => c.name === 'trial_started_at')) {
    db.exec('ALTER TABLE auth ADD COLUMN trial_started_at INTEGER')
  }

  // Forward-migrate older `settings` schemas (previously only had theme + launch_at_login).
  const settingsCols = db.prepare('PRAGMA table_info(settings)').all() as { name: string }[]
  const settingsColNames = new Set(settingsCols.map((c) => c.name))
  const addColumn = (name: string, ddl: string): void => {
    if (!settingsColNames.has(name)) db.exec(`ALTER TABLE settings ADD COLUMN ${ddl}`)
  }
  addColumn('theme', "theme TEXT NOT NULL DEFAULT 'midnight'")
  addColumn('notch_theme', "notch_theme TEXT NOT NULL DEFAULT 'obsidian'")
  addColumn('launch_at_login', 'launch_at_login INTEGER NOT NULL DEFAULT 0')
  addColumn('hide_in_fullscreen', 'hide_in_fullscreen INTEGER NOT NULL DEFAULT 1')
  addColumn('hide_from_screen_capture', 'hide_from_screen_capture INTEGER NOT NULL DEFAULT 0')
  addColumn('haptic_feedback', 'haptic_feedback INTEGER NOT NULL DEFAULT 1')
  addColumn('hide_when_paused', 'hide_when_paused INTEGER NOT NULL DEFAULT 1')
  addColumn('show_album_art', 'show_album_art INTEGER NOT NULL DEFAULT 1')
  addColumn('show_visualizer', 'show_visualizer INTEGER NOT NULL DEFAULT 1')
  addColumn('enable_calendar', 'enable_calendar INTEGER NOT NULL DEFAULT 0')
  addColumn('calendar_next_event_only', 'calendar_next_event_only INTEGER NOT NULL DEFAULT 1')
  addColumn('calendar_click_to_join', 'calendar_click_to_join INTEGER NOT NULL DEFAULT 1')
  addColumn('calendar_reminder_min', 'calendar_reminder_min INTEGER NOT NULL DEFAULT 5')
  addColumn('show_lottie_on_pause', 'show_lottie_on_pause INTEGER NOT NULL DEFAULT 0')
  addColumn('lottie_style', 'lottie_style INTEGER NOT NULL DEFAULT 0')
  addColumn('focus_duration', 'focus_duration INTEGER NOT NULL DEFAULT 25')
  addColumn('show_weather', 'show_weather INTEGER NOT NULL DEFAULT 1')
  addColumn('show_weather_in_calendar', 'show_weather_in_calendar INTEGER NOT NULL DEFAULT 1')
  addColumn('sonic_feedback', 'sonic_feedback INTEGER NOT NULL DEFAULT 0')
  addColumn('has_seen_welcome', 'has_seen_welcome INTEGER NOT NULL DEFAULT 0')

  dbInstance = db
  return db
}
