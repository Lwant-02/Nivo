import { motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'

interface GlassButtonProps {
  onClick: () => void
  label: string
  flex1?: boolean
  disabled?: boolean
}

export const GlassButton = ({ onClick, label, flex1, disabled }: GlassButtonProps) => {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className={`
        ${flex1 ? 'flex-1' : 'w-full'} 
        relative h-14 group overflow-hidden rounded-lg cursor-pointer
        transition-all duration-300 ease-out
        disabled:opacity-20 disabled:cursor-not-allowed
      `}
    >
      <div className="absolute inset-0 bg-linear-to-b from-white/8 to-transparent backdrop-blur-xl rounded-lg" />

      <div className="absolute inset-0 rounded-lg border border-white/10 group-hover:border-white/20 transition-colors duration-500" />
      <div className="absolute inset-px rounded-lg border border-white/5 pointer-events-none" />
      <div className="absolute top-0 inset-x-4 h-px bg-linear-to-r from-transparent via-white/30 to-transparent group-hover:via-white/50 transition-all duration-500" />

      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="absolute inset-0 bg-linear-to-tr from-indigo-500/10 via-transparent to-cyan-500/10" />
        <div className="absolute inset-0 w-1/2 h-full bg-white/5 -skew-x-12 -translate-x-full group-hover:animate-[shimmer_2s_infinite_ease-in-out]" />
      </div>

      <div className="relative z-10 flex items-center justify-center gap-2 px-8">
        <span className="text-white font-semibold tracking-tight text-lg">{label}</span>
        <ChevronRight
          strokeWidth={3}
          className="text-white/40 size-5.5 group-hover:text-white group-hover:translate-x-1 transition-all duration-300"
        />
      </div>

      <div className="absolute inset-0 shadow-[inset_0_-4px_12px_rgba(0,0,0,0.5)] pointer-events-none" />
    </motion.button>
  )
}
