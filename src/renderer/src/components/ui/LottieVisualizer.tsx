import { motion } from 'framer-motion'
import { DotLottieReact } from '@lottiefiles/dotlottie-react'
import { useSettings } from '../../hooks/useSettings'

export interface LottieStyle {
  src: string
  figureSize: number
  scale: number
}

export const LOTTIE_STYLES: LottieStyle[] = [
  {
    src: 'https://lottie.host/ce3cd7e7-10b2-4105-9da9-7af484c75037/Y5R2r4rXlp.lottie',
    figureSize: 40,
    scale: 1.4
  },
  {
    src: 'https://lottie.host/aa15cb89-2d5f-4037-9918-5d53719b4c16/BOCGt2pRik.lottie',
    figureSize: 40,
    scale: 1.4
  },
  {
    src: 'https://lottie.host/67d290a0-b085-4c67-b92b-44367c0b2d03/rPqDUXC2lg.lottie',
    figureSize: 40,
    scale: 1.4
  },
  {
    src: 'https://lottie.host/78f4b8fa-f675-4461-96f9-6b1d9aee1c71/jV1RnEAZJM.lottie',
    figureSize: 40,
    scale: 1.4
  },
  {
    src: 'https://lottie.host/f0a68f44-d307-4f14-918b-14c7c53b491b/RKTzkNFXga.lottie',
    figureSize: 30,
    scale: 1.4
  }
]

interface LottieVisualizerProps {
  width: number
}

export function LottieVisualizer({ width }: LottieVisualizerProps) {
  const { settings } = useSettings()
  const style = LOTTIE_STYLES[settings.lottieStyle] || LOTTIE_STYLES[0]

  return (
    <div className="absolute top-0 left-0 right-0 h-[33.8px] overflow-hidden pointer-events-none z-0">
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
