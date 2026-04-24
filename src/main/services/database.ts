import Database from 'better-sqlite3'
import { app } from 'electron'
import { join } from 'path'
import { mkdirSync } from 'fs'

let dbInstance: Database.Database | null = null

export function getDatabase(): Database.Database {
  if (dbInstance) return dbInstance

  const dir = app.getPath('userData')
  mkdirSync(dir, { recursive: true })
  const db = new Database(join(dir, 'lume.db'))
  db.pragma('journal_mode = WAL')

  db.exec(`
    CREATE TABLE IF NOT EXISTS auth (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      license_key TEXT,
      validation_hash TEXT,
      instance_id TEXT
    );

    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      theme TEXT NOT NULL DEFAULT 'midnight',
      launch_at_login INTEGER NOT NULL DEFAULT 0,
      hide_in_fullscreen INTEGER NOT NULL DEFAULT 1,
      hide_from_screen_capture INTEGER NOT NULL DEFAULT 0,
      haptic_feedback INTEGER NOT NULL DEFAULT 1,
      hide_when_paused INTEGER NOT NULL DEFAULT 1
    );
  `)

  // Forward-migrate older `auth` schemas that lacked validation_hash.
  const authCols = db.prepare('PRAGMA table_info(auth)').all() as { name: string }[]
  if (!authCols.some((c) => c.name === 'validation_hash')) {
    db.exec('ALTER TABLE auth ADD COLUMN validation_hash TEXT')
  }

  // Forward-migrate older `settings` schemas (previously only had theme + launch_at_login).
  const settingsCols = db.prepare('PRAGMA table_info(settings)').all() as { name: string }[]
  const settingsColNames = new Set(settingsCols.map((c) => c.name))
  const addColumn = (name: string, ddl: string): void => {
    if (!settingsColNames.has(name)) db.exec(`ALTER TABLE settings ADD COLUMN ${ddl}`)
  }
  addColumn('theme', "theme TEXT NOT NULL DEFAULT 'midnight'")
  addColumn('launch_at_login', 'launch_at_login INTEGER NOT NULL DEFAULT 0')
  addColumn('hide_in_fullscreen', 'hide_in_fullscreen INTEGER NOT NULL DEFAULT 1')
  addColumn('hide_from_screen_capture', 'hide_from_screen_capture INTEGER NOT NULL DEFAULT 0')
  addColumn('haptic_feedback', 'haptic_feedback INTEGER NOT NULL DEFAULT 1')
  addColumn('hide_when_paused', 'hide_when_paused INTEGER NOT NULL DEFAULT 1')
  addColumn('show_album_art', 'show_album_art INTEGER NOT NULL DEFAULT 1')
  addColumn('show_visualizer', 'show_visualizer INTEGER NOT NULL DEFAULT 1')

  dbInstance = db
  return db
}
