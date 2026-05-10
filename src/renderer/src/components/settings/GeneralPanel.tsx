import { useEffect, useState, type JSX } from 'react'
import {
  Maximize2,
  ShieldOff,
  Vibrate,
  LogIn,
  CloudSun,
  ClipboardList,
  Zap,
  MapPin,
  Loader2,
  Check,
  X
} from 'lucide-react'
import { SettingCard } from './SettingCard'
import { SectionLabel } from './SectionLabel'
import { SettingRow } from './SettingRow'
import { useSettings } from '../../hooks/useSettings'

const ICON_STYLE = { size: 15, strokeWidth: 2 }

type LocationStatus =
  | { kind: 'idle' }
  | { kind: 'saving' }
  | { kind: 'success'; message: string }
  | { kind: 'error'; message: string }

export function GeneralPanel(): JSX.Element {
  const { settings, update } = useSettings()
  const [locationInput, setLocationInput] = useState(settings.weatherLocation)
  const [status, setStatus] = useState<LocationStatus>({ kind: 'idle' })

  useEffect(() => {
    setLocationInput(settings.weatherLocation)
  }, [settings.weatherLocation])

  const submitLocation = async (): Promise<void> => {
    if (status.kind === 'saving') return
    setStatus({ kind: 'saving' })
    const result = await window.api.setWeatherLocation(locationInput)
    if (!result.ok) {
      setStatus({ kind: 'error', message: result.error ?? 'Could not set location.' })
      return
    }
    if (result.cleared) {
      setStatus({ kind: 'success', message: 'Reverted to automatic detection.' })
    } else {
      setStatus({ kind: 'success', message: `Set to ${result.location}.` })
    }
  }

  const clearLocation = async (): Promise<void> => {
    setLocationInput('')
    setStatus({ kind: 'saving' })
    const result = await window.api.setWeatherLocation('')
    if (!result.ok) {
      setStatus({ kind: 'error', message: result.error ?? 'Could not clear.' })
      return
    }
    setStatus({ kind: 'success', message: 'Reverted to automatic detection.' })
  }

  const isOverridden = !!settings.weatherLocation
  const isDirty = locationInput.trim() !== settings.weatherLocation

  return (
    <>
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
          General
        </h1>
        <p
          style={{
            marginTop: 6,
            fontSize: 13,
            color: 'rgba(255,255,255,0.48)',
            letterSpacing: -0.1
          }}
        >
          System-wide preferences for how nivo behaves on your Mac.
        </p>
      </div>

      <SectionLabel text="System" />
      <SettingCard>
        <SettingRow
          icon={<LogIn {...ICON_STYLE} />}
          label="Launch at login"
          description="Open nivo automatically when you sign in."
          enabled={settings.launchAtLogin}
          onToggle={() => update('launchAtLogin', !settings.launchAtLogin)}
          isFirst
        />
      </SettingCard>

      <SectionLabel text="Visibility" />
      <SettingCard>
        <SettingRow
          icon={<Maximize2 {...ICON_STYLE} />}
          label="Hide in fullscreen"
          enabled={settings.hideInFullscreen}
          onToggle={() => update('hideInFullscreen', !settings.hideInFullscreen)}
          isFirst
        />
        <SettingRow
          icon={<ShieldOff {...ICON_STYLE} />}
          label="Hide from screen capture"
          enabled={settings.hideFromScreenCapture}
          onToggle={() => update('hideFromScreenCapture', !settings.hideFromScreenCapture)}
        />
      </SettingCard>

      <SectionLabel text="Behaviour" />
      <SettingCard>
        <SettingRow
          icon={<Vibrate {...ICON_STYLE} />}
          label="Haptic feedback"
          description="Subtle taps on interaction via Force Touch trackpads."
          enabled={settings.hapticFeedback}
          onToggle={() => update('hapticFeedback', !settings.hapticFeedback)}
          isFirst
        />
        <SettingRow
          icon={<ClipboardList {...ICON_STYLE} />}
          label="Clipboard history"
          description="Keep a searchable history of recent text you copy. Stored locally."
          enabled={settings.enableClipboardHistory}
          onToggle={() => update('enableClipboardHistory', !settings.enableClipboardHistory)}
        />
        <SettingRow
          icon={<Zap {...ICON_STYLE} />}
          label="Beam"
          description="Pin apps, URLs, and files for one-tap launch from the notch."
          enabled={settings.enableBeam}
          onToggle={() => update('enableBeam', !settings.enableBeam)}
        />
      </SettingCard>

      <SectionLabel text="Atmospheric" />
      <SettingCard>
        <SettingRow
          icon={<CloudSun {...ICON_STYLE} />}
          label="Ambient weather aura"
          description="Soft glows and rain when the notch is expanded."
          enabled={settings.showWeather}
          onToggle={() => update('showWeather', !settings.showWeather)}
          isFirst
        />
      </SettingCard>

      <SectionLabel text="Weather location" />
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              className="flex items-center justify-center shrink-0"
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                background: 'rgba(255,255,255,0.055)',
                color: 'rgba(255,255,255,0.65)'
              }}
            >
              <MapPin {...ICON_STYLE} />
            </div>
            <div className="flex flex-col min-w-0" style={{ gap: 2 }}>
              <span
                style={{
                  fontSize: 13.5,
                  fontWeight: 500,
                  color: 'rgba(255,255,255,0.95)',
                  letterSpacing: -0.1,
                  lineHeight: 1.2
                }}
              >
                Manual location
              </span>
              <span
                style={{
                  fontSize: 11.5,
                  color: 'rgba(255,255,255,0.42)',
                  lineHeight: 1.3
                }}
              >
                Override IP-based detection. Type a city or province (e.g. &quot;Pathum Thani&quot;).
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <div
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 10,
                paddingLeft: 12,
                paddingRight: 12,
                height: 36
              }}
            >
              <input
                type="text"
                value={locationInput}
                onChange={(e) => {
                  setLocationInput(e.target.value)
                  if (status.kind !== 'idle') setStatus({ kind: 'idle' })
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') submitLocation()
                }}
                placeholder={isOverridden ? settings.weatherLocation : 'Auto (IP-based)'}
                className="bg-transparent border-none outline-none text-white/85 placeholder:text-white/35 w-full"
                style={{ fontSize: 12.5 }}
              />
            </div>
            <button
              onClick={submitLocation}
              disabled={!isDirty || status.kind === 'saving' || !locationInput.trim()}
              className={
                !isDirty || status.kind === 'saving' || !locationInput.trim()
                  ? 'cursor-not-allowed'
                  : 'cursor-pointer'
              }
              style={{
                height: 36,
                paddingLeft: 14,
                paddingRight: 14,
                borderRadius: 10,
                border: '1px solid #a855f7',
                background:
                  !isDirty || status.kind === 'saving' || !locationInput.trim()
                    ? 'rgba(168,85,247,0.25)'
                    : '#a855f7',
                color: '#fff',
                fontSize: 12.5,
                fontWeight: 600,
                opacity: !isDirty || status.kind === 'saving' || !locationInput.trim() ? 0.7 : 1,
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              {status.kind === 'saving' ? (
                <Loader2 size={13} className="animate-spin" />
              ) : null}
              {status.kind === 'saving' ? 'Saving' : 'Set'}
            </button>
            {isOverridden && (
              <button
                onClick={clearLocation}
                disabled={status.kind === 'saving'}
                className="cursor-pointer"
                title="Use automatic detection"
                style={{
                  height: 36,
                  width: 36,
                  borderRadius: 10,
                  border: '1px solid rgba(255,255,255,0.12)',
                  background: 'rgba(255,255,255,0.05)',
                  color: 'rgba(255,255,255,0.7)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <X size={13} />
              </button>
            )}
          </div>

          {status.kind === 'success' && (
            <div
              style={{
                fontSize: 11.5,
                color: '#3AE15A',
                display: 'flex',
                alignItems: 'center',
                gap: 5
              }}
            >
              <Check size={12} />
              {status.message}
            </div>
          )}
          {status.kind === 'error' && (
            <div
              style={{
                fontSize: 11.5,
                color: '#ff6b80',
                fontFamily: 'ui-monospace, SFMono-Regular, monospace'
              }}
            >
              {status.message}
            </div>
          )}
          {status.kind === 'idle' && isOverridden && (
            <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.4)' }}>
              Currently overriding IP detection.
            </div>
          )}
        </div>
      </SettingCard>
    </>
  )
}
