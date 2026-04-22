interface SettingCardProps {
  children: React.ReactNode
  style?: React.CSSProperties
}

export function SettingCard({ children, style }: SettingCardProps) {
  return (
    <div
      style={{
        background:
          'linear-gradient(180deg, rgba(255,255,255,0.055) 0%, rgba(255,255,255,0.025) 100%)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 16,
        overflow: 'hidden',
        boxShadow: '0 1px 0 rgba(255,255,255,0.04) inset, 0 8px 24px rgba(0,0,0,0.18)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        ...style
      }}
    >
      {children}
    </div>
  )
}
