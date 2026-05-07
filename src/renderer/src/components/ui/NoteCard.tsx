import { IconClipboardText, IconDotsVertical, IconTrash } from '@tabler/icons-react'
import { ICONS } from './NoteView'
import { useEffect, useRef, useState } from 'react'

interface NoteCardProps {
  note: Note
  isActive?: boolean
  onOpen: () => void
  onDelete: () => void
}

export const NoteCard: React.FC<NoteCardProps> = ({ note, isActive, onOpen, onDelete }) => {
  const Icon = ICONS[note.icon] ?? IconClipboardText
  const [menuOpen, setMenuOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!menuOpen) return
    const onDocClick = (e: MouseEvent): void => {
      if (!containerRef.current) return
      if (!containerRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [menuOpen])

  const title = note.title.trim() || 'Untitled'
  const preview = note.content.trim() || 'No additional text'

  return (
    <div
      ref={containerRef}
      onClick={onOpen}
      style={{
        position: 'relative',
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.25)',
        borderRadius: '16px',
        padding: '12px',
        minHeight: '80px',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.20)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
          <div
            style={{
              background: isActive ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.05)',
              padding: '5px',
              borderRadius: '7px',
              flexShrink: 0
            }}
          >
            <Icon
              size={14}
              stroke={2}
              style={{ color: isActive ? '#fff' : 'rgba(255,255,255,0.8)' }}
            />
          </div>
          <div
            style={{
              color: '#fff',
              fontSize: '13px',
              fontWeight: '600',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            {title}
          </div>
        </div>
        <div
          onClick={(e) => {
            e.stopPropagation()
            setMenuOpen((v) => !v)
          }}
          style={{
            padding: '2px',
            cursor: 'pointer',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <IconDotsVertical size={14} stroke={2} style={{ color: 'rgba(255,255,255,0.4)' }} />
        </div>
      </div>
      <div
        style={{
          color: isActive ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.35)',
          fontSize: '11px',
          lineHeight: '1.4',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}
      >
        {preview}
      </div>

      {menuOpen && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'absolute',
            top: '34px',
            right: '8px',
            background: 'rgba(20,20,20,0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '10px',
            padding: '4px',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 10,
            boxShadow: '0 8px 24px rgba(0,0,0,0.4)'
          }}
        >
          <div
            onClick={(e) => {
              e.stopPropagation()
              setMenuOpen(false)
              onDelete()
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 10px',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: 600,
              color: '#ff6b6b',
              cursor: 'pointer'
            }}
          >
            <IconTrash size={12} stroke={2} />
            Delete
          </div>
        </div>
      )}
    </div>
  )
}
