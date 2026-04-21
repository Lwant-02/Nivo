import { Check } from 'lucide-react'

export interface ThemeOption<T extends string> {
  id: T
  label: string
  gradient: string
  ring: string
}

interface ThemePickerProps<T extends string> {
  value: T
  onChange: (id: T) => void
  options: ThemeOption<T>[]
}

export function ThemePicker<T extends string>({ value, onChange, options }: ThemePickerProps<T>) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
        gap: 8,
        padding: 8,
        background: 'rgba(0,0,0,0.22)',
        borderRadius: 14,
        border: '1px solid rgba(255,255,255,0.05)'
      }}
    >
      {options.map(({ id, label, gradient, ring }) => {
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
              paddingLeft: 6,
              paddingRight: 6,
              borderRadius: 10,
              background: active
                ? 'linear-gradient(180deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.06) 100%)'
                : 'transparent',
              border: active ? `1px solid ${ring}80` : '1px solid transparent',
              boxShadow: active
                ? `0 0 0 2px ${ring}1A, 0 6px 14px rgba(0,0,0,0.25)`
                : 'none',
              color: active ? '#fff' : 'rgba(255,255,255,0.55)'
            }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: gradient,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: active
                  ? `0 0 0 2px rgba(255,255,255,0.95), 0 0 0 4px ${ring}`
                  : 'inset 0 0 0 1px rgba(255,255,255,0.08), 0 2px 6px rgba(0,0,0,0.35)'
              }}
            >
              {active && <Check size={14} strokeWidth={3} color="#fff" />}
            </div>
            <span
              style={{
                fontSize: 11,
                fontWeight: active ? 600 : 500,
                letterSpacing: -0.1,
                color: active ? '#fff' : 'rgba(255,255,255,0.55)',
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
