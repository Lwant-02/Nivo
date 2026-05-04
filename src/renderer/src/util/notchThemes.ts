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
    outerBg: 'linear-gradient(180deg, rgba(60,60,75,0.42) 0%, rgba(20,20,30,0.52) 100%)',
    outerBorder: 'rgba(255,255,255,0.75)',
    outerShadow:
      '0 14px 50px rgba(0,0,0,0.55), 0 2px 10px rgba(255,255,255,0.10), inset 0 2px 1px rgba(255,255,255,0.70), inset 0 -1px 0 rgba(0,0,0,0.45), inset 0 0 24px rgba(200,210,235,0.18)',
    innerBg: 'linear-gradient(180deg, rgba(28,28,38,0.78) 0%, rgba(10,10,16,0.86) 100%)',
    innerOverlay:
      'radial-gradient(160% 100% at 50% -30%, rgba(255,255,255,0.30) 0%, rgba(255,255,255,0.08) 38%, transparent 62%), radial-gradient(80% 50% at 100% 0%, rgba(180,200,255,0.12) 0%, transparent 60%)',
    preview: {
      gradient: 'linear-gradient(135deg, #2a2d39 0%, #050509 100%)',
      ring: '#ffffff'
    }
  },
  frost: {
    label: 'Frost',
    collapsedBg: '#000',
    outerBg: 'linear-gradient(180deg, rgba(220,235,255,0.42) 0%, rgba(150,190,240,0.32) 100%)',
    outerBorder: 'rgba(255,255,255,0.85)',
    outerShadow:
      '0 14px 50px rgba(80,150,255,0.40), 0 2px 10px rgba(255,255,255,0.20), inset 0 2px 1px rgba(255,255,255,0.85), inset 0 -1px 0 rgba(40,80,140,0.22), inset 0 0 24px rgba(180,220,255,0.32)',
    innerBg: 'linear-gradient(180deg, rgba(56,80,120,0.76) 0%, rgba(28,46,80,0.88) 100%)',
    innerOverlay:
      'radial-gradient(160% 100% at 50% -30%, rgba(255,255,255,0.42) 0%, rgba(255,255,255,0.10) 38%, transparent 62%), radial-gradient(90% 65% at 100% 20%, rgba(220,240,255,0.22) 0%, transparent 60%)',
    preview: {
      gradient: 'linear-gradient(135deg, #d8eaff 0%, #6aa6e8 100%)',
      ring: '#ffffff'
    }
  },
  aurora: {
    label: 'Aurora',
    collapsedBg: '#000',
    outerBg:
      'linear-gradient(135deg, rgba(180,80,255,0.38) 0%, rgba(255,80,180,0.30) 50%, rgba(80,200,255,0.34) 100%)',
    outerBorder: 'rgba(255,255,255,0.80)',
    outerShadow:
      '0 14px 50px rgba(180,80,255,0.45), 0 2px 10px rgba(255,255,255,0.18), inset 0 2px 1px rgba(255,255,255,0.75), inset 0 -1px 0 rgba(60,20,100,0.30), inset 0 0 24px rgba(230,200,255,0.28)',
    innerBg:
      'linear-gradient(135deg, rgba(58,28,82,0.82) 0%, rgba(70,30,90,0.84) 50%, rgba(34,52,96,0.86) 100%)',
    innerOverlay:
      'radial-gradient(160% 100% at 50% -30%, rgba(255,255,255,0.38) 0%, rgba(255,255,255,0.10) 38%, transparent 62%), radial-gradient(120% 80% at 100% 0%, rgba(255,120,200,0.22) 0%, transparent 55%), radial-gradient(100% 70% at 0% 100%, rgba(80,200,255,0.20) 0%, transparent 55%)',
    preview: {
      gradient: 'linear-gradient(135deg, #b850ff 0%, #ff5fb1 50%, #50c8ff 100%)',
      ring: '#ffffff'
    }
  },
  sand: {
    label: 'Sand',
    collapsedBg: '#000',
    outerBg: 'linear-gradient(180deg, rgba(255,210,160,0.40) 0%, rgba(220,160,100,0.30) 100%)',
    outerBorder: 'rgba(255,245,225,0.82)',
    outerShadow:
      '0 14px 50px rgba(220,150,90,0.42), 0 2px 10px rgba(255,235,200,0.20), inset 0 2px 1px rgba(255,245,220,0.80), inset 0 -1px 0 rgba(120,70,30,0.30), inset 0 0 24px rgba(255,220,180,0.30)',
    innerBg: 'linear-gradient(180deg, rgba(78,56,38,0.80) 0%, rgba(44,30,22,0.88) 100%)',
    innerOverlay:
      'radial-gradient(160% 100% at 50% -30%, rgba(255,245,225,0.40) 0%, rgba(255,245,225,0.10) 38%, transparent 62%), radial-gradient(100% 70% at 100% 0%, rgba(255,200,140,0.22) 0%, transparent 60%)',
    preview: {
      gradient: 'linear-gradient(135deg, #ffc88c 0%, #d8965a 100%)',
      ring: '#ffffff'
    }
  },
  lavender: {
    label: 'Lavender',
    collapsedBg: '#000',
    outerBg: 'linear-gradient(180deg, rgba(190,170,255,0.40) 0%, rgba(140,120,240,0.30) 100%)',
    outerBorder: 'rgba(245,240,255,0.82)',
    outerShadow:
      '0 14px 50px rgba(140,120,240,0.42), 0 2px 10px rgba(230,220,255,0.18), inset 0 2px 1px rgba(255,255,255,0.78), inset 0 -1px 0 rgba(60,40,140,0.30), inset 0 0 24px rgba(220,210,255,0.30)',
    innerBg: 'linear-gradient(180deg, rgba(48,40,84,0.80) 0%, rgba(28,22,52,0.88) 100%)',
    innerOverlay:
      'radial-gradient(160% 100% at 50% -30%, rgba(255,255,255,0.38) 0%, rgba(255,255,255,0.10) 38%, transparent 62%), radial-gradient(100% 70% at 0% 0%, rgba(180,160,255,0.22) 0%, transparent 60%)',
    preview: {
      gradient: 'linear-gradient(135deg, #b4a0ff 0%, #7c68ff 100%)',
      ring: '#ffffff'
    }
  },
  crimson: {
    label: 'Crimson',
    collapsedBg: '#000',
    outerBg: 'linear-gradient(180deg, rgba(255,90,110,0.40) 0%, rgba(200,40,60,0.30) 100%)',
    outerBorder: 'rgba(255,235,238,0.82)',
    outerShadow:
      '0 14px 50px rgba(200,40,60,0.45), 0 2px 10px rgba(255,220,225,0.18), inset 0 2px 1px rgba(255,235,238,0.78), inset 0 -1px 0 rgba(120,0,20,0.35), inset 0 0 24px rgba(255,200,210,0.28)',
    innerBg: 'linear-gradient(180deg, rgba(72,28,34,0.82) 0%, rgba(40,16,20,0.90) 100%)',
    innerOverlay:
      'radial-gradient(160% 100% at 50% -30%, rgba(255,240,242,0.36) 0%, rgba(255,240,242,0.10) 38%, transparent 62%), radial-gradient(100% 70% at 100% 0%, rgba(255,80,100,0.20) 0%, transparent 60%)',
    preview: {
      gradient: 'linear-gradient(135deg, #ff5064 0%, #c8283c 100%)',
      ring: '#ffffff'
    }
  },
  emerald: {
    label: 'Emerald',
    collapsedBg: '#000',
    outerBg: 'linear-gradient(180deg, rgba(90,255,190,0.38) 0%, rgba(40,200,140,0.28) 100%)',
    outerBorder: 'rgba(235,255,245,0.80)',
    outerShadow:
      '0 14px 50px rgba(40,200,140,0.42), 0 2px 10px rgba(220,255,235,0.18), inset 0 2px 1px rgba(235,255,245,0.78), inset 0 -1px 0 rgba(0,80,50,0.32), inset 0 0 24px rgba(200,255,225,0.28)',
    innerBg: 'linear-gradient(180deg, rgba(22,64,48,0.82) 0%, rgba(10,34,26,0.90) 100%)',
    innerOverlay:
      'radial-gradient(160% 100% at 50% -30%, rgba(240,255,248,0.36) 0%, rgba(240,255,248,0.10) 38%, transparent 62%), radial-gradient(100% 70% at 0% 100%, rgba(80,255,180,0.20) 0%, transparent 60%)',
    preview: {
      gradient: 'linear-gradient(135deg, #50ffb4 0%, #28c88c 100%)',
      ring: '#ffffff'
    }
  },
  amber: {
    label: 'Amber',
    collapsedBg: '#000',
    outerBg: 'linear-gradient(180deg, rgba(255,190,80,0.40) 0%, rgba(220,140,40,0.30) 100%)',
    outerBorder: 'rgba(255,240,210,0.82)',
    outerShadow:
      '0 14px 50px rgba(220,140,40,0.42), 0 2px 10px rgba(255,235,190,0.18), inset 0 2px 1px rgba(255,240,210,0.80), inset 0 -1px 0 rgba(120,60,0,0.32), inset 0 0 24px rgba(255,225,170,0.30)',
    innerBg: 'linear-gradient(180deg, rgba(64,44,20,0.82) 0%, rgba(38,28,12,0.90) 100%)',
    innerOverlay:
      'radial-gradient(160% 100% at 50% -30%, rgba(255,245,220,0.40) 0%, rgba(255,245,220,0.10) 38%, transparent 62%), radial-gradient(100% 70% at 50% 0%, rgba(255,180,60,0.20) 0%, transparent 60%)',
    preview: {
      gradient: 'linear-gradient(135deg, #ffb43c 0%, #dc8c28 100%)',
      ring: '#ffffff'
    }
  },
  nebula: {
    label: 'Nebula',
    collapsedBg: '#000',
    outerBg: 'linear-gradient(135deg, rgba(150,90,255,0.42) 0%, rgba(70,50,200,0.32) 100%)',
    outerBorder: 'rgba(240,232,255,0.82)',
    outerShadow:
      '0 14px 50px rgba(100,60,255,0.50), 0 2px 10px rgba(230,210,255,0.18), inset 0 2px 1px rgba(245,235,255,0.78), inset 0 -1px 0 rgba(30,10,80,0.35), inset 0 0 24px rgba(220,200,255,0.30)',
    innerBg: 'linear-gradient(135deg, rgba(40,22,76,0.82) 0%, rgba(20,12,52,0.90) 100%)',
    innerOverlay:
      'radial-gradient(160% 100% at 50% -30%, rgba(245,238,255,0.36) 0%, rgba(245,238,255,0.10) 38%, transparent 62%), radial-gradient(100% 70% at 0% 0%, rgba(140,80,255,0.22) 0%, transparent 60%)',
    preview: {
      gradient: 'linear-gradient(135deg, #8c50ff 0%, #3c28b4 100%)',
      ring: '#ffffff'
    }
  },
  midnight: {
    label: 'Midnight',
    collapsedBg: '#000',
    outerBg: 'linear-gradient(180deg, rgba(60,80,130,0.42) 0%, rgba(20,25,45,0.50) 100%)',
    outerBorder: 'rgba(220,228,250,0.70)',
    outerShadow:
      '0 14px 50px rgba(0,0,0,0.70), 0 2px 10px rgba(180,200,240,0.14), inset 0 2px 1px rgba(220,228,250,0.55), inset 0 -1px 0 rgba(0,0,0,0.45), inset 0 0 24px rgba(160,180,230,0.20)',
    innerBg: 'linear-gradient(180deg, rgba(16,22,42,0.86) 0%, rgba(6,8,16,0.92) 100%)',
    innerOverlay:
      'radial-gradient(160% 100% at 50% -30%, rgba(220,232,255,0.28) 0%, rgba(220,232,255,0.06) 38%, transparent 62%), radial-gradient(100% 70% at 50% 0%, rgba(60,80,150,0.18) 0%, transparent 60%)',
    preview: {
      gradient: 'linear-gradient(135deg, #14192d 0%, #080a14 100%)',
      ring: '#ffffff'
    }
  },
  sakura: {
    label: 'Sakura',
    collapsedBg: '#000',
    outerBg: 'linear-gradient(180deg, rgba(255,190,210,0.40) 0%, rgba(240,140,160,0.30) 100%)',
    outerBorder: 'rgba(255,240,245,0.85)',
    outerShadow:
      '0 14px 50px rgba(240,140,160,0.42), 0 2px 10px rgba(255,230,235,0.18), inset 0 2px 1px rgba(255,240,245,0.82), inset 0 -1px 0 rgba(140,40,70,0.30), inset 0 0 24px rgba(255,220,230,0.30)',
    innerBg: 'linear-gradient(180deg, rgba(76,38,48,0.80) 0%, rgba(48,22,30,0.88) 100%)',
    innerOverlay:
      'radial-gradient(160% 100% at 50% -30%, rgba(255,242,247,0.40) 0%, rgba(255,242,247,0.10) 38%, transparent 62%), radial-gradient(100% 70% at 0% 0%, rgba(255,180,200,0.22) 0%, transparent 60%)',
    preview: {
      gradient: 'linear-gradient(135deg, #ffb4c8 0%, #f08ca0 100%)',
      ring: '#ffffff'
    }
  },
  cyber: {
    label: 'Cyber',
    collapsedBg: '#000',
    outerBg: 'linear-gradient(135deg, rgba(0,255,160,0.34) 0%, rgba(0,180,255,0.28) 100%)',
    outerBorder: 'rgba(225,255,245,0.80)',
    outerShadow:
      '0 14px 50px rgba(0,255,150,0.38), 0 2px 10px rgba(200,255,230,0.18), inset 0 2px 1px rgba(225,255,245,0.78), inset 0 -1px 0 rgba(0,80,60,0.32), inset 0 0 24px rgba(180,255,225,0.30)',
    innerBg: 'linear-gradient(135deg, rgba(12,38,30,0.86) 0%, rgba(4,18,16,0.92) 100%)',
    innerOverlay:
      'radial-gradient(160% 100% at 50% -30%, rgba(232,255,245,0.34) 0%, rgba(232,255,245,0.08) 38%, transparent 62%), radial-gradient(100% 70% at 100% 100%, rgba(0,255,150,0.20) 0%, transparent 60%)',
    preview: {
      gradient: 'linear-gradient(135deg, #00ff96 0%, #00b4ff 100%)',
      ring: '#ffffff'
    }
  },
  solar: {
    label: 'Solar',
    collapsedBg: '#000',
    outerBg: 'linear-gradient(180deg, rgba(255,170,30,0.40) 0%, rgba(255,100,0,0.30) 100%)',
    outerBorder: 'rgba(255,235,210,0.82)',
    outerShadow:
      '0 14px 50px rgba(255,100,0,0.45), 0 2px 10px rgba(255,230,200,0.18), inset 0 2px 1px rgba(255,235,210,0.80), inset 0 -1px 0 rgba(140,40,0,0.32), inset 0 0 24px rgba(255,220,180,0.32)',
    innerBg: 'linear-gradient(180deg, rgba(64,30,12,0.82) 0%, rgba(36,16,4,0.90) 100%)',
    innerOverlay:
      'radial-gradient(160% 100% at 50% -30%, rgba(255,240,225,0.40) 0%, rgba(255,240,225,0.10) 38%, transparent 62%), radial-gradient(100% 70% at 50% 0%, rgba(255,160,0,0.22) 0%, transparent 60%)',
    preview: {
      gradient: 'linear-gradient(135deg, #ffa000 0%, #ff6400 100%)',
      ring: '#ffffff'
    }
  },
  oceanic: {
    label: 'Oceanic',
    collapsedBg: '#000',
    outerBg: 'linear-gradient(180deg, rgba(20,200,255,0.38) 0%, rgba(0,100,200,0.28) 100%)',
    outerBorder: 'rgba(225,245,255,0.82)',
    outerShadow:
      '0 14px 50px rgba(0,100,200,0.42), 0 2px 10px rgba(220,245,255,0.18), inset 0 2px 1px rgba(225,245,255,0.80), inset 0 -1px 0 rgba(0,40,90,0.32), inset 0 0 24px rgba(200,235,255,0.30)',
    innerBg: 'linear-gradient(180deg, rgba(14,42,72,0.82) 0%, rgba(6,18,38,0.90) 100%)',
    innerOverlay:
      'radial-gradient(160% 100% at 50% -30%, rgba(232,247,255,0.36) 0%, rgba(232,247,255,0.10) 38%, transparent 62%), radial-gradient(100% 70% at 0% 100%, rgba(0,180,255,0.20) 0%, transparent 60%)',
    preview: {
      gradient: 'linear-gradient(135deg, #00b4ff 0%, #0064c8 100%)',
      ring: '#ffffff'
    }
  },
  vulcan: {
    label: 'Vulcan',
    collapsedBg: '#000',
    outerBg: 'linear-gradient(180deg, rgba(255,60,60,0.38) 0%, rgba(150,0,0,0.30) 100%)',
    outerBorder: 'rgba(255,225,225,0.82)',
    outerShadow:
      '0 14px 50px rgba(150,0,0,0.55), 0 2px 10px rgba(255,210,210,0.18), inset 0 2px 1px rgba(255,225,225,0.78), inset 0 -1px 0 rgba(80,0,0,0.40), inset 0 0 24px rgba(255,200,200,0.28)',
    innerBg: 'linear-gradient(180deg, rgba(40,12,12,0.86) 0%, rgba(18,6,6,0.92) 100%)',
    innerOverlay:
      'radial-gradient(160% 100% at 50% -30%, rgba(255,232,232,0.34) 0%, rgba(255,232,232,0.08) 38%, transparent 62%), radial-gradient(100% 70% at 50% 100%, rgba(255,50,50,0.20) 0%, transparent 60%)',
    preview: {
      gradient: 'linear-gradient(135deg, #ff3232 0%, #960000 100%)',
      ring: '#ffffff'
    }
  },
  prism: {
    label: 'Prism',
    collapsedBg: '#000',
    outerBg: 'linear-gradient(135deg, rgba(255,255,255,0.30) 0%, rgba(255,255,255,0.16) 100%)',
    outerBorder: 'rgba(255,255,255,0.90)',
    outerShadow:
      '0 14px 50px rgba(255,255,255,0.22), 0 2px 10px rgba(255,255,255,0.20), inset 0 2px 1px rgba(255,255,255,0.85), inset 0 -1px 0 rgba(0,0,0,0.25), inset 0 0 24px rgba(255,255,255,0.22)',
    innerBg: 'linear-gradient(135deg, rgba(34,34,40,0.82) 0%, rgba(16,16,22,0.90) 100%)',
    innerOverlay:
      'radial-gradient(160% 100% at 50% -30%, rgba(255,255,255,0.42) 0%, rgba(255,255,255,0.12) 38%, transparent 62%), linear-gradient(135deg, rgba(255,80,120,0.10) 0%, rgba(80,255,160,0.10) 50%, rgba(80,160,255,0.10) 100%)',
    preview: {
      gradient: 'linear-gradient(135deg, #ff0000 0%, #00ff00 50%, #0000ff 100%)',
      ring: '#ffffff'
    }
  }
}

export function getNotchTheme(id: NotchThemeId | undefined): NotchThemeStyle {
  return NOTCH_THEMES[id ?? 'obsidian'] ?? NOTCH_THEMES.obsidian
}
