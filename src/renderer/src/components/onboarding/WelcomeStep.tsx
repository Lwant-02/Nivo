import { motion } from 'framer-motion'
import { GlassButton } from './GlassButton'
import logo from '../../../../../resources/icon.png'

interface WelcomeStepProps {
  onNext: () => void
}

export const WelcomeStep = ({ onNext }: WelcomeStepProps) => {
  return (
    <div className="flex flex-col items-center max-w-2xl px-6">
      <div className="relative group mb-12">
        <div className="absolute inset-0 bg-white/20 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
        <motion.img
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          src={logo}
          className="w-64 h-64 md:w-80 md:h-80 object-contain drop-shadow-[0_0_40px_rgba(120,100,255,0.2)]"
        />
      </div>

      <div className="space-y-4">
        <h1 className="text-5xl font-bold text-white mb-10">
          Your Notch, <span className="text-white/80">illuminated.</span>
        </h1>
        <p className="text-xl text-white/50 text-center font-medium tracking-tight mx-auto">
          The definitive media controller for the next generation of macOS.
        </p>
      </div>

      <div style={{ marginTop: '30px' }} className="mt-12 w-full max-w-xs">
        <GlassButton onClick={onNext} label="Get Started" />
      </div>

      <div
        style={{ marginTop: '30px' }}
        className="opacity-60 uppercase tracking-[0.15em] text-xs text-white font-bold"
      >
        One payment. Lifetime access.
      </div>
    </div>
  )
}
