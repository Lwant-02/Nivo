interface ToggleProps {
  enabled: boolean
  onChange: () => void
}

const TRACK_WIDTH = 42
const TRACK_HEIGHT = 26
const KNOB_SIZE = 20
const KNOB_INSET = 3
const TRAVEL = TRACK_WIDTH - KNOB_SIZE - KNOB_INSET * 2

export function Toggle({ enabled, onChange }: ToggleProps) {
  return (
    <button
      role="switch"
      aria-checked={enabled}
      onClick={(e) => {
        e.stopPropagation()
        onChange()
      }}
      className="cursor-pointer shrink-0"
      style={{
        position: 'relative',
        width: TRACK_WIDTH,
        height: TRACK_HEIGHT,
        borderRadius: 999,
        border: 'none',
        background: enabled
          ? 'linear-gradient(180deg, #3AE15A 0%, #2CC449 100%)'
          : 'rgba(255,255,255,0.1)',
        boxShadow: enabled
          ? 'inset 0 1px 0 rgba(255,255,255,0.25), 0 2px 6px rgba(50,215,75,0.28)'
          : 'inset 0 0 0 1px rgba(255,255,255,0.08), inset 0 1px 1.5px rgba(0,0,0,0.25)',
        transition: 'background 200ms ease, box-shadow 200ms ease',
        padding: 0,
        outline: 'none'
      }}
    >
      <span
        style={{
          position: 'absolute',
          top: '50%',
          left: KNOB_INSET,
          width: KNOB_SIZE,
          height: KNOB_SIZE,
          borderRadius: '50%',
          background: '#ffffff',
          boxShadow: '0 2px 4px rgba(0,0,0,0.28), 0 0 0 0.5px rgba(0,0,0,0.08)',
          transform: `translate(${enabled ? TRAVEL : 0}px, -50%)`,
          transition: 'transform 220ms cubic-bezier(0.22, 1, 0.36, 1)'
        }}
      />
    </button>
  )
}
