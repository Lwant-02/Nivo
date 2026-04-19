import { motion } from 'framer-motion'
import { ArrowLeft, Droplet, Music, Sparkles, Bell, Fingerprint } from 'lucide-react'
import { GlassButton } from './GlassButton'

interface FeatureStepProps {
  onBack: () => void
  onNext: () => void
}

type Highlight = {
  icon: typeof Droplet
  label: string
  tintClass: string
  iconClass: string
}

const HIGHLIGHTS: Highlight[] = [
  {
    icon: Droplet,
    label: 'Fluid Transition',
    tintClass: 'from-cyan-400/30 to-sky-500/0',
    iconClass: 'text-white/50 group-hover:text-cyan-300'
  },
  {
    icon: Music,
    label: 'Live Sync',
    tintClass: 'from-indigo-400/30 to-violet-500/0',
    iconClass: 'text-white/50 group-hover:text-indigo-300'
  },
  {
    icon: Fingerprint,
    label: 'Swipe Gestures',
    tintClass: 'from-emerald-400/30 to-teal-500/0',
    iconClass: 'text-white/50 group-hover:text-emerald-300'
  },
  {
    icon: Bell,
    label: 'Ambient Alerts',
    tintClass: 'from-amber-400/30 to-orange-500/0',
    iconClass: 'text-white/50 group-hover:text-amber-300'
  },
  {
    icon: Sparkles,
    label: 'Intelligent',
    tintClass: 'from-fuchsia-400/30 to-purple-500/0',
    iconClass: 'text-white/50 group-hover:text-fuchsia-300'
  },
  {
    icon: Bell,
    label: 'Ambient Alerts',
    tintClass: 'from-amber-400/30 to-orange-500/0',
    iconClass: 'text-white/50 group-hover:text-amber-300'
  }
]

const FeatureCard = ({
  icon: Icon,
  label,
  tintClass,
  iconClass,
  index
}: Highlight & { index: number }) => {
  return (
    <motion.div
      key={label}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 + index * 0.05 }}
      style={{ padding: '7px' }}
      className="group relative h-32 flex flex-col justify-center items-center  gap-3 rounded-xl border border-white/6 bg-white/2 p-10 overflow-hidden hover:bg-white/4 transition-all duration-300"
    >
      <div
        className={`absolute -top-10 -right-10 w-24 h-24 rounded-full bg-linear-to-br ${tintClass} blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
      />

      <div className="relative size-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-white/20 transition-all">
        <Icon size={16} strokeWidth={2.5} className={iconClass} />
      </div>
      <h3 className="text-base font-bold text-white tracking-tight leading-none">{label}</h3>
    </motion.div>
  )
}

export const FeatureStep = ({ onBack, onNext }: FeatureStepProps) => {
  return (
    <div className="flex flex-col items-center w-full max-w-xl h-full min-h-[580px] relative pt-8">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
        style={{
          padding: '30px'
        }}
      >
        <span className="inline-block text-[9px] font-bold tracking-[0.4em] text-white/20 uppercase mb-2">
          The Essentials
        </span>
        <h2 className="text-5xl font-bold tracking-tight text-white leading-tight">
          Everything Liquid.
        </h2>
        <p className="text-[13px] text-white/30 mt-2 font-medium">
          The definitive interface for macOS.
        </p>
      </motion.div>

      {/* Feature grid - Removed aspect-square for vertical flexibility */}
      <div className="w-full grid grid-cols-3 gap-3 mb-6">
        {HIGHLIGHTS.map((h, index) => (
          <FeatureCard key={h.label} {...h} index={index} />
        ))}
      </div>

      {/* Controls - Pushed to bottom with mt-auto */}
      <div
        style={{ paddingTop: '30px' }}
        className="w-full flex flex-col items-center gap-6 mt-auto pb-8"
      >
        <div className="flex w-full gap-3">
          <button
            onClick={onBack}
            className="w-14 h-14 rounded-2xl bg-white/3 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all active:scale-90"
          >
            <ArrowLeft size={18} className="text-white/30" />
          </button>
          <GlassButton onClick={onNext} label="Continue" flex1 />
        </div>
      </div>
    </div>
  )
}
