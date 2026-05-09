import { motion } from 'framer-motion'
import { Coffee, Heart, Sparkles } from 'lucide-react'
import { useState } from 'react'
import cn from 'clsx'
import iconSrc from '../../../../resources/icon.png'
import bmcQrSrc from '../../../../resources/bmc_qr.png'

const BMC_URL = 'https://buymeacoffee.com/sainawmain'

export const WelcomeUI = () => {
  const [starting, setStarting] = useState(false)

  const handleStart = async () => {
    if (starting) return
    setStarting(true)
    try {
      await window.api.startWelcome()
    } catch {
      setStarting(false)
    }
  }

  return (
    <div
      className="h-screen w-full flex flex-col justify-center items-center overflow-hidden relative select-none rounded-[18px] border border-white/10 shadow-2xl"
      style={
        {
          WebkitAppRegion: 'drag',
          background: 'linear-gradient(180deg, #141414 0%, #121418 45%, #151a24 100%)',
          backdropFilter: 'blur(40px)',
          padding: '28px 20px'
        } as any
      }
    >
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="z-10 w-full flex flex-col items-center"
      >
        <div
          className="flex items-center justify-center"
          style={{
            width: 72,
            height: 72,
            borderRadius: 20,
            background: 'linear-gradient(135deg, #a855f7 0%, #6366f1 60%, #3b82f6 100%)',
            boxShadow: '0 12px 32px rgba(168,85,247,0.4), inset 0 1px 0 rgba(255,255,255,0.25)',
            marginBottom: 16
          }}
        >
          <img src={iconSrc} alt="Nivo" className="w-full h-full object-cover rounded-[20px]" />
        </div>

        <h1
          className="text-[28px] font-bold text-white tracking-tight"
          style={{ marginBottom: '6px' }}
        >
          Welcome to <span className="text-purple">Nivo</span>
        </h1>
        <p
          className="text-[13px] text-white/65 text-center max-w-[320px] leading-snug"
          style={{ marginBottom: '20px' }}
        >
          Your notch, evolved. Music, meetings, and live activities — right where the notch lives.
        </p>

        <div
          className="w-[360px] border rounded-2xl border-white/10 overflow-hidden"
          style={{
            marginBottom: '18px',
            background:
              'linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.015) 100%)',
            backdropFilter: 'blur(40px)',
            padding: '16px'
          }}
        >
          <div className="flex items-start gap-3" style={{ marginBottom: '12px' }}>
            <div
              className="flex items-center justify-center shrink-0"
              style={{
                width: 60,
                height: 60,
                borderRadius: 10,
                background: 'rgba(255,255,255,0.96)',
                padding: 4
              }}
            >
              <img src={bmcQrSrc} alt="Buy Me a Coffee" className="w-full h-full object-contain" />
            </div>
            <div className="flex flex-col min-w-0" style={{ paddingTop: 2 }}>
              <span className="text-[12px] text-white/85 font-semibold flex items-center gap-1.5">
                <Heart size={12} className="text-pink-400" />
                Free forever
              </span>
              <p className="text-[11px] text-white/55 leading-snug" style={{ marginTop: 2 }}>
                Nivo is free and crafted with care. If it earns a place on your Mac, a coffee keeps
                it growing.
              </p>
              <span
                onClick={() => window.api.openExternal(BMC_URL)}
                style={{ WebkitAppRegion: 'no-drag' } as any}
                className="text-[11px] text-yellow-400 cursor-pointer hover:underline font-medium flex items-center gap-1"
              >
                <Coffee size={11} />
                buymeacoffee.com/sainawmain
              </span>
            </div>
          </div>
        </div>

        <button
          disabled={starting}
          onClick={handleStart}
          style={{ WebkitAppRegion: 'no-drag' } as any}
          className={cn(
            'w-[360px] h-12 rounded-xl border text-sm font-semibold transition-all flex items-center justify-center gap-2',
            starting
              ? 'bg-white/5 border-white/10 text-white/50 cursor-not-allowed'
              : 'bg-purple border-purple text-white cursor-pointer shadow-purple/50 hover:bg-purple/90'
          )}
        >
          <Sparkles size={16} />
          Start Now
        </button>
      </motion.div>
    </div>
  )
}
