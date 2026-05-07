import { motion } from 'framer-motion'
import { DotLottieReact } from '@lottiefiles/dotlottie-react'
import { useSettings } from '../../hooks/useSettings'

import walkingCat from '@renderer/assets/lottie/Walking Cat.lottie'
import walkingDuck from '@renderer/assets/lottie/Walking Duck.lottie'
import walkingTommy from '@renderer/assets/lottie/Walking Tommy.lottie'
import musicMan from '@renderer/assets/lottie/Music Man.lottie'
import moodyDog from '@renderer/assets/lottie/Moody Dog.lottie'
import joyWalking from '@renderer/assets/lottie/Joy Walking with Phone.lottie'

export interface LottieStyle {
  src: string
  figureSize: number
  scale: number
}

export const LOTTIE_STYLES: LottieStyle[] = [
  {
    src: walkingCat,
    figureSize: 40,
    scale: 1.4
  },
  {
    src: walkingDuck,
    figureSize: 40,
    scale: 1.4
  },
  {
    src: walkingTommy,
    figureSize: 40,
    scale: 1.4
  },
  {
    src: musicMan,
    figureSize: 30,
    scale: 1.4
  },
  {
    src: moodyDog,
    figureSize: 40,
    scale: 1.4
  },
  {
    src: joyWalking,
    figureSize: 30,
    scale: 1.4
  }
]

interface LottieVisualizerProps {
  width: number
  visible?: boolean
}

const COLLAPSED_HEIGHT = 33.8
const COLLAPSED_R = 11
const COLLAPSED_B = 11

const buildCollapsedClipPath = (w: number, h: number) => {
  const r = COLLAPSED_R
  const b = COLLAPSED_B
  return `path('M 0,0 A ${r} ${r} 0 0 1 ${r} ${r} V ${h - b} A ${b} ${b} 0 0 0 ${r + b} ${h} H ${w - r - b} A ${b} ${b} 0 0 0 ${w - r} ${h - b} V ${r} A ${r} ${r} 0 0 1 ${w} 0 Z')`
}

export function LottieVisualizer({ width, visible = true }: LottieVisualizerProps) {
  const { settings } = useSettings()
  const style = LOTTIE_STYLES[settings.lottieStyle] || LOTTIE_STYLES[0]
  const clipPath = buildCollapsedClipPath(width, COLLAPSED_HEIGHT)

  return (
    <div
      className="absolute top-0 left-0 h-[33.8px] overflow-hidden pointer-events-none z-0"
      style={{
        width,
        visibility: visible ? 'visible' : 'hidden',
        clipPath,
        WebkitClipPath: clipPath
      }}
    >
      <motion.div
        animate={{ x: [-style.figureSize, width + style.figureSize] }}
        transition={{
          duration: 14,
          repeat: Infinity,
          ease: 'linear',
          repeatType: 'loop'
        }}
        className="h-full flex items-center justify-center"
        style={{ width: style.figureSize }}
      >
        <DotLottieReact
          key={style.src}
          src={style.src}
          loop
          autoplay
          style={{ width: '100%', height: '100%', transform: `scale(${style.scale})` }}
        />
      </motion.div>
    </div>
  )
}
