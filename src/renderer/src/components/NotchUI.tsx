import React, { useState, useEffect, useRef } from 'react'
import {
  motion,
  AnimatePresence,
  Transition,
  useMotionValue,
  useTransform,
  useMotionValueEvent,
  PanInfo
} from 'framer-motion'
import {
  Play,
  Pause,
  Rewind,
  FastForward,
  Headphones,
  ChevronsLeft,
  ChevronsRight,
  Settings,
  Timer
} from 'lucide-react'
import cn from 'clsx'

import MarqueeText from './ui/MarqueeText'
import { useMedia } from '../hooks/useMedia'
import { useSound } from '../hooks/useSound'
import { useSettings } from '../hooks/useSettings'
import { Thumbnail } from './ui/Thumbnail'
import { formatTime } from '@renderer/util'
import { getNotchTheme } from '@renderer/util/notchThemes'
import { VolumeSwitcher } from './ui/VolumeSwitcher'
import { DevicePannel } from './ui/DevicePannel'
import { CalendarPane } from './ui/CalendarPane'
import { MusicVisualizer } from './ui/MusicVisualizer'
import { SourceBadge } from './ui/SourceBadge'
import { LottieVisualizer } from './ui/LottieVisualizer'
import { IdleView } from './ui/IdleView'
import { WelcomeView } from './ui/WelcomeView'
import { FocusView } from './ui/FocusView'
import { useFocusTimer } from '../hooks/useFocusTimer'
import { DotLottieReact } from '@lottiefiles/dotlottie-react'

const bounceTransition: Transition = { type: 'spring', stiffness: 400, damping: 28, mass: 0.8 }

const SWIPE_THRESHOLD = 100
const SWIPE_COOLDOWN_MS = 600
const TRANSITION_HOLD_MS = 1200

const BRAND_COLORS: Record<string, string> = {
  spotify: '#1DB954',
  music: '#FA243C',
  youtube: '#FF0033',
  chrome: '#4285F4',
  brave: '#FB542B',
  safari: '#1B72E8',
  system: '#FFFFFF'
}

type SidePanel = 'volume' | 'device' | null

const MEDIA_PANE_WIDTH = 350
const CALENDAR_PANE_WIDTH = 300

export default function NotchUI() {
  const { settings, ready: settingsReady, update: updateSetting } = useSettings()
  const [isHovering, setIsHovering] = useState(false)
  const [toast, setToast] = useState<{ title: string; body: string } | null>(null)
  const toastTimeout = useRef<NodeJS.Timeout | null>(null)
  const [isAutoExpanded, setIsAutoExpanded] = useState(false)
  const [isWelcoming, setIsWelcoming] = useState(false)
  const welcomeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [sidePanel, setSidePanel] = useState<SidePanel>(null)
  const [volumeLevel, setVolumeLevel] = useState(50)
  const { playExpand, playNotification } = useSound()

  const focusTimer = useFocusTimer({
    defaultMinutes: settings.focusDuration ?? 25,
    onComplete: () => {
      const mins = settings.focusDuration ?? 25
      window.api.showLumeToast(
        'Focus Complete',
        mins === 1 ? 'Test session done' : `${mins} min session done`
      )
      if (settings.hapticFeedback) window.api.triggerHaptic()
      playNotification()
    }
  })

  const collapsedWidth = focusTimer.isActive ? 360 : 280

  const showVolume = sidePanel === 'volume'
  const showDevice = sidePanel === 'device'

  const isExpanded = isHovering || isAutoExpanded || isWelcoming
  const showSidePane = isExpanded && settings.enableCalendar

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
  const hasSyncedInitial = useRef(false)
  useEffect(() => {
    const valid = duration > 0
    const pos = valid ? Math.min(initialPosition, duration) : initialPosition

    // Force snap on first load or song change
    if (!hasSyncedInitial.current || title !== prevTitleRef.current) {
      setPosition(pos)
      if (title) hasSyncedInitial.current = true
    } else {
      // Regular periodic sync from backend
      setPosition(pos)
    }
  }, [initialPosition, duration, title])

  useEffect(() => {
    setVolumeLevel(volume)
  }, [volume])

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
      playExpand()

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

  // Auto-show welcome notch for 5s on first launch after license activation
  useEffect(() => {
    window.api.setNotchActive(focusTimer.isActive)
  }, [focusTimer.isActive])

  useEffect(() => {
    if (!settingsReady || settings.hasSeenWelcome) return

    setIsWelcoming(true)
    playExpand()

    welcomeTimerRef.current = setTimeout(() => {
      setIsWelcoming(false)
      updateSetting('hasSeenWelcome', true)
    }, 8000)

    return () => {
      if (welcomeTimerRef.current) {
        clearTimeout(welcomeTimerRef.current)
        welcomeTimerRef.current = null
      }
    }
  }, [settingsReady, settings.hasSeenWelcome])

  useEffect(() => {
    const unsub = window.api.onLumeToast((data) => {
      if (toastTimeout.current) clearTimeout(toastTimeout.current)
      setToast(data)
      setIsAutoExpanded(true)
      playExpand()
      toastTimeout.current = setTimeout(() => {
        setToast(null)
        if (!isHoveringRef.current) setIsAutoExpanded(false)
      }, 5000)
    })
    return unsub
  }, [])

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

  // Swipe gesture: x → rotate/scale + reveal background icons
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-150, 0, 150], [-5, 0, 5])
  const scale = useTransform(x, [-150, 0, 150], [0.98, 1, 0.98])
  const nextIconOpacity = useTransform(x, [0, 60, SWIPE_THRESHOLD], [0, 0.35, 1])
  const prevIconOpacity = useTransform(x, [-SWIPE_THRESHOLD, -60, 0], [1, 0.35, 0])

  const [thresholdCrossed, setThresholdCrossed] = useState<'next' | 'prev' | null>(null)
  useMotionValueEvent(x, 'change', (latest) => {
    if (latest > SWIPE_THRESHOLD) setThresholdCrossed((c) => (c === 'next' ? c : 'next'))
    else if (latest < -SWIPE_THRESHOLD) setThresholdCrossed((c) => (c === 'prev' ? c : 'prev'))
    else if (Math.abs(latest) < SWIPE_THRESHOLD - 5)
      setThresholdCrossed((c) => (c === null ? c : null))
  })

  const lastSwipeAtRef = useRef(0)
  const transitionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [isTransitioning, setIsTransitioning] = useState(false)

  useEffect(() => {
    return () => {
      if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current)
    }
  }, [])

  // Cancel optimistic state once new track metadata actually arrives
  useEffect(() => {
    if (!isTransitioning) return
    if (transitionTimerRef.current) {
      clearTimeout(transitionTimerRef.current)
      transitionTimerRef.current = null
    }
    setIsTransitioning(false)
  }, [title, artist])

  const triggerSwipe = (direction: 'next' | 'prev') => {
    const now = Date.now()
    if (now - lastSwipeAtRef.current < SWIPE_COOLDOWN_MS) return
    lastSwipeAtRef.current = now

    setIsTransitioning(true)
    if (direction === 'next') window.api.mediaNext()
    else window.api.mediaPrevious()

    if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current)
    transitionTimerRef.current = setTimeout(() => {
      setIsTransitioning(false)
      transitionTimerRef.current = null
    }, TRANSITION_HOLD_MS)
  }

  const handleDragEnd = (_e: PointerEvent, info: PanInfo) => {
    if (info.offset.x > SWIPE_THRESHOLD) triggerSwipe('next')
    else if (info.offset.x < -SWIPE_THRESHOLD) triggerSwipe('prev')
  }

  const brandColor = BRAND_COLORS[source] || BRAND_COLORS.system
  const nextActive = thresholdCrossed === 'next'
  const prevActive = thresholdCrossed === 'prev'

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const level = Number(e.target.value)
    setVolumeLevel(level)
    window.api.setVolume(level)
  }

  const handleShowVolume = (): void => setSidePanel((p) => (p === 'volume' ? null : 'volume'))

  const progressPct = duration > 0 ? (position / duration) * 100 : 0

  const mediaPaneWidth = isExpanded ? MEDIA_PANE_WIDTH : collapsedWidth
  const sidePaneExtra = showSidePane ? CALENDAR_PANE_WIDTH + 1 : 0
  const totalWidth = mediaPaneWidth + sidePaneExtra
  const expandedHeight = showDevice || showVolume ? 270 : showSidePane ? 240 : 180

  const isIdle = !title || title === 'Not Playing'
  const showLottie = !isPlaying && !isExpanded && settings.showLottieOnPause && !focusTimer.isActive
  const showWelcome = isExpanded && !settings.hasSeenWelcome
  const showIdleView = isExpanded && isIdle && settings.hasSeenWelcome && !focusTimer.isActive
  const showFocusView = isExpanded && focusTimer.isActive

  const notchTheme = getNotchTheme(settings.notchTheme)

  return (
    <motion.div
      onMouseEnter={() => {
        if (!isExpanded) playExpand()
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
        setSidePanel(null)
      }}
      initial={false}
      animate={{
        width: totalWidth,
        height: isExpanded ? expandedHeight : 33.8
      }}
      transition={bounceTransition}
      className={cn(
        'relative overflow-hidden origin-top transition-shadow duration-500',
        isExpanded ? 'backdrop-blur-2xl' : ''
      )}
      style={{
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
        borderBottomLeftRadius: isExpanded ? 40 : 17,
        borderBottomRightRadius: isExpanded ? 40 : 17,
        borderTop: 'none',
        marginTop: '-1px',
        background: isExpanded ? notchTheme.outerBg : 'transparent',
        border: isExpanded ? `1px solid ${notchTheme.outerBorder}` : 'none',
        borderTopWidth: 0,
        boxShadow: 'none'
      }}
    >
      <div
        className="relative flex h-full backdrop-blur-2xl shadow-inner"
        style={{ background: isExpanded ? notchTheme.innerBg : notchTheme.collapsedBg }}
      >
        {isExpanded && notchTheme.innerOverlay && (
          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none"
            style={{ background: notchTheme.innerOverlay }}
          />
        )}
        {showLottie && <LottieVisualizer width={isExpanded ? totalWidth : collapsedWidth} />}
        <div
          className="relative shrink-0 h-full"
          style={{
            width: mediaPaneWidth,
            padding: isExpanded ? '20px' : '10px'
          }}
        >
          {isExpanded && (
            <>
              <motion.div
                aria-hidden
                style={{
                  opacity: nextIconOpacity,
                  color: nextActive ? brandColor : 'rgba(255,255,255,0.55)',
                  filter: nextActive ? `drop-shadow(0 0 10px ${brandColor})` : 'none'
                }}
                className="absolute left-3 top-1/2 -translate-y-1/2 z-0 pointer-events-none transition-[color,filter] duration-150"
              >
                <ChevronsRight size={28} strokeWidth={2.5} />
              </motion.div>
              <motion.div
                aria-hidden
                style={{
                  opacity: prevIconOpacity,
                  color: prevActive ? brandColor : 'rgba(255,255,255,0.55)',
                  filter: prevActive ? `drop-shadow(0 0 10px ${brandColor})` : 'none'
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-0 pointer-events-none transition-[color,filter] duration-150"
              >
                <ChevronsLeft size={28} strokeWidth={2.5} />
              </motion.div>
            </>
          )}

          <AnimatePresence>
            {toast && (
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                className="absolute inset-0 z-200 flex items-center justify-center px-4 rounded-[inherit] backdrop-blur-3xl"
                style={{
                  background:
                    'radial-gradient(120% 80% at 50% 0%, var(--lume-accent-glow, rgba(168,85,247,0.25)) 0%, rgba(0,0,0,1) 60%, rgba(0,0,0,1) 100%)'
                }}
              >
                <div className="flex items-center gap-3 text-left">
                  <div
                    className="relative size-[96px] shrink-0 rounded-full overflow-hidden"
                    style={{
                      background:
                        'radial-gradient(circle, var(--lume-accent-glow, rgba(168,85,247,0.35)) 0%, transparent 70%)'
                    }}
                  >
                    <DotLottieReact
                      src="https://lottie.host/35d8a45e-69c7-47f2-b712-34a7d743d088/quPIsQA9QD.lottie"
                      loop
                      autoplay
                      style={{ width: '100%', height: '100%' }}
                    />
                  </div>
                  <div className="flex flex-col min-w-0 flex-1">
                    <span
                      className="text-[10px] font-bold uppercase tracking-[0.22em]"
                      style={{ color: 'var(--lume-accent, #a855f7)' }}
                    >
                      {toast.body}
                    </span>
                    <h3 className="text-white text-[18px] font-bold tracking-tight leading-tight mt-1">
                      {toast.title}
                    </h3>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {toast ? null : !isExpanded ? (
              <motion.div
                key="collapsed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={cn('flex items-center px-6 h-full justify-between')}
              >
                {focusTimer.isActive ? (
                  <div
                    className="flex items-center w-full justify-between h-full"
                    style={{ paddingLeft: '16px', paddingRight: '12px' }}
                  >
                    <div className="flex items-center" style={{ gap: '10px' }}>
                      <span
                        className="text-[10px] font-bold uppercase tracking-[0.24em]"
                        style={{ color: 'var(--lume-accent, #a855f7)' }}
                      >
                        {focusTimer.isPaused ? 'Paused' : 'Focus'}
                      </span>
                    </div>

                    {/* Right side circular progress */}
                    <div className="relative size-6 flex items-center justify-center">
                      <svg width="20" height="20" viewBox="0 0 20 20" className="-rotate-90">
                        <circle
                          cx="10"
                          cy="10"
                          r="8"
                          stroke="rgba(255,255,255,0.1)"
                          strokeWidth="2"
                          fill="transparent"
                        />
                        <motion.circle
                          cx="10"
                          cy="10"
                          r="8"
                          stroke="var(--lume-accent, #a855f7)"
                          strokeWidth="2"
                          strokeDasharray={2 * Math.PI * 8}
                          initial={false}
                          animate={{
                            strokeDashoffset:
                              2 * Math.PI * 8 - focusTimer.progress * 2 * Math.PI * 8
                          }}
                          transition={{ duration: 0.9, ease: 'linear' }}
                          strokeLinecap="round"
                          fill="transparent"
                          style={{
                            filter: 'drop-shadow(0 0 4px var(--lume-accent))'
                          }}
                        />
                      </svg>
                    </div>
                  </div>
                ) : (
                  !showLottie && (
                    <>
                      <Thumbnail
                        src={settings.showAlbumArt ? displayArt : null}
                        alt={title}
                        size="pill"
                        isPlaying={isPlaying}
                      />
                      <MusicVisualizer isPlaying={isPlaying} isStatic={!settings.showVisualizer} />
                    </>
                  )
                )}
              </motion.div>
            ) : (
              <motion.div
                key="expanded"
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.7}
                dragMomentum={false}
                dragTransition={{ bounceStiffness: 400, bounceDamping: 30 }}
                onDragEnd={handleDragEnd}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                  x,
                  rotate,
                  scale,
                  paddingTop: '12px',
                  cursor: 'grab',
                  touchAction: 'pan-y'
                }}
                whileDrag={{ cursor: 'grabbing' }}
                className="flex flex-col h-full p-[22px] justify-between relative z-10"
              >
                {showWelcome ? (
                  <WelcomeView />
                ) : showFocusView ? (
                  <FocusView
                    {...focusTimer}
                    onPause={focusTimer.pause}
                    onResume={focusTimer.resume}
                    onStop={focusTimer.stop}
                  />
                ) : showIdleView ? (
                  <IdleView
                    onStartFocus={() => focusTimer.start()}
                    focusMinutes={settings.focusDuration ?? 25}
                  />
                ) : (
                  <>
                    <div className="flex relative items-center justify-between">
                      <button
                        onClick={() => window.api.openSettings()}
                        className="absolute -top-6 right-2.5 flex items-center justify-center cursor-pointer"
                      >
                        <Settings
                          size={15}
                          className="transition-colors duration-200"
                          style={{
                            color: 'var(--lume-text-dim)'
                          }}
                        />
                      </button>
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
                              <MusicVisualizer
                                isPlaying={isPlaying}
                                isStatic={!settings.showVisualizer}
                              />
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
                        )
                      }

                      return (
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
                          {duration > 0 && (
                            <span className="min-w-[40px] text-right">{formatTime(duration)}</span>
                          )}
                        </div>
                      )
                    })()}

                    <div className="flex items-center justify-center relative mt-1">
                      <div className="absolute left-0">
                        <button
                          onClick={handleShowVolume}
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
                          onClick={handlePrev}
                          className="size-[40px] rounded-xl flex items-center justify-center cursor-pointer transition-all hover:bg-white/10 active:scale-95"
                        >
                          <Rewind size={20} />
                        </button>
                        <button
                          onClick={handlePlayPause}
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
                          onClick={handleNext}
                          className="size-[40px] rounded-xl flex items-center justify-center cursor-pointer transition-all hover:bg-white/20 active:scale-95"
                        >
                          <FastForward size={20} />
                        </button>
                      </div>

                      <button
                        onClick={() => focusTimer.start()}
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

                    <AnimatePresence mode="wait" initial={false}>
                      {showVolume && (
                        <VolumeSwitcher
                          showVolume={showVolume}
                          volumeLevel={volumeLevel}
                          handleVolumeChange={handleVolumeChange}
                        />
                      )}
                      {showDevice && <DevicePannel show={showDevice} />}
                    </AnimatePresence>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {showSidePane && <CalendarPane />}
      </div>
    </motion.div>
  )
}
