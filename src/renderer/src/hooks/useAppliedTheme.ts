import { useEffect } from 'react'

const THEME_ACCENTS: Record<ThemeId, { accent: string; glow: string }> = {
  midnight: { accent: '#6e7a99', glow: 'rgba(110, 122, 153, 0.15)' },
  graphite: { accent: '#98989d', glow: 'rgba(152, 152, 157, 0.12)' },
  ocean: { accent: '#0a84ff', glow: 'rgba(10, 132, 255, 0.18)' },
  forest: { accent: '#30d158', glow: 'rgba(48, 209, 88, 0.18)' },
  sunset: { accent: '#ff9f0a', glow: 'rgba(255, 159, 10, 0.18)' },
  berry: { accent: '#bf5af2', glow: 'rgba(191, 90, 242, 0.18)' }
}

export function useAppliedTheme(theme: ThemeId): void {
  useEffect(() => {
    const { accent, glow } = THEME_ACCENTS[theme] ?? THEME_ACCENTS.midnight
    const root = document.documentElement
    root.style.setProperty('--lume-accent', accent)
    root.style.setProperty('--lume-accent-glow', glow)
    root.style.setProperty('--lume-purple', accent)
    root.style.setProperty('--lume-purple-glow', glow)
  }, [theme])
}
