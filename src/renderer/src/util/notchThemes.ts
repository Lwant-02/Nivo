export interface NotchThemeStyle {
  label: string
  collapsedBg: string
  outerBg: string
  outerBorder: string
  outerShadow: string
  innerBg: string
  innerOverlay?: string
  preview: {
    gradient: string
    ring: string
  }
}

export const NOTCH_THEMES: Record<NotchThemeId, NotchThemeStyle> = {
  obsidian: {
    label: 'Obsidian',
    collapsedBg: '#000',
    outerBg:
      'linear-gradient(180deg, rgba(0,0,0,0.88) 0%, rgba(8,8,14,0.85) 100%)',
    outerBorder: 'rgba(255,255,255,0.10)',
    outerShadow: '0 18px 48px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.05)',
    innerBg:
      'linear-gradient(180deg, rgba(0,0,0,0.95) 0%, rgba(15,15,22,0.92) 100%)',
    preview: {
      gradient: 'linear-gradient(135deg, #1a1d29 0%, #050509 100%)',
      ring: '#6e7a99'
    }
  },
  frost: {
    label: 'Frost',
    collapsedBg: '#000',
    outerBg:
      'linear-gradient(180deg, rgba(220,235,255,0.22) 0%, rgba(150,190,240,0.10) 100%)',
    outerBorder: 'rgba(190,225,255,0.32)',
    outerShadow:
      '0 18px 48px rgba(80,150,255,0.22), inset 0 1px 0 rgba(255,255,255,0.20)',
    innerBg:
      'linear-gradient(180deg, rgba(18,28,48,0.82) 0%, rgba(22,42,72,0.78) 100%)',
    innerOverlay:
      'radial-gradient(120% 80% at 0% 0%, rgba(180,220,255,0.18) 0%, transparent 60%)',
    preview: {
      gradient: 'linear-gradient(135deg, #d8eaff 0%, #6aa6e8 100%)',
      ring: '#7fb6ef'
    }
  },
  aurora: {
    label: 'Aurora',
    collapsedBg: '#000',
    outerBg:
      'linear-gradient(135deg, rgba(180,80,255,0.26) 0%, rgba(255,80,180,0.20) 50%, rgba(80,200,255,0.24) 100%)',
    outerBorder: 'rgba(220,180,255,0.32)',
    outerShadow:
      '0 18px 48px rgba(180,80,255,0.28), inset 0 1px 0 rgba(255,255,255,0.10)',
    innerBg:
      'linear-gradient(135deg, rgba(28,12,42,0.88) 0%, rgba(38,16,48,0.84) 50%, rgba(16,28,52,0.88) 100%)',
    innerOverlay:
      'radial-gradient(140% 90% at 100% 0%, rgba(255,120,200,0.18) 0%, transparent 55%), radial-gradient(120% 80% at 0% 100%, rgba(80,200,255,0.18) 0%, transparent 55%)',
    preview: {
      gradient: 'linear-gradient(135deg, #b850ff 0%, #ff5fb1 50%, #50c8ff 100%)',
      ring: '#d684ff'
    }
  },
  sand: {
    label: 'Sand',
    collapsedBg: '#000',
    outerBg:
      'linear-gradient(180deg, rgba(255,200,140,0.22) 0%, rgba(220,150,90,0.12) 100%)',
    outerBorder: 'rgba(255,200,140,0.30)',
    outerShadow:
      '0 18px 48px rgba(220,150,90,0.22), inset 0 1px 0 rgba(255,220,180,0.12)',
    innerBg:
      'linear-gradient(180deg, rgba(42,30,20,0.88) 0%, rgba(28,20,15,0.86) 100%)',
    innerOverlay:
      'radial-gradient(120% 80% at 100% 0%, rgba(255,200,140,0.18) 0%, transparent 60%)',
    preview: {
      gradient: 'linear-gradient(135deg, #ffc88c 0%, #d8965a 100%)',
      ring: '#e6a878'
    }
  },
  lavender: {
    label: 'Lavender',
    collapsedBg: '#000',
    outerBg:
      'linear-gradient(180deg, rgba(180,160,255,0.22) 0%, rgba(140,120,240,0.12) 100%)',
    outerBorder: 'rgba(180,160,255,0.32)',
    outerShadow:
      '0 18px 48px rgba(140,120,240,0.22), inset 0 1px 0 rgba(255,255,255,0.10)',
    innerBg:
      'linear-gradient(180deg, rgba(24,20,42,0.92) 0%, rgba(18,15,32,0.88) 100%)',
    innerOverlay:
      'radial-gradient(120% 80% at 0% 0%, rgba(180,160,255,0.15) 0%, transparent 60%)',
    preview: {
      gradient: 'linear-gradient(135deg, #b4a0ff 0%, #7c68ff 100%)',
      ring: '#9a84ff'
    }
  },
  crimson: {
    label: 'Crimson',
    collapsedBg: '#000',
    outerBg:
      'linear-gradient(180deg, rgba(255,80,100,0.20) 0%, rgba(200,40,60,0.10) 100%)',
    outerBorder: 'rgba(255,100,120,0.28)',
    outerShadow:
      '0 18px 48px rgba(200,40,60,0.25), inset 0 1px 0 rgba(255,255,255,0.08)',
    innerBg:
      'linear-gradient(180deg, rgba(32,12,15,0.94) 0%, rgba(22,8,10,0.90) 100%)',
    innerOverlay:
      'radial-gradient(120% 80% at 100% 0%, rgba(255,80,100,0.12) 0%, transparent 60%)',
    preview: {
      gradient: 'linear-gradient(135deg, #ff5064 0%, #c8283c 100%)',
      ring: '#ff6478'
    }
  },
  emerald: {
    label: 'Emerald',
    collapsedBg: '#000',
    outerBg:
      'linear-gradient(180deg, rgba(80,255,180,0.18) 0%, rgba(40,200,140,0.08) 100%)',
    outerBorder: 'rgba(100,255,200,0.25)',
    outerShadow:
      '0 18px 48px rgba(40,200,140,0.22), inset 0 1px 0 rgba(255,255,255,0.08)',
    innerBg:
      'linear-gradient(180deg, rgba(10,32,24,0.94) 0%, rgba(5,22,18,0.90) 100%)',
    innerOverlay:
      'radial-gradient(120% 80% at 0% 100%, rgba(80,255,180,0.12) 0%, transparent 60%)',
    preview: {
      gradient: 'linear-gradient(135deg, #50ffb4 0%, #28c88c 100%)',
      ring: '#64ffc8'
    }
  },
  amber: {
    label: 'Amber',
    collapsedBg: '#000',
    outerBg:
      'linear-gradient(180deg, rgba(255,180,60,0.20) 0%, rgba(220,140,40,0.10) 100%)',
    outerBorder: 'rgba(255,200,100,0.30)',
    outerShadow:
      '0 18px 48px rgba(220,140,40,0.22), inset 0 1px 0 rgba(255,255,255,0.10)',
    innerBg:
      'linear-gradient(180deg, rgba(32,24,10,0.94) 0%, rgba(22,18,5,0.90) 100%)',
    innerOverlay:
      'radial-gradient(120% 80% at 50% 0%, rgba(255,180,60,0.15) 0%, transparent 60%)',
    preview: {
      gradient: 'linear-gradient(135deg, #ffb43c 0%, #dc8c28 100%)',
      ring: '#ffc864'
    }
  }
}

export function getNotchTheme(id: NotchThemeId | undefined): NotchThemeStyle {
  return NOTCH_THEMES[id ?? 'obsidian'] ?? NOTCH_THEMES.obsidian
}
