import { IconClipboardText, IconSearch, IconX } from '@tabler/icons-react'
import { useEffect, useMemo, useState } from 'react'
import { ICONS } from './NoteView'

interface NoteSearchBarProps {
  notes: Note[]
  onPick: (id: string) => void
  onClose: () => void
}

export const NoteSearchBar: React.FC<NoteSearchBarProps> = ({ notes, onPick, onClose }) => {
  const [query, setQuery] = useState('')
  const [highlight, setHighlight] = useState(0)

  // Notch is non-focusable by default; flip while the search bar is mounted
  // so the input receives keystrokes.
  useEffect(() => {
    window.api.setNotchEditing(true)
    return () => {
      window.api.setNotchEditing(false)
    }
  }, [])

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return notes.slice(0, 8)
    return notes
      .filter((n) => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q))
      .slice(0, 8)
  }, [notes, query])

  useEffect(() => {
    setHighlight(0)
  }, [query])

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Escape') {
      e.preventDefault()
      onClose()
      return
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlight((h) => Math.min(results.length - 1, h + 1))
      return
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlight((h) => Math.max(0, h - 1))
      return
    }
    if (e.key === 'Enter') {
      e.preventDefault()
      const pick = results[highlight]
      if (pick) onPick(pick.id)
    }
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 20,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '8px'
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '420px',
          background: 'rgba(255,255,255,0.05)',
          backdropFilter: 'blur(80px) saturate(180%)',
          WebkitBackdropFilter: 'blur(80px) saturate(180%)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '14px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <div
          style={{ display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 12px',
            borderBottom: results.length ? '1px solid rgba(255,255,255,0.08)' : 'none'
          }}
        >
          <IconSearch size={14} stroke={2} style={{ color: 'rgba(255,255,255,0.5)' }} />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Search notes…"
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#fff',
              fontSize: '12px',
              fontWeight: 500
            }}
          />
          <div
            onClick={onClose}
            style={{
              cursor: 'pointer',
              color: 'rgba(255,255,255,0.4)',
              display: 'flex',
              padding: '2px',
              borderRadius: '4px'
            }}
          >
            <IconX size={14} stroke={2} />
          </div>
        </div>

        {results.length > 0 && (
          <div
            style={{
              maxHeight: '140px',
              overflowY: 'auto',
              padding: '4px'
            }}
          >
            {results.map((note, idx) => {
              const Icon = ICONS[note.icon] ?? IconClipboardText
              const selected = idx === highlight
              const title = note.title.trim() || 'Untitled'
              const snippet = note.content.trim().slice(0, 60)
              return (
                <div
                  key={note.id}
                  onMouseEnter={() => setHighlight(idx)}
                  onClick={() => onPick(note.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '6px 8px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    background: selected ? 'rgba(255,255,255,0.08)' : 'transparent'
                  }}
                >
                  <div
                    style={{
                      width: '22px',
                      height: '22px',
                      flexShrink: 0,
                      borderRadius: '6px',
                      background: 'rgba(255,255,255,0.06)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Icon size={12} stroke={2} style={{ color: 'rgba(255,255,255,0.85)' }} />
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div
                      style={{
                        color: '#fff',
                        fontSize: '12px',
                        fontWeight: 600,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                    >
                      {title}
                    </div>
                    {snippet && (
                      <div
                        style={{
                          color: 'rgba(255,255,255,0.4)',
                          fontSize: '10px',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                      >
                        {snippet}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {query.trim() && results.length === 0 && (
          <div
            style={{
              padding: '12px',
              color: 'rgba(255,255,255,0.4)',
              fontSize: '11px',
              textAlign: 'center'
            }}
          >
            No matches.
          </div>
        )}
      </div>
    </div>
  )
}
