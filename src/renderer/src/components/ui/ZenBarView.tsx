import React, { useEffect, useRef, useState } from 'react'
import {
  IconPlayerPlayFilled,
  IconPlayerPauseFilled,
  IconClock,
  IconHourglass,
  IconRotate,
  IconFlag,
  IconTarget,
  IconX,
  IconPlus
} from '@tabler/icons-react'
import { COUNTDOWN_PRESETS_SEC, ZenTimerApi } from '../../hooks/useZenTimer'

function pad(n: number, width = 2): string {
  return String(n).padStart(width, '0')
}

function formatCountdown(ms: number, presetSec: number): string {
  const total = Math.ceil(ms / 1000)
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  if (presetSec >= 3600) return `${pad(h)}:${pad(m)}:${pad(s)}`
  return `${pad(m)}:${pad(s)}`
}

function formatStopwatch(ms: number): string {
  const totalCs = Math.floor(ms / 10)
  const cs = totalCs % 100
  const totalSec = Math.floor(totalCs / 100)
  const s = totalSec % 60
  const totalMin = Math.floor(totalSec / 60)
  const m = totalMin % 60
  const h = Math.floor(totalMin / 60)
  if (h > 0) return `${pad(h)}:${pad(m)}:${pad(s)}`
  return `${pad(m)}:${pad(s)}.${pad(cs)}`
}

function formatPresetLabel(sec: number): string {
  if (sec >= 3600) {
    const h = Math.floor(sec / 3600)
    const m = Math.floor((sec % 3600) / 60)
    const s = sec % 60
    return `${pad(h)}:${pad(m)}:${pad(s)}`
  }
  return `${pad(Math.floor(sec / 60))}:${pad(sec % 60)}`
}

// Accept "5" (5 minutes), "5:30" (mm:ss), or "1:30:00" (hh:mm:ss). Returns
// total seconds, or null if the string can't be parsed or is out of range.
function parseTimeInput(input: string): number | null {
  const parts = input.trim().split(':')
  if (parts.length === 0 || parts.length > 3) return null
  if (parts.some((p) => p === '' || !/^\d+$/.test(p))) return null
  const nums = parts.map((p) => parseInt(p, 10))
  let sec: number
  if (nums.length === 1) sec = nums[0] * 60
  else if (nums.length === 2) sec = nums[0] * 60 + nums[1]
  else sec = nums[0] * 3600 + nums[1] * 60 + nums[2]
  if (!Number.isFinite(sec) || sec <= 0 || sec > 24 * 60 * 60) return null
  return sec
}

interface PresetCardProps {
  label: string
  onClick?: () => void
  accentColor: string
  isSelected?: boolean
}

const PresetCard: React.FC<PresetCardProps> = ({ label, onClick, accentColor, isSelected }) => (
  <div
    onClick={onClick}
    style={{
      background: isSelected ? `${accentColor}15` : 'rgba(255,255,255,0.03)',
      border: isSelected ? `1px solid ${accentColor}40` : '1px solid rgba(255,255,255,0.08)',
      borderRadius: '20px',
      padding: '6px 10px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    }}
  >
    <div
      style={{
        color: isSelected ? accentColor : '#fff',
        fontSize: '16px',
        fontWeight: '700'
      }}
    >
      {label}
    </div>
  </div>
)

interface CustomTileProps {
  accentColor: string
  isSelected: boolean
  customLabel: string | null
  onCommit: (sec: number) => void
}

const CustomTile: React.FC<CustomTileProps> = ({
  accentColor,
  isSelected,
  customLabel,
  onCommit
}) => {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')
  const [error, setError] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Notch is non-focusable by default; flip while editing so the input
  // receives keystrokes.
  useEffect(() => {
    if (!editing) return
    window.api.setNotchEditing(true)
    inputRef.current?.focus()
    return () => {
      window.api.setNotchEditing(false)
    }
  }, [editing])

  const commit = (): void => {
    const sec = parseTimeInput(draft)
    if (sec === null) {
      setError(true)
      return
    }
    onCommit(sec)
    setEditing(false)
    setError(false)
  }

  const baseStyle: React.CSSProperties = {
    background: isSelected ? `${accentColor}15` : 'rgba(255,255,255,0.03)',
    border: error
      ? '1px solid rgba(255,80,80,0.5)'
      : isSelected
        ? `1px solid ${accentColor}40`
        : '1px solid rgba(255,255,255,0.08)',
    borderRadius: '20px',
    padding: '6px 10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    minWidth: 0
  }

  if (editing) {
    return (
      <div style={baseStyle}>
        <input
          ref={inputRef}
          value={draft}
          placeholder="mm:ss"
          onChange={(e) => {
            setDraft(e.target.value)
            if (error) setError(false)
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commit()
            else if (e.key === 'Escape') {
              setEditing(false)
              setError(false)
            }
          }}
          onBlur={commit}
          style={{
            width: '100%',
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: '#fff',
            fontSize: '15px',
            fontWeight: '700',
            textAlign: 'center',
            fontVariantNumeric: 'tabular-nums'
          }}
        />
      </div>
    )
  }

  return (
    <div
      onClick={() => {
        setDraft(customLabel ?? '')
        setEditing(true)
      }}
      style={baseStyle}
    >
      <IconPlus
        size={12}
        stroke={2.5}
        style={{
          color: isSelected ? accentColor : 'rgba(255,255,255,0.5)',
          flexShrink: 0
        }}
      />
      <div
        style={{
          color: isSelected ? accentColor : '#fff',
          fontSize: customLabel ? '16px' : '12px',
          fontWeight: '700',
          letterSpacing: customLabel ? '-0.01em' : '0.04em',
          textTransform: customLabel ? 'none' : 'uppercase'
        }}
      >
        {customLabel ?? 'Custom'}
      </div>
    </div>
  )
}

interface TargetPillProps {
  accentColor: string
  targetMs: number | null
  onSet: (ms: number | null) => void
}

const TargetPill: React.FC<TargetPillProps> = ({ accentColor, targetMs, onSet }) => {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')
  const [error, setError] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!editing) return
    window.api.setNotchEditing(true)
    inputRef.current?.focus()
    return () => {
      window.api.setNotchEditing(false)
    }
  }, [editing])

  const commit = (): void => {
    if (draft.trim() === '') {
      onSet(null)
      setEditing(false)
      setError(false)
      return
    }
    const sec = parseTimeInput(draft)
    if (sec === null) {
      setError(true)
      return
    }
    onSet(sec * 1000)
    setEditing(false)
    setError(false)
  }

  const hasTarget = targetMs !== null
  const targetLabel = hasTarget ? formatPresetLabel(Math.floor(targetMs / 1000)) : null

  const baseStyle: React.CSSProperties = {
    background: hasTarget ? `${accentColor}15` : 'rgba(255,255,255,0.03)',
    border: error
      ? '1px solid rgba(255,80,80,0.5)'
      : hasTarget
        ? `1px solid ${accentColor}40`
        : '1px solid rgba(255,255,255,0.08)',
    borderRadius: '100px',
    height: '30px',
    padding: '0 12px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    flex: 1,
    minWidth: 0
  }

  if (editing) {
    return (
      <div style={baseStyle}>
        <IconTarget size={12} stroke={2.5} style={{ color: accentColor, flexShrink: 0 }} />
        <input
          ref={inputRef}
          value={draft}
          placeholder="mm:ss"
          onChange={(e) => {
            setDraft(e.target.value)
            if (error) setError(false)
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commit()
            else if (e.key === 'Escape') {
              setEditing(false)
              setError(false)
            }
          }}
          onBlur={commit}
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: '#fff',
            fontSize: '12px',
            fontWeight: '700',
            fontVariantNumeric: 'tabular-nums'
          }}
        />
      </div>
    )
  }

  return (
    <div
      onClick={() => {
        setDraft(targetLabel ?? '')
        setEditing(true)
      }}
      style={baseStyle}
    >
      <IconTarget
        size={12}
        stroke={2.5}
        style={{
          color: hasTarget ? accentColor : 'rgba(255,255,255,0.5)',
          flexShrink: 0
        }}
      />
      <span
        style={{
          flex: 1,
          fontSize: hasTarget ? '13px' : '11px',
          fontWeight: '700',
          color: hasTarget ? accentColor : 'rgba(255,255,255,0.5)',
          textTransform: hasTarget ? 'none' : 'uppercase',
          letterSpacing: hasTarget ? '-0.01em' : '0.04em',
          fontVariantNumeric: 'tabular-nums',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}
      >
        {hasTarget ? targetLabel : 'Set target'}
      </span>
      {hasTarget && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onSet(null)
          }}
          style={{
            background: 'transparent',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            color: 'rgba(255,255,255,0.5)',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <IconX size={12} stroke={2.5} />
        </button>
      )}
    </div>
  )
}

interface ZenBarViewProps {
  accentColor: string
  zen: ZenTimerApi
}

export const ZenBarView: React.FC<ZenBarViewProps> = ({ accentColor, zen }) => {
  const displayTime =
    zen.mode === 'countdown'
      ? formatCountdown(zen.countdownMs, zen.presetSec)
      : formatStopwatch(zen.stopwatchMs)

  const isCustomCountdown = !COUNTDOWN_PRESETS_SEC.includes(zen.presetSec)
  const customLabel = isCustomCountdown ? formatPresetLabel(zen.presetSec) : null

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        gap: '12px',
        padding: '0px 0px',
        height: '100%',
        boxSizing: 'border-box'
      }}
    >
      {/* Left Pane - Main Display */}
      <div
        style={{
          flex: 1,
          background: 'rgba(255,255,255,0.04)',
          borderRadius: '20px',
          display: 'flex',
          flexDirection: 'column',
          padding: '10px',
          border: '1px solid rgba(255,255,255,0.05)',
          justifyContent: 'space-between',
          overflow: 'hidden'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
          <div
            style={{
              fontSize: '56px',
              fontWeight: '900',
              color: '#fff',
              letterSpacing: '-0.04em',
              fontFamily: 'system-ui',
              fontVariantNumeric: 'tabular-nums'
            }}
          >
            {displayTime}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          <div
            onClick={zen.toggle}
            style={{
              flex: 1,
              background: zen.isActive ? `${accentColor}30` : `${accentColor}20`,
              height: '45px',
              borderRadius: '30px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              border: zen.isActive ? `1px solid ${accentColor}60` : `1px solid ${accentColor}40`
            }}
          >
            {zen.isActive ? (
              <>
                <IconPlayerPauseFilled size={16} style={{ color: accentColor }} />
                <span style={{ fontSize: '12px', fontWeight: '800', color: accentColor }}>
                  Pause
                </span>
              </>
            ) : (
              <>
                <IconPlayerPlayFilled size={16} style={{ color: accentColor }} />
                <span style={{ fontSize: '12px', fontWeight: '800', color: accentColor }}>
                  Play
                </span>
              </>
            )}
          </div>
          <div
            onClick={zen.restart}
            style={{
              flex: 1,
              background: 'rgba(255,255,255,0.06)',
              height: '45px',
              borderRadius: '30px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <IconRotate size={16} stroke={2.5} style={{ color: '#fff' }} />
            <span style={{ fontSize: '12px', fontWeight: '800', color: '#fff' }}>Restart</span>
          </div>
        </div>
      </div>

      {/* Right Pane - Mode-specific controls */}
      <div
        style={{ flex: 1.5, display: 'flex', flexDirection: 'column', gap: '8px', minHeight: 0 }}
      >
        {/* Custom Tabs */}
        <div
          style={{
            background: 'rgba(255,255,255,0.03)',
            borderRadius: '100px',
            padding: '3px',
            display: 'flex',
            gap: '2px',
            border: '1px solid rgba(255,255,255,0.05)'
          }}
        >
          <div
            onClick={() => zen.setMode('countdown')}
            style={{
              flex: 1,
              background: zen.mode === 'countdown' ? `${accentColor}15` : 'transparent',
              border:
                zen.mode === 'countdown' ? `1px solid ${accentColor}30` : '1px solid transparent',
              borderRadius: '100px',
              height: '30px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              color: zen.mode === 'countdown' ? accentColor : 'rgba(255,255,255,0.4)',
              fontSize: '11px',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <IconHourglass size={14} stroke={zen.mode === 'countdown' ? 2.5 : 2} />
            Countdown
          </div>
          <div
            onClick={() => zen.setMode('stopwatch')}
            style={{
              flex: 1,
              background: zen.mode === 'stopwatch' ? `${accentColor}15` : 'transparent',
              border:
                zen.mode === 'stopwatch' ? `1px solid ${accentColor}30` : '1px solid transparent',
              borderRadius: '100px',
              height: '30px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              color: zen.mode === 'stopwatch' ? accentColor : 'rgba(255,255,255,0.4)',
              fontSize: '11px',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <IconClock size={14} stroke={zen.mode === 'stopwatch' ? 2.5 : 2} />
            Stopwatch
          </div>
        </div>

        {zen.mode === 'countdown' ? (
          <div
            style={{
              flex: 1,
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gridTemplateRows: 'repeat(2, 1fr)',
              gap: '6px'
            }}
          >
            {COUNTDOWN_PRESETS_SEC.map((sec) => (
              <PresetCard
                key={sec}
                label={formatPresetLabel(sec)}
                accentColor={accentColor}
                isSelected={zen.presetSec === sec}
                onClick={() => zen.selectPreset(sec)}
              />
            ))}
            <CustomTile
              accentColor={accentColor}
              isSelected={isCustomCountdown}
              customLabel={customLabel}
              onCommit={(sec) => zen.selectPreset(sec)}
            />
          </div>
        ) : (
          <StopwatchPanel zen={zen} accentColor={accentColor} />
        )}
      </div>
    </div>
  )
}

interface StopwatchPanelProps {
  zen: ZenTimerApi
  accentColor: string
}

const StopwatchPanel: React.FC<StopwatchPanelProps> = ({ zen, accentColor }) => {
  const lapDisabled = !zen.isActive && zen.stopwatchMs === 0

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px', minHeight: 0 }}>
      <div style={{ display: 'flex', gap: '6px', alignItems: 'stretch' }}>
        <TargetPill accentColor={accentColor} targetMs={zen.targetMs} onSet={zen.setTarget} />
        <button
          onClick={zen.recordLap}
          disabled={lapDisabled}
          style={{
            background: lapDisabled ? 'rgba(255,255,255,0.03)' : `${accentColor}20`,
            border: lapDisabled ? '1px solid rgba(255,255,255,0.05)' : `1px solid ${accentColor}40`,
            borderRadius: '100px',
            height: '30px',
            padding: '0 12px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            cursor: lapDisabled ? 'default' : 'pointer',
            opacity: lapDisabled ? 0.4 : 1,
            transition: 'all 0.2s ease'
          }}
        >
          <IconFlag
            size={12}
            stroke={2.5}
            style={{ color: lapDisabled ? 'rgba(255,255,255,0.5)' : accentColor }}
          />
          <span
            style={{
              fontSize: '11px',
              fontWeight: '800',
              color: lapDisabled ? 'rgba(255,255,255,0.5)' : accentColor,
              textTransform: 'uppercase',
              letterSpacing: '0.04em'
            }}
          >
            Lap
          </span>
        </button>
      </div>

      <div
        style={{
          flex: 1,
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.05)',
          borderRadius: '14px',
          padding: '6px 4px 6px 10px',
          minHeight: 0,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {zen.laps.length === 0 ? (
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '10px',
              fontWeight: '700',
              color: 'rgba(255,255,255,0.35)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em'
            }}
          >
            No laps yet
          </div>
        ) : (
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '2px',
              paddingRight: '6px'
            }}
          >
            {zen.laps.map((lapMs, idx) => {
              const lapNumber = zen.laps.length - idx
              const prevLap = zen.laps[idx + 1] ?? 0
              const split = lapMs - prevLap
              return (
                <div
                  key={`${lapNumber}-${lapMs}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '3px 4px',
                    fontVariantNumeric: 'tabular-nums'
                  }}
                >
                  <span
                    style={{
                      fontSize: '9px',
                      fontWeight: '800',
                      color: 'rgba(255,255,255,0.4)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em'
                    }}
                  >
                    Lap {lapNumber}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                    <span
                      style={{
                        fontSize: '9px',
                        fontWeight: '700',
                        color: 'rgba(255,255,255,0.4)'
                      }}
                    >
                      +{formatStopwatch(split)}
                    </span>
                    <span style={{ fontSize: '12px', fontWeight: '700', color: '#fff' }}>
                      {formatStopwatch(lapMs)}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
