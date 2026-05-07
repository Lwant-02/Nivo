export interface NotchThemeStyle {
  label: string
  collapsedBg: string
  outerBg: string
  outerBorder: string
  outerShadow: string
  innerBg: string
  innerOverlay?: string
  accent?: string
  preview: {
    gradient: string
    ring: string
  }
}

export const NOTCH_THEMES: Record<NotchThemeId, NotchThemeStyle> = {
  glass: {
    label: 'Liquid Glass',
    collapsedBg: 'rgba(0,0,0,0.2)',
    outerBg: 'transparent',
    outerBorder: 'rgba(247, 238, 238, 0.3)',
    outerShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
    innerBg: 'black',
    innerOverlay: '',
    preview: {
      gradient: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.05) 100%)',
      ring: 'rgba(255,255,255,0.4)'
    }
  }
}

export function getNotchTheme(id: NotchThemeId | undefined): NotchThemeStyle {
  return NOTCH_THEMES[id ?? 'glass'] ?? NOTCH_THEMES.glass
}
