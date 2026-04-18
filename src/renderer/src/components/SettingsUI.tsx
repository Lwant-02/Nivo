import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Settings,
  Zap,
  Wifi,
  Moon,
  Sun,
  Volume2,
  Play,
  Calendar,
  Archive,
  Lock,
  ShieldCheck,
  Info,
  Laptop,
  Monitor,
  Layers,
  RotateCcw,
  Info as InfoIcon
} from 'lucide-react'
import { Toggle } from '../components/ui/Toggle'

// ─── Sidebar config ───────────────────────────────────────────────────────────

const NAV_GROUPS = [
  {
    items: [{ id: 'general', icon: Settings, label: 'General', color: '#636366' }]
  },
  {
    label: 'Notifications',
    items: [
      { id: 'battery', icon: Zap, label: 'Battery', color: '#FF9F0A' },
      { id: 'connectivity', icon: Wifi, label: 'Connectivity', color: '#32D74B' },
      { id: 'focus', icon: Moon, label: 'Focus', color: '#5E5CE6' },
      { id: 'display', icon: Sun, label: 'Display', color: '#FFD60A' },
      { id: 'sound', icon: Volume2, label: 'Sound', color: '#BF5AF2' }
    ]
  },
  {
    label: 'Live Activities',
    items: [
      { id: 'nowplaying', icon: Play, label: 'Now Playing', color: '#FF3B30' },
      { id: 'calendar', icon: Calendar, label: 'Calendar', color: '#FF3B30' },
      { id: 'filetray', icon: Archive, label: 'File Tray', color: '#636366', soon: true },
      { id: 'lockscreen', icon: Lock, label: 'Lock Screen', color: '#636366' }
    ]
  },
  {
    label: 'Alcove',
    items: [
      { id: 'license', icon: ShieldCheck, label: 'License', color: '#32D74B' },
      { id: 'about', icon: Info, label: 'About', color: '#636366' }
    ]
  }
]

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SettingsUI() {
  const [active, setActive] = useState('general')

  return (
    <div
      className="flex h-screen w-full select-none overflow-hidden text-white"
      style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif' }}
    >
      {/* Sidebar */}
      <aside className="w-[210px] shrink-0 flex flex-col bg-[#1C1C1E]/90 backdrop-blur-2xl border-r border-white/6">
        <div
          className="h-[52px] shrink-0"
          style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
        />

        <nav className="flex-1 px-2 pb-4 space-y-4 overflow-y-auto overflow-x-hidden scrollbar-hide">
          {NAV_GROUPS.map((group, gi) => (
            <div key={gi}>
              {group.label && (
                <p className="px-3 pb-1 text-[11px] font-semibold text-white/30 tracking-wide">
                  {group.label}
                </p>
              )}
              <div className="space-y-0.5">
                {group.items.map((item: (typeof NAV_GROUPS)[0]['items'][0]) => {
                  const Icon = item.icon
                  const isActive = active === item.id
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActive(item.id)}
                      className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg transition-all duration-150 cursor-pointer
                        ${isActive ? 'bg-white/12 text-white' : 'text-white/55 hover:bg-white/6 hover:text-white/80'}`}
                    >
                      <span
                        className="w-[26px] h-[26px] rounded-[7px] flex items-center justify-center shrink-0"
                        style={{ backgroundColor: item.color }}
                      >
                        <Icon size={13} className="text-white" />
                      </span>
                      <span className="text-[13px] font-medium flex-1 text-left min-w-0 truncate">
                        {item.label}
                      </span>
                      {'soon' in item && item.soon && (
                        <span className="text-[10px] font-medium text-white/40 bg-white/8 border border-white/10 px-1.5 py-0.5 rounded-md">
                          Soon
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>
      </aside>

      {/* Content */}
      <div
        className="flex-1 flex flex-col overflow-hidden"
        style={{
          background: 'linear-gradient(160deg, #1e2d3d 0%, #1a1a2e 40%, #16213e 100%)'
        }}
      >
        <div
          className="h-[52px] shrink-0"
          style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
        />

        <div
          className="flex-1 overflow-y-auto scrollbar-hide"
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="px-6 pb-12 pt-2 max-w-[540px]"
            >
              {active === 'general' && <GeneralPanel />}
              {active !== 'general' && <PlaceholderPanel id={active} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

// ─── Settings Card ────────────────────────────────────────────────────────────

function SCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white/6 border border-white/8 rounded-xl overflow-hidden">{children}</div>
  )
}

// ─── Settings Row ─────────────────────────────────────────────────────────────

function SRow({
  label,
  enabled,
  onToggle,
  isFirst = false,
  info = false,
  right
}: {
  label: string
  enabled?: boolean
  onToggle?: () => void
  isFirst?: boolean
  info?: boolean
  right?: React.ReactNode
}) {
  return (
    <div
      onClick={onToggle}
      className={`relative flex items-center justify-between px-4 py-3 min-h-[44px] transition-colors
        ${onToggle ? 'cursor-pointer hover:bg-white/4' : ''}`}
    >
      {!isFirst && <div className="absolute top-0 left-4 right-0 h-px bg-white/7" />}
      <div className="flex items-center gap-1.5">
        <span className="text-[14px] font-medium text-white/90">{label}</span>
        {info && <InfoIcon size={13} className="text-white/30" />}
      </div>
      <div className="shrink-0">
        {right}
        {enabled !== undefined && onToggle && <Toggle enabled={enabled} onChange={onToggle} />}
      </div>
    </div>
  )
}

// ─── Section Label ────────────────────────────────────────────────────────────

function SLabel({ text }: { text: string }) {
  return <p className="text-[13px] font-semibold text-white/50 mt-5 mb-2 px-1">{text}</p>
}

// ─── General Panel ────────────────────────────────────────────────────────────

function GeneralPanel() {
  const [launchAtLogin, setLaunchAtLogin] = useState(false)
  const [syncICloud, setSyncICloud] = useState(true)
  const [hideFullscreen, setHideFullscreen] = useState(true)
  const [hideMissionControl, setHideMissionControl] = useState(false)
  const [hideScreenCapture, setHideScreenCapture] = useState(false)
  const [forceNotch, setForceNotch] = useState(false)
  const [display, setDisplay] = useState<'builtin' | 'main' | 'active'>('builtin')
  const [idleActivity, setIdleActivity] = useState(true)
  const [progressiveBlur, setProgressiveBlur] = useState(true)
  const [hapticFeedback, setHapticFeedback] = useState(true)
  const [expandOnHover, setExpandOnHover] = useState(true)

  const displays: { id: 'builtin' | 'main' | 'active'; label: string; Icon: typeof Laptop }[] = [
    { id: 'builtin', label: 'Built-in display', Icon: Laptop },
    { id: 'main', label: 'Main display', Icon: Monitor },
    { id: 'active', label: 'Active display', Icon: Layers }
  ]

  return (
    <>
      {/* Main toggles */}
      <SCard>
        <SRow
          label="Launch at login"
          enabled={launchAtLogin}
          onToggle={() => setLaunchAtLogin((v) => !v)}
          isFirst
        />
        <SRow
          label="Sync settings via iCloud"
          enabled={syncICloud}
          onToggle={() => setSyncICloud((v) => !v)}
        />
        <SRow
          label="Hide in fullscreen"
          enabled={hideFullscreen}
          onToggle={() => setHideFullscreen((v) => !v)}
        />
        <SRow
          label="Hide in mission control"
          enabled={hideMissionControl}
          onToggle={() => setHideMissionControl((v) => !v)}
        />
        <SRow
          label="Hide from screen capture"
          enabled={hideScreenCapture}
          onToggle={() => setHideScreenCapture((v) => !v)}
        />
        <SRow
          label="Force simulated notch"
          enabled={forceNotch}
          onToggle={() => setForceNotch((v) => !v)}
        />

        {/* Display selector */}
        <div className="relative px-4 py-3">
          <div className="absolute top-0 left-4 right-0 h-px bg-white/7" />
          <div className="grid grid-cols-3 gap-2">
            {displays.map(({ id, label, Icon }) => {
              const active = display === id
              return (
                <button
                  key={id}
                  onClick={() => setDisplay(id)}
                  className={`flex flex-col items-center gap-2 py-3 px-2 rounded-xl transition-all duration-150 cursor-pointer
                    ${
                      active
                        ? 'bg-white/10 border border-[#32D74B]/60 text-white'
                        : 'bg-white/4 border border-white/7 text-white/35 hover:text-white/60 hover:bg-white/7'
                    }`}
                >
                  <Icon size={22} strokeWidth={1.5} />
                  <span
                    className={`text-[11px] font-medium text-center leading-tight
                    ${active ? 'text-white font-semibold' : 'text-white/35'}`}
                  >
                    {label}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </SCard>

      {/* Idle Activity */}
      <SLabel text="Idle Activity" />
      <SCard>
        <div
          className="flex items-center justify-between px-4 py-3 min-h-[44px] cursor-pointer hover:bg-white/4 transition-colors"
          onClick={() => setIdleActivity((v) => !v)}
        >
          <div className="flex items-center gap-2">
            <RotateCcw size={15} className="text-white/50" />
            <span className="text-[14px] font-medium text-white/90">Most Recent</span>
            <span className="text-[14px] text-white/35">· Duo</span>
          </div>
          <Toggle enabled={idleActivity} onChange={() => setIdleActivity((v) => !v)} />
        </div>
      </SCard>

      {/* Behaviour */}
      <SLabel text="Behaviour" />
      <SCard>
        <SRow
          label="Progressive blur"
          enabled={progressiveBlur}
          onToggle={() => setProgressiveBlur((v) => !v)}
          isFirst
        />
        <SRow
          label="Haptic feedback"
          enabled={hapticFeedback}
          onToggle={() => setHapticFeedback((v) => !v)}
        />
        <SRow
          label="Expand on hover"
          enabled={expandOnHover}
          onToggle={() => setExpandOnHover((v) => !v)}
          info
        />
        <SRow
          label="Hover duration"
          right={
            <span className="text-[13px] font-medium text-white/40 bg-white/7 border border-white/10 rounded-full px-3 py-1">
              0.0 s
            </span>
          }
        />
      </SCard>
    </>
  )
}

// ─── Placeholder for other panels ─────────────────────────────────────────────

function PlaceholderPanel({ id }: { id: string }) {
  const label = id.charAt(0).toUpperCase() + id.slice(1)
  return (
    <div className="flex flex-col items-center justify-center h-48 opacity-30">
      <p className="text-[15px] font-medium text-white">{label}</p>
      <p className="text-[13px] text-white/50 mt-1">Coming soon</p>
    </div>
  )
}
