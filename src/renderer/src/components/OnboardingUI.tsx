import { motion, AnimatePresence } from 'framer-motion'
import { BadgeCheck, Clock, HelpCircle, KeyRound, ShoppingCart, Sparkles } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import cn from 'clsx'
import { Spinner } from './ui/Spinner'

const GET_LICENSE_URL = 'https://nivo.nawmain.dev'
const RECOVER_LICENSE_URL = 'https://nivo.nawmain.dev/recover-license'

type Mode = 'license' | 'trial'

export const OnboardingUI = () => {
  const [mode, setMode] = useState<Mode>('license')
  const [licenseKey, setLicenseKey] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [authState, setAuthState] = useState<{ isInTrial: boolean; trialStartedAt: number | null } | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    window.api.getLicenseState().then(setAuthState)
  }, [])

  useEffect(() => {
    if (mode !== 'license') return
    const id = requestAnimationFrame(() => inputRef.current?.focus())
    return () => cancelAnimationFrame(id)
  }, [mode])

  const activate = async () => {
    if (!licenseKey || submitting) return
    setSubmitting(true)
    setError(null)
    try {
      const result = await window.api.activateLicense(licenseKey)
      if (!result.ok) {
        setError(result.error ?? 'Activation failed. Please try again.')
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const startTrial = async () => {
    if (submitting) return
    setSubmitting(true)
    setError(null)
    try {
      const result = await window.api.startTrial()
      if (!result.ok) {
        setError(result.error ?? 'Could not start your trial. Please try again.')
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className="h-screen w-full flex flex-col justify-center items-center overflow-hidden relative select-none rounded-[32px] border border-white/10 shadow-2xl"
      style={
        {
          WebkitAppRegion: 'drag',
          background: 'linear-gradient(180deg, #141414 0%, #121418 45%, #151a24 100%)',
          backdropFilter: 'blur(40px)',
          padding: '28px 20px'
        } as any
      }
    >
      <AnimatePresence mode="wait">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="z-10 w-full flex flex-col items-center"
        >
          <h1
            className="text-[30px] font-bold text-white tracking-tight"
            style={{ marginBottom: '8px' }}
          >
            Ready For <span className="text-purple">Nivo?</span>
          </h1>
          <p
            className="text-[14px] text-white/70 text-center max-w-[320px] leading-snug"
            style={{ marginBottom: '22px' }}
          >
            One payment. Lifetime access. Or kick the tires for 48 hours, free.
          </p>

          <div
            className="w-[360px] border rounded-2xl border-white/8 overflow-hidden"
            style={{
              marginBottom: '20px',
              background:
                'linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.015) 100%)',
              backdropFilter: 'blur(40px)'
            }}
          >
            <div className="grid grid-cols-2" style={{ gap: '8px', padding: '8px' }}>
              <TabButton
                active={mode === 'license'}
                onClick={() => {
                  setMode('license')
                  setError(null)
                }}
                icon={<BadgeCheck className="size-[20px] text-white" strokeWidth={2.5} />}
                label="License"
              />
              <TabButton
                active={mode === 'trial'}
                onClick={() => {
                  setMode('trial')
                  setError(null)
                }}
                icon={<Sparkles className="size-[20px] text-white" strokeWidth={2.5} />}
                label="Free Trial"
              />
            </div>

            <div className="border-t border-white/10" />

            {mode === 'license' ? (
              <div className="flex items-center gap-3" style={{ padding: '12px 18px' }}>
                <KeyRound className="size-[18px] -rotate-135 text-white/40" />
                <input
                  ref={inputRef}
                  autoFocus
                  type="text"
                  value={licenseKey}
                  onChange={(e) => {
                    setLicenseKey(e.target.value)
                    if (error) setError(null)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') activate()
                  }}
                  placeholder="License Key"
                  style={{ WebkitAppRegion: 'no-drag' } as any}
                  className="bg-transparent border-none outline-none text-white/80 placeholder:text-white/30 w-full text-[14px] font-mono tracking-wide"
                />
              </div>
            ) : (
              <div className="flex items-center gap-3" style={{ padding: '14px 18px' }}>
                <Clock className="size-[18px] text-white/40 shrink-0" />
                <div className="flex flex-col min-w-0">
                  <span className="text-[13px] text-white/85 font-semibold">
                    48 hours, every feature.
                  </span>
                </div>
              </div>
            )}
          </div>

          {error && (
            <p
              className="text-[12px] text-red-400 text-center max-w-[320px] font-mono"
              style={{ marginTop: '-8px', marginBottom: '14px' }}
            >
              {error}
            </p>
          )}

          <div className="flex flex-col items-center w-full" style={{ gap: '16px' }}>
            <div className="flex flex-col items-center" style={{ gap: '8px' }}>
              <p className="text-[13px] text-white/55 flex items-center gap-2">
                <ShoppingCart className="size-[14px] text-white/40" />
                Buy once. Own forever.
                <span
                  onClick={() => window.api.openExternal(GET_LICENSE_URL)}
                  style={{ WebkitAppRegion: 'no-drag' } as any}
                  className="text-green-400 cursor-pointer hover:underline font-medium"
                >
                  Get license.
                </span>
              </p>

              <div className="flex items-center w-full" style={{ gap: '10px' }}>
                <div className="h-px flex-1 bg-white/8" />
                <span className="text-[11px] text-white/35 uppercase tracking-[0.18em]">or</span>
                <div className="h-px flex-1 bg-white/8" />
              </div>

              <p className="text-[13px] text-white/55 flex items-center gap-2">
                <HelpCircle className="size-[14px] text-white/40" />
                Lost your license?
                <span
                  onClick={() => window.api.openExternal(RECOVER_LICENSE_URL)}
                  style={{ WebkitAppRegion: 'no-drag' } as any}
                  className="text-purple cursor-pointer hover:underline font-medium"
                >
                  Recover license.
                </span>
              </p>
            </div>

            {mode === 'license' ? (
              <button
                disabled={!licenseKey || submitting}
                onClick={activate}
                style={{ WebkitAppRegion: 'no-drag' } as any}
                className={cn(
                  'w-[360px] h-12 rounded-xl border text-sm font-semibold transition-all',
                  licenseKey && !submitting
                    ? 'bg-purple border-purple text-white cursor-pointer shadow-purple/50 hover:bg-purple/90'
                    : 'bg-white/3 border-white/8 text-white/40 cursor-not-allowed'
                )}
              >
                {submitting ? <Spinner size="size-11" /> : 'Activate Nivo'}
              </button>
            ) : (
              <button
                disabled={submitting || !!authState?.trialStartedAt}
                onClick={startTrial}
                style={{ WebkitAppRegion: 'no-drag' } as any}
                className={cn(
                  'w-[360px] h-12 rounded-xl border text-sm font-semibold transition-all',
                  !submitting && !authState?.trialStartedAt
                    ? 'bg-purple border-purple text-white cursor-pointer shadow-purple/50 hover:bg-purple/90'
                    : 'bg-white/3 border-white/8 text-white/40 cursor-not-allowed'
                )}
              >
                {submitting ? (
                  <Spinner size="size-11" />
                ) : authState?.trialStartedAt ? (
                  'Trial Already Used'
                ) : (
                  'Start Free Trial'
                )}
              </button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

function TabButton({
  active,
  onClick,
  icon,
  label
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
}) {
  return (
    <button
      onClick={onClick}
      style={{ WebkitAppRegion: 'no-drag', padding: '12px 8px 10px' } as any}
      className={cn(
        'flex flex-col items-center justify-center gap-2 rounded-2xl border bg-white/3 cursor-pointer transition-all',
        active
          ? 'border-purple shadow-[0_0_0_1.5px_#a855f7]'
          : 'border-white/8 hover:border-white/20'
      )}
    >
      <span
        className={cn(
          'flex items-center justify-center size-10 rounded-xl',
          active ? 'bg-purple' : 'bg-white/8'
        )}
      >
        {icon}
      </span>
      <span className={cn('text-sm font-semibold', active ? 'text-white' : 'text-white/55')}>
        {label}
      </span>
    </button>
  )
}
