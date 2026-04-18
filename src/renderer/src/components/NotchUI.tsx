import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, Transition } from 'framer-motion'
import { Play, Pause, Shuffle, Rewind, FastForward, Monitor, Volume, Volume2 } from 'lucide-react'

import cn from 'clsx'
import MarqueeText from './ui/MarqueeText'
import { SoundWave } from './ui/SoundWave'
import defaultArt from '../assets/electron.svg'

const bounceTransition: Transition = { type: 'spring', stiffness: 400, damping: 28, mass: 0.8 }

function formatTime(seconds: number): string {
  if (!seconds || isNaN(seconds)) return '-:--'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function NotchUI() {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showVolume, setShowVolume] = useState(false)
  const [volumeLevel, setVolumeLevel] = useState(50)
  const [title, setTitle] = useState('')
  const [artist, setArtist] = useState('')
  const [albumArt, setAlbumArt] = useState<string | null>(null)
  const [position, setPosition] = useState(0)
  const [duration, setDuration] = useState(0)
  const isPlayingRef = useRef(isPlaying)
  isPlayingRef.current = isPlaying

  // Smooth position increment between polls
  useEffect(() => {
    let last = performance.now()
    let rafId: number
    const tick = (now: number) => {
      const delta = (now - last) / 1000
      last = now
      if (isPlayingRef.current) {
        setPosition((p) => p + delta)
      }
      rafId = requestAnimationFrame(tick)
    }
    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [])

  useEffect(() => {
    const fetchState = async () => {
      try {
        const state = await window.api.getMediaState()
        setIsPlaying(state.isPlaying)
        setTitle(state.title)
        setArtist(state.artist)
        setPosition(state.position)
        setDuration(state.duration)
        setAlbumArt(state.albumArt)
      } catch {}
    }

    fetchState()
    const interval = setInterval(fetchState, 3000)
    return () => clearInterval(interval)
  }, [])

  const handlePlayPause = async () => {
    await window.api.playPause()
    setIsPlaying((p) => !p)
  }

  const handleNext = () => window.api.mediaNext()
  const handlePrev = () => window.api.mediaPrevious()

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const level = Number(e.target.value)
    setVolumeLevel(level)
    window.api.setVolume(level)
  }

  const handleShowVolume = async () => {
    setShowVolume((v) => !v)
    if (!showVolume) {
      try {
        const level = await window.api.getVolume()
        setVolumeLevel(level)
      } catch {}
    }
  }

  const progressPct = duration > 0 ? Math.min((position / duration) * 100, 100) : 0
  const artSrc = albumArt || defaultArt

  return (
    <motion.div
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => {
        setIsExpanded(false)
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
          ? 'border border-white/10 shadow-[0_0_60px_rgba(0,0,0,0.8),0_0_30px_var(--color-purple-glow)]/30'
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
            <img src={artSrc} alt="album art" className="w-6 h-3.5 overflow-hidden object-cover" />

            <SoundWave isPlaying={isPlaying} />
          </motion.div>
        ) : (
          <motion.div
            key="expanded"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ paddingTop: '10px' }}
            className="flex flex-col h-full p-[22px] justify-between relative backdrop-blur-2xl shadow-inner"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="size-[54px] bg-gray rounded-xl flex items-center justify-center shadow-inner overflow-hidden">
                  <img src={artSrc} alt="album art" className="w-full h-full object-cover" />
                </div>
                <div className="flex flex-col justify-start items-start min-w-0 flex-1">
                  <MarqueeText
                    text={title || 'Nothing Playing'}
                    className="text-text font-bold text-base tracking-wide max-w-[160px]"
                    speed={25}
                  />
                  <span className="text-text-dim text-center font-semibold text-sm tracking-wide">
                    {artist || '—'}
                  </span>
                </div>
              </div>
              <div className="w-full flex justify-end items-center">
                <SoundWave isPlaying={isPlaying} size="lg" />
              </div>
            </div>

            <div className="flex items-center gap-3 text-[12px] font-medium text-text-dim tracking-widest mt-2">
              <span>{formatTime(position)}</span>
              <div className="flex-1 h-[5px] bg-gray rounded-full overflow-hidden">
                <div
                  className="h-full bg-white/80 rounded-full transition-none"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <span>{formatTime(duration)}</span>
            </div>

            <div className="flex items-center justify-center relative mt-1">
              <div className="absolute text-white left-2 size-[40px] rounded-xl flex items-center justify-center cursor-pointer transition-colors hover:bg-white/20">
                <Shuffle size={20} fill="currentColor" />
              </div>

              <div className="flex items-center gap-4 text-white">
                <button
                  onClick={handlePrev}
                  className="size-[40px] rounded-xl flex items-center justify-center cursor-pointer transition-colors hover:bg-white/20"
                >
                  <Rewind size={20} fill="currentColor" />
                </button>
                <button
                  onClick={handlePlayPause}
                  className="size-[40px] rounded-xl flex items-center justify-center cursor-pointer transition-colors hover:bg-white/20"
                >
                  {isPlaying ? (
                    <Pause size={20} fill="currentColor" />
                  ) : (
                    <Play size={20} fill="currentColor" />
                  )}
                </button>
                <button
                  onClick={handleNext}
                  className="size-[40px] rounded-xl flex items-center justify-center cursor-pointer transition-colors hover:bg-white/20"
                >
                  <FastForward size={20} fill="currentColor" />
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
