import { motion, Transition } from 'framer-motion'
import { useAudioOutput } from '../../hooks/useAudioOutput'
import { AirPodsIcon, HeadsetIcon, SpeakerIcon } from './DeviceIcons'

const PANEL_SPRING: Transition = { type: 'spring', stiffness: 400, damping: 40 }

export function DevicePannel({ show }: { show: boolean }): React.JSX.Element | null {
  const audioOutput = useAudioOutput()

  if (!show) return null

  return (
    <motion.div
      key="device-panel-wrapper"
      initial={{ opacity: 0, scale: 0.96, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96, y: 10 }}
      className="w-full origin-top mt-4"
    >
      <div className="grid grid-cols-3 w-full gap-3 p-1">
        {['airpods', 'headset', 'speakers'].map((k) => {
          const isActive = audioOutput.kind === k
          const Icon = k === 'airpods' ? AirPodsIcon : k === 'headset' ? HeadsetIcon : SpeakerIcon

          return <DeviceBox key={k} k={k} isActive={isActive} Icon={Icon} />
        })}
      </div>
    </motion.div>
  )
}

export const DeviceBox = ({
  k,
  isActive,
  Icon
}: {
  k: string
  isActive: boolean
  Icon: React.ComponentType<{ size?: number }>
}) => {
  return (
    <motion.div
      key={k}
      className="relative h-[80px] w-full flex items-center justify-center rounded-[22px] flex-col gap-1.5 overflow-hidden transition-all duration-300"
      animate={{
        backgroundColor: isActive ? 'rgba(50, 215, 75, 0.08)' : 'rgba(255, 255, 255, 0.03)',
        color: isActive ? '#fff' : 'rgba(255, 255, 255, 0.25)',
        boxShadow: isActive
          ? '0 8px 20px rgba(0,0,0,0.3), inset 0 0 0 1px rgba(50, 215, 75, 0.2)'
          : '0 0 0 rgba(0,0,0,0), inset 0 0 0 1px rgba(255,255,255,0.02)'
      }}
    >
      {isActive && (
        <motion.div
          layoutId="activeGlow"
          className="absolute inset-0 bg-[#32d74b]/5"
          initial={false}
          transition={PANEL_SPRING}
        />
      )}

      <Icon size={30} />

      <div className="flex flex-col items-center mt-[-6px] pb-1">
        <motion.span layout className="text-[10px] text-center font-bold tracking-tight opacity-90">
          {k === 'airpods' ? 'AirPods' : k === 'headset' ? 'Headset' : 'Built-in'}
        </motion.span>
      </div>
    </motion.div>
  )
}
