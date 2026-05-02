import { useEffect, useMemo, useState } from 'react'
import {
  IconApps,
  IconLink,
  IconFile,
  IconArrowLeft,
  IconX,
  IconSearch,
  IconDeviceDesktop
} from '@tabler/icons-react'

type Step = 'pick-kind' | 'pick-app' | 'enter-url' | 'pick-file-loading'

interface BeamAddModalProps {
  onAdd: (input: BeamTileInput) => Promise<void>
  onClose: () => void
}

export const BeamAddModal: React.FC<BeamAddModalProps> = ({ onAdd, onClose }) => {
  const [step, setStep] = useState<Step>('pick-kind')
  const [apps, setApps] = useState<InstalledApp[]>([])
  const [appsLoading, setAppsLoading] = useState(false)
  const [appQuery, setAppQuery] = useState('')
  const [urlInput, setUrlInput] = useState('')
  const [urlLabel, setUrlLabel] = useState('')

  useEffect(() => {
    window.api.setNotchEditing(true)
    return () => window.api.setNotchEditing(false)
  }, [])

  useEffect(() => {
    if (step !== 'pick-app' || apps.length > 0) return
    setAppsLoading(true)
    window.api
      .listInstalledApps()
      .then((list) => setApps(list ?? []))
      .finally(() => setAppsLoading(false))
  }, [step, apps.length])

  const filteredApps = useMemo(() => {
    const q = appQuery.trim().toLowerCase()
    if (!q) return apps
    return apps.filter((a) => a.name.toLowerCase().includes(q))
  }, [apps, appQuery])

  const handlePickApp = async (app: InstalledApp): Promise<void> => {
    // App tiles always render the monitor glyph in BeamCard, so don't bother
    // saving the real macOS icon — it's been unreliable in this Electron build.
    await onAdd({ kind: 'app', label: app.name, target: app.path, icon: null })
    onClose()
  }

  const handleAddUrl = async (): Promise<void> => {
    const target = urlInput.trim()
    if (!target) return
    let url = target
    if (!/^https?:\/\//i.test(url)) url = `https://${url}`
    let host = url
    try {
      host = new URL(url).hostname.replace(/^www\./, '')
    } catch {
      // keep raw
    }
    await onAdd({
      kind: 'url',
      label: urlLabel.trim() || host,
      target: url,
      icon: null
    })
    onClose()
  }

  const handlePickFile = async (): Promise<void> => {
    setStep('pick-file-loading')
    const result = await window.api.pickBeamFile()
    if (!result) {
      setStep('pick-kind')
      return
    }
    await onAdd({
      kind: 'file',
      label: result.label,
      target: result.path,
      icon: null
    })
    onClose()
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 30,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '4px'
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '320px',
          maxHeight: '100%',
          background: 'rgba(10,10,10,0.93)',
          backdropFilter: 'blur(120px) saturate(200%)',
          WebkitBackdropFilter: 'blur(120px) saturate(200%)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: '14px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 10px',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            flexShrink: 0
          }}
        >
          {step !== 'pick-kind' && step !== 'pick-file-loading' && (
            <div
              onClick={() => setStep('pick-kind')}
              style={{
                cursor: 'pointer',
                color: 'rgba(255,255,255,0.5)',
                display: 'flex'
              }}
            >
              <IconArrowLeft size={14} stroke={2} />
            </div>
          )}
          <div style={{ flex: 1, color: '#fff', fontSize: '12px', fontWeight: 600 }}>
            {step === 'pick-kind' && 'Add to Beam'}
            {step === 'pick-app' && 'Pick an app'}
            {step === 'enter-url' && 'Add a URL'}
            {step === 'pick-file-loading' && 'Picking…'}
          </div>
          <div
            onClick={onClose}
            style={{ cursor: 'pointer', color: 'rgba(255,255,255,0.4)', display: 'flex' }}
          >
            <IconX size={14} stroke={2} />
          </div>
        </div>

        {step === 'pick-kind' && (
          <div style={{ padding: '6px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <KindRow
              icon={<IconApps size={14} stroke={2} />}
              label="Application"
              hint="Pick from your installed apps"
              onClick={() => setStep('pick-app')}
            />
            <KindRow
              icon={<IconLink size={14} stroke={2} />}
              label="URL"
              hint="Open a website in your browser"
              onClick={() => setStep('enter-url')}
            />
            <KindRow
              icon={<IconFile size={14} stroke={2} />}
              label="File or Folder"
              hint="Reveal a path with macOS"
              onClick={handlePickFile}
            />
          </div>
        )}

        {step === 'pick-app' && (
          <>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 10px',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
                flexShrink: 0
              }}
            >
              <IconSearch size={12} stroke={2} style={{ color: 'rgba(255,255,255,0.5)' }} />
              <input
                autoFocus
                value={appQuery}
                onChange={(e) => setAppQuery(e.target.value)}
                placeholder="Search apps…"
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: '#fff',
                  fontSize: '11px',
                  fontWeight: 500
                }}
              />
            </div>
            <div
              style={{
                flex: 1,
                minHeight: 0,
                maxHeight: '120px',
                overflowY: 'auto',
                padding: '4px'
              }}
            >
              {appsLoading && (
                <div
                  style={{
                    padding: '10px',
                    color: 'rgba(255,255,255,0.4)',
                    fontSize: 10,
                    textAlign: 'center'
                  }}
                >
                  Loading apps…
                </div>
              )}
              {!appsLoading && filteredApps.length === 0 && (
                <div
                  style={{
                    padding: '10px',
                    color: 'rgba(255,255,255,0.4)',
                    fontSize: 10,
                    textAlign: 'center'
                  }}
                >
                  No matches.
                </div>
              )}
              {filteredApps.slice(0, 60).map((app) => (
                <div
                  key={app.path}
                  onClick={() => handlePickApp(app)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '4px 6px',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')
                  }
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <div
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: 5,
                      background: 'rgba(255,255,255,0.06)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    <IconDeviceDesktop
                      size={11}
                      stroke={2}
                      style={{ color: 'rgba(255,255,255,0.7)' }}
                    />
                  </div>
                  <div
                    style={{
                      color: '#fff',
                      fontSize: 11,
                      fontWeight: 500,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                  >
                    {app.name}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {step === 'enter-url' && (
          <div style={{ padding: '10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <input
              autoFocus
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://example.com"
              onKeyDown={(e) => e.key === 'Enter' && handleAddUrl()}
              style={inputStyle}
            />
            <input
              value={urlLabel}
              onChange={(e) => setUrlLabel(e.target.value)}
              placeholder="Label (optional)"
              onKeyDown={(e) => e.key === 'Enter' && handleAddUrl()}
              style={inputStyle}
            />
            <div
              onClick={handleAddUrl}
              style={{
                marginTop: 2,
                padding: '6px 10px',
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '7px',
                color: '#fff',
                fontSize: 11,
                fontWeight: 600,
                textAlign: 'center',
                cursor: 'pointer'
              }}
            >
              Add
            </div>
          </div>
        )}

        {step === 'pick-file-loading' && (
          <div
            style={{
              padding: '16px',
              color: 'rgba(255,255,255,0.4)',
              fontSize: 10,
              textAlign: 'center'
            }}
          >
            Waiting for file picker…
          </div>
        )}
      </div>
    </div>
  )
}

const KindRow: React.FC<{
  icon: React.ReactNode
  label: string
  hint: string
  onClick: () => void
}> = ({ icon, label, hint, onClick }) => {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '6px 8px',
        borderRadius: '8px',
        cursor: 'pointer',
        background: hovered ? 'rgba(255,255,255,0.06)' : 'transparent'
      }}
    >
      <div
        style={{
          width: 24,
          height: 24,
          borderRadius: 6,
          background: 'rgba(255,255,255,0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          flexShrink: 0
        }}
      >
        {icon}
      </div>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ color: '#fff', fontSize: 11, fontWeight: 600 }}>{label}</div>
        <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 9, fontWeight: 500 }}>{hint}</div>
      </div>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 7,
  outline: 'none',
  color: '#fff',
  fontSize: 11,
  fontWeight: 500,
  padding: '6px 8px'
}
