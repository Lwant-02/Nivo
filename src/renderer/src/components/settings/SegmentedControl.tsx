import type { LucideIcon } from 'lucide-react'

export interface SegmentOption<T extends string> {
  id: T
  label: string
  Icon: LucideIcon
}

interface SegmentedControlProps<T extends string> {
  value: T
  onChange: (id: T) => void
  options: SegmentOption<T>[]
  accent?: string
}

export function SegmentedControl<T extends string>({
  value,
  onChange,
  options,
  accent = '#32D74B'
}: SegmentedControlProps<T>) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))`,
        gap: 8,
        padding: 8,
        background: 'rgba(0,0,0,0.22)',
        borderRadius: 14,
        border: '1px solid rgba(255,255,255,0.05)'
      }}
    >
      {options.map(({ id, label, Icon }) => {
        const active = value === id
        return (
          <button
            key={id}
            onClick={() => onChange(id)}
            className="cursor-pointer transition-all duration-150"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              paddingTop: 12,
              paddingBottom: 12,
              paddingLeft: 8,
              paddingRight: 8,
              borderRadius: 10,
              background: active
                ? 'linear-gradient(180deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.06) 100%)'
                : 'transparent',
              border: active
                ? `1px solid ${accent}80`
                : '1px solid transparent',
              boxShadow: active
                ? `0 0 0 2px ${accent}1A, 0 6px 14px rgba(0,0,0,0.25)`
                : 'none',
              color: active ? '#fff' : 'rgba(255,255,255,0.45)'
            }}
          >
            <Icon size={22} strokeWidth={1.6} />
            <span
              style={{
                fontSize: 11,
                fontWeight: active ? 600 : 500,
                letterSpacing: -0.1,
                color: active ? '#fff' : 'rgba(255,255,255,0.45)',
                textAlign: 'center',
                lineHeight: 1.15
              }}
            >
              {label}
            </span>
          </button>
        )
      })}
    </div>
  )
}
