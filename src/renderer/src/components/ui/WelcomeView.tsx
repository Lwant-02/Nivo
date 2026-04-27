import { DotLottieReact } from '@lottiefiles/dotlottie-react'
import { Music2 } from 'lucide-react'
import welcomeLottie from '@renderer/assets/lottie/Welcome.lottie'

interface WelcomeViewProps {
  notchTheme: any
}

export function WelcomeView({ notchTheme }: WelcomeViewProps) {
  return (
    <div className="absolute inset-0 flex items-center gap-3 px-6 bg-transparent z-200">
      <div className="relative w-[130px] h-[130px] shrink-0 -ml-4">
        <DotLottieReact
          src={welcomeLottie}
          loop
          autoplay
          style={{ width: '100%', height: '100%' }}
        />
      </div>
      <div className="flex flex-col min-w-0 flex-1 pr-4 justify-center">
        <div className="flex items-center gap-1.5 text-white/40 text-[10px] font-bold uppercase tracking-[0.18em]">
          <Music2 size={11} strokeWidth={2.5} style={{ color: notchTheme.accent }} />
          <span>WELCOME TO NIVO</span>
        </div>
        <h2 className="text-white text-[17px] font-bold tracking-tight leading-tight mt-1.5">
          Your notch, evolved.
        </h2>
        <p className="text-white/50 text-[11px] leading-snug mt-1">
          Nivo brings your music, meetings, and magic to the center of your screen.
        </p>
      </div>
    </div>
  )
}
