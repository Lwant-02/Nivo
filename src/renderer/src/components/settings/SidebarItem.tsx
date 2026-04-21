import type { LucideIcon } from 'lucide-react'
import { Pill } from './Pill'

interface SidebarItemProps {
  icon: LucideIcon
  label: string
  color: string
  active: boolean
  soon?: boolean
  onClick: () => void
}

export function SidebarItem({ icon: Icon, label, color, active, soon, onClick }: SidebarItemProps) {
  return (
    <button
      onClick={onClick}
      className="w-full cursor-pointer transition-all duration-150"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        paddingLeft: 10,
        paddingRight: 10,
        paddingTop: 7,
        paddingBottom: 7,
        marginBottom: 7,
        borderRadius: 10,
        background: active
          ? 'linear-gradient(180deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.06) 100%)'
          : 'transparent',
        boxShadow: active ? 'inset 0 0 0 1px rgba(255,255,255,0.07)' : 'none',
        color: active ? '#fff' : 'rgba(255,255,255,0.6)'
      }}
      onMouseEnter={(e) => {
        if (!active) {
          e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
          e.currentTarget.style.color = 'rgba(255,255,255,0.85)'
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.currentTarget.style.background = 'transparent'
          e.currentTarget.style.color = 'rgba(255,255,255,0.6)'
        }
      }}
    >
      <span
        className="shrink-0 flex items-center justify-center"
        style={{
          width: 24,
          height: 24,
          borderRadius: 7,
          background: color,
          boxShadow: '0 1px 2px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.15)'
        }}
      >
        <Icon size={13} color="#fff" strokeWidth={2.2} />
      </span>
      <span
        className="flex-1 min-w-0 truncate text-left"
        style={{
          fontSize: 13,
          fontWeight: 500,
          letterSpacing: -0.1
        }}
      >
        {label}
      </span>
      {soon && (
        <Pill variant="soft" style={{ paddingLeft: 7, paddingRight: 7, fontSize: 10 }}>
          Soon
        </Pill>
      )}
    </button>
  )
}
