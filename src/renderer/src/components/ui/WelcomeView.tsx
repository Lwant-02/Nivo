import { DotLottieReact } from '@lottiefiles/dotlottie-react'
import { Music2 } from 'lucide-react'
import welcomeLottie from '@renderer/assets/lottie/Welcome.lottie'

interface WelcomeViewProps {
  notchTheme: any
}

export function WelcomeView({ notchTheme }: WelcomeViewProps) {
  return (
    <div
      style={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '20px',
        border: '1px solid rgba(255,255,255,0.25)',
        background: 'rgba(255,255,255,0.04)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.20)',
        padding: '16px',
        boxSizing: 'border-box',
        textAlign: 'center'
      }}
    >
      <div className="relative w-[130px] h-[90px] shrink-0">
        <DotLottieReact
          src={welcomeLottie}
          loop
          autoplay
          style={{ width: '100%', height: '100%' }}
        />
      </div>
      <div className="flex flex-col items-center min-w-0">
        <div className="flex items-center gap-1.5 text-white/40 text-[10px] font-bold uppercase tracking-[0.18em]">
          <Music2 size={11} strokeWidth={2.5} style={{ color: notchTheme.accent }} />
          <span>WELCOME TO NIVO</span>
        </div>
        <h2 className="text-white text-[16px] font-bold tracking-tight leading-tight mt-1.5">
          Your notch, evolved.
        </h2>
        <p className="text-white/45 text-[11px] leading-snug mt-1 max-w-[200px]">
          Nivo brings your music, meetings, and magic to the center of your screen.
        </p>
      </div>
    </div>
  )
}
