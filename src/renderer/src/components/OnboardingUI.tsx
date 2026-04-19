import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { WelcomeStep } from './onboarding/WelcomeStep'
import { FeatureStep } from './onboarding/FeatureStep'
import { GateStep } from './onboarding/GateStep'

export const OnboardingUI = () => {
  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState(1)

  const go = async (next: number) => {
    if (next > step) {
      await window.api.pulseOnboarding()
    }
    setDirection(next > step ? 1 : -1)
    setStep(next)
  }

  const finish = async () => {
    await window.api.closeOnboarding()
  }

  return (
    <div className="h-screen w-full bg-black flex flex-col justify-center items-center overflow-hidden relative select-none font-sans">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />

      <motion.div
        animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        className="absolute top-[20%] left-[15%] w-72 h-72 bg-purple-600/5 blur-[100px] rounded-full"
      />

      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={step}
          custom={direction}
          initial={{ opacity: 0, scale: 0.9, filter: 'blur(15px)' }}
          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          exit={{ opacity: 0, scale: 1.1, filter: 'blur(15px)' }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="z-10 w-full flex flex-col items-center"
        >
          {step === 0 && <WelcomeStep onNext={() => go(1)} />}
          {step === 1 && <FeatureStep onBack={() => go(0)} onNext={() => go(2)} />}
          {step === 2 && <GateStep onBack={() => go(1)} onFinish={finish} />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
