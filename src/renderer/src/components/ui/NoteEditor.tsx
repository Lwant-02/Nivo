import { useEffect, useRef, useState } from 'react'
import { ICON_OPTIONS, ICONS } from './NoteView'
import {
  IconArrowLeft,
  IconClipboardText,
  IconTrash,
  IconCopy,
  IconCheck
} from '@tabler/icons-react'

interface NoteEditorProps {
  note: Note
  onChange: (patch: NoteInput) => void
  onClose: () => void
  onDelete: () => void
}

export const NoteEditor: React.FC<NoteEditorProps> = ({ note, onChange, onClose, onDelete }) => {
  const [title, setTitle] = useState(note.title)
  const [content, setContent] = useState(note.content)
  const [icon, setIcon] = useState<NoteIconId>(note.icon)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  // The notch window is non-focusable by default so it can't steal focus
  // from the user's app. While the editor is mounted, allow focus so
  // the title/content inputs receive keyboard events.
  useEffect(() => {
    window.api.setNotchEditing(true)
    return () => {
      window.api.setNotchEditing(false)
    }
  }, [])

  // Reflect external swaps (different note opened) into local state.
  const lastIdRef = useRef(note.id)
  useEffect(() => {
    if (note.id !== lastIdRef.current) {
      lastIdRef.current = note.id
      setTitle(note.title)
      setContent(note.content)
      setIcon(note.icon)
      setCopied(false)
    }
  }, [note.id, note.title, note.content, note.icon])

  // Mirror live state into refs so the unmount flush sees the latest values
  // without retriggering the cleanup on every keystroke.
  const titleRef = useRef(title)
  const contentRef = useRef(content)
  const noteRef = useRef(note)
  const onChangeRef = useRef(onChange)
  titleRef.current = title
  contentRef.current = content
  noteRef.current = note
  onChangeRef.current = onChange

  // Debounced autosave for title/content.
  useEffect(() => {
    if (title === note.title && content === note.content) return
    const id = window.setTimeout(() => {
      onChange({ title, content })
    }, 350)
    return () => window.clearTimeout(id)
  }, [title, content, note.title, note.content, onChange])

  // Flush any pending edits when the editor unmounts (e.g. user closes within
  // the debounce window) so we don't drop the last keystrokes.
  useEffect(() => {
    return () => {
      const t = titleRef.current
      const c = contentRef.current
      const n = noteRef.current
      if (t !== n.title || c !== n.content) {
        onChangeRef.current({ title: t, content: c })
      }
    }
  }, [])

  const handleCopy = async () => {
    try {
      const fullText = title ? `${title}\n\n${content}` : content
      await navigator.clipboard.writeText(fullText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const Icon = ICONS[icon] ?? IconClipboardText

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        height: '100%',
        boxSizing: 'border-box'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', position: 'relative' }}>
        <div
          onClick={onClose}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.12)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
          style={{
            padding: '6px',
            borderRadius: '8px',
            background: 'rgba(255,255,255,0.05)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'rgba(255,255,255,0.7)',
            transition: 'all 0.2s ease'
          }}
        >
          <IconArrowLeft size={14} stroke={2} />
        </div>
        <div
          onClick={() => setPickerOpen((v) => !v)}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
          style={{
            padding: '6px',
            borderRadius: '8px',
            background: 'rgba(255,255,255,0.08)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            transition: 'all 0.2s ease'
          }}
        >
          <Icon size={14} stroke={2} />
        </div>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: '#fff',
            fontSize: '14px',
            fontWeight: 700,
            padding: '4px 0'
          }}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div
            onClick={handleCopy}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = copied
                ? 'rgba(52,211,153,0.2)'
                : 'rgba(255,255,255,0.12)')
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = copied
                ? 'rgba(52,211,153,0.15)'
                : 'rgba(255,255,255,0.05)')
            }
            style={{
              padding: '6px',
              borderRadius: '8px',
              background: copied ? 'rgba(52,211,153,0.15)' : 'rgba(255,255,255,0.05)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: copied ? '#34d399' : 'rgba(255,255,255,0.6)',
              transition: 'all 0.2s ease'
            }}
            title="Copy to clipboard"
          >
            {copied ? <IconCheck size={14} stroke={2} /> : <IconCopy size={14} stroke={2} />}
          </div>

          <div
            onClick={onDelete}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,107,107,0.2)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,107,107,0.1)')}
            style={{
              padding: '6px',
              borderRadius: '8px',
              background: 'rgba(255,107,107,0.1)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ff6b6b',
              transition: 'all 0.2s ease'
            }}
            title="Delete note"
          >
            <IconTrash size={14} stroke={2} />
          </div>
        </div>

        {pickerOpen && (
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'absolute',
              top: '36px',
              left: '36px',
              background: 'rgba(20,20,20,0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              padding: '6px',
              display: 'grid',
              gridTemplateColumns: 'repeat(6, 1fr)',
              gap: '4px',
              zIndex: 10,
              boxShadow: '0 8px 24px rgba(0,0,0,0.4)'
            }}
          >
            {ICON_OPTIONS.map((id) => {
              const OptIcon = ICONS[id]
              const selected = id === icon
              return (
                <div
                  key={id}
                  onClick={() => {
                    setIcon(id)
                    setPickerOpen(false)
                    onChange({ icon: id })
                  }}
                  style={{
                    width: '24px',
                    height: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '6px',
                    background: selected ? 'rgba(255,255,255,0.15)' : 'transparent',
                    cursor: 'pointer',
                    color: selected ? '#fff' : 'rgba(255,255,255,0.6)'
                  }}
                >
                  <OptIcon size={14} stroke={2} />
                </div>
              )
            })}
          </div>
        )}
      </div>

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Start writing…"
        style={{
          flex: 1,
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '14px',
          color: 'rgba(255,255,255,0.85)',
          fontSize: '12px',
          lineHeight: 1.5,
          padding: '10px 12px',
          outline: 'none',
          resize: 'none',
          fontFamily: 'inherit'
        }}
      />
    </div>
  )
}
