import React from 'react'

interface GlassTabProps {
  icon: React.ElementType
  label: string
  isActive: boolean
  onClick: () => void
}

export const GlassTab: React.FC<GlassTabProps> = ({ icon: Icon, label, isActive, onClick }) => (
  <div
    onClick={onClick}
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: isActive ? 'rgba(255,255,255,0.12)' : 'transparent',
      padding: isActive ? '6px 12px' : '6px',
      borderRadius: '7px',
      borderColor: isActive ? 'rgba(255,255,255,0.25)' : 'transparent',
      boxShadow: isActive ? 'inset 0 1px 0 rgba(255,255,255,0.20)' : 'none',
      color: isActive ? '#fff' : 'rgba(255,255,255,0.5)',
      fontSize: '10px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s cubic-bezier(0.25, 1, 0.5, 1)'
    }}
  >
    <span style={{ display: 'flex', alignItems: 'center', transition: 'all 0.3s' }}>
      <Icon size={16} stroke={isActive ? 2.5 : 2} />
    </span>
    <span
      style={{
        width: isActive ? `${label.length + 1.5}ch` : '0ch',
        opacity: isActive ? 1 : 0,
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        display: 'inline-block',
        textAlign: 'center',
        transition:
          'width 0.25s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.2s ease, margin-left 0.25s cubic-bezier(0.25, 1, 0.5, 1)'
      }}
    >
      {label}
    </span>
  </div>
)
