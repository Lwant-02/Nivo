interface ToggleProps {
  enabled: boolean
  onChange: () => void
}

export function Toggle({ enabled, onChange }: ToggleProps) {
  return (
    <button
      role="switch"
      aria-checked={enabled}
      onClick={(e) => { e.stopPropagation(); onChange() }}
      className={`w-[42px] h-[25px] rounded-full relative transition-colors duration-200 cursor-pointer shrink-0
        ${enabled ? 'bg-[#32D74B]' : 'bg-[#3A3A3C] border border-[#48484A]'}`}
    >
      <span
        className={`absolute top-[2px] w-[21px] h-[21px] bg-white rounded-full shadow-[0_2px_5px_rgba(0,0,0,0.35)] transition-transform duration-200 ease-out
          ${enabled ? 'translate-x-[19px]' : 'translate-x-[2px]'}`}
      />
    </button>
  )
}
