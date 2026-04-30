import React from 'react'
import { Rewind, Play, Pause, FastForward } from 'lucide-react'
import { Thumbnail } from './Thumbnail'
import { formatTime } from '@renderer/util'
import MarqueeText from './MarqueeText'
import { SourceBadge } from './SourceBadge'

interface ExpandedMediaViewProps {
  title: string
  artist: string
  isPlaying: boolean
  duration: number
  position: number
  source: string
  displayArt: string | null
  settings: any
  onPlayPause: () => void
  onNext: () => void
  onPrev: () => void
  progressPct: number
  accentColor: string
}

export const ExpandedMediaView: React.FC<ExpandedMediaViewProps> = ({
  title,
  artist,
  isPlaying,
  duration,
  position,
  source,
  displayArt,
  settings,
  onPlayPause,
  onNext,
  onPrev,
  progressPct,
  accentColor
}) => {
  const [hovered, setHovered] = React.useState<number | null>(null)

  const buttonBaseStyle: React.CSSProperties = {
    width: '40px',
    height: '40px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    background: 'transparent',
    border: 'none',
    color: '#fff',
    padding: 0
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: 'rgba(255,255,255,0.05)',
        borderRadius: '30px',
        border: '1px solid rgba(255,255,255,0.08)',
        padding: '16px 18px',
        boxSizing: 'border-box'
      }}
    >
      {/* ── Track Info Card (White) ── */}
      <div
        style={{
          padding: 0,
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          flexShrink: 0
        }}
      >
        <div
          style={{
            width: '56px',
            height: '50px',
            borderRadius: '10px',
            overflow: 'hidden',
            flexShrink: 0,
            background: 'rgba(0,0,0,0.2)',
            position: 'relative'
          }}
        >
          <Thumbnail
            src={settings.showAlbumArt ? displayArt : null}
            alt={title}
            size="expanded"
            isPlaying={isPlaying}
            accentColor={accentColor}
          />
          <div style={{ position: 'absolute', bottom: '4px', right: '4px' }}>
            <SourceBadge source={source} size={14} />
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', fontWeight: '600' }}>
            <MarqueeText text={title || 'Not Playing'} />
          </div>
          <div style={{ fontSize: '13px', fontWeight: '500', color: 'rgba(255,255,255,0.8)' }}>
            <MarqueeText text={artist || '—'} />
          </div>
        </div>
      </div>

      {/* ── Integrated Progress Bar with strictly enforced gap ── */}
      <div
        style={{
          padding: '0 4px',
          display: 'flex',
          flexDirection: 'column',
          marginTop: '20px'
        }}
      >
        <div
          style={{
            height: '3px',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '1.5px',
            overflow: 'hidden',
            width: '100%'
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${progressPct}%`,
              background: accentColor || '#fff',
              borderRadius: '1.5px',
              transition: 'width 0.1s linear'
            }}
          />
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'between',
            marginTop: '4px',
            fontSize: '10px',
            color: 'rgba(255,255,255,0.4)',
            fontWeight: '600',
            width: '100%'
          }}
        >
          <span>{formatTime(position)}</span>
          <div style={{ flex: 1 }} />
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* ── Controls Row ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '16px',
          flex: 1,
          marginTop: '0px'
        }}
      >
        <button
          onClick={onPrev}
          onMouseEnter={() => setHovered(0)}
          onMouseLeave={() => setHovered(null)}
          style={{
            ...buttonBaseStyle,
            background: hovered === 0 ? 'rgba(255,255,255,0.1)' : 'transparent',
            transform: hovered === 0 ? 'scale(0.95)' : 'scale(1)'
          }}
        >
          <Rewind size={22} color="#fff" />
        </button>

        <button
          onClick={onPlayPause}
          onMouseEnter={() => setHovered(1)}
          onMouseLeave={() => setHovered(null)}
          style={{
            ...buttonBaseStyle,
            color: accentColor || '#fff',
            background: hovered === 1 ? 'rgba(255,255,255,0.2)' : 'transparent',
            transform: hovered === 1 ? 'scale(0.95)' : 'scale(1)'
          }}
        >
          {isPlaying ? (
            <Pause size={22} fill="currentColor" stroke="none" />
          ) : (
            <Play size={22} fill="currentColor" stroke="none" />
          )}
        </button>

        <button
          onClick={onNext}
          onMouseEnter={() => setHovered(2)}
          onMouseLeave={() => setHovered(null)}
          style={{
            ...buttonBaseStyle,
            background: hovered === 2 ? 'rgba(255,255,255,0.2)' : 'transparent',
            transform: hovered === 2 ? 'scale(0.95)' : 'scale(1)'
          }}
        >
          <FastForward size={22} color="#fff" />
        </button>
      </div>
    </div>
  )
}
