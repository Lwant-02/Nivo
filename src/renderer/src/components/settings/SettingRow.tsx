import { Info as InfoIcon } from 'lucide-react'
import { Toggle } from '../ui/Toggle'

interface SettingRowProps {
  label: string
  description?: string
  icon?: React.ReactNode
  enabled?: boolean
  onToggle?: () => void
  isFirst?: boolean
  info?: boolean
  right?: React.ReactNode
}

export function SettingRow({
  label,
  description,
  icon,
  enabled,
  onToggle,
  isFirst = false,
  info = false,
  right
}: SettingRowProps) {
  const clickable = Boolean(onToggle)

  return (
    <div
      onClick={onToggle}
      className={`relative flex items-center justify-between transition-colors ${
        clickable ? 'cursor-pointer hover:bg-white/[0.035]' : ''
      }`}
      style={{
        paddingLeft: 18,
        paddingRight: 18,
        paddingTop: 14,
        paddingBottom: 14,
        minHeight: 52
      }}
    >
      {!isFirst && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 18,
            right: 0,
            height: 1,
            background: 'rgba(255,255,255,0.06)'
          }}
        />
      )}

      <div
        className="flex items-center flex-1 min-w-0"
        style={{ gap: 12, paddingRight: 16 }}
      >
        {icon && (
          <div
            className="flex items-center justify-center shrink-0"
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              background: 'rgba(255,255,255,0.055)',
              color: 'rgba(255,255,255,0.65)'
            }}
          >
            {icon}
          </div>
        )}
        <div className="flex flex-col min-w-0" style={{ gap: 2 }}>
          <div className="flex items-center" style={{ gap: 6 }}>
            <span
              style={{
                fontSize: 13.5,
                fontWeight: 500,
                color: 'rgba(255,255,255,0.95)',
                letterSpacing: -0.1,
                lineHeight: 1.2
              }}
            >
              {label}
            </span>
            {info && <InfoIcon size={13} style={{ color: 'rgba(255,255,255,0.3)' }} />}
          </div>
          {description && (
            <span
              style={{
                fontSize: 11.5,
                color: 'rgba(255,255,255,0.42)',
                lineHeight: 1.3
              }}
            >
              {description}
            </span>
          )}
        </div>
      </div>

      <div className="shrink-0 flex items-center" style={{ gap: 10 }}>
        {right}
        {enabled !== undefined && onToggle && <Toggle enabled={enabled} onChange={onToggle} />}
      </div>
    </div>
  )
}
