import type Database from 'better-sqlite3'
import { BrowserWindow, clipboard } from 'electron'
import { EventEmitter } from 'node:events'
import { randomUUID } from 'node:crypto'
import { getDatabase } from './database'

export interface ClipboardItem {
  id: string
  content: string
  pinned: boolean
  createdAt: number
}

interface ClipboardRow {
  id: string
  content: string
  pinned: number
  createdAt: number
}

const SELECT_COLUMNS = 'id, content, pinned, created_at as createdAt'
const POLL_INTERVAL_MS = 700
const MAX_UNPINNED = 100
// macOS sets this on the pasteboard when content comes from a password manager.
// Electron's clipboard module exposes available formats via availableFormats().
const CONCEALED_TYPE = 'org.nspasteboard.ConcealedType'

function rowToItem(row: ClipboardRow): ClipboardItem {
  return {
    id: row.id,
    content: row.content,
    pinned: !!row.pinned,
    createdAt: row.createdAt
  }
}

export class ClipboardService extends EventEmitter {
  private db: Database.Database
  private timer: NodeJS.Timeout | null = null
  private lastSeen: string | null = null

  constructor() {
    super()
    this.db = getDatabase()
    // Seed lastSeen so we don't capture whatever was on the clipboard at app start
    // (could be a password from before launch).
    this.lastSeen = clipboard.readText() || null
  }

  start(): void {
    if (this.timer) return
    this.timer = setInterval(() => this.poll(), POLL_INTERVAL_MS)
  }

  stop(): void {
    if (!this.timer) return
    clearInterval(this.timer)
    this.timer = null
  }

  dispose(): void {
    this.stop()
  }

  private poll(): void {
    let formats: string[] = []
    try {
      formats = clipboard.availableFormats()
    } catch {
      // Some platforms / states don't support format introspection — fall through.
    }
    if (formats.includes(CONCEALED_TYPE)) return

    const text = clipboard.readText()
    if (!text) return
    if (text === this.lastSeen) return

    this.lastSeen = text
    this.capture(text)
  }

  private capture(content: string): void {
    const trimmed = content.trim()
    if (!trimmed) return

    // If the most-recent unpinned entry already matches, just bump it forward.
    const existing = this.db
      .prepare(
        `SELECT ${SELECT_COLUMNS} FROM clipboard_items
         WHERE content = ? ORDER BY created_at DESC LIMIT 1`
      )
      .get(content) as ClipboardRow | undefined

    const now = Date.now()
    if (existing) {
      this.db
        .prepare('UPDATE clipboard_items SET created_at = ? WHERE id = ?')
        .run(now, existing.id)
    } else {
      this.db
        .prepare(
          'INSERT INTO clipboard_items (id, content, pinned, created_at) VALUES (?, ?, 0, ?)'
        )
        .run(randomUUID(), content, now)
      this.evictOldest()
    }

    this.broadcast()
  }

  private evictOldest(): void {
    // Keep only the most recent MAX_UNPINNED unpinned entries.
    this.db
      .prepare(
        `DELETE FROM clipboard_items
         WHERE pinned = 0
         AND id NOT IN (
           SELECT id FROM clipboard_items
           WHERE pinned = 0
           ORDER BY created_at DESC
           LIMIT ?
         )`
      )
      .run(MAX_UNPINNED)
  }

  private broadcast(): void {
    const items = this.list()
    for (const win of BrowserWindow.getAllWindows()) {
      if (!win.isDestroyed()) win.webContents.send('clipboard:update', items)
    }
  }

  list(): ClipboardItem[] {
    const rows = this.db
      .prepare(
        `SELECT ${SELECT_COLUMNS} FROM clipboard_items
         ORDER BY pinned DESC, created_at DESC`
      )
      .all() as ClipboardRow[]
    return rows.map(rowToItem)
  }

  togglePin(id: string): ClipboardItem | null {
    const row = this.db
      .prepare(`SELECT ${SELECT_COLUMNS} FROM clipboard_items WHERE id = ?`)
      .get(id) as ClipboardRow | undefined
    if (!row) return null

    const next = row.pinned ? 0 : 1
    this.db.prepare('UPDATE clipboard_items SET pinned = ? WHERE id = ?').run(next, id)
    this.broadcast()
    return { ...rowToItem(row), pinned: !!next }
  }

  copy(id: string): ClipboardItem | null {
    const row = this.db
      .prepare(`SELECT ${SELECT_COLUMNS} FROM clipboard_items WHERE id = ?`)
      .get(id) as ClipboardRow | undefined
    if (!row) return null

    // Track this write so the poller doesn't re-record it as a new item.
    this.lastSeen = row.content
    clipboard.writeText(row.content)
    return rowToItem(row)
  }

  delete(id: string): boolean {
    const info = this.db.prepare('DELETE FROM clipboard_items WHERE id = ?').run(id)
    if (info.changes > 0) this.broadcast()
    return info.changes > 0
  }

  clear(): void {
    // Pinned items are kept; users have explicitly opted to retain them.
    this.db.prepare('DELETE FROM clipboard_items WHERE pinned = 0').run()
    this.broadcast()
  }
}
