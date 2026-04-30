import { useEffect } from 'react'

export const THEME_ACCENTS: Record<string, { accent: string; glow: string }> = {
  midnight: { accent: '#6e7a99', glow: 'rgba(110, 122, 153, 0.15)' },
  graphite: { accent: '#98989d', glow: 'rgba(152, 152, 157, 0.12)' },
  ocean: { accent: '#0a84ff', glow: 'rgba(10, 132, 255, 0.18)' },
  forest: { accent: '#30d158', glow: 'rgba(48, 209, 88, 0.18)' },
  sunset: { accent: '#ff9f0a', glow: 'rgba(255, 159, 10, 0.18)' },
  berry: { accent: '#bf5af2', glow: 'rgba(191, 90, 242, 0.18)' },
  indigo: { accent: '#5e5ce6', glow: 'rgba(94, 92, 230, 0.18)' },
  rose: { accent: '#ff375f', glow: 'rgba(255, 55, 95, 0.18)' },
  teal: { accent: '#64d2ff', glow: 'rgba(100, 210, 255, 0.18)' },
  gold: { accent: '#ffd60a', glow: 'rgba(255, 214, 10, 0.18)' },
  mint: { accent: '#00fa9a', glow: 'rgba(0, 250, 154, 0.18)' },
  sky: { accent: '#87ceeb', glow: 'rgba(135, 206, 235, 0.18)' },
  lavender: { accent: '#e6e6fa', glow: 'rgba(230, 230, 250, 0.18)' },
  coral: { accent: '#ff7f50', glow: 'rgba(255, 127, 80, 0.18)' },
  silver: { accent: '#c0c0c0', glow: 'rgba(192, 192, 192, 0.18)' },
  plum: { accent: '#dda0dd', glow: 'rgba(221, 160, 221, 0.18)' }
}

export function useAppliedTheme(theme: ThemeId): void {
  useEffect(() => {
    const { accent, glow } = THEME_ACCENTS[theme] ?? THEME_ACCENTS.midnight
    const root = document.documentElement
    root.style.setProperty('--lume-accent', accent)
    root.style.setProperty('--lume-accent-glow', glow)
    root.style.setProperty('--lume-accent-soft', glow)
    root.style.setProperty('--nivo-accent', accent)
    root.style.setProperty('--nivo-accent-glow', glow)
    root.style.setProperty('--lume-purple', accent)
    root.style.setProperty('--lume-purple-glow', glow)
  }, [theme])
}
