import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Settings, Timer, Rewind, Play, Pause, FastForward, Headphones, Keyboard } from 'lucide-react'
import MarqueeText from './MarqueeText'
import { Thumbnail } from './Thumbnail'
import { MusicVisualizer } from './MusicVisualizer'
import { SourceBadge } from './SourceBadge'
import { formatTime } from '@renderer/util'

interface ExpandedMediaViewProps {
  title: string
  artist: string
  isPlaying: boolean
  duration: number
  position: number
  source: string
  displayArt: string | null
  settings: any
  isTransitioning: boolean
  onPlayPause: () => void
  onNext: () => void
  onPrev: () => void
  onShowVolume: () => void
  onOpenSettings: () => void
  onStartFocus: () => void
  showVolume: boolean
  progressPct: number
}

export const ExpandedMediaView: React.FC<ExpandedMediaViewProps> = ({
  title,
  artist,
  isPlaying,
  duration,
  position,
  source,
  displayArt,
  settings,
  isTransitioning,
  onPlayPause,
  onNext,
  onPrev,
  onShowVolume,
  onOpenSettings,
  onStartFocus,
  showVolume,
  progressPct
}) => {
  const browserSources = ['brave', 'chrome', 'youtube', 'safari']
  const isStream = duration === 0 && browserSources.includes(source)

  return (
    <>
      <div className="flex relative items-center justify-between">
        <div className="absolute -top-6 left-0 flex items-center gap-2">
          <button
            onClick={onOpenSettings}
            className="flex items-center justify-center cursor-pointer"
          >
            <Settings
              size={15}
              className="transition-colors duration-200"
              style={{
                color: 'var(--lume-text-dim)'
              }}
            />
          </button>
          {settings.sonicFeedback && (
            <Keyboard
              size={15}
              aria-label="Sonic Feedback active"
              className="transition-colors duration-200"
              style={{
                color: 'var(--lume-accent)'
              }}
            />
          )}
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-14 h-9 bg-gray rounded-md flex items-center justify-center overflow-hidden shadow-lg border border-white/5 relative">
              <Thumbnail
                src={settings.showAlbumArt ? displayArt : null}
                alt={title}
                size="expanded"
                isPlaying={isPlaying}
              />
            </div>
            {source && (
              <div className="absolute -bottom-1 right-0 flex items-center justify-center p-1">
                <div className="size-full flex items-center justify-center">
                  <SourceBadge source={source} />
                </div>
              </div>
            )}
          </div>
          <div
            className="flex flex-col justify-start items-start min-w-0 flex-1 transition-opacity duration-200"
            style={{ opacity: isTransitioning ? 0.4 : 1 }}
          >
            <MarqueeText
              text={isTransitioning ? '...' : title || 'Nothing Playing'}
              className="text-text font-bold text-base tracking-wide max-w-[190px]"
              speed={25}
            />
            <MarqueeText
              text={isTransitioning ? '' : artist || '—'}
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
                <MusicVisualizer isPlaying={isPlaying} isStatic={!settings.showVisualizer} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {isStream ? (
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
                transition={{
                  duration: 1.8,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
              />
            )}
          </div>
          <span className="min-w-[40px] text-right text-white/30">∞</span>
        </div>
      ) : (
        <div className="flex items-center gap-3 text-[12px] font-medium text-text-dim tracking-widest mt-2">
          <span>{formatTime(position)}</span>
          <div className="flex-1 h-[5px] bg-gray rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-none"
              style={{
                width: `${progressPct}%`,
                background: 'var(--lume-accent, rgba(255,255,255,0.8))'
              }}
            />
          </div>
          {duration > 0 && <span className="min-w-[40px] text-right">{formatTime(duration)}</span>}
        </div>
      )}

      <div className="flex items-center justify-center relative mt-1">
        <div className="absolute left-0">
          <button
            onClick={onShowVolume}
            className="size-[40px] rounded-xl flex items-center justify-center cursor-pointer transition-all hover:bg-white/10 active:scale-95"
          >
            <Headphones
              size={20}
              className="transition-colors duration-200"
              style={{
                color: showVolume ? 'var(--lume-accent)' : 'var(--lume-text-dim)'
              }}
            />
          </button>
        </div>

        <div className="flex items-center gap-4 text-white">
          <button
            onClick={onPrev}
            className="size-[40px] rounded-xl flex items-center justify-center cursor-pointer transition-all hover:bg-white/10 active:scale-95"
          >
            <Rewind size={20} />
          </button>
          <button
            onClick={onPlayPause}
            className="size-[40px] rounded-xl flex items-center justify-center cursor-pointer transition-all hover:bg-white/20 active:scale-95"
            style={{ color: 'var(--lume-accent)' }}
          >
            {isPlaying ? (
              <Pause size={20} fill="currentColor" />
            ) : (
              <Play size={20} fill="currentColor" />
            )}
          </button>
          <button
            onClick={onNext}
            className="size-[40px] rounded-xl flex items-center justify-center cursor-pointer transition-all hover:bg-white/20 active:scale-95"
          >
            <FastForward size={20} />
          </button>
        </div>

        <button
          onClick={onStartFocus}
          className="absolute right-0 size-[40px] rounded-xl flex items-center justify-center cursor-pointer transition-all hover:bg-white/20 active:scale-95"
        >
          <Timer
            size={22}
            className="transition-colors duration-200"
            style={{
              color: 'var(--lume-text-dim)'
            }}
          />
        </button>
      </div>
    </>
  )
}
