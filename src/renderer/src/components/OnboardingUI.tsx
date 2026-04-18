import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, ChevronLeft, Check, Zap, Shield } from 'lucide-react'
import { Toggle } from '../components/ui/Toggle'

// ─── Step definitions ─────────────────────────────────────────────────────────

const TOTAL_STEPS = 3

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function OnboardingUI() {
  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState(1)
  const [launchAtLogin, setLaunchAtLogin] = useState(true)
  const [mediaAccess, setMediaAccess] = useState(true)

  const go = (next: number) => {
    setDirection(next > step ? 1 : -1)
    setStep(next)
  }

  const finish = async () => {
    await window.api.closeOnboarding()
  }

  return (
    <div
      className="h-screen w-full bg-[#0a0a0a] text-white flex flex-col items-center justify-center overflow-hidden relative select-none"
      style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif' }}
    >
      {/* Ambient glow */}
      <motion.div
        animate={{ scale: [1, 1.15, 1], opacity: [0.12, 0.2, 0.12] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-linear-to-b from-purple-600 to-indigo-700 blur-[120px] rounded-full pointer-events-none"
      />

      {/* Steps */}
      <div className="relative w-full max-w-[420px] px-8 z-10">
        <AnimatePresence mode="wait" custom={direction}>
          {step === 0 && (
            <StepWrapper key="step-0" direction={direction}>
              <WelcomeStep onNext={() => go(1)} />
            </StepWrapper>
          )}
          {step === 1 && (
            <StepWrapper key="step-1" direction={direction}>
              <DemoStep onNext={() => go(2)} onBack={() => go(0)} />
            </StepWrapper>
          )}
          {step === 2 && (
            <StepWrapper key="step-2" direction={direction}>
              <PermissionsStep
                launchAtLogin={launchAtLogin}
                setLaunchAtLogin={setLaunchAtLogin}
                mediaAccess={mediaAccess}
                setMediaAccess={setMediaAccess}
                onBack={() => go(1)}
                onFinish={finish}
              />
            </StepWrapper>
          )}
        </AnimatePresence>
      </div>

      {/* Progress dots */}
      <div className="absolute bottom-10 flex items-center gap-2 z-10">
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
          <motion.button
            key={i}
            onClick={() => go(i)}
            animate={{ width: i === step ? 24 : 6, opacity: i === step ? 1 : 0.25 }}
            transition={{ duration: 0.25 }}
            className="h-[6px] rounded-full bg-white cursor-pointer"
          />
        ))}
      </div>
    </div>
  )
}

// ─── Step wrapper (slide animation) ──────────────────────────────────────────

function StepWrapper({ children, direction }: { children: React.ReactNode; direction: number }) {
  return (
    <motion.div
      custom={direction}
      variants={{
        enter: (d: number) => ({ opacity: 0, x: d * 40, scale: 0.97 }),
        center: { opacity: 1, x: 0, scale: 1 },
        exit: (d: number) => ({ opacity: 0, x: d * -40, scale: 0.97 })
      }}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  )
}

// ─── Step 0: Welcome ──────────────────────────────────────────────────────────

function WelcomeStep({ onNext }: { onNext: () => void }) {
  return (
    <div className="flex flex-col items-center text-center">
      {/* Logo */}
      <div className="relative mb-10">
        <div className="absolute inset-0 bg-linear-to-br from-purple-500 to-indigo-600 blur-2xl opacity-40 rounded-full scale-110" />
        <div className="relative w-24 h-24 bg-linear-to-br from-purple-500 to-indigo-600 rounded-[26px] flex items-center justify-center shadow-2xl border border-white/10">
          <span className="text-white text-5xl font-black italic leading-none drop-shadow-lg">
            L
          </span>
        </div>
      </div>

      <h1 className="text-[32px] font-bold tracking-tight mb-3">Welcome to Lume</h1>
      <p className="text-white/40 text-[15px] leading-relaxed mb-10 max-w-[300px]">
        Your Mac notch, transformed into a beautiful Dynamic Island experience.
      </p>

      <PrimaryButton onClick={onNext} label="Get Started" />
    </div>
  )
}

// ─── Step 1: Demo ─────────────────────────────────────────────────────────────

function DemoStep({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  return (
    <div className="flex flex-col items-center">
      {/* Demo pill */}
      <div className="w-full aspect-video bg-white/3 border border-white/8 rounded-2xl mb-8 flex flex-col items-center overflow-hidden relative">
        <motion.div
          animate={{
            width: [130, 260, 260, 130],
            height: [28, 84, 84, 28],
            borderRadius: [14, 24, 24, 14]
          }}
          transition={{
            duration: 3.5,
            repeat: Infinity,
            ease: 'easeInOut',
            times: [0, 0.25, 0.65, 1]
          }}
          className="bg-black border border-white/8 shadow-xl -mt-px flex items-center justify-center overflow-hidden"
        >
          <div className="flex items-end gap-[3px] h-4">
            {[0.5, 0.85, 0.6, 0.95, 0.45].map((h, i) => (
              <motion.div
                key={i}
                animate={{
                  height: [`${h * 35}%`, `${h * 100}%`, `${h * 55}%`, `${h * 100}%`, `${h * 35}%`]
                }}
                transition={{ repeat: Infinity, duration: 0.65 + i * 0.12, ease: 'easeInOut' }}
                className="w-[3px] bg-linear-to-t from-purple-400 to-indigo-400 rounded-full"
              />
            ))}
          </div>
          <span className="w-2 h-2 rounded-full bg-green-500/50 absolute top-2.5 right-2.5" />
        </motion.div>

        <motion.p
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-5 text-[12px] text-white/40 flex items-center gap-2"
        >
          <Zap size={12} className="text-purple-400" />
          Hover at the top of your screen
        </motion.p>
      </div>

      <h2 className="text-[22px] font-bold text-center mb-2">The Magic Island</h2>
      <p className="text-white/40 text-[14px] text-center leading-relaxed mb-8 max-w-[300px]">
        Move your cursor to the top center to instantly expand the Island and access media controls.
      </p>

      <div className="flex w-full gap-3">
        <BackButton onClick={onBack} />
        <PrimaryButton onClick={onNext} label="Continue" flex1 />
      </div>
    </div>
  )
}

// ─── Step 2: Permissions ──────────────────────────────────────────────────────

interface PermissionsStepProps {
  launchAtLogin: boolean
  setLaunchAtLogin: (v: boolean) => void
  mediaAccess: boolean
  setMediaAccess: (v: boolean) => void
  onBack: () => void
  onFinish: () => void
}

function PermissionsStep({
  launchAtLogin,
  setLaunchAtLogin,
  mediaAccess,
  setMediaAccess,
  onBack,
  onFinish
}: PermissionsStepProps) {
  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-11 h-11 rounded-xl bg-linear-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg">
          <Shield size={20} className="text-white" />
        </div>
        <div>
          <h2 className="text-[20px] font-bold leading-tight">Setup & Permissions</h2>
          <p className="text-white/40 text-[13px]">Almost done</p>
        </div>
      </div>

      <p className="text-[13px] text-white/40 leading-relaxed mb-5">
        Allow these permissions to make Lume work perfectly on your Mac.
      </p>

      {/* Permissions list */}
      <div className="bg-white/4 border border-white/8 rounded-xl overflow-hidden mb-6">
        <PermissionRow
          title="Launch at Login"
          description="Automatically start Lume when you log in"
          enabled={launchAtLogin}
          onToggle={() => setLaunchAtLogin(!launchAtLogin)}
          isFirst
        />
        <PermissionRow
          title="Media Access"
          description="Show Apple Music and Spotify in the Island"
          enabled={mediaAccess}
          onToggle={() => setMediaAccess(!mediaAccess)}
        />
      </div>

      <div className="flex gap-3">
        <BackButton onClick={onBack} />
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={onFinish}
          className="flex-1 py-3.5 bg-linear-to-r from-emerald-500 to-teal-500 text-white font-semibold text-[15px] rounded-xl
            flex items-center justify-center gap-2 shadow-lg hover:shadow-[0_0_24px_rgba(52,199,89,0.3)] transition-all cursor-pointer"
        >
          <Check size={18} strokeWidth={2.5} />
          Finish Setup
        </motion.button>
      </div>
    </div>
  )
}

// ─── Small components ─────────────────────────────────────────────────────────

function PermissionRow({
  title,
  description,
  enabled,
  onToggle,
  isFirst = false
}: {
  title: string
  description: string
  enabled: boolean
  onToggle: () => void
  isFirst?: boolean
}) {
  return (
    <div className="relative">
      {!isFirst && <div className="absolute top-0 left-4 right-0 h-px bg-white/[0.07]" />}
      <div
        onClick={onToggle}
        className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-white/4 transition-colors"
      >
        <div className="flex flex-col gap-1 pr-4">
          <span className="text-[14px] font-medium text-white leading-tight">{title}</span>
          <span className="text-[12px] text-white/40 leading-tight">{description}</span>
        </div>
        <Toggle enabled={enabled} onChange={onToggle} />
      </div>
    </div>
  )
}

function PrimaryButton({
  onClick,
  label,
  flex1
}: {
  onClick: () => void
  label: string
  flex1?: boolean
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`${flex1 ? 'flex-1' : 'w-full'} py-3.5 bg-white text-black font-semibold text-[15px] rounded-xl
        flex items-center justify-center gap-2 hover:shadow-[0_0_24px_rgba(255,255,255,0.2)] transition-all cursor-pointer`}
    >
      {label}
      <ChevronRight size={17} strokeWidth={2.5} />
    </motion.button>
  )
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <motion.button
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="w-12 h-12 rounded-xl bg-white/6 border border-white/8 flex items-center justify-center
        hover:bg-white/10 transition-all cursor-pointer shrink-0"
      aria-label="Back"
    >
      <ChevronLeft size={18} className="text-white/60" />
    </motion.button>
  )
}
