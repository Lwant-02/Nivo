import React, { useMemo, useState } from 'react'
import {
  IconSearch,
  IconArrowsSort,
  IconPlus,
  IconClipboardText,
  IconHome,
  IconBook,
  IconBell,
  IconSoup,
  IconTarget,
  IconNote,
  IconBulb,
  IconHeart,
  IconStar,
  IconBriefcase,
  IconFlag
} from '@tabler/icons-react'
import { useNotes } from '../../hooks/useNotes'
import { NoteCard } from './NoteCard'
import { NoteEditor } from './NoteEditor'
import { NoteSearchBar } from './NoteSearchBar'
import { DotLottieReact } from '@lottiefiles/dotlottie-react'

export const ICONS: Record<NoteIconId, React.ElementType> = {
  'clipboard-text': IconClipboardText,
  home: IconHome,
  book: IconBook,
  bell: IconBell,
  soup: IconSoup,
  target: IconTarget,
  note: IconNote,
  bulb: IconBulb,
  heart: IconHeart,
  star: IconStar,
  briefcase: IconBriefcase,
  flag: IconFlag
}

export const ICON_OPTIONS = Object.keys(ICONS) as NoteIconId[]

type SortMode = 'recent' | 'alphabetical'

export const NoteView: React.FC = () => {
  const { notes, createNote, updateNote, deleteNote } = useNotes()
  const [activeId, setActiveId] = useState<string | null>(null)
  const [searchOpen, setSearchOpen] = useState(false)
  const [sortMode, setSortMode] = useState<SortMode>('recent')

  const visibleNotes = useMemo(() => {
    if (sortMode === 'alphabetical') {
      return [...notes].sort((a, b) => (a.title || 'Untitled').localeCompare(b.title || 'Untitled'))
    }
    return notes
  }, [notes, sortMode])

  const activeNote = useMemo(
    () => (activeId ? (notes.find((n) => n.id === activeId) ?? null) : null),
    [notes, activeId]
  )

  const handleCreate = async (): Promise<void> => {
    const created = await createNote({ title: '', content: '', icon: 'clipboard-text' })
    if (created) setActiveId(created.id)
  }

  const handleEditorChange = (patch: NoteInput): void => {
    if (!activeNote) return
    updateNote(activeNote.id, patch)
  }

  const handleDelete = async (id: string): Promise<void> => {
    await deleteNote(id)
    if (activeId === id) setActiveId(null)
  }

  if (activeNote) {
    return (
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          boxSizing: 'border-box'
        }}
      >
        <NoteEditor
          note={activeNote}
          onChange={handleEditorChange}
          onClose={() => setActiveId(null)}
          onDelete={() => handleDelete(activeNote.id)}
        />
      </div>
    )
  }

  return (
    <div
      style={{
        position: 'relative',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        padding: '0px 0px',
        height: '100%',
        boxSizing: 'border-box'
      }}
    >
      {visibleNotes.length === 0 ? (
        <div className="h-fit flex justify-center items-center gap-0 flex-col">
          <div className="relative size-[95px] shrink-0 ">
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
                fontWeight: '700',
                margin: 0,
                opacity: 0.9
              }}
            >
              No Notes Found
            </h3>
            <p
              style={{
                color: 'rgba(255,255,255,0.4)',
                fontSize: '11px',
                fontWeight: '600',
                marginBottom: 13,
                lineHeight: '1.4'
              }}
            >
              Tab the plus button to create your first note.
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
          {visibleNotes.map((note, idx) => (
            <NoteCard
              key={note.id}
              note={note}
              isActive={sortMode === 'recent' && idx === 0}
              onOpen={() => setActiveId(note.id)}
              onDelete={() => handleDelete(note.id)}
            />
          ))}
        </div>
      )}

      {searchOpen && (
        <NoteSearchBar
          notes={notes}
          onPick={(id) => {
            setSearchOpen(false)
            setActiveId(id)
          }}
          onClose={() => setSearchOpen(false)}
        />
      )}

      {/* Floating Action Bar */}
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
        />
        <ActionButton
          onClick={() => setSortMode((m) => (m === 'recent' ? 'alphabetical' : 'recent'))}
          icon={<IconArrowsSort size={15} stroke={2} />}
          title={sortMode === 'recent' ? 'Sorted by recent' : 'Sorted A-Z'}
        />
        <ActionButton onClick={handleCreate} icon={<IconPlus size={15} stroke={2.5} />} />
      </div>
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
