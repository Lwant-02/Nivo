import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, Transition } from 'framer-motion'
import {
  IconHome,
  IconClipboardText,
  IconClock,
  IconKeyboard,
  IconSettings,
  IconCopy,
  IconBolt
} from '@tabler/icons-react'

import { useMedia } from '../hooks/useMedia'
import { useSound } from '../hooks/useSound'
import { useSettings } from '../hooks/useSettings'
import { useSonicFeedback } from '../hooks/useSonicFeedback'
import { getNotchTheme } from '@renderer/util/notchThemes'
import { CalendarPane } from './ui/CalendarPane'
import { WeatherPane } from './ui/WeatherPane'
import { THEME_ACCENTS } from '../hooks/useAppliedTheme'
import { LottieVisualizer } from './ui/LottieVisualizer'
import { IdleView } from './ui/IdleView'
import { WelcomeView } from './ui/WelcomeView'
import { ExpandedMediaView } from './ui/ExpandedMediaView'
import { CollapsedNotchView } from './ui/CollapsedNotchView'
import { AtmosphericAura } from './ui/AtmosphericAura'
import { useWeather } from '../hooks/useWeather'
import { NoteView } from './ui/NoteView'
import { ClipboardView } from './ui/ClipboardView'
import { BeamView } from './ui/BeamView'
import { ZenBarView } from './ui/ZenBarView'
import { SonicView } from './ui/SonicView'
import { useZenTimer } from '../hooks/useZenTimer'
import { NotchToast } from './ui/NotchToast'
import { GlassTab } from './ui/GlassTab'

const bounceTransition: Transition = {
  type: 'spring',
  stiffness: 260,
  damping: 32,
  mass: 1
}

const MEDIA_PANE_WIDTH = 260
const WEATHER_PANE_WIDTH = 260
const CALENDAR_PANE_WIDTH = 260
const COLUMN_GAP = 6
const TOTAL_EXPANDED_WIDTH =
  MEDIA_PANE_WIDTH + WEATHER_PANE_WIDTH + CALENDAR_PANE_WIDTH + COLUMN_GAP * 2 + 64

const createNotchPath = (w: number, h: number, isExpanded: boolean) => {
  if (!isExpanded) {
    const r = 8
    const b = 11
    return `
    M 0,0
    A ${r} ${r} 0 0 1 ${r} ${r}
    V ${h - b}
    A ${b} ${b} 0 0 0 ${r + b} ${h}
    H ${w - r - b}
    A ${b} ${b} 0 0 0 ${w - r} ${h - b}
    V ${r}
    A ${r} ${r} 0 0 1 ${w} 0
    Z
  `.replace(/\s+/g, ' ')
  }

  const r = 20 // Top ear radius
  const b = 30 // Bottom curve radius

  return `
    M 0,0
    A ${r} ${r} 0 0 1 ${r} ${r}
    V ${h - b}
    A ${b} ${b} 0 0 0 ${r + b} ${h}
    H ${w - r - b}
    A ${b} ${b} 0 0 0 ${w - r} ${h - b}
    V ${r}
    A ${r} ${r} 0 0 1 ${w} 0
    Z
  `.replace(/\s+/g, ' ')
}

function NotchPerimeter({
  width,
  height,
  isExpanded,
  notchTheme
}: {
  width: number
  height: number
  isExpanded: boolean
  notchTheme: any
}) {
  const path = createNotchPath(width, height, isExpanded)

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="absolute top-0 left-0 pointer-events-none"
      style={{ overflow: 'visible' }}
    >
      <path
        d={path}
        fill="transparent"
        stroke={isExpanded ? notchTheme.outerBorder : 'transparent'}
        strokeWidth="0.3"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  )
}

export default function NotchUI() {
  const { settings, ready: settingsReady, update: updateSetting } = useSettings()
  useSonicFeedback(settings.sonicFeedback, settings.sonicSoundPack)
  const [isHovering, setIsHovering] = useState(false)
  const [toast, setToast] = useState<{ title: string; body: string } | null>(null)
  const toastTimeout = useRef<NodeJS.Timeout | null>(null)
  const [isAutoExpanded, setIsAutoExpanded] = useState(false)
  const [isWelcoming, setIsWelcoming] = useState(false)
  const [activeTab, setActiveTab] = useState<
    'home' | 'note' | 'clipboard' | 'beam' | 'zenbar' | 'sonic'
  >('home')

  useEffect(() => {
    if (activeTab === 'clipboard' && !settings.enableClipboardHistory) {
      setActiveTab('home')
    }
    if (activeTab === 'beam' && !settings.enableBeam) {
      setActiveTab('home')
    }
  }, [activeTab, settings.enableClipboardHistory, settings.enableBeam])
  const welcomeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const { playExpand, playNotification } = useSound()

  const zenTimer = useZenTimer({
    onComplete: (reason) => {
      const body = reason === 'target' ? 'Stopwatch hit target' : 'Countdown complete'
      window.api.showLumeToast('Nivo | ZenBar', body)
      if (settings.hapticFeedback) window.api.triggerHaptic()
      playNotification()
    }
  })

  const collapsedWidth = 320

  const isExpanded = isHovering || isAutoExpanded || isWelcoming

  const isHoveringRef = useRef(false)
  const autoCollapseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pendingCollapseRef = useRef(false)
  const prevTitleRef = useRef('')

  const {
    title,
    artist,
    isPlaying,
    duration,
    playbackRate,
    albumArt,
    position: initialPosition,
    source
  } = useMedia()

  const [position, setPosition] = useState(initialPosition)
  const [displayArt, setDisplayArt] = useState<string | null>(null)

  useEffect(() => {
    const valid = duration > 0
    const pos = valid ? Math.min(initialPosition, duration) : initialPosition

    if (!prevTitleRef.current || title !== prevTitleRef.current) {
      setPosition(pos)
      if (title) prevTitleRef.current = title
    } else {
      setPosition(pos)
    }
  }, [initialPosition, duration, title])

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
      }, 4000)
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
    // Only set active if expanded or hovering (or focus/welcoming)
    const active = isExpanded || isWelcoming || zenTimer.isActive
    window.api.setNotchActive(active)
  }, [isExpanded, isWelcoming, zenTimer.isActive])

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
      pendingCollapseRef.current = false
      setIsAutoExpanded(true)
      playExpand()
      toastTimeout.current = setTimeout(() => {
        setToast(null)
        if (!isHoveringRef.current) {
          setIsAutoExpanded(false)
        } else {
          pendingCollapseRef.current = true
        }
      }, 5000)
    })
    return unsub
  }, [])

  useEffect(() => {
    return () => {
      if (autoCollapseTimerRef.current) clearTimeout(autoCollapseTimerRef.current)
    }
  }, [])

  useEffect(() => {
    if (albumArt) {
      setDisplayArt(albumArt)
    } else if (!title || title === 'Not Playing' || title === '') {
      setDisplayArt(null)
    }
  }, [albumArt, title])

  const playbackRateRef = useRef(playbackRate)
  playbackRateRef.current = playbackRate

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

  const totalWidth = isExpanded ? TOTAL_EXPANDED_WIDTH : collapsedWidth
  const expandedHeight = 250
  const appAccent = THEME_ACCENTS[settings.theme]?.accent || '#fff'

  const isIdle = !title || title === 'Not Playing'
  const showLottie = !isPlaying && settings.showLottieOnPause
  const showWelcome = isExpanded && !settings.hasSeenWelcome
  const showIdleView = isExpanded && isIdle && settings.hasSeenWelcome

  const notchTheme = getNotchTheme(settings.notchTheme)
  const { weather, weatherState } = useWeather()

  const getPath = (w: number, h: number, isExpanded: boolean) => createNotchPath(w, h, isExpanded)

  const currentHeight = isExpanded ? expandedHeight : 33.8
  const d = getPath(totalWidth, currentHeight, isExpanded)
  const progressPct = duration > 0 ? (position / duration) * 100 : 0

  return (
    <>
      {/* Mask Definition */}
      <svg width="0" height="0" className="absolute">
        <defs>
          <clipPath id="notch-clip" clipPathUnits="userSpaceOnUse">
            <motion.path animate={{ d }} transition={bounceTransition} />
          </clipPath>
        </defs>
      </svg>

      <motion.div
        onMouseEnter={() => {
          if (!isExpanded) playExpand()
          setIsHovering(true)
          isHoveringRef.current = true
        }}
        onMouseLeave={() => {
          isHoveringRef.current = false
          setTimeout(() => {
            if (!isHoveringRef.current) {
              setIsHovering(false)
              if (pendingCollapseRef.current) {
                pendingCollapseRef.current = false
                setIsAutoExpanded(false)
              }
            }
          }, 100)
        }}
        initial={false}
        animate={{
          width: totalWidth,
          height: isExpanded ? expandedHeight : 33.8
        }}
        transition={bounceTransition}
        className="relative origin-top z-1000"
        style={{
          backdropFilter: isExpanded ? 'blur(20px)' : 'none',
          WebkitBackdropFilter: isExpanded ? 'blur(20px)' : 'none',
          marginTop: '-1.8px',
          background: notchTheme.innerBg,
          clipPath: 'url(#notch-clip)',
          WebkitClipPath: 'url(#notch-clip)',
          filter: isExpanded
            ? notchTheme.outerShadow
                .split(/,(?![^(]*\))/)
                .filter((s: string) => !s.includes('inset'))
                .map((s: string) => `drop-shadow(${s})`)
                .join(' ')
            : 'none'
        }}
      >
        <NotchPerimeter
          width={totalWidth}
          height={currentHeight}
          isExpanded={isExpanded}
          notchTheme={notchTheme}
        />

        <div
          className="relative flex h-full overflow-hidden"
          style={{
            padding: '0 22px' // Match ear width
          }}
        >
          {/* Inset shadows overlay */}
          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none"
            style={{
              boxShadow: isExpanded
                ? notchTheme.outerShadow
                    .split(/,(?![^(]*\))/)
                    .filter((s: string) => s.includes('inset'))
                    .join(', ')
                : 'none',
              clipPath: 'url(#notch-clip)',
              WebkitClipPath: 'url(#notch-clip)'
            }}
          />
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
          {showLottie && <LottieVisualizer width={collapsedWidth} visible={!isExpanded} />}
          <AnimatePresence mode="wait">
            {!isExpanded ? (
              <motion.div
                key="collapsed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0 24px',
                  height: '100%',
                  justifyContent: 'space-between',
                  width: '100%'
                }}
              >
                <CollapsedNotchView
                  settings={settings}
                  displayArt={displayArt}
                  title={title}
                  isPlaying={isPlaying}
                  showLottie={showLottie}
                  accentColor={appAccent}
                />
              </motion.div>
            ) : (
              <motion.div
                key="expanded"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                  width: '100%',
                  padding: '12px',
                  boxSizing: 'border-box'
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '8px',
                    width: '100%'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <GlassTab
                      icon={IconHome}
                      label="Home"
                      isActive={activeTab === 'home'}
                      onClick={() => setActiveTab('home')}
                    />
                    <GlassTab
                      icon={IconClipboardText}
                      label="Note"
                      isActive={activeTab === 'note'}
                      onClick={() => setActiveTab('note')}
                    />
                    {settings.enableClipboardHistory && (
                      <GlassTab
                        icon={IconCopy}
                        label="Clipboard"
                        isActive={activeTab === 'clipboard'}
                        onClick={() => setActiveTab('clipboard')}
                      />
                    )}
                    {settings.enableBeam && (
                      <GlassTab
                        icon={IconBolt}
                        label="Beam"
                        isActive={activeTab === 'beam'}
                        onClick={() => setActiveTab('beam')}
                      />
                    )}
                    <GlassTab
                      icon={IconClock}
                      label="ZenBar"
                      isActive={activeTab === 'zenbar'}
                      onClick={() => setActiveTab('zenbar')}
                    />
                    <GlassTab
                      icon={IconKeyboard}
                      label="Sonic"
                      isActive={activeTab === 'sonic'}
                      onClick={() => setActiveTab('sonic')}
                    />
                  </div>

                  <div style={{ flex: 1 }} />

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div
                      onClick={() => window.api.openSettings()}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '6px',
                        borderRadius: '7px',
                        background: 'rgba(255,255,255,0.12)',
                        borderColor: 'rgba(255,255,255,0.25)',
                        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.20)',
                        color: '#fff',
                        cursor: 'pointer',
                        transition: 'all 0.3s cubic-bezier(0.25, 1, 0.5, 1)'
                      }}
                    >
                      <IconSettings size={16} stroke={2.5} />
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    gap: `${COLUMN_GAP}px`,
                    flex: 1,
                    minHeight: 0
                  }}
                >
                  {activeTab === 'home' ? (
                    <>
                      <div
                        style={{
                          flex: 1,
                          minWidth: 0,
                          display: 'flex',
                          flexDirection: 'column'
                        }}
                      >
                        {toast ? (
                          <NotchToast toast={toast} accentColor={appAccent} />
                        ) : showWelcome ? (
                          <WelcomeView notchTheme={notchTheme} />
                        ) : showIdleView ? (
                          <IdleView />
                        ) : (
                          <ExpandedMediaView
                            title={title}
                            artist={artist}
                            isPlaying={isPlaying}
                            duration={duration}
                            position={position}
                            source={source}
                            displayArt={displayArt}
                            settings={settings}
                            onPlayPause={handlePlayPause}
                            onNext={handleNext}
                            onPrev={handlePrev}
                            progressPct={progressPct}
                            accentColor={appAccent}
                          />
                        )}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <WeatherPane weather={weather} weatherState={weatherState} />
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <CalendarPane accentColor={appAccent} />
                      </div>
                    </>
                  ) : (
                    <div style={{ flex: 1, minWidth: 0 }}>
                      {activeTab === 'note' && <NoteView />}
                      {activeTab === 'clipboard' && <ClipboardView />}
                      {activeTab === 'beam' && <BeamView />}
                      {activeTab === 'zenbar' && (
                        <ZenBarView accentColor={appAccent} zen={zenTimer} />
                      )}
                      {activeTab === 'sonic' && <SonicView accentColor={appAccent} />}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </>
  )
}
