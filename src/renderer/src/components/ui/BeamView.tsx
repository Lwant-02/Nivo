import { useEffect, useRef, useState } from 'react'
import {
  IconDeviceDesktop,
  IconDotsVertical,
  IconFile,
  IconLink,
  IconPlus,
  IconTrash
} from '@tabler/icons-react'
import { useBeam } from '../../hooks/useBeam'
import { BeamAddModal } from './BeamAddModal'
import { DotLottieReact } from '@lottiefiles/dotlottie-react'

const KIND_ICON: Record<BeamKind, React.ElementType> = {
  app: IconDeviceDesktop,
  url: IconLink,
  file: IconFile
}

export const BeamView: React.FC = () => {
  const { tiles, createTile, deleteTile, launchTile } = useBeam()
  const [addOpen, setAddOpen] = useState(false)

  const handleAdd = async (input: BeamTileInput): Promise<void> => {
    await createTile(input)
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
      {tiles.length === 0 ? (
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
              Nothing in Beam
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
              Tap the plus button to add an app, URL, or file.
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
          {tiles.map((tile) => (
            <BeamCard
              key={tile.id}
              tile={tile}
              onLaunch={() => launchTile(tile.id)}
              onDelete={() => deleteTile(tile.id)}
            />
          ))}
        </div>
      )}

      {addOpen && <BeamAddModal onAdd={handleAdd} onClose={() => setAddOpen(false)} />}

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
          onClick={() => setAddOpen(true)}
          icon={<IconPlus size={15} stroke={2.5} />}
          title="Add"
        />
      </div>
    </div>
  )
}

interface BeamCardProps {
  tile: BeamTile
  onLaunch: () => void
  onDelete: () => void
}

const BeamCard: React.FC<BeamCardProps> = ({ tile, onLaunch, onDelete }) => {
  const [menuOpen, setMenuOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const KindIcon = KIND_ICON[tile.kind]

  useEffect(() => {
    if (!menuOpen) return
    const onDocClick = (e: MouseEvent): void => {
      if (!containerRef.current) return
      if (!containerRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [menuOpen])

  return (
    <div
      ref={containerRef}
      onClick={onLaunch}
      style={{
        position: 'relative',
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.25)',
        borderRadius: '16px',
        padding: '12px',
        minHeight: '80px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.20)'
      }}
    >
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          background: 'rgba(255,255,255,0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          overflow: 'hidden'
        }}
      >
        <TileIcon fallback={KindIcon} />
      </div>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div
          style={{
            color: '#fff',
            fontSize: 12,
            fontWeight: 600,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}
        >
          {tile.label}
        </div>
        <div
          style={{
            color: 'rgba(255,255,255,0.4)',
            fontSize: 10,
            fontWeight: 500,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}
        >
          {tile.kind === 'app' ? 'App' : tile.kind === 'url' ? tile.target : tile.target}
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
          justifyContent: 'center',
          flexShrink: 0
        }}
      >
        <IconDotsVertical size={14} stroke={2} style={{ color: 'rgba(255,255,255,0.4)' }} />
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
            Remove
          </div>
        </div>
      )}
    </div>
  )
}

const TileIcon: React.FC<{ fallback: React.ElementType }> = ({ fallback: Fallback }) => {
  return <Fallback size={16} stroke={2} style={{ color: 'rgba(255,255,255,0.85)' }} />
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
