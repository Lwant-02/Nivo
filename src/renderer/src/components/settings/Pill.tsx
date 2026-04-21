interface PillProps {
  children: React.ReactNode
  variant?: 'default' | 'soft' | 'accent'
  style?: React.CSSProperties
}

export function Pill({ children, variant = 'default', style }: PillProps) {
  const palette = {
    default: {
      background: 'rgba(255,255,255,0.07)',
      border: '1px solid rgba(255,255,255,0.09)',
      color: 'rgba(255,255,255,0.7)'
    },
    soft: {
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.06)',
      color: 'rgba(255,255,255,0.45)'
    },
    accent: {
      background: 'rgba(50, 215, 75, 0.12)',
      border: '1px solid rgba(50, 215, 75, 0.35)',
      color: 'rgba(110, 240, 130, 0.95)'
    }
  }[variant]

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        paddingLeft: 10,
        paddingRight: 10,
        paddingTop: 3,
        paddingBottom: 3,
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: 0.2,
        borderRadius: 999,
        ...palette,
        ...style
      }}
    >
      {children}
    </span>
  )
}
