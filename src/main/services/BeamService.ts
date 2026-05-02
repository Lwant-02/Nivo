import type Database from 'better-sqlite3'
import { dialog, shell } from 'electron'
import { exec } from 'node:child_process'
import { randomUUID } from 'node:crypto'
import { promises as fs } from 'node:fs'
import { basename, extname, join } from 'node:path'
import { getDatabase } from './database'

export type BeamKind = 'app' | 'url' | 'file'

export interface BeamTile {
  id: string
  kind: BeamKind
  label: string
  target: string
  icon: string | null
  position: number
  createdAt: number
}

export interface BeamTileInput {
  kind: BeamKind
  label: string
  target: string
  icon?: string | null
}

export interface InstalledApp {
  name: string
  path: string
  icon: string | null
}

interface BeamRow {
  id: string
  kind: string
  label: string
  target: string
  icon: string | null
  position: number
  createdAt: number
}

const SELECT_COLUMNS = 'id, kind, label, target, icon, position, created_at as createdAt'
const VALID_KINDS: ReadonlySet<BeamKind> = new Set(['app', 'url', 'file'])
const APP_DIRS = ['/Applications', '/Applications/Utilities', '/System/Applications']

function rowToTile(row: BeamRow): BeamTile {
  return {
    id: row.id,
    kind: VALID_KINDS.has(row.kind as BeamKind) ? (row.kind as BeamKind) : 'url',
    label: row.label,
    target: row.target,
    icon: row.icon,
    position: row.position,
    createdAt: row.createdAt
  }
}

export class BeamService {
  private db: Database.Database

  constructor() {
    this.db = getDatabase()
  }

  list(): BeamTile[] {
    const rows = this.db
      .prepare(`SELECT ${SELECT_COLUMNS} FROM beam_tiles ORDER BY position ASC, created_at ASC`)
      .all() as BeamRow[]
    return rows.map(rowToTile)
  }

  create(input: BeamTileInput): BeamTile {
    if (!VALID_KINDS.has(input.kind)) throw new Error(`Invalid beam kind: ${input.kind}`)
    const label = input.label.trim() || input.target
    const target = input.target.trim()
    if (!target) throw new Error('Beam target cannot be empty')

    const now = Date.now()
    const id = randomUUID()
    const nextPos = (
      this.db.prepare('SELECT COALESCE(MAX(position), -1) + 1 AS pos FROM beam_tiles').get() as {
        pos: number
      }
    ).pos

    this.db
      .prepare(
        'INSERT INTO beam_tiles (id, kind, label, target, icon, position, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
      )
      .run(id, input.kind, label, target, input.icon ?? null, nextPos, now)

    return {
      id,
      kind: input.kind,
      label,
      target,
      icon: input.icon ?? null,
      position: nextPos,
      createdAt: now
    }
  }

  update(id: string, patch: Partial<BeamTileInput>): BeamTile | null {
    const sets: string[] = []
    const values: (string | number | null)[] = []
    if (patch.label !== undefined) {
      sets.push('label = ?')
      values.push(patch.label)
    }
    if (patch.target !== undefined) {
      sets.push('target = ?')
      values.push(patch.target)
    }
    if (patch.icon !== undefined) {
      sets.push('icon = ?')
      values.push(patch.icon)
    }
    if (sets.length === 0) return this.get(id)
    values.push(id)
    this.db.prepare(`UPDATE beam_tiles SET ${sets.join(', ')} WHERE id = ?`).run(...values)
    return this.get(id)
  }

  delete(id: string): boolean {
    const info = this.db.prepare('DELETE FROM beam_tiles WHERE id = ?').run(id)
    return info.changes > 0
  }

  reorder(ids: string[]): BeamTile[] {
    const update = this.db.prepare('UPDATE beam_tiles SET position = ? WHERE id = ?')
    this.db.exec('BEGIN')
    try {
      ids.forEach((id, index) => update.run(index, id))
      this.db.exec('COMMIT')
    } catch (err) {
      this.db.exec('ROLLBACK')
      throw err
    }
    return this.list()
  }

  launch(id: string): boolean {
    const tile = this.get(id)
    if (!tile) return false
    try {
      switch (tile.kind) {
        case 'url':
          shell.openExternal(tile.target)
          return true
        case 'app':
          // open -a "/Applications/Foo.app"
          exec(`open -a ${JSON.stringify(tile.target)}`)
          return true
        case 'file':
          shell.openPath(tile.target)
          return true
      }
    } catch (err) {
      console.error('[BeamService] launch failed:', err)
      return false
    }
    return false
  }

  async listInstalledApps(): Promise<InstalledApp[]> {
    // Skip per-app icon extraction here — it's slow and the picker uses a
    // generic icon. Icons get fetched lazily once the user picks one.
    const seen = new Map<string, InstalledApp>()
    for (const dir of APP_DIRS) {
      const entries = await this.scanDir(dir).catch(() => [] as string[])
      for (const path of entries) {
        if (seen.has(path)) continue
        const name = basename(path, '.app')
        seen.set(path, { name, path, icon: null })
      }
    }
    return Array.from(seen.values()).sort((a, b) => a.name.localeCompare(b.name))
  }

  async pickFile(): Promise<{ path: string; label: string; icon: string | null } | null> {
    const result = await dialog.showOpenDialog({
      properties: ['openFile', 'openDirectory'],
      message: 'Pick a file or folder to beam to'
    })
    if (result.canceled || result.filePaths.length === 0) return null
    const path = result.filePaths[0]
    return { path, label: basename(path), icon: null }
  }

  private get(id: string): BeamTile | null {
    const row = this.db.prepare(`SELECT ${SELECT_COLUMNS} FROM beam_tiles WHERE id = ?`).get(id) as
      | BeamRow
      | undefined
    return row ? rowToTile(row) : null
  }

  private async scanDir(dir: string): Promise<string[]> {
    const out: string[] = []
    const entries = await fs.readdir(dir, { withFileTypes: true })
    for (const entry of entries) {
      if (extname(entry.name) === '.app') {
        out.push(join(dir, entry.name))
      }
    }
    return out
  }
}
