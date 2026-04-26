import { ChevronRight, MessageSquare } from 'lucide-react'
import { SettingCard } from './SettingCard'
import { SectionLabel } from './SectionLabel'
import { Pill } from './Pill'
import iconSrc from '../../../../../resources/icon.png'

const FEEDBACK = 'https://nivo.nawmain.dev/faqs'

export function AboutPanel() {
  const year = new Date().getFullYear()

  return (
    <>
      {/* Hero */}
      <SettingCard
        style={{
          background:
            'radial-gradient(120% 120% at 0% 0%, rgba(168,85,247,0.22) 0%, transparent 55%), radial-gradient(100% 100% at 100% 100%, rgba(90,200,245,0.18) 0%, transparent 55%), linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
          border: '1px solid rgba(255,255,255,0.1)'
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            paddingLeft: 24,
            paddingRight: 24,
            paddingTop: 28,
            paddingBottom: 24
          }}
        >
          <div
            style={{
              width: 68,
              height: 68,
              borderRadius: 18,
              background: 'linear-gradient(135deg, #a855f7 0%, #6366f1 60%, #3b82f6 100%)',
              boxShadow: '0 12px 30px rgba(168,85,247,0.4), inset 0 1px 0 rgba(255,255,255,0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 14
            }}
          >
            <img src={iconSrc} className="object-cover" alt="Nivo" />
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}
          >
            <h1
              style={{
                fontSize: 26,
                fontWeight: 700,
                letterSpacing: -0.8,
                color: '#fff',
                lineHeight: 1
              }}
            >
              Nivo
            </h1>
          </div>
          <p
            style={{
              marginTop: 6,
              fontSize: 12.5,
              color: 'rgba(255,255,255,0.55)',
              maxWidth: 360,
              lineHeight: 1.45
            }}
          >
            A premium Dynamic Island for your Mac. Notifications, media, and live activities — right
            where the notch lives.
          </p>
          <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
            <Pill variant="soft">macOS · Apple Silicon</Pill>
          </div>
        </div>
      </SettingCard>

      {/* Links */}
      <SectionLabel text="Resources" />
      <SettingCard>
        <LinkRow
          icon={<MessageSquare size={15} strokeWidth={2} />}
          label="Send feedback"
          description="If you encounter issues or have ideas, feel free to share."
          onClick={() => window.api.openExternal(FEEDBACK)}
          isFirst
        />
      </SettingCard>

      {/* Footer */}
      <p
        style={{
          marginTop: 26,
          textAlign: 'center',
          fontSize: 11,
          color: 'rgba(255,255,255,0.32)',
          letterSpacing: 0.2
        }}
      >
        © {year} Nivo · All rights reserved.
      </p>
    </>
  )
}

function LinkRow({
  icon,
  label,
  description,
  onClick,
  isFirst
}: {
  icon: React.ReactNode
  label: string
  description?: string
  onClick: () => void
  isFirst?: boolean
}) {
  return (
    <button
      onClick={onClick}
      className="cursor-pointer transition-colors hover:bg-white/[0.035]"
      style={{
        position: 'relative',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingLeft: 18,
        paddingRight: 18,
        paddingTop: 14,
        paddingBottom: 14,
        minHeight: 52,
        background: 'transparent',
        border: 'none',
        textAlign: 'left'
      }}
    >
      {!isFirst && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 18,
            right: 0,
            height: 1,
            background: 'rgba(255,255,255,0.06)'
          }}
        />
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            background: 'rgba(255,255,255,0.055)',
            color: 'rgba(255,255,255,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}
        >
          {icon}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
          <span
            style={{
              fontSize: 13.5,
              fontWeight: 500,
              color: 'rgba(255,255,255,0.95)',
              letterSpacing: -0.1
            }}
          >
            {label}
          </span>
          {description && (
            <span style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.42)' }}>{description}</span>
          )}
        </div>
      </div>
      <ChevronRight size={15} color="rgba(255,255,255,0.35)" />
    </button>
  )
}
