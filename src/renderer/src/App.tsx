import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, Variants } from 'framer-motion'
import { clsx } from 'clsx'

// Types
interface MediaState {
  isPlaying: boolean
  title: string
  artist: string
  source: string
  coverArt?: string
}

const notchVariants: Variants = {
  collapsed: {
    width: 220,
    height: 36,
    borderRadius: 18,
    transition: { type: 'spring', stiffness: 400, damping: 25, mass: 0.8 }
  },
  expanded: {
    width: 420,
    height: 180,
    borderRadius: 40,
    transition: { type: 'spring', stiffness: 300, damping: 25, mass: 0.9 }
  }
}

const contentVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.2, delay: 0.05 } }
}

function App(): React.JSX.Element {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const hoverTimeout = useRef<NodeJS.Timeout | null>(null)

  const [media, setMedia] = useState<MediaState>({
    isPlaying: false,
    title: 'Not Playing',
    artist: 'Select a source',
    source: 'System'
  })

  // Date formatted like in the screenshot
  const today = new Date()
  const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
  const currentDay = days[today.getDay()]
  const currentDate = today.getDate().toString()

  useEffect(() => {
    const loadData = async () => {
      try {
        const initialMedia = await window.api.getMediaState()
        setMedia(initialMedia)
      } catch (error) {
        console.error('Failed to load initial data:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()

    const updateMedia = async () => {
      const currentMedia = await window.api.getMediaState()
      setMedia(currentMedia)
    }

    const mediaInterval = setInterval(updateMedia, 2000)
    return () => clearInterval(mediaInterval)
  }, [])

  const handlePlayPause = async () => {
    await window.api.playPause()
    setMedia((prev) => ({ ...prev, isPlaying: !prev.isPlaying }))
  }

  const handleMouseEnter = () => {
    hoverTimeout.current = setTimeout(() => {
      if (window.api && window.api.setIgnoreMouseEvents) {
        window.api.setIgnoreMouseEvents(false)
      }
      setIsExpanded(true)
    }, 200)
  }

  const handleMouseLeave = () => {
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current)
    if (window.api && window.api.setIgnoreMouseEvents) {
      window.api.setIgnoreMouseEvents(true, { forward: true })
    }
    setIsExpanded(false)
  }

  // Handle double clicking or manual exit if needed
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 rounded-full border-2 border-purple-500/30 border-t-purple-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-start pointer-events-none">
      <motion.div
        className={clsx(
          'relative overflow-hidden cursor-default bg-yellow-500 pointer-events-auto origin-top'
        )}
        variants={notchVariants}
        initial="collapsed"
        animate={isExpanded ? 'expanded' : 'collapsed'}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{ marginTop: '0px' }}
      >
        {/* Collapsed State - Minimal Reference Match */}
        <AnimatePresence>
          {!isExpanded && (
            <motion.div
              className="absolute inset-0 flex items-center justify-between px-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="w-5 h-5 rounded-[4px] bg-linear-to-br from-pink-400 to-purple-500 shadow-sm shrink-0" />

              <div className="flex items-center gap-[2px] pr-1">
                <div className="w-[3px] h-2 bg-yellow-500 rounded-full animate-pulse" />
                <div className="w-[3px] h-3 bg-yellow-500 rounded-full animate-pulse delay-75" />
                <div className="w-[3px] h-2.5 bg-yellow-500 rounded-full animate-pulse delay-150" />
                <div className="w-[3px] h-1.5 bg-yellow-500 rounded-full animate-pulse delay-300" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Expanded State - 2 Column Match */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              className="p-6 h-full flex flex-row items-stretch gap-6 relative"
              variants={contentVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              {/* Left Column - Media */}
              <div className="flex flex-col w-[55%] h-full justify-between">
                {/* Horizontal Album Art Placeholder */}
                <div className="w-[72px] h-[40px] rounded-md bg-linear-to-br from-indigo-500 to-purple-600 shadow-md shrink-0 mb-auto" />

                <div className="flex flex-col flex-none min-w-0 mb-4">
                  <h3 className="text-[17px] font-bold text-white truncate leading-tight tracking-wide">
                    {media.title}
                  </h3>
                  <p className="text-[14px] font-medium text-white/50 truncate mt-0.5">
                    {media.artist}
                  </p>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-7">
                  {/* Rewind */}
                  <button className="text-white hover:text-white/80 transition-colors cursor-pointer flex items-center justify-center">
                    <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                      <path d="M11 18V6l-8.5 6 8.5 6zm.5-6l8.5 6V6l-8.5 6z" />
                    </svg>
                  </button>
                  {/* Play/Pause */}
                  <button
                    onClick={handlePlayPause}
                    className="text-white hover:text-white/80 transition-colors cursor-pointer flex items-center justify-center"
                  >
                    {media.isPlaying ? (
                      <svg className="w-7 h-7 fill-current" viewBox="0 0 24 24">
                        <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                      </svg>
                    ) : (
                      <svg className="w-7 h-7 fill-current" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    )}
                  </button>
                  {/* Fast Forward */}
                  <button className="text-white hover:text-white/80 transition-colors cursor-pointer flex items-center justify-center">
                    <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                      <path d="M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Divider */}
              <div className="w-px] bg-white/10 my-2" />

              {/* Right Column - Calendar */}
              <div className="flex flex-col w-[45%] h-full relative pl-2">
                {/* Date Top Right */}
                <div className="absolute top-0 right-0 flex flex-col items-end pt-1 pr-1">
                  <span className="text-[11px] font-bold text-[#ff3b30] tracking-widest">
                    {currentDay}
                  </span>
                  <span className="text-[42px] leading-none font-normal text-white">
                    {currentDate}
                  </span>
                </div>

                {/* Events Text Centered */}
                <div className="flex flex-col justify-end pb-5 h-full">
                  <span className="text-[14px] font-bold text-white/80">No events today</span>
                  <span className="text-[14px] font-semibold text-white/40 mt-1">
                    Your day is clear
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

export default App
