import { motion, AnimatePresence } from 'framer-motion'
import { BadgeCheck, HelpCircle, KeyRound, ShoppingCart } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import cn from 'clsx'
import { Spinner } from './ui/Spinner'

const GET_LICENSE_URL = 'https://nivo.nawmain.dev'
const RECOVER_LICENSE_URL = 'https://nivo.nawmain.dev/recover-license'

export const OnboardingUI = () => {
  const [licenseKey, setLicenseKey] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const id = requestAnimationFrame(() => inputRef.current?.focus())
    return () => cancelAnimationFrame(id)
  }, [])

  const finish = async () => {
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
            One payment. Lifetime access. Own the full command center experience forever.
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
            <div className="grid grid-cols-1" style={{ gap: '8px', padding: '8px' }}>
              <button
                style={{ WebkitAppRegion: 'no-drag', padding: '12px 8px 10px' } as any}
                className={`flex flex-col items-center justify-center gap-2 rounded-2xl border border-purple shadow-[0_0_0_1.5px_#a855f7] bg-white/3`}
              >
                <span className={`flex items-center justify-center size-10 rounded-xl bg-purple`}>
                  <BadgeCheck className="size-[20px] text-white" strokeWidth={2.5} />
                </span>
                <span className={`text-sm font-semibold text-white`}>License</span>
              </button>
            </div>

            <div className="border-t border-white/10" />

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
                  if (e.key === 'Enter') finish()
                }}
                placeholder="License Key"
                style={{ WebkitAppRegion: 'no-drag' } as any}
                className="bg-transparent border-none outline-none text-white/80 placeholder:text-white/30 w-full text-[14px] font-mono tracking-wide"
              />
            </div>
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

            <button
              disabled={!licenseKey || submitting}
              onClick={finish}
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
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
