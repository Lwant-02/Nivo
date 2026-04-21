import { Settings } from 'lucide-react'

export function PlaceholderPanel({ id }: { id: string }) {
  const label = id.charAt(0).toUpperCase() + id.slice(1)
  return (
    <div
      className="flex flex-col items-center justify-center"
      style={{ height: 260, opacity: 0.4 }}
    >
      <div
        className="flex items-center justify-center"
        style={{
          width: 56,
          height: 56,
          borderRadius: 16,
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.07)',
          marginBottom: 14
        }}
      >
        <Settings size={22} color="rgba(255,255,255,0.55)" />
      </div>
      <p style={{ fontSize: 15, fontWeight: 600, color: '#fff' }}>{label}</p>
      <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.45)', marginTop: 4 }}>Coming soon</p>
    </div>
  )
}
