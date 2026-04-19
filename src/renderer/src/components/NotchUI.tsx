import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, Transition } from 'framer-motion'
import {
  Play,
  Pause,
  Rewind,
  FastForward,
  Monitor,
  Volume,
  Volume2,
  Headphones
} from 'lucide-react'
import cn from 'clsx'

import MarqueeText from './ui/MarqueeText'
import { MusicVisualizer } from './ui/MusicVisualizer'
import { useMedia } from '../hooks/useMedia'
import { SourceBadge } from './ui/SourceBadge'
import { Thumbnail } from './ui/Thumbnail'

const bounceTransition: Transition = { type: 'spring', stiffness: 400, damping: 28, mass: 0.8 }

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '-:--'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function NotchUI() {
  const [isHovering, setIsHovering] = useState(false)
  const [isAutoExpanded, setIsAutoExpanded] = useState(false)
  const [showVolume, setShowVolume] = useState(false)
  const [volumeLevel, setVolumeLevel] = useState(50)

  const isExpanded = isHovering || isAutoExpanded

  const isHoveringRef = useRef(false)
  const autoCollapseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pendingCollapseRef = useRef(false)
  const prevTitleRef = useRef('')

  const {
    title,
    artist,
    isPlaying,
    playbackRate,
    volume,
    albumArt,
    duration,
    position: initialPosition,
    source
  } = useMedia()

  const [position, setPosition] = useState(initialPosition)
  const [displayArt, setDisplayArt] = useState<string | null>(null)

  // Sync position and volume when media updates
  useEffect(() => {
    setPosition(duration > 0 ? Math.min(initialPosition, duration) : initialPosition)
    setVolumeLevel(volume)
  }, [initialPosition, volume, duration])

  // Auto-expand announcement on song change
  useEffect(() => {
    const isValidTitle = title && title !== 'Not Playing' && title !== ''

    if (isValidTitle && title !== prevTitleRef.current) {
      prevTitleRef.current = title

      if (autoCollapseTimerRef.current) {
        clearTimeout(autoCollapseTimerRef.current)
        autoCollapseTimerRef.current = null
      }
      pendingCollapseRef.current = false
      setIsAutoExpanded(true)

      autoCollapseTimerRef.current = setTimeout(() => {
        if (isHoveringRef.current) {
          pendingCollapseRef.current = true
        } else {
          setIsAutoExpanded(false)
        }
      }, 3000)
    } else if (!isValidTitle) {
      prevTitleRef.current = ''
      setIsAutoExpanded(false)
      pendingCollapseRef.current = false
      if (autoCollapseTimerRef.current) {
        clearTimeout(autoCollapseTimerRef.current)
        autoCollapseTimerRef.current = null
      }
    }
  }, [title])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (autoCollapseTimerRef.current) clearTimeout(autoCollapseTimerRef.current)
    }
  }, [])

  // Optimization: Keep previous artwork if incoming is null (delta update)
  useEffect(() => {
    if (albumArt) {
      setDisplayArt(albumArt)
    } else if (!title || title === 'Not Playing' || title === '') {
      setDisplayArt(null)
    }
  }, [albumArt, title])

  const playbackRateRef = useRef(playbackRate)
  playbackRateRef.current = playbackRate

  // Smooth position increment between backend ticks
  const durationRef = useRef(duration)
  useEffect(() => {
    durationRef.current = duration
  }, [duration])

  useEffect(() => {
    let last = performance.now()
    let rafId: number
    const tick = (now: number) => {
      const delta = (now - last) / 1000
      last = now
      if (playbackRateRef.current > 0) {
        setPosition((p) => {
          const next = p + delta * playbackRateRef.current
          return durationRef.current > 0 ? Math.min(next, durationRef.current) : next
        })
      }
      rafId = requestAnimationFrame(tick)
    }
    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [])

  const handlePlayPause = () => window.api.playPause()

  const handleNext = () => window.api.mediaNext()
  const handlePrev = () => window.api.mediaPrevious()

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const level = Number(e.target.value)
    setVolumeLevel(level)
    window.api.setVolume(level)
  }

  const handleShowVolume = () => setShowVolume((v) => !v)

  const progressPct = duration > 0 ? (position / duration) * 100 : 0

  return (
    <motion.div
      onMouseEnter={() => {
        setIsHovering(true)
        isHoveringRef.current = true
      }}
      onMouseLeave={() => {
        setIsHovering(false)
        isHoveringRef.current = false
        if (pendingCollapseRef.current) {
          pendingCollapseRef.current = false
          setIsAutoExpanded(false)
        }
        setShowVolume(false)
      }}
      initial={false}
      animate={{
        width: isExpanded ? 350 : 270,
        height: isExpanded ? (showVolume ? 240 : 180) : 33.8
      }}
      transition={bounceTransition}
      className={cn(
        'relative bg-black overflow-hidden origin-top transition-shadow duration-500',
        isExpanded
          ? 'border border-white/10 shadow-[0_0_60px_rgba(0,0,0,0.8),0_0_30px_var(--color-purple-glow)]/10'
          : 'border-none shadow-none'
      )}
      style={{
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
        borderBottomLeftRadius: isExpanded ? 40 : 17,
        borderBottomRightRadius: isExpanded ? 40 : 17,
        borderTop: 'none',
        marginTop: '-1px',
        padding: isExpanded ? '20px' : '10px'
      }}
    >
      <AnimatePresence mode="wait">
        {!isExpanded ? (
          <motion.div
            key="collapsed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-between p-10 h-full"
          >
            <div className="relative">
              <Thumbnail src={displayArt} alt={title} size="pill" />
            </div>
            <MusicVisualizer isPlaying={isPlaying} />
          </motion.div>
        ) : (
          <motion.div
            key="expanded"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ paddingTop: '12px' }}
            className="flex flex-col h-full p-[22px] justify-between relative backdrop-blur-2xl shadow-inner"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-12 h-10 bg-gray rounded-md flex items-center justify-center overflow-hidden shadow-lg border border-white/5 relative">
                    <Thumbnail src={displayArt} alt={title} size="expanded" />
                  </div>
                  {source && (
                    <div className="absolute -bottom-1 right-0 flex items-center justify-center p-1">
                      <div className="size-full flex items-center justify-center">
                        <SourceBadge source={source} />
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex flex-col justify-start items-start min-w-0 flex-1">
                  <MarqueeText
                    text={title || 'Nothing Playing'}
                    className="text-text font-bold text-base tracking-wide max-w-[190px]"
                    speed={25}
                  />
                  <MarqueeText
                    text={artist || '—'}
                    className="text-text-dim text-center font-semibold text-sm tracking-wide max-w-[190px]"
                    speed={25}
                  />
                </div>
              </div>
              <div className="w-fit flex justify-end items-center">
                <AnimatePresence mode="wait">
                  {isPlaying && (
                    <motion.div
                      key="visualizer"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.2 }}
                    >
                      <MusicVisualizer isPlaying={isPlaying} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {(() => {
              const browserSources = ['brave', 'chrome', 'youtube', 'safari']
              const isStream = duration === 0 && browserSources.includes(source)

              if (isStream) {
                return (
                  <div className="flex items-center gap-3 text-[12px] font-medium text-text-dim tracking-widest mt-2">
                    <span className="text-white/50">LIVE</span>
                    <div className="flex-1 h-[5px] bg-gray rounded-full overflow-hidden relative">
                      {isPlaying && (
                        <motion.div
                          className="absolute inset-0 h-full rounded-full"
                          style={{
                            background:
                              'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.6) 50%, transparent 100%)',
                            width: '40%'
                          }}
                          animate={{ x: ['-100%', '350%'] }}
                          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                        />
                      )}
                    </div>
                    <span className="min-w-[40px] text-right text-white/30">∞</span>
                  </div>
                )
              }

              return (
                <div className="flex items-center gap-3 text-[12px] font-medium text-text-dim tracking-widest mt-2">
                  <span>{formatTime(position)}</span>
                  <div className="flex-1 h-[5px] bg-gray rounded-full overflow-hidden">
                    <div
                      className="h-full bg-white/80 rounded-full transition-none"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                  {duration > 0 && (
                    <span className="min-w-[40px] text-right">{formatTime(duration)}</span>
                  )}
                </div>
              )
            })()}

            <div className="flex items-center justify-center relative mt-1">
              <div className="absolute text-white size-[40px] left-2 rounded-xl flex items-center justify-center cursor-pointer transition-colors hover:bg-white/20">
                <Headphones size={20} />
              </div>

              <div className="flex items-center gap-4 text-white">
                <button
                  onClick={handlePrev}
                  className="size-[40px] rounded-xl flex items-center justify-center cursor-pointer transition-colors hover:bg-white/20"
                >
                  <Rewind size={20} />
                </button>
                <button
                  onClick={handlePlayPause}
                  className="size-[40px] rounded-xl flex items-center justify-center cursor-pointer transition-colors hover:bg-white/20"
                >
                  {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                </button>
                <button
                  onClick={handleNext}
                  className="size-[40px] rounded-xl flex items-center justify-center cursor-pointer transition-colors hover:bg-white/20"
                >
                  <FastForward size={20} />
                </button>
              </div>

              <button
                onClick={handleShowVolume}
                className="absolute right-0 size-[40px] rounded-xl flex items-center justify-center cursor-pointer transition-colors hover:bg-white/20"
              >
                <Monitor size={20} className={showVolume ? 'text-white' : 'text-text'} />
              </button>
            </div>

            <AnimatePresence>
              {showVolume && (
                <motion.div
                  initial={{ height: 0, opacity: 0, marginTop: 0 }}
                  animate={{ height: 'auto', opacity: 1, marginTop: 12 }}
                  exit={{ height: 0, opacity: 0, marginTop: 0 }}
                  className="flex items-center gap-3 text-text-dim px-1 overflow-hidden"
                >
                  <Volume size={16} />
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={volumeLevel}
                    onChange={handleVolumeChange}
                    className="flex-1 h-[5px] rounded-full appearance-none outline-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-md transition-all duration-75"
                    style={{
                      background: `linear-gradient(to right, rgba(255,255,255,0.9) ${volumeLevel}%, var(--color-gray) ${volumeLevel}%)`
                    }}
                  />
                  <Volume2 size={16} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
