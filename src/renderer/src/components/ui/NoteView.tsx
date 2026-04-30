import React from 'react'
import {
  IconDotsVertical,
  IconSearch,
  IconArrowsSort,
  IconPlus,
  IconClipboardText,
  IconHome,
  IconBook,
  IconBell,
  IconSoup,
  IconTarget
} from '@tabler/icons-react'

interface NoteCardProps {
  icon: React.ElementType
  title: string
  preview: string
  isActive?: boolean
}

const NoteCard: React.FC<NoteCardProps> = ({ icon: Icon, title, preview, isActive }) => (
  <div
    style={{
      background: isActive
        ? 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.03) 100%)'
        : 'rgba(255,255,255,0.03)',
      border: isActive ? '1px solid rgba(255,255,255,0.15)' : '1px solid rgba(255,255,255,0.08)',
      borderRadius: '16px',
      padding: '12px',
      display: 'flex',
      flexDirection: 'column',
      gap: '6px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      boxShadow: isActive ? '0 8px 24px rgba(0,0,0,0.2)' : 'none'
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div
          style={{
            background: isActive ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.05)',
            padding: '5px',
            borderRadius: '7px'
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
            textOverflow: 'ellipsis',
            maxWidth: '160px'
          }}
        >
          {title}
        </div>
      </div>
      <IconDotsVertical size={14} stroke={2} style={{ color: 'rgba(255,255,255,0.4)' }} />
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
  </div>
)

export const NoteView: React.FC = () => (
  <div
    style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      padding: '0px 0px',
      height: '100%',
      boxSizing: 'border-box'
    }}
  >
    <div
      style={{
        flex: 1,
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gridAutoRows: 'max-content',
        gap: '6px',
        overflowY: 'auto'
      }}
    >
      <NoteCard
        icon={IconClipboardText}
        isActive={true}
        title="Meeting Notes - Q4 Planning"
        preview="Discuss budget allocation for new projects. Review team performance metrics. Schedule..."
      />
      <NoteCard
        icon={IconHome}
        title="Weekend Project Ideas"
        preview="Build a small herb garden on the balcony. Organize photo albums from summer trip..."
      />
      <NoteCard
        icon={IconBook}
        title="Book Recommendations"
        preview="The Design of Everyday Things - Don Norman. Atomic Habits - James Clear. Syste..."
      />
      <NoteCard
        icon={IconBell}
        title="Quick Reminders"
        preview="Explore potential collaborations with eco-conscious brands. Prepare for the upcomin..."
      />
      <NoteCard
        icon={IconSoup}
        title="Recipe - Thai Curry"
        preview="Explore potential collaborations with eco-conscious brands. Prepare for the upcomin..."
      />
      <NoteCard
        icon={IconTarget}
        title="Learning Goals"
        preview="Explore potential collaborations with eco-conscious brands. Prepare for the upcomin..."
      />
    </div>

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
      <div
        style={{
          padding: '5px 8px',
          cursor: 'pointer',
          borderRadius: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'rgba(255,255,255,0.6)'
        }}
      >
        <IconSearch size={15} stroke={2} />
      </div>
      <div
        style={{
          padding: '5px 8px',
          cursor: 'pointer',
          borderRadius: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'rgba(255,255,255,0.6)'
        }}
      >
        <IconArrowsSort size={15} stroke={2} />
      </div>
      <div
        style={{
          marginLeft: '4px',
          padding: '5px 8px',
          cursor: 'pointer',
          background: 'rgba(255,255,255,0.08)',
          borderRadius: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid rgba(255,255,255,0.1)'
        }}
      >
        <IconPlus size={15} stroke={2.5} style={{ color: '#fff' }} />
      </div>
    </div>
  </div>
)
