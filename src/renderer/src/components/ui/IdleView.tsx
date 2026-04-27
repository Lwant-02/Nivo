import { DotLottieReact } from '@lottiefiles/dotlottie-react'
import { Music2 } from 'lucide-react'
import catPlaying from '@renderer/assets/lottie/Cat playing animation.lottie'

export function IdleView() {
  return (
    <div className="flex items-center gap-3 h-full w-full">
      <div className="relative w-[130px] h-[130px] shrink-0 -ml-2">
        <DotLottieReact src={catPlaying} loop autoplay style={{ width: '100%', height: '100%' }} />
      </div>
      <div className="flex flex-col min-w-0 flex-1 pr-2">
        <div className="flex items-center gap-1.5 text-white/40 text-[10px] font-bold uppercase tracking-[0.18em]">
          <Music2 size={11} strokeWidth={2.5} />
          <span>NIVO</span>
        </div>
        <h2 className="text-white text-[17px] font-bold tracking-tight leading-tight mt-1.5">
          Ready when you are
        </h2>
        <p className="text-white/50 text-[11px] leading-snug mt-1">
          Press play in Spotify, Music, or your browser and it'll land here.
        </p>
      </div>
    </div>
  )
}
