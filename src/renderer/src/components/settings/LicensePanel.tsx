import { useEffect, useRef, useState } from 'react'
import {
  ShieldCheck,
  ShieldAlert,
  Clock,
  Copy,
  Check,
  Eye,
  EyeOff,
  Fingerprint,
  Cpu,
  ExternalLink,
  KeyRound,
  ShoppingCart
} from 'lucide-react'
import { SettingCard } from './SettingCard'
import { SectionLabel } from './SectionLabel'
import { Pill } from './Pill'

const RECOVER_URL = 'https://nivo.nawmain.dev/recover-license'
const BUY_URL = 'https://nivo.nawmain.dev'

type Status = 'activated' | 'trial' | 'expired' | 'inactive'

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

function formatRemaining(ms: number): string {
  if (ms <= 0) return '0s'
  const totalSec = Math.floor(ms / 1000)
  const d = Math.floor(totalSec / 86400)
  const h = Math.floor((totalSec % 86400) / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  if (d > 0) return `${d}d ${h}h ${m}m`
  if (h > 0) return `${h}h ${m}m ${s}s`
  if (m > 0) return `${m}m ${s}s`
  return `${s}s`
}

function deriveStatus(state: LicenseState | null): Status {
  if (!state) return 'inactive'
  if (state.isActivated) return 'activated'
  if (state.isInTrial) return 'trial'
  if (state.trialEndsAt !== null && Date.now() >= state.trialEndsAt) return 'expired'
  return 'inactive'
}

export function LicensePanel() {
  const [state, setState] = useState<LicenseState | null>(null)
  const [reveal, setReveal] = useState(false)
  const [copied, setCopied] = useState<'key' | 'id' | null>(null)
  const [, setTick] = useState(0)
  const [keyInput, setKeyInput] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [activationError, setActivationError] = useState<string | null>(null)
  const tickerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    let mounted = true
    window.api.getLicenseState().then((s) => {
      if (mounted) setState(s)
    })
    const off = window.api.onLicenseUpdate((next) => {
      if (mounted) setState(next)
    })
    return () => {
      mounted = false
      off()
    }
  }, [])

  // Tick once a second while a trial is active so the countdown is live.
  useEffect(() => {
    const status = deriveStatus(state)
    if (status !== 'trial') {
      if (tickerRef.current) clearInterval(tickerRef.current)
      tickerRef.current = null
      return
    }
    tickerRef.current = setInterval(() => setTick((n) => n + 1), 1000)
    return () => {
      if (tickerRef.current) clearInterval(tickerRef.current)
      tickerRef.current = null
    }
  }, [state])

  const copy = async (value: string, what: 'key' | 'id') => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(what)
      setTimeout(() => setCopied(null), 1400)
    } catch {
      console.log('Failed to copy')
    }
  }

  const submitActivation = async () => {
    if (!keyInput || submitting) return
    setSubmitting(true)
    setActivationError(null)
    try {
      const result = await window.api.activateLicense(keyInput)
      if (!result.ok) {
        setActivationError(result.error ?? 'Activation failed. Please try again.')
      } else {
        setKeyInput('')
      }
    } catch {
      setActivationError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const status = deriveStatus(state)
  const key = state?.licenseKey ?? ''
  const displayKey = key ? (reveal ? key : maskKey(key)) : '—'
  const trialMsLeft =
    status === 'trial' && state?.trialEndsAt ? Math.max(0, state.trialEndsAt - Date.now()) : 0

  const hero = HERO_BY_STATUS[status]
  const HeroIcon = hero.icon

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
          Your Nivo activation for this Mac.
        </p>
      </div>

      {/* Status hero card */}
      <SettingCard
        style={{
          background: hero.cardBg,
          border: hero.cardBorder
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
              background: hero.iconBg,
              boxShadow: hero.iconShadow,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <HeroIcon size={26} color="#fff" strokeWidth={2.2} />
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
                {hero.title}
              </span>
              <Pill variant={hero.pillVariant}>
                {status === 'trial' ? formatRemaining(trialMsLeft) + ' left' : hero.pillText}
              </Pill>
            </div>
            <p
              style={{
                fontSize: 12.5,
                color: 'rgba(255,255,255,0.55)',
                lineHeight: 1.35
              }}
            >
              {hero.body}
            </p>
          </div>
        </div>
      </SettingCard>

      {/* Activate / re-activate input — hidden once activated */}
      {status !== 'activated' && (
        <>
          <SectionLabel text="Activate" />
          <SettingCard>
            <div
              style={{
                paddingLeft: 18,
                paddingRight: 18,
                paddingTop: 14,
                paddingBottom: 14,
                display: 'flex',
                flexDirection: 'column',
                gap: 10
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 10,
                  paddingLeft: 12,
                  paddingRight: 12,
                  height: 40
                }}
              >
                <KeyRound size={15} className="-rotate-135" color="rgba(255,255,255,0.4)" />
                <input
                  type="text"
                  value={keyInput}
                  onChange={(e) => {
                    setKeyInput(e.target.value)
                    if (activationError) setActivationError(null)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') submitActivation()
                  }}
                  placeholder="Paste your license key"
                  className="bg-transparent border-none outline-none text-white/85 placeholder:text-white/30 w-full font-mono"
                  style={{ fontSize: 13, letterSpacing: 0.4 }}
                />
              </div>

              {activationError && (
                <p
                  className="text-center"
                  style={{
                    fontSize: 11.5,
                    color: '#ff6b80',
                    fontFamily: 'ui-monospace, SFMono-Regular, monospace'
                  }}
                >
                  {activationError}
                </p>
              )}

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={submitActivation}
                  disabled={!keyInput || submitting}
                  className={!keyInput || submitting ? 'cursor-not-allowed' : 'cursor-pointer'}
                  style={{
                    flex: 1,
                    height: 38,
                    borderRadius: 10,
                    border: '1px solid #a855f7',
                    background: !keyInput || submitting ? 'rgba(168,85,247,0.25)' : '#a855f7',
                    color: '#fff',
                    fontSize: 13,
                    fontWeight: 600,
                    transition: 'background 150ms ease',
                    opacity: !keyInput || submitting ? 0.7 : 1
                  }}
                >
                  {submitting ? 'Activating…' : 'Activate'}
                </button>
                <button
                  onClick={() => window.api.openExternal(BUY_URL)}
                  className="cursor-pointer"
                  style={{
                    height: 38,
                    paddingLeft: 14,
                    paddingRight: 14,
                    borderRadius: 10,
                    border: '1px solid rgba(255,255,255,0.12)',
                    background: 'rgba(255,255,255,0.05)',
                    color: '#fff',
                    fontSize: 13,
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                >
                  <ShoppingCart size={14} />
                  Buy a license
                </button>
              </div>
            </div>
          </SettingCard>
        </>
      )}

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

const HERO_BY_STATUS: Record<
  Status,
  {
    icon: typeof ShieldCheck
    title: string
    body: string
    pillText: string
    pillVariant: 'default' | 'soft' | 'accent'
    cardBg: string
    cardBorder: string
    iconBg: string
    iconShadow: string
  }
> = {
  activated: {
    icon: ShieldCheck,
    title: 'Nivo Activated',
    body: 'Thanks for supporting Nivo. Enjoy every feature, forever.',
    pillText: 'Lifetime',
    pillVariant: 'accent',
    cardBg:
      'linear-gradient(135deg, rgba(50,215,75,0.16) 0%, rgba(50,215,75,0.04) 60%, rgba(255,255,255,0.02) 100%)',
    cardBorder: '1px solid rgba(50,215,75,0.25)',
    iconBg: 'linear-gradient(180deg, #3AE15A 0%, #2CC449 100%)',
    iconShadow: '0 6px 16px rgba(50,215,75,0.35), inset 0 1px 0 rgba(255,255,255,0.3)'
  },
  trial: {
    icon: Clock,
    title: 'Trial Active',
    body: 'You have full access to Nivo while your trial runs. Activate any time to keep going.',
    pillText: 'Trial',
    pillVariant: 'accent',
    cardBg:
      'linear-gradient(135deg, rgba(168,85,247,0.18) 0%, rgba(168,85,247,0.05) 60%, rgba(255,255,255,0.02) 100%)',
    cardBorder: '1px solid rgba(168,85,247,0.28)',
    iconBg: 'linear-gradient(180deg, #c084fc 0%, #a855f7 100%)',
    iconShadow: '0 6px 16px rgba(168,85,247,0.35), inset 0 1px 0 rgba(255,255,255,0.3)'
  },
  expired: {
    icon: ShieldAlert,
    title: 'Trial Expired',
    body: 'Your 48-hour trial is over. Activate a license to keep using Nivo.',
    pillText: 'Expired',
    pillVariant: 'default',
    cardBg:
      'linear-gradient(135deg, rgba(255,69,58,0.16) 0%, rgba(255,69,58,0.04) 60%, rgba(255,255,255,0.02) 100%)',
    cardBorder: '1px solid rgba(255,69,58,0.25)',
    iconBg: 'linear-gradient(180deg, #ff6b6b 0%, #ff453a 100%)',
    iconShadow: '0 6px 16px rgba(255,69,58,0.35), inset 0 1px 0 rgba(255,255,255,0.3)'
  },
  inactive: {
    icon: ShieldAlert,
    title: 'Not activated',
    body: 'Enter a valid license key, or start a 48-hour trial.',
    pillText: 'Inactive',
    pillVariant: 'default',
    cardBg:
      'linear-gradient(135deg, rgba(255,159,10,0.14) 0%, rgba(255,159,10,0.03) 60%, rgba(255,255,255,0.02) 100%)',
    cardBorder: '1px solid rgba(255,159,10,0.22)',
    iconBg: 'linear-gradient(180deg, #FFB340 0%, #FF9500 100%)',
    iconShadow: '0 6px 16px rgba(255,159,10,0.35), inset 0 1px 0 rgba(255,255,255,0.3)'
  }
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
