import { ChevronRight } from 'lucide-react'
import { Toggle } from '../ui/Toggle'

interface SettingRowProps {
  title: string
  description?: string
  enabled?: boolean
  onToggle?: () => void
  isFirst?: boolean
  showChevron?: boolean
  right?: React.ReactNode
}

export function SettingRow({
  title,
  description,
  enabled,
  onToggle,
  isFirst = false,
  showChevron = false,
  right
}: SettingRowProps) {
  return (
    <div
      onClick={onToggle}
      className={`relative flex items-center justify-between px-5 py-3.5 min-h-[56px] transition-colors
        ${onToggle ? 'cursor-pointer hover:bg-white/[0.04]' : ''}`}
    >
      {!isFirst && <div className="absolute top-0 left-5 right-0 h-px bg-white/[0.06]" />}
      <div className="flex flex-col gap-0.5 pr-4 flex-1 min-w-0">
        <span className="text-[14px] font-medium text-white leading-tight">{title}</span>
        {description && (
          <span className="text-[12px] text-white/40 leading-snug">{description}</span>
        )}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {right}
        {enabled !== undefined && onToggle && (
          <Toggle enabled={enabled} onChange={onToggle} />
        )}
        {showChevron && <ChevronRight size={15} className="text-white/25" />}
      </div>
    </div>
  )
}
