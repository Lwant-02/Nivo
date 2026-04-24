import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Settings, Play, Calendar, ShieldCheck, Info } from 'lucide-react'
import { SidebarItem } from './settings/SidebarItem'
import { LicensePanel } from './settings/LicensePanel'
import { AboutPanel } from './settings/AboutPanel'
import { NowPlayingPanel } from './settings/NowPlayingPanel'
import { CalendarPanel } from './settings/CalendarPanel'
import { GeneralPanel } from './settings/GeneralPanel'
import { PlaceholderPanel } from './settings/PlaceholderPanel'
import { VisualizerPanel } from './settings/VisualizerPanel'
import { Sparkles } from 'lucide-react'

const NAV_GROUPS = [
  {
    label: 'General',
    items: [{ id: 'general', icon: Settings, label: 'General', color: 'var(--lume-accent)' }]
  },
  {
    label: 'Live Activities',
    items: [
      { id: 'nowplaying', icon: Play, label: 'Now Playing', color: '#FF3B30' },
      { id: 'calendar', icon: Calendar, label: 'Calendar', color: '#FF3B30' },
      { id: 'visualizer', icon: Sparkles, label: 'Visualizer', color: 'var(--lume-accent)' }
    ]
  },
  {
    label: 'Lume',
    items: [
      { id: 'license', icon: ShieldCheck, label: 'License', color: '#32D74B' },
      { id: 'about', icon: Info, label: 'About', color: '#636366' }
    ]
  }
]

export default function SettingsUI() {
  const [active, setActive] = useState('general')

  const activeLabel =
    NAV_GROUPS.flatMap((g) => g.items).find((i) => i.id === active)?.label ?? 'General'

  return (
    <div
      className="flex h-screen w-full select-none overflow-hidden text-white"
      style={{
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
        borderRadius: 18,
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 24px 60px rgba(0,0,0,0.5), 0 0 0 0.5px rgba(0,0,0,0.6)'
      }}
    >
      {/* ── Sidebar ── */}
      <aside
        className="shrink-0 flex flex-col"
        style={{
          width: 230,
          background: 'linear-gradient(180deg, rgba(24,24,28,0.92) 0%, rgba(18,18,22,0.92) 100%)',
          backdropFilter: 'blur(32px)',
          WebkitBackdropFilter: 'blur(32px)',
          borderRight: '1px solid rgba(255,255,255,0.06)'
        }}
      >
        <div
          style={{ height: 52, flexShrink: 0, WebkitAppRegion: 'drag' } as React.CSSProperties}
        />

        <nav
          className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide"
          style={{
            paddingLeft: 10,
            paddingRight: 10,
            paddingBottom: 20
          }}
        >
          {NAV_GROUPS.map((group, gi) => (
            <div key={gi} style={{ marginBottom: 18 }}>
              {group.label && (
                <p
                  style={{
                    paddingLeft: 12,
                    paddingRight: 12,
                    marginBottom: 6,
                    fontSize: 10.5,
                    fontWeight: 700,
                    color: 'rgba(255,255,255,0.32)',
                    textTransform: 'uppercase',
                    letterSpacing: 1.3
                  }}
                >
                  {group.label}
                </p>
              )}
              {group.items.map((item: (typeof NAV_GROUPS)[number]['items'][number]) => (
                <SidebarItem
                  key={item.id}
                  icon={item.icon}
                  label={item.label}
                  color={item.color}
                  active={active === item.id}
                  soon={'soon' in item ? (item.soon as boolean) : false}
                  onClick={() => setActive(item.id)}
                />
              ))}
            </div>
          ))}
        </nav>
      </aside>

      {/* ── Content ── */}
      <div
        className="flex-1 flex flex-col overflow-hidden relative"
        style={{
          background:
            'radial-gradient(120% 80% at 0% 0%, #1f3048 0%, transparent 55%), radial-gradient(100% 80% at 100% 100%, #2a1b40 0%, transparent 55%), linear-gradient(160deg, #141826 0%, #0f1420 50%, #0b0f1a 100%)'
        }}
      >
        {/* Title bar */}
        <div
          className="flex items-center justify-between shrink-0"
          style={
            {
              height: 52,
              paddingLeft: 28,
              paddingRight: 28,
              WebkitAppRegion: 'drag',
              borderBottom: '1px solid rgba(255,255,255,0.04)'
            } as React.CSSProperties
          }
        >
          <span
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: 'rgba(255,255,255,0.55)',
              letterSpacing: -0.1
            }}
          >
            {activeLabel}
          </span>
        </div>

        <div
          className="flex-1 overflow-y-auto scrollbar-hide"
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
              style={{
                paddingLeft: 28,
                paddingRight: 28,
                paddingTop: 20,
                paddingBottom: 48,
                maxWidth: 620
              }}
            >
              {active === 'general' && <GeneralPanel />}
              {active === 'nowplaying' && <NowPlayingPanel />}
              {active === 'calendar' && <CalendarPanel />}
              {active === 'visualizer' && <VisualizerPanel />}
              {active === 'license' && <LicensePanel />}
              {active === 'about' && <AboutPanel />}
              {!['general', 'nowplaying', 'calendar', 'license', 'about', 'visualizer'].includes(
                active
              ) && <PlaceholderPanel id={active} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
