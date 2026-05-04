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
    outerBg: 'linear-gradient(180deg, rgba(40,40,52,0.42) 0%, rgba(15,15,22,0.52) 100%)',
    outerBorder: 'rgba(255,255,255,0.45)',
    outerShadow:
      '0 12px 40px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.35), inset 0 -1px 0 rgba(0,0,0,0.45)',
    innerBg: 'linear-gradient(180deg, rgba(22,22,30,0.82) 0%, rgba(8,8,14,0.90) 100%)',
    innerOverlay:
      'radial-gradient(140% 90% at 50% -20%, rgba(255,255,255,0.22) 0%, transparent 55%), radial-gradient(80% 50% at 100% 0%, rgba(180,200,255,0.10) 0%, transparent 60%)',
    preview: {
      gradient: 'linear-gradient(135deg, #2a2d39 0%, #050509 100%)',
      ring: '#8a96b5'
    }
  },
  frost: {
    label: 'Frost',
    collapsedBg: '#000',
    outerBg: 'linear-gradient(180deg, rgba(220,235,255,0.32) 0%, rgba(150,190,240,0.22) 100%)',
    outerBorder: 'rgba(220,240,255,0.62)',
    outerShadow:
      '0 12px 40px rgba(80,150,255,0.35), inset 0 1px 0 rgba(255,255,255,0.55), inset 0 -1px 0 rgba(40,80,140,0.22)',
    innerBg: 'linear-gradient(180deg, rgba(32,46,72,0.78) 0%, rgba(18,28,48,0.88) 100%)',
    innerOverlay:
      'radial-gradient(140% 90% at 50% -20%, rgba(230,242,255,0.32) 0%, transparent 55%), radial-gradient(90% 65% at 100% 20%, rgba(180,220,255,0.18) 0%, transparent 60%)',
    preview: {
      gradient: 'linear-gradient(135deg, #d8eaff 0%, #6aa6e8 100%)',
      ring: '#7fb6ef'
    }
  },
  aurora: {
    label: 'Aurora',
    collapsedBg: '#000',
    outerBg:
      'linear-gradient(135deg, rgba(180,80,255,0.32) 0%, rgba(255,80,180,0.26) 50%, rgba(80,200,255,0.30) 100%)',
    outerBorder: 'rgba(230,200,255,0.6)',
    outerShadow:
      '0 12px 40px rgba(180,80,255,0.42), inset 0 1px 0 rgba(255,255,255,0.42), inset 0 -1px 0 rgba(60,20,100,0.30)',
    innerBg:
      'linear-gradient(135deg, rgba(38,18,56,0.85) 0%, rgba(48,22,62,0.85) 50%, rgba(22,36,68,0.88) 100%)',
    innerOverlay:
      'radial-gradient(140% 90% at 50% -20%, rgba(255,255,255,0.25) 0%, transparent 55%), radial-gradient(120% 80% at 100% 0%, rgba(255,120,200,0.22) 0%, transparent 55%), radial-gradient(100% 70% at 0% 100%, rgba(80,200,255,0.20) 0%, transparent 55%)',
    preview: {
      gradient: 'linear-gradient(135deg, #b850ff 0%, #ff5fb1 50%, #50c8ff 100%)',
      ring: '#d684ff'
    }
  },
  sand: {
    label: 'Sand',
    collapsedBg: '#000',
    outerBg: 'linear-gradient(180deg, rgba(255,210,160,0.32) 0%, rgba(220,160,100,0.22) 100%)',
    outerBorder: 'rgba(255,220,180,0.60)',
    outerShadow:
      '0 12px 40px rgba(220,150,90,0.38), inset 0 1px 0 rgba(255,235,200,0.50), inset 0 -1px 0 rgba(120,70,30,0.30)',
    innerBg: 'linear-gradient(180deg, rgba(56,40,28,0.82) 0%, rgba(32,22,16,0.90) 100%)',
    innerOverlay:
      'radial-gradient(140% 90% at 50% -20%, rgba(255,225,190,0.30) 0%, transparent 55%), radial-gradient(100% 70% at 100% 0%, rgba(255,200,140,0.22) 0%, transparent 60%)',
    preview: {
      gradient: 'linear-gradient(135deg, #ffc88c 0%, #d8965a 100%)',
      ring: '#e6a878'
    }
  },
  lavender: {
    label: 'Lavender',
    collapsedBg: '#000',
    outerBg: 'linear-gradient(180deg, rgba(190,170,255,0.32) 0%, rgba(140,120,240,0.22) 100%)',
    outerBorder: 'rgba(210,195,255,0.60)',
    outerShadow:
      '0 12px 40px rgba(140,120,240,0.38), inset 0 1px 0 rgba(255,255,255,0.45), inset 0 -1px 0 rgba(60,40,140,0.30)',
    innerBg: 'linear-gradient(180deg, rgba(34,28,60,0.82) 0%, rgba(20,16,38,0.90) 100%)',
    innerOverlay:
      'radial-gradient(140% 90% at 50% -20%, rgba(230,220,255,0.28) 0%, transparent 55%), radial-gradient(100% 70% at 0% 0%, rgba(180,160,255,0.20) 0%, transparent 60%)',
    preview: {
      gradient: 'linear-gradient(135deg, #b4a0ff 0%, #7c68ff 100%)',
      ring: '#9a84ff'
    }
  },
  crimson: {
    label: 'Crimson',
    collapsedBg: '#000',
    outerBg: 'linear-gradient(180deg, rgba(255,90,110,0.32) 0%, rgba(200,40,60,0.22) 100%)',
    outerBorder: 'rgba(255,160,170,0.60)',
    outerShadow:
      '0 12px 40px rgba(200,40,60,0.42), inset 0 1px 0 rgba(255,220,225,0.40), inset 0 -1px 0 rgba(120,0,20,0.35)',
    innerBg: 'linear-gradient(180deg, rgba(48,18,22,0.85) 0%, rgba(28,10,14,0.92) 100%)',
    innerOverlay:
      'radial-gradient(140% 90% at 50% -20%, rgba(255,200,210,0.25) 0%, transparent 55%), radial-gradient(100% 70% at 100% 0%, rgba(255,80,100,0.18) 0%, transparent 60%)',
    preview: {
      gradient: 'linear-gradient(135deg, #ff5064 0%, #c8283c 100%)',
      ring: '#ff6478'
    }
  },
  emerald: {
    label: 'Emerald',
    collapsedBg: '#000',
    outerBg: 'linear-gradient(180deg, rgba(90,255,190,0.30) 0%, rgba(40,200,140,0.20) 100%)',
    outerBorder: 'rgba(180,255,220,0.55)',
    outerShadow:
      '0 12px 40px rgba(40,200,140,0.38), inset 0 1px 0 rgba(220,255,235,0.45), inset 0 -1px 0 rgba(0,80,50,0.32)',
    innerBg: 'linear-gradient(180deg, rgba(16,46,34,0.85) 0%, rgba(6,26,20,0.92) 100%)',
    innerOverlay:
      'radial-gradient(140% 90% at 50% -20%, rgba(200,255,225,0.25) 0%, transparent 55%), radial-gradient(100% 70% at 0% 100%, rgba(80,255,180,0.18) 0%, transparent 60%)',
    preview: {
      gradient: 'linear-gradient(135deg, #50ffb4 0%, #28c88c 100%)',
      ring: '#64ffc8'
    }
  },
  amber: {
    label: 'Amber',
    collapsedBg: '#000',
    outerBg: 'linear-gradient(180deg, rgba(255,190,80,0.32) 0%, rgba(220,140,40,0.22) 100%)',
    outerBorder: 'rgba(255,220,150,0.60)',
    outerShadow:
      '0 12px 40px rgba(220,140,40,0.38), inset 0 1px 0 rgba(255,235,190,0.50), inset 0 -1px 0 rgba(120,60,0,0.32)',
    innerBg: 'linear-gradient(180deg, rgba(46,32,14,0.85) 0%, rgba(28,20,8,0.92) 100%)',
    innerOverlay:
      'radial-gradient(140% 90% at 50% -20%, rgba(255,225,170,0.28) 0%, transparent 55%), radial-gradient(100% 70% at 50% 0%, rgba(255,180,60,0.18) 0%, transparent 60%)',
    preview: {
      gradient: 'linear-gradient(135deg, #ffb43c 0%, #dc8c28 100%)',
      ring: '#ffc864'
    }
  },
  nebula: {
    label: 'Nebula',
    collapsedBg: '#000',
    outerBg: 'linear-gradient(135deg, rgba(150,90,255,0.35) 0%, rgba(70,50,200,0.28) 100%)',
    outerBorder: 'rgba(190,150,255,0.60)',
    outerShadow:
      '0 12px 40px rgba(100,60,255,0.45), inset 0 1px 0 rgba(230,210,255,0.45), inset 0 -1px 0 rgba(30,10,80,0.35)',
    innerBg: 'linear-gradient(135deg, rgba(28,16,56,0.85) 0%, rgba(14,8,38,0.92) 100%)',
    innerOverlay:
      'radial-gradient(140% 90% at 50% -20%, rgba(220,200,255,0.25) 0%, transparent 55%), radial-gradient(100% 70% at 0% 0%, rgba(140,80,255,0.22) 0%, transparent 60%)',
    preview: {
      gradient: 'linear-gradient(135deg, #8c50ff 0%, #3c28b4 100%)',
      ring: '#a064ff'
    }
  },
  midnight: {
    label: 'Midnight',
    collapsedBg: '#000',
    outerBg: 'linear-gradient(180deg, rgba(40,55,90,0.42) 0%, rgba(15,18,32,0.50) 100%)',
    outerBorder: 'rgba(120,150,220,0.50)',
    outerShadow:
      '0 12px 40px rgba(0,0,0,0.70), inset 0 1px 0 rgba(180,200,240,0.32), inset 0 -1px 0 rgba(0,0,0,0.45)',
    innerBg: 'linear-gradient(180deg, rgba(12,16,30,0.88) 0%, rgba(4,6,12,0.94) 100%)',
    innerOverlay:
      'radial-gradient(140% 90% at 50% -20%, rgba(180,200,240,0.18) 0%, transparent 55%), radial-gradient(100% 70% at 50% 0%, rgba(60,80,150,0.18) 0%, transparent 60%)',
    preview: {
      gradient: 'linear-gradient(135deg, #14192d 0%, #080a14 100%)',
      ring: '#3c5096'
    }
  },
  sakura: {
    label: 'Sakura',
    collapsedBg: '#000',
    outerBg: 'linear-gradient(180deg, rgba(255,190,210,0.32) 0%, rgba(240,140,160,0.22) 100%)',
    outerBorder: 'rgba(255,215,225,0.62)',
    outerShadow:
      '0 12px 40px rgba(240,140,160,0.38), inset 0 1px 0 rgba(255,230,235,0.50), inset 0 -1px 0 rgba(140,40,70,0.30)',
    innerBg: 'linear-gradient(180deg, rgba(56,28,36,0.82) 0%, rgba(36,18,24,0.90) 100%)',
    innerOverlay:
      'radial-gradient(140% 90% at 50% -20%, rgba(255,220,230,0.30) 0%, transparent 55%), radial-gradient(100% 70% at 0% 0%, rgba(255,180,200,0.20) 0%, transparent 60%)',
    preview: {
      gradient: 'linear-gradient(135deg, #ffb4c8 0%, #f08ca0 100%)',
      ring: '#ffc8dc'
    }
  },
  cyber: {
    label: 'Cyber',
    collapsedBg: '#000',
    outerBg: 'linear-gradient(135deg, rgba(0,255,160,0.28) 0%, rgba(0,180,255,0.22) 100%)',
    outerBorder: 'rgba(160,255,220,0.55)',
    outerShadow:
      '0 12px 40px rgba(0,255,150,0.32), inset 0 1px 0 rgba(200,255,230,0.40), inset 0 -1px 0 rgba(0,80,60,0.30)',
    innerBg: 'linear-gradient(180deg, rgba(8,24,18,0.88) 0%, rgba(2,10,8,0.94) 100%)',
    innerOverlay:
      'radial-gradient(140% 90% at 50% -20%, rgba(200,255,230,0.22) 0%, transparent 55%), radial-gradient(100% 70% at 100% 100%, rgba(0,255,150,0.18) 0%, transparent 60%)',
    preview: {
      gradient: 'linear-gradient(135deg, #00ff96 0%, #00b4ff 100%)',
      ring: '#64ffc8'
    }
  },
  solar: {
    label: 'Solar',
    collapsedBg: '#000',
    outerBg: 'linear-gradient(180deg, rgba(255,170,30,0.32) 0%, rgba(255,100,0,0.22) 100%)',
    outerBorder: 'rgba(255,210,150,0.60)',
    outerShadow:
      '0 12px 40px rgba(255,100,0,0.40), inset 0 1px 0 rgba(255,230,200,0.50), inset 0 -1px 0 rgba(140,40,0,0.32)',
    innerBg: 'linear-gradient(180deg, rgba(48,22,8,0.85) 0%, rgba(28,12,2,0.92) 100%)',
    innerOverlay:
      'radial-gradient(140% 90% at 50% -20%, rgba(255,220,180,0.30) 0%, transparent 55%), radial-gradient(100% 70% at 50% 0%, rgba(255,160,0,0.20) 0%, transparent 60%)',
    preview: {
      gradient: 'linear-gradient(135deg, #ffa000 0%, #ff6400 100%)',
      ring: '#ffb464'
    }
  },
  oceanic: {
    label: 'Oceanic',
    collapsedBg: '#000',
    outerBg: 'linear-gradient(180deg, rgba(20,200,255,0.30) 0%, rgba(0,100,200,0.20) 100%)',
    outerBorder: 'rgba(160,230,255,0.55)',
    outerShadow:
      '0 12px 40px rgba(0,100,200,0.38), inset 0 1px 0 rgba(220,245,255,0.45), inset 0 -1px 0 rgba(0,40,90,0.32)',
    innerBg: 'linear-gradient(180deg, rgba(10,32,56,0.85) 0%, rgba(4,14,30,0.92) 100%)',
    innerOverlay:
      'radial-gradient(140% 90% at 50% -20%, rgba(200,235,255,0.25) 0%, transparent 55%), radial-gradient(100% 70% at 0% 100%, rgba(0,180,255,0.18) 0%, transparent 60%)',
    preview: {
      gradient: 'linear-gradient(135deg, #00b4ff 0%, #0064c8 100%)',
      ring: '#64dcff'
    }
  },
  vulcan: {
    label: 'Vulcan',
    collapsedBg: '#000',
    outerBg: 'linear-gradient(180deg, rgba(255,60,60,0.30) 0%, rgba(150,0,0,0.22) 100%)',
    outerBorder: 'rgba(255,160,160,0.60)',
    outerShadow:
      '0 12px 40px rgba(150,0,0,0.50), inset 0 1px 0 rgba(255,210,210,0.40), inset 0 -1px 0 rgba(80,0,0,0.40)',
    innerBg: 'linear-gradient(180deg, rgba(28,8,8,0.88) 0%, rgba(12,4,4,0.94) 100%)',
    innerOverlay:
      'radial-gradient(140% 90% at 50% -20%, rgba(255,200,200,0.22) 0%, transparent 55%), radial-gradient(100% 70% at 50% 100%, rgba(255,50,50,0.18) 0%, transparent 60%)',
    preview: {
      gradient: 'linear-gradient(135deg, #ff3232 0%, #960000 100%)',
      ring: '#ff6464'
    }
  },
  prism: {
    label: 'Prism',
    collapsedBg: '#000',
    outerBg: 'linear-gradient(135deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.10) 100%)',
    outerBorder: 'rgba(255,255,255,0.65)',
    outerShadow:
      '0 12px 40px rgba(255,255,255,0.18), inset 0 1px 0 rgba(255,255,255,0.50), inset 0 -1px 0 rgba(0,0,0,0.25)',
    innerBg: 'linear-gradient(135deg, rgba(28,28,32,0.85) 0%, rgba(14,14,18,0.92) 100%)',
    innerOverlay:
      'radial-gradient(140% 90% at 50% -20%, rgba(255,255,255,0.28) 0%, transparent 55%), linear-gradient(135deg, rgba(255,80,120,0.10) 0%, rgba(80,255,160,0.10) 50%, rgba(80,160,255,0.10) 100%)',
    preview: {
      gradient: 'linear-gradient(135deg, #ff0000 0%, #00ff00 50%, #0000ff 100%)',
      ring: '#ffffff'
    }
  }
}

export function getNotchTheme(id: NotchThemeId | undefined): NotchThemeStyle {
  return NOTCH_THEMES[id ?? 'obsidian'] ?? NOTCH_THEMES.obsidian
}
