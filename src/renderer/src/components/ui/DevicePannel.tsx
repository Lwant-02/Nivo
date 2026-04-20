import { motion, AnimatePresence, Transition } from 'framer-motion'
import { useAudioOutput } from '../../hooks/useAudioOutput'
import { AirPodsIcon, HeadsetIcon, SpeakerIcon } from './DeviceIcons'

const PANEL_SPRING: Transition = {
  type: 'spring',
  stiffness: 350,
  damping: 35,
  mass: 1
}

export function DevicePannel({ show }: { show: boolean }): React.JSX.Element {
  const audioOutput = useAudioOutput()

  return (
    <AnimatePresence initial={false}>
      {show && (
        <motion.div
          key="device-panel-wrapper"
          initial={{ height: 0, opacity: 0, scale: 0.98 }}
          animate={{ height: 'auto', opacity: 1, scale: 1 }}
          exit={{ height: 0, opacity: 0, scale: 0.98 }}
          transition={PANEL_SPRING}
          className="overflow-hidden w-full origin-top"
        >
          <div className="grid grid-cols-3 w-full gap-3 p-1">
            {['airpods', 'headset', 'speakers'].map((k) => {
              const isActive = audioOutput.kind === k
              const Icon =
                k === 'airpods' ? AirPodsIcon : k === 'headset' ? HeadsetIcon : SpeakerIcon

              return <DeviceBox key={k} k={k} isActive={isActive} Icon={Icon} />
            })}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

const DeviceBox = ({
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
      className="relative h-[85px] w-full flex items-center justify-center rounded-[22px] flex-col gap-1.5 overflow-hidden transition-all duration-300"
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

      <Icon size={40} />

      <div className="flex flex-col items-center mt-[-6px] pb-1">
        <motion.span layout className="text-[10px] text-center font-bold tracking-tight opacity-90">
          {k === 'airpods' ? 'AirPods' : k === 'headset' ? 'Headset' : 'Built-in'}
        </motion.span>
      </div>
    </motion.div>
  )
}
