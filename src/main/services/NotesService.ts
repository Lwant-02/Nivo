import type Database from 'better-sqlite3'
import { randomUUID } from 'node:crypto'
import { getDatabase } from './database'

export type NoteIconId =
  | 'clipboard-text'
  | 'home'
  | 'book'
  | 'bell'
  | 'soup'
  | 'target'
  | 'note'
  | 'bulb'
  | 'heart'
  | 'star'
  | 'briefcase'
  | 'flag'

export const NOTE_ICONS: readonly NoteIconId[] = [
  'clipboard-text',
  'home',
  'book',
  'bell',
  'soup',
  'target',
  'note',
  'bulb',
  'heart',
  'star',
  'briefcase',
  'flag'
]

const VALID_ICONS: ReadonlySet<NoteIconId> = new Set(NOTE_ICONS)

export interface Note {
  id: string
  title: string
  content: string
  icon: NoteIconId
  createdAt: number
  updatedAt: number
}

export interface NoteUpdate {
  title?: string
  content?: string
  icon?: NoteIconId
}

interface NoteRow {
  id: string
  title: string
  content: string
  icon: string
  createdAt: number
  updatedAt: number
}

const SELECT_COLUMNS =
  'id, title, content, icon, created_at as createdAt, updated_at as updatedAt'

function normalizeIcon(raw: string): NoteIconId {
  return VALID_ICONS.has(raw as NoteIconId) ? (raw as NoteIconId) : 'clipboard-text'
}

function rowToNote(row: NoteRow): Note {
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    icon: normalizeIcon(row.icon),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt
  }
}

export class NotesService {
  private db: Database.Database

  constructor() {
    this.db = getDatabase()
  }

  list(): Note[] {
    const rows = this.db
      .prepare(`SELECT ${SELECT_COLUMNS} FROM notes ORDER BY updated_at DESC`)
      .all() as NoteRow[]
    return rows.map(rowToNote)
  }

  create(input: NoteUpdate = {}): Note {
    const now = Date.now()
    const id = randomUUID()
    const icon = input.icon && VALID_ICONS.has(input.icon) ? input.icon : 'clipboard-text'
    this.db
      .prepare(
        'INSERT INTO notes (id, title, content, icon, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)'
      )
      .run(id, input.title ?? '', input.content ?? '', icon, now, now)

    return {
      id,
      title: input.title ?? '',
      content: input.content ?? '',
      icon,
      createdAt: now,
      updatedAt: now
    }
  }

  update(id: string, patch: NoteUpdate): Note | null {
    const sets: string[] = []
    const values: (string | number)[] = []
    if (patch.title !== undefined) {
      sets.push('title = ?')
      values.push(patch.title)
    }
    if (patch.content !== undefined) {
      sets.push('content = ?')
      values.push(patch.content)
    }
    if (patch.icon !== undefined) {
      if (!VALID_ICONS.has(patch.icon)) throw new Error(`Invalid note icon: ${patch.icon}`)
      sets.push('icon = ?')
      values.push(patch.icon)
    }

    if (sets.length === 0) return this.get(id)

    sets.push('updated_at = ?')
    values.push(Date.now())
    values.push(id)

    this.db.prepare(`UPDATE notes SET ${sets.join(', ')} WHERE id = ?`).run(...values)
    return this.get(id)
  }

  delete(id: string): boolean {
    const info = this.db.prepare('DELETE FROM notes WHERE id = ?').run(id)
    return info.changes > 0
  }

  private get(id: string): Note | null {
    const row = this.db
      .prepare(`SELECT ${SELECT_COLUMNS} FROM notes WHERE id = ?`)
      .get(id) as NoteRow | undefined
    return row ? rowToNote(row) : null
  }
}
