import { Coffee } from 'lucide-react'
import { SettingCard } from './SettingCard'
import { SectionLabel } from './SectionLabel'
import { Pill } from './Pill'
import iconSrc from '../../../../../resources/icon.png'
import bmcQrSrc from '../../../../../resources/bmc_qr.png'

const BMC_URL = 'https://buymeacoffee.com/sainawmain'

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
            A free Dynamic Island for your Mac. Notifications, media, and live activities — right
            where the notch lives.
          </p>
          <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
            <Pill variant="soft">macOS · Apple Silicon</Pill>
            <Pill variant="accent">Free</Pill>
          </div>
        </div>
      </SettingCard>

      {/* Support */}
      <SectionLabel text="Support" />
      <SettingCard
        style={{
          background:
            'linear-gradient(135deg, rgba(253,224,71,0.12) 0%, rgba(253,224,71,0.03) 60%, rgba(255,255,255,0.02) 100%)',
          border: '1px solid rgba(253,224,71,0.22)'
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            paddingLeft: 18,
            paddingRight: 18,
            paddingTop: 16,
            paddingBottom: 16
          }}
        >
          <div
            style={{
              width: 78,
              height: 78,
              borderRadius: 12,
              background: 'rgba(255,255,255,0.95)',
              padding: 6,
              flexShrink: 0,
              boxShadow: '0 4px 14px rgba(0,0,0,0.18)'
            }}
          >
            <img
              src={bmcQrSrc}
              alt="Buy Me a Coffee QR"
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: '#fff',
                letterSpacing: -0.2,
                marginBottom: 4,
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              <Coffee size={14} color="#fde047" />
              Buy me a coffee
            </div>
            <p
              style={{
                fontSize: 11.5,
                color: 'rgba(255,255,255,0.55)',
                lineHeight: 1.4,
                marginBottom: 8
              }}
            >
              Nivo is free. If it earns a place on your Mac, a small tip helps keep it growing.
            </p>
            <button
              onClick={() => window.api.openExternal(BMC_URL)}
              className="cursor-pointer"
              style={{
                height: 30,
                paddingLeft: 12,
                paddingRight: 12,
                borderRadius: 8,
                border: '1px solid rgba(253,224,71,0.4)',
                background: 'rgba(253,224,71,0.15)',
                color: '#fde047',
                fontSize: 12,
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              <Coffee size={12} />
              buymeacoffee.com/sainawmain
            </button>
          </div>
        </div>
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
        © {year} Nivo · Made with care.
      </p>
    </>
  )
}
