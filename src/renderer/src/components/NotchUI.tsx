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
import { ChevronsLeft, ChevronsRight } from 'lucide-react'
import cn from 'clsx'

import { useMedia } from '../hooks/useMedia'
import { useSound } from '../hooks/useSound'
import { useSettings } from '../hooks/useSettings'
import { getNotchTheme } from '@renderer/util/notchThemes'
import { VolumeSwitcher } from './ui/VolumeSwitcher'
import { CalendarPane } from './ui/CalendarPane'
import { LottieVisualizer } from './ui/LottieVisualizer'
import { IdleView } from './ui/IdleView'
import { WelcomeView } from './ui/WelcomeView'
import { FocusView } from './ui/FocusView'
import { useFocusTimer } from '../hooks/useFocusTimer'
import { ExpandedMediaView } from './ui/ExpandedMediaView'
import { NotchToast } from './ui/NotchToast'
import { CollapsedNotchView } from './ui/CollapsedNotchView'
import { AtmosphericAura } from './ui/AtmosphericAura'
import { useWeather } from '../hooks/useWeather'

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
        'Nivo | Focus Complete',
        mins === 1 ? 'Test session done' : `${mins} min session done`
      )
      if (settings.hapticFeedback) window.api.triggerHaptic()
      playNotification()
    }
  })

  const collapsedWidth = focusTimer.isActive ? 360 : 280
  const showVolume = sidePanel === 'volume'

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

  // Inform main process when notch should be visible/active (e.g. welcome, focus, or toast)
  useEffect(() => {
    const active = isAutoExpanded || isWelcoming || focusTimer.isActive
    window.api.setNotchActive(active)
  }, [isAutoExpanded, isWelcoming, focusTimer.isActive])

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
  const expandedHeight = showVolume ? 270 : showSidePane ? 240 : 180

  const isIdle = !title || title === 'Not Playing'
  const showLottie = !isPlaying && !isExpanded && settings.showLottieOnPause && !focusTimer.isActive
  const showWelcome = isExpanded && !settings.hasSeenWelcome
  const showIdleView = isExpanded && isIdle && settings.hasSeenWelcome && !focusTimer.isActive
  const showFocusView = isExpanded && focusTimer.isActive

  const notchTheme = getNotchTheme(settings.notchTheme)
  const { weatherState } = useWeather()

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
        isExpanded ? 'backdrop-blur-3xl' : ''
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
        className="relative flex h-full backdrop-blur-3xl shadow-inner"
        style={{ background: isExpanded ? notchTheme.innerBg : notchTheme.collapsedBg }}
      >
        {isExpanded && notchTheme.innerOverlay && (
          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none"
            style={{ background: notchTheme.innerOverlay }}
          />
        )}
        {isExpanded && settings.showWeather && weatherState && (
          <AtmosphericAura weatherState={weatherState} variant="background" />
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
            <NotchToast toast={toast} />
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
                <CollapsedNotchView
                  focusTimer={focusTimer}
                  settings={settings}
                  displayArt={displayArt}
                  title={title}
                  isPlaying={isPlaying}
                  showLottie={showLottie}
                />
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
                  <WelcomeView notchTheme={notchTheme} />
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
                    <ExpandedMediaView
                      title={title}
                      artist={artist}
                      isPlaying={isPlaying}
                      duration={duration}
                      position={position}
                      source={source}
                      displayArt={displayArt}
                      settings={settings}
                      isTransitioning={isTransitioning}
                      onPlayPause={handlePlayPause}
                      onNext={handleNext}
                      onPrev={handlePrev}
                      onShowVolume={handleShowVolume}
                      onOpenSettings={() => window.api.openSettings()}
                      onStartFocus={() => focusTimer.start()}
                      showVolume={showVolume}
                      progressPct={progressPct}
                    />

                    <AnimatePresence mode="wait" initial={false}>
                      {showVolume && (
                        <VolumeSwitcher
                          showVolume={showVolume}
                          volumeLevel={volumeLevel}
                          handleVolumeChange={handleVolumeChange}
                        />
                      )}
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
