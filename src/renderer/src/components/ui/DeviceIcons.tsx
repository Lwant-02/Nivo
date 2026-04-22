import { motion, Transition } from 'framer-motion'
import { AudioDeviceKind } from '../../hooks/useAudioOutput'

import airpodsImg from '../../assets/devices/airpods.png'
import headsetImg from '../../assets/devices/headset.png'
import speakerImg from '../../assets/devices/speaker.png'

interface IconProps {
  size?: number
  className?: string
}

const FloatTransition: Transition = {
  duration: 4,
  repeat: Infinity,
  ease: 'easeInOut'
}

function IconContainer({
  children,
  glowColor,
  size = 40
}: {
  children: React.ReactNode
  glowColor: string
  size?: number
}) {
  return (
    <div className="relative flex items-center justify-center p-2">
      <div
        className="absolute inset-0 blur-2xl opacity-15 rounded-full scale-125"
        style={{ backgroundColor: glowColor }}
      />

      <motion.div
        style={{
          width: size,
          height: size
        }}
        animate={{ y: [0, -4, 0] }}
        transition={FloatTransition}
        className="relative z-10 flex items-center justify-center"
      >
        {children}
      </motion.div>
    </div>
  )
}

const maskStyle = (imgUrl: string): React.CSSProperties => ({
  maskImage: `url(${imgUrl})`,
  WebkitMaskImage: `url(${imgUrl})`,
  maskPosition: 'center',
  WebkitMaskPosition: 'center',
  maskRepeat: 'no-repeat',
  WebkitMaskRepeat: 'no-repeat',
  maskSize: 'contain',
  WebkitMaskSize: 'contain'
})

export function AirPodsIcon({ size = 40 }: IconProps) {
  return (
    <IconContainer glowColor="#fff" size={size}>
      <img
        src={airpodsImg}
        alt="AirPods"
        className="w-full h-full object-contain"
        style={{
          ...maskStyle(airpodsImg),
          filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.4)) contrast(1.1)'
        }}
      />
    </IconContainer>
  )
}

export function HeadsetIcon({ size = 40 }: IconProps) {
  return (
    <IconContainer glowColor="#fff" size={size}>
      <img
        src={headsetImg}
        alt="Headset"
        className="w-full h-full object-contain scale-110"
        style={{
          ...maskStyle(headsetImg),
          filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.5)) contrast(1.1)'
        }}
      />
    </IconContainer>
  )
}

export function SpeakerIcon({ size = 40 }: IconProps) {
  return (
    <IconContainer glowColor="#fff" size={size}>
      <img
        src={speakerImg}
        alt="Speaker"
        className="w-full h-full object-contain scale-125"
        style={{
          ...maskStyle(speakerImg),
          filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.4)) contrast(1.1)'
        }}
      />
    </IconContainer>
  )
}

export function DeviceGlyph({
  kind,
  size
}: {
  kind: AudioDeviceKind
  size?: number
  className?: string
}): React.JSX.Element {
  if (kind === 'airpods') return <AirPodsIcon size={size} />
  if (kind === 'headset') return <HeadsetIcon size={size} />
  return <SpeakerIcon size={size} />
}
