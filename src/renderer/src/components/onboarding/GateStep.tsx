import React, { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { GlassButton } from './GlassButton'
import { ShieldCheck, ArrowLeft, Check } from 'lucide-react'

interface GateStepProps {
  onBack: () => void
  onFinish: () => void
}

const TOTAL = 12 // 3 groups of 4

export const GateStep = ({ onBack, onFinish }: GateStepProps) => {
  const [raw, setRaw] = useState('') // raw alphanumeric chars, no dashes
  const [focused, setFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cleaned = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, TOTAL)
    setRaw(cleaned)
  }

  const focusInput = () => inputRef.current?.focus()

  const isValid = raw.length === TOTAL
  const groups = [raw.slice(0, 4), raw.slice(4, 8), raw.slice(8, 12)]

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-4 mb-9">
        <div className="relative w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
          <div className="absolute inset-0 rounded-2xl bg-emerald-500/10 blur-md" />
          <ShieldCheck size={26} className="text-emerald-400 relative" />
        </div>
        <div>
          <h2 className="text-[26px] font-bodoni font-medium leading-none">Activate Lume</h2>
          <p className="text-white/35 text-[13px] mt-1.5 font-jost font-light">
            Unlock the full experience
          </p>
        </div>
      </div>

      {/* License input card */}
      <div
        onClick={focusInput}
        className={`relative bg-white/2 border rounded-3xl p-7 mb-6 overflow-hidden cursor-text transition-all duration-300
          ${focused ? 'border-amber-gold/30 bg-white/3' : 'border-white/8 hover:border-white/12'}`}
      >
        <div
          className={`absolute -top-12 -right-12 w-48 h-48 rounded-full blur-[80px] pointer-events-none transition-opacity duration-500
            ${isValid ? 'bg-emerald-500/15 opacity-100' : focused ? 'bg-amber-gold/15 opacity-100' : 'opacity-0'}`}
        />

        <div className="flex items-center justify-between mb-5">
          <span className="text-[10px] font-bold text-white/30 uppercase tracking-[0.3em]">
            License Key
          </span>
          {isValid && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="flex items-center gap-1.5 text-emerald-400 text-[10px] font-bold uppercase tracking-[0.2em]"
            >
              <Check size={11} strokeWidth={3} />
              Valid
            </motion.div>
          )}
        </div>

        {/* Hidden actual input */}
        <input
          ref={inputRef}
          type="text"
          value={raw}
          onChange={handleChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          autoFocus
          className="absolute opacity-0 pointer-events-none -z-10"
          aria-label="License key"
        />

        {/* Segmented display */}
        <div className="flex items-center justify-between gap-2 select-none">
          {groups.map((group, gi) => (
            <React.Fragment key={gi}>
              <div className="flex gap-1.5 flex-1">
                {Array.from({ length: 4 }).map((_, ci) => {
                  const idx = gi * 4 + ci
                  const ch = group[ci]
                  const isCursor = focused && raw.length === idx
                  const filled = ch !== undefined
                  return (
                    <div
                      key={ci}
                      className={`relative flex-1 aspect-3/4 max-h-[52px] rounded-lg flex items-center justify-center font-mono text-[20px] font-medium transition-all duration-200
                        ${
                          filled
                            ? 'bg-white/8 border border-white/15 text-white'
                            : isCursor
                              ? 'bg-amber-gold/5 border border-amber-gold/40 text-white'
                              : 'bg-white/2 border border-white/8 text-white/30'
                        }`}
                    >
                      {ch ?? ''}
                      {isCursor && (
                        <motion.div
                          animate={{ opacity: [1, 0, 1] }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          className="absolute bottom-2 left-1/2 -translate-x-1/2 w-3 h-px bg-amber-gold"
                        />
                      )}
                    </div>
                  )
                })}
              </div>
              {gi < 2 && <span className="text-white/20 text-lg font-light">—</span>}
            </React.Fragment>
          ))}
        </div>

        <p className="text-[11px] text-white/25 mt-5 leading-relaxed font-jost font-light">
          Enter the activation code from your purchase confirmation. Don't have one yet? Activate later from Settings.
        </p>
      </div>

      {/* Nav */}
      <div className="flex gap-3 items-center">
        <button
          onClick={onBack}
          className="w-14 h-14 rounded-2xl bg-white/3 border border-white/5 flex items-center justify-center
            transition-all cursor-pointer group hover:bg-white/6 hover:border-white/10"
          aria-label="Back"
        >
          <ArrowLeft size={18} className="text-white/40 group-hover:text-white transition-colors" />
        </button>
        <GlassButton
          onClick={onFinish}
          label={isValid ? 'Activate Lume' : 'Skip for now'}
          flex1
        />
      </div>
    </div>
  )
}
