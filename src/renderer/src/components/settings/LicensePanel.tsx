import { useEffect, useState } from 'react'
import {
  ShieldCheck,
  ShieldAlert,
  Copy,
  Check,
  Eye,
  EyeOff,
  Fingerprint,
  Cpu,
  ExternalLink
} from 'lucide-react'
import { SettingCard } from './SettingCard'
import { SectionLabel } from './SectionLabel'
import { Pill } from './Pill'

interface LicenseState {
  licenseKey: string | null
  isActivated: boolean
  instanceId: string | null
}

const RECOVER_URL = 'https://nawmain.dev'

function maskKey(key: string): string {
  const parts = key.split('-')
  if (parts.length < 3) {
    if (key.length <= 6) return key
    return key.slice(0, 3) + 'x'.repeat(Math.max(4, key.length - 6)) + key.slice(-3)
  }
  return parts
    .map((p, i) => (i === 0 || i === parts.length - 1 ? p : 'x'.repeat(p.length)))
    .join('-')
}

function shortId(id: string, head = 6, tail = 4): string {
  if (id.length <= head + tail + 3) return id
  return `${id.slice(0, head)}....${id.slice(-tail)}`
}

export function LicensePanel() {
  const [state, setState] = useState<LicenseState | null>(null)
  const [reveal, setReveal] = useState(false)
  const [copied, setCopied] = useState<'key' | 'id' | null>(null)

  useEffect(() => {
    let mounted = true
    window.api.getLicenseState().then((s) => {
      if (mounted) setState(s)
    })
    return () => {
      mounted = false
    }
  }, [])

  const copy = async (value: string, what: 'key' | 'id') => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(what)
      setTimeout(() => setCopied(null), 1400)
    } catch {
      console.log('Failed to copy')
    }
  }

  const activated = state?.isActivated ?? false
  const key = state?.licenseKey ?? ''
  const displayKey = key ? (reveal ? key : maskKey(key)) : '—'

  return (
    <>
      {/* Hero */}
      <div style={{ marginBottom: 18 }}>
        <h1
          style={{
            fontSize: 26,
            fontWeight: 700,
            letterSpacing: -0.6,
            color: '#fff',
            lineHeight: 1.1
          }}
        >
          License
        </h1>
        <p
          style={{
            marginTop: 6,
            fontSize: 13,
            color: 'rgba(255,255,255,0.48)',
            letterSpacing: -0.1
          }}
        >
          Your Lume activation for this Mac.
        </p>
      </div>

      {/* Status hero card */}
      <SettingCard
        style={{
          background: activated
            ? 'linear-gradient(135deg, rgba(50,215,75,0.16) 0%, rgba(50,215,75,0.04) 60%, rgba(255,255,255,0.02) 100%)'
            : 'linear-gradient(135deg, rgba(255,159,10,0.14) 0%, rgba(255,159,10,0.03) 60%, rgba(255,255,255,0.02) 100%)',
          border: activated ? '1px solid rgba(50,215,75,0.25)' : '1px solid rgba(255,159,10,0.22)'
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            paddingLeft: 20,
            paddingRight: 20,
            paddingTop: 20,
            paddingBottom: 20
          }}
        >
          <div
            style={{
              width: 54,
              height: 54,
              borderRadius: 14,
              background: activated
                ? 'linear-gradient(180deg, #3AE15A 0%, #2CC449 100%)'
                : 'linear-gradient(180deg, #FFB340 0%, #FF9500 100%)',
              boxShadow: activated
                ? '0 6px 16px rgba(50,215,75,0.35), inset 0 1px 0 rgba(255,255,255,0.3)'
                : '0 6px 16px rgba(255,159,10,0.35), inset 0 1px 0 rgba(255,255,255,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            {activated ? (
              <ShieldCheck size={26} color="#fff" strokeWidth={2.2} />
            ) : (
              <ShieldAlert size={26} color="#fff" strokeWidth={2.2} />
            )}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                marginBottom: 4
              }}
            >
              <span
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: '#fff',
                  letterSpacing: -0.2
                }}
              >
                {activated ? 'Lume Pro — Activated' : 'Not activated'}
              </span>
              <Pill variant={activated ? 'accent' : 'default'}>
                {activated ? 'Lifetime' : 'Inactive'}
              </Pill>
            </div>
            <p
              style={{
                fontSize: 12.5,
                color: 'rgba(255,255,255,0.55)',
                lineHeight: 1.35
              }}
            >
              {activated
                ? 'Thanks for supporting Lume. Enjoy every feature, forever.'
                : 'Enter a valid license key to unlock the full experience.'}
            </p>
          </div>
        </div>
      </SettingCard>

      {/* Key & identifiers */}
      <SectionLabel text="Credentials" />
      <SettingCard>
        {/* License key row */}
        <div
          style={{
            paddingLeft: 18,
            paddingRight: 18,
            paddingTop: 14,
            paddingBottom: 14,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            minHeight: 56
          }}
        >
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
            <Fingerprint size={15} strokeWidth={2} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: 'rgba(255,255,255,0.45)',
                textTransform: 'uppercase',
                letterSpacing: 1.1,
                marginBottom: 4
              }}
            >
              License key
            </div>
            <div
              style={{
                fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
                fontSize: 13.5,
                color: key ? '#fff' : 'rgba(255,255,255,0.35)',
                letterSpacing: 0.6,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              {displayKey}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
            <IconButton
              disabled={!key}
              onClick={() => setReveal((v) => !v)}
              title={reveal ? 'Hide key' : 'Reveal key'}
            >
              {reveal ? <EyeOff size={14} /> : <Eye size={14} />}
            </IconButton>
            <IconButton disabled={!key} onClick={() => copy(key, 'key')} title="Copy">
              {copied === 'key' ? <Check size={14} color="#3AE15A" /> : <Copy size={14} />}
            </IconButton>
          </div>
        </div>

        {/* Instance row */}
        <div
          style={{
            position: 'relative',
            paddingLeft: 18,
            paddingRight: 18,
            paddingTop: 14,
            paddingBottom: 14,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            minHeight: 56
          }}
        >
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
            <Cpu size={15} strokeWidth={2} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: 'rgba(255,255,255,0.45)',
                textTransform: 'uppercase',
                letterSpacing: 1.1,
                marginBottom: 4
              }}
            >
              Instance ID
            </div>
            <div
              style={{
                fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
                fontSize: 12.5,
                color: state?.instanceId ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.35)'
              }}
            >
              {state?.instanceId ? shortId(state.instanceId) : '—'}
            </div>
          </div>
          <IconButton
            disabled={!state?.instanceId}
            onClick={() => state?.instanceId && copy(state.instanceId, 'id')}
            title="Copy"
          >
            {copied === 'id' ? <Check size={14} color="#3AE15A" /> : <Copy size={14} />}
          </IconButton>
        </div>
      </SettingCard>

      {/* Help */}
      <SectionLabel text="Help" />
      <SettingCard>
        <button
          onClick={() => window.api.openExternal(RECOVER_URL)}
          className="cursor-pointer transition-colors hover:bg-white/[0.035]"
          style={{
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
            color: '#fff',
            textAlign: 'left'
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span
              style={{
                fontSize: 13.5,
                fontWeight: 500,
                color: 'rgba(255,255,255,0.95)',
                letterSpacing: -0.1
              }}
            >
              Recover a lost license
            </span>
            <span style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.42)' }}>
              Get help retrieving your key by email.
            </span>
          </div>
          <ExternalLink size={14} color="rgba(255,255,255,0.45)" />
        </button>
      </SettingCard>
    </>
  )
}

function IconButton({
  children,
  onClick,
  disabled,
  title
}: {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  title?: string
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={disabled ? '' : 'cursor-pointer'}
      style={{
        width: 28,
        height: 28,
        borderRadius: 8,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.08)',
        color: disabled ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.75)',
        transition: 'background 150ms ease, color 150ms ease',
        padding: 0
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.background = 'rgba(255,255,255,0.09)'
          e.currentTarget.style.color = '#fff'
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
          e.currentTarget.style.color = 'rgba(255,255,255,0.75)'
        }
      }}
    >
      {children}
    </button>
  )
}
