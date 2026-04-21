interface SectionLabelProps {
  text: string
  hint?: string
}

export function SectionLabel({ text, hint }: SectionLabelProps) {
  return (
    <div
      className="flex items-baseline justify-between"
      style={{
        paddingLeft: 6,
        paddingRight: 6,
        marginTop: 22,
        marginBottom: 10
      }}
    >
      <p
        style={{
          fontSize: 11,
          fontWeight: 600,
          color: 'rgba(255,255,255,0.45)',
          textTransform: 'uppercase',
          letterSpacing: 1.4
        }}
      >
        {text}
      </p>
      {hint && (
        <p
          style={{
            fontSize: 11,
            color: 'rgba(255,255,255,0.3)',
            letterSpacing: 0.2
          }}
        >
          {hint}
        </p>
      )}
    </div>
  )
}
