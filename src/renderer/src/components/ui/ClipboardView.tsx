import React, { useEffect, useRef, useState } from 'react'
import {
  IconClipboardCopy,
  IconCopy,
  IconDotsVertical,
  IconPin,
  IconPinFilled,
  IconSearch,
  IconTrash
} from '@tabler/icons-react'
import { useClipboard } from '../../hooks/useClipboard'
import { ClipboardSearchBar } from './ClipboardSearchBar'
import { DotLottieReact } from '@lottiefiles/dotlottie-react'

const MAX_PREVIEW_LINES = 2
const MAX_PREVIEW_CHARS = 140

function formatRelative(timestamp: number): string {
  const diffMs = Date.now() - timestamp
  const sec = Math.floor(diffMs / 1000)
  if (sec < 60) return 'just now'
  const min = Math.floor(sec / 60)
  if (min < 60) return `${min}m ago`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr}h ago`
  const day = Math.floor(hr / 24)
  if (day < 7) return `${day}d ago`
  return new Date(timestamp).toLocaleDateString()
}

function buildPreview(content: string): string {
  const trimmed = content.trim()
  return trimmed.length > MAX_PREVIEW_CHARS ? trimmed.slice(0, MAX_PREVIEW_CHARS) + '…' : trimmed
}

export const ClipboardView: React.FC = () => {
  const { items, copyItem, togglePin, deleteItem, clearAll } = useClipboard()
  const [searchOpen, setSearchOpen] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  useEffect(() => {
    if (!copiedId) return
    const timer = setTimeout(() => setCopiedId(null), 1200)
    return () => clearTimeout(timer)
  }, [copiedId])

  const handleCopy = async (id: string): Promise<void> => {
    await copyItem(id)
    setCopiedId(id)
  }

  return (
    <div
      style={{
        position: 'relative',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        height: '100%',
        boxSizing: 'border-box'
      }}
    >
      {items.length === 0 ? (
        <div className="h-fit flex justify-center items-center gap-0 flex-col" style={{ flex: 1 }}>
          <div className="relative size-[95px] shrink-0">
            <DotLottieReact
              src="https://lottie.host/35d8a45e-69c7-47f2-b712-34a7d743d088/quPIsQA9QD.lottie"
              loop
              autoplay
              style={{ width: '100%', height: '100%' }}
            />
          </div>
          <div className="flex flex-col items-center">
            <h3
              style={{
                color: '#fff',
                fontSize: '13px',
                fontWeight: 700,
                margin: 0,
                opacity: 0.9
              }}
            >
              No Clipboard History
            </h3>
            <p
              style={{
                color: 'rgba(255,255,255,0.4)',
                fontSize: '11px',
                fontWeight: 600,
                marginBottom: 13,
                lineHeight: 1.4
              }}
            >
              Copy something to start your history.
            </p>
          </div>
        </div>
      ) : (
        <div
          style={{
            flex: 1,
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gridAutoRows: 'max-content',
            gap: '6px',
            overflowY: 'auto'
          }}
        >
          {items.map((item) => (
            <ClipboardCard
              key={item.id}
              item={item}
              isCopied={copiedId === item.id}
              onCopy={() => handleCopy(item.id)}
              onTogglePin={() => togglePin(item.id)}
              onDelete={() => deleteItem(item.id)}
            />
          ))}
        </div>
      )}

      {searchOpen && (
        <ClipboardSearchBar
          items={items}
          onPick={(id) => {
            setSearchOpen(false)
            handleCopy(id)
          }}
          onClose={() => setSearchOpen(false)}
        />
      )}

      <div
        style={{
          alignSelf: 'center',
          background: 'rgba(255,255,255,0.04)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '24px',
          padding: '3px 6px',
          display: 'flex',
          alignItems: 'center',
          gap: '2px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
        }}
      >
        <ActionButton
          onClick={() => setSearchOpen((v) => !v)}
          icon={<IconSearch size={15} stroke={2} />}
          title="Search"
        />
        {items.length > 0 && (
          <ActionButton
            onClick={clearAll}
            icon={<IconTrash size={15} stroke={2} />}
            title="Clear unpinned"
          />
        )}
      </div>
    </div>
  )
}

interface ClipboardCardProps {
  item: ClipboardItem
  isCopied: boolean
  onCopy: () => void
  onTogglePin: () => void
  onDelete: () => void
}

const ClipboardCard: React.FC<ClipboardCardProps> = ({
  item,
  isCopied,
  onCopy,
  onTogglePin,
  onDelete
}) => {
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

  const preview = buildPreview(item.content) || 'Empty entry'

  return (
    <div
      ref={containerRef}
      onClick={onCopy}
      style={{
        position: 'relative',
        background: item.pinned
          ? 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.03) 100%)'
          : 'rgba(255,255,255,0.03)',
        border: item.pinned
          ? '1px solid rgba(255,255,255,0.15)'
          : '1px solid rgba(255,255,255,0.08)',
        borderRadius: '16px',
        padding: '12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        boxShadow: item.pinned ? '0 8px 24px rgba(0,0,0,0.2)' : 'none'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
          <div
            style={{
              background: item.pinned ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.05)',
              padding: '5px',
              borderRadius: '7px',
              flexShrink: 0
            }}
          >
            {item.pinned ? (
              <IconPinFilled
                size={14}
                stroke={2}
                style={{ color: '#fff' }}
              />
            ) : (
              <IconCopy
                size={14}
                stroke={2}
                style={{ color: 'rgba(255,255,255,0.8)' }}
              />
            )}
          </div>
          <div
            style={{
              color: 'rgba(255,255,255,0.55)',
              fontSize: '10px',
              fontWeight: 600,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            {isCopied ? 'Copied!' : formatRelative(item.createdAt)}
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
          color: item.pinned ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.55)',
          fontSize: '11px',
          lineHeight: 1.4,
          whiteSpace: 'pre-wrap',
          display: '-webkit-box',
          WebkitLineClamp: MAX_PREVIEW_LINES,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          wordBreak: 'break-word'
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
            boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
            minWidth: '120px'
          }}
        >
          <MenuItem
            icon={
              item.pinned ? (
                <IconPinFilled size={12} stroke={2} />
              ) : (
                <IconPin size={12} stroke={2} />
              )
            }
            label={item.pinned ? 'Unpin' : 'Pin'}
            onClick={() => {
              setMenuOpen(false)
              onTogglePin()
            }}
          />
          <MenuItem
            icon={<IconClipboardCopy size={12} stroke={2} />}
            label="Copy"
            onClick={() => {
              setMenuOpen(false)
              onCopy()
            }}
          />
          <MenuItem
            icon={<IconTrash size={12} stroke={2} />}
            label="Delete"
            onClick={() => {
              setMenuOpen(false)
              onDelete()
            }}
            danger
          />
        </div>
      )}
    </div>
  )
}

const MenuItem: React.FC<{
  icon: React.ReactNode
  label: string
  onClick: () => void
  danger?: boolean
}> = ({ icon, label, onClick, danger }) => {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '6px 10px',
        borderRadius: '6px',
        fontSize: '11px',
        fontWeight: 600,
        color: danger ? '#ff6b6b' : hovered ? '#fff' : 'rgba(255,255,255,0.75)',
        background: hovered ? 'rgba(255,255,255,0.06)' : 'transparent',
        cursor: 'pointer'
      }}
    >
      {icon}
      {label}
    </div>
  )
}

const ActionButton: React.FC<{
  onClick: () => void
  icon: React.ReactNode
  title?: string
}> = ({ onClick, icon, title }) => {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      title={title}
      style={{
        padding: '5px 8px',
        cursor: 'pointer',
        borderRadius: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: hovered ? 'rgba(255,255,255,0.08)' : 'transparent',
        color: hovered ? '#fff' : 'rgba(255,255,255,0.6)',
        transition: 'all 0.2s ease'
      }}
    >
      {icon}
    </div>
  )
}
