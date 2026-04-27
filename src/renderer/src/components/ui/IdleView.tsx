import { DotLottieReact } from '@lottiefiles/dotlottie-react'
import { Music2, Timer } from 'lucide-react'
import catPlaying from '@renderer/assets/lottie/Cat playing animation.lottie'

interface IdleViewProps {
  onStartFocus?: () => void
  focusMinutes?: number
}

export function IdleView({ onStartFocus, focusMinutes = 25 }: IdleViewProps) {
  return (
    <div className="flex items-center gap-3 h-full w-full">
      <div className="relative w-[110px] h-[110px] shrink-0 -ml-2">
        <DotLottieReact src={catPlaying} loop autoplay style={{ width: '100%', height: '100%' }} />
      </div>
      <div className="flex flex-col min-w-0 flex-1 pr-1">
        <div className="flex items-center gap-1.5 text-white/40 text-[10px] font-bold uppercase tracking-[0.18em]">
          <Music2 size={11} strokeWidth={2.5} />
          <span>NIVO</span>
        </div>
        <h2 className="text-white text-[16px] font-bold tracking-tight leading-tight mt-1.5">
          Ready when you are
        </h2>
        <p className="text-white/45 text-[11px] leading-snug mt-1">
          Press play in Spotify or start a focus session.
        </p>

        {onStartFocus && (
          <button
            onClick={onStartFocus}
            className="mt-3 flex items-center cursor-pointer justify-center gap-2 h-9 px-3 rounded-full transition-all active:scale-95"
            style={{
              background: 'var(--lume-accent, #a855f7)',
              boxShadow: '0 6px 18px var(--lume-accent-glow, rgba(168,85,247,0.45))',
              marginTop: '10px'
            }}
          >
            <Timer size={13} strokeWidth={2.5} className="text-text" />
            <span className="text-text text-[12px] font-bold tracking-tight">
              Start {focusMinutes}m Focus
            </span>
          </button>
        )}
      </div>
    </div>
  )
}
