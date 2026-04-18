interface SettingCardProps {
  title?: string
  children: React.ReactNode
}

export function SettingCard({ title, children }: SettingCardProps) {
  return (
    <div className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-xl overflow-hidden">
      {title && (
        <div className="px-5 py-2.5 border-b border-[#2C2C2E]">
          <span className="text-[11px] font-semibold text-white/40 uppercase tracking-widest">
            {title}
          </span>
        </div>
      )}
      {children}
    </div>
  )
}
