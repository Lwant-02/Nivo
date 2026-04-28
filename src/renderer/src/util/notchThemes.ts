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
      'linear-gradient(180deg, rgba(0,0,0,0.95) 0%, rgba(8,8,14,0.94) 100%)',
    outerBorder: 'rgba(255,255,255,0.12)',
    outerShadow: '0 18px 48px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.08)',
    innerBg:
      'linear-gradient(180deg, rgba(0,0,0,0.98) 0%, rgba(15,15,22,0.97) 100%)',
    preview: {
      gradient: 'linear-gradient(135deg, #1a1d29 0%, #050509 100%)',
      ring: '#6e7a99'
    }
  },
  frost: {
    label: 'Frost',
    collapsedBg: '#000',
    outerBg:
      'linear-gradient(180deg, rgba(220,235,255,0.35) 0%, rgba(150,190,240,0.25) 100%)',
    outerBorder: 'rgba(190,225,255,0.45)',
    outerShadow:
      '0 18px 48px rgba(80,150,255,0.32), inset 0 1px 0 rgba(255,255,255,0.30)',
    innerBg:
      'linear-gradient(180deg, rgba(18,28,48,0.96) 0%, rgba(22,42,72,0.94) 100%)',
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
      'linear-gradient(135deg, rgba(180,80,255,0.42) 0%, rgba(255,80,180,0.36) 50%, rgba(80,200,255,0.40) 100%)',
    outerBorder: 'rgba(220,180,255,0.45)',
    outerShadow:
      '0 18px 48px rgba(180,80,255,0.42), inset 0 1px 0 rgba(255,255,255,0.20)',
    innerBg:
      'linear-gradient(135deg, rgba(28,12,42,0.97) 0%, rgba(38,16,48,0.96) 50%, rgba(16,28,52,0.97) 100%)',
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
      'linear-gradient(180deg, rgba(255,200,140,0.36) 0%, rgba(220,150,90,0.26) 100%)',
    outerBorder: 'rgba(255,200,140,0.45)',
    outerShadow:
      '0 18px 48px rgba(220,150,90,0.36), inset 0 1px 0 rgba(255,220,180,0.22)',
    innerBg:
      'linear-gradient(180deg, rgba(42,30,20,0.97) 0%, rgba(28,20,15,0.96) 100%)',
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
      'linear-gradient(180deg, rgba(180,160,255,0.35) 0%, rgba(140,120,240,0.25) 100%)',
    outerBorder: 'rgba(180,160,255,0.45)',
    outerShadow:
      '0 18px 48px rgba(140,120,240,0.32), inset 0 1px 0 rgba(255,255,255,0.20)',
    innerBg:
      'linear-gradient(180deg, rgba(24,20,42,0.98) 0%, rgba(18,15,32,0.97) 100%)',
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
      'linear-gradient(180deg, rgba(255,80,100,0.35) 0%, rgba(200,40,60,0.25) 100%)',
    outerBorder: 'rgba(255,100,120,0.42)',
    outerShadow:
      '0 18px 48px rgba(200,40,60,0.35), inset 0 1px 0 rgba(255,255,255,0.15)',
    innerBg:
      'linear-gradient(180deg, rgba(32,12,15,0.98) 0%, rgba(22,8,10,0.97) 100%)',
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
      'linear-gradient(180deg, rgba(80,255,180,0.32) 0%, rgba(40,200,140,0.22) 100%)',
    outerBorder: 'rgba(100,255,200,0.40)',
    outerShadow:
      '0 18px 48px rgba(40,200,140,0.32), inset 0 1px 0 rgba(255,255,255,0.15)',
    innerBg:
      'linear-gradient(180deg, rgba(10,32,24,0.98) 0%, rgba(5,22,18,0.97) 100%)',
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
      'linear-gradient(180deg, rgba(255,180,60,0.35) 0%, rgba(220,140,40,0.25) 100%)',
    outerBorder: 'rgba(255,200,100,0.45)',
    outerShadow:
      '0 18px 48px rgba(220,140,40,0.32), inset 0 1px 0 rgba(255,255,255,0.20)',
    innerBg:
      'linear-gradient(180deg, rgba(32,24,10,0.98) 0%, rgba(22,18,5,0.97) 100%)',
    innerOverlay:
      'radial-gradient(120% 80% at 50% 0%, rgba(255,180,60,0.15) 0%, transparent 60%)',
    preview: {
      gradient: 'linear-gradient(135deg, #ffb43c 0%, #dc8c28 100%)',
      ring: '#ffc864'
    }
  },
  nebula: {
    label: 'Nebula',
    collapsedBg: '#000',
    outerBg: 'linear-gradient(135deg, rgba(140,80,255,0.42) 0%, rgba(60,40,180,0.36) 100%)',
    outerBorder: 'rgba(160,100,255,0.45)',
    outerShadow: '0 18px 48px rgba(100,60,255,0.42), inset 0 1px 0 rgba(255,255,255,0.20)',
    innerBg: 'linear-gradient(135deg, rgba(20,10,40,0.98) 0%, rgba(10,5,30,0.97) 100%)',
    innerOverlay: 'radial-gradient(120% 80% at 0% 0%, rgba(140,80,255,0.18) 0%, transparent 60%)',
    preview: {
      gradient: 'linear-gradient(135deg, #8c50ff 0%, #3c28b4 100%)',
      ring: '#a064ff'
    }
  },
  midnight: {
    label: 'Midnight',
    collapsedBg: '#000',
    outerBg: 'linear-gradient(180deg, rgba(20,25,45,0.35) 0%, rgba(10,12,25,0.25) 100%)',
    outerBorder: 'rgba(60,80,150,0.42)',
    outerShadow: '0 18px 48px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.08)',
    innerBg: 'linear-gradient(180deg, rgba(8,10,20,0.98) 0%, rgba(4,5,10,0.97) 100%)',
    innerOverlay: 'radial-gradient(120% 80% at 50% 0%, rgba(60,80,150,0.15) 0%, transparent 60%)',
    preview: {
      gradient: 'linear-gradient(135deg, #14192d 0%, #080a14 100%)',
      ring: '#3c5096'
    }
  },
  sakura: {
    label: 'Sakura',
    collapsedBg: '#000',
    outerBg: 'linear-gradient(180deg, rgba(255,180,200,0.35) 0%, rgba(240,140,160,0.25) 100%)',
    outerBorder: 'rgba(255,200,220,0.45)',
    outerShadow: '0 18px 48px rgba(240,140,160,0.32), inset 0 1px 0 rgba(255,255,255,0.20)',
    innerBg: 'linear-gradient(180deg, rgba(42,20,25,0.98) 0%, rgba(32,15,20,0.97) 100%)',
    innerOverlay: 'radial-gradient(120% 80% at 0% 0%, rgba(255,180,200,0.15) 0%, transparent 60%)',
    preview: {
      gradient: 'linear-gradient(135deg, #ffb4c8 0%, #f08ca0 100%)',
      ring: '#ffc8dc'
    }
  },
  cyber: {
    label: 'Cyber',
    collapsedBg: '#000',
    outerBg: 'linear-gradient(135deg, rgba(0,255,150,0.3) 0%, rgba(0,180,255,0.25) 100%)',
    outerBorder: 'rgba(100,255,200,0.4)',
    outerShadow: '0 18px 48px rgba(0,255,150,0.2), inset 0 1px 0 rgba(255,255,255,0.1)',
    innerBg: 'linear-gradient(180deg, rgba(5,15,10,0.98) 0%, rgba(2,8,5,0.97) 100%)',
    innerOverlay: 'radial-gradient(120% 80% at 100% 100%, rgba(0,255,150,0.1) 0%, transparent 60%)',
    preview: {
      gradient: 'linear-gradient(135deg, #00ff96 0%, #00b4ff 100%)',
      ring: '#64ffc8'
    }
  },
  solar: {
    label: 'Solar',
    collapsedBg: '#000',
    outerBg: 'linear-gradient(180deg, rgba(255,160,0,0.35) 0%, rgba(255,100,0,0.25) 100%)',
    outerBorder: 'rgba(255,180,100,0.45)',
    outerShadow: '0 18px 48px rgba(255,100,0,0.35), inset 0 1px 0 rgba(255,255,255,0.20)',
    innerBg: 'linear-gradient(180deg, rgba(35,15,5,0.98) 0%, rgba(25,10,0,0.97) 100%)',
    innerOverlay: 'radial-gradient(120% 80% at 50% 0%, rgba(255,160,0,0.15) 0%, transparent 60%)',
    preview: {
      gradient: 'linear-gradient(135deg, #ffa000 0%, #ff6400 100%)',
      ring: '#ffb464'
    }
  },
  oceanic: {
    label: 'Oceanic',
    collapsedBg: '#000',
    outerBg: 'linear-gradient(180deg, rgba(0,180,255,0.32) 0%, rgba(0,100,200,0.22) 100%)',
    outerBorder: 'rgba(100,220,255,0.40)',
    outerShadow: '0 18px 48px rgba(0,100,200,0.32), inset 0 1px 0 rgba(255,255,255,0.15)',
    innerBg: 'linear-gradient(180deg, rgba(5,20,35,0.98) 0%, rgba(2,10,25,0.97) 100%)',
    innerOverlay: 'radial-gradient(120% 80% at 0% 100%, rgba(0,180,255,0.12) 0%, transparent 60%)',
    preview: {
      gradient: 'linear-gradient(135deg, #00b4ff 0%, #0064c8 100%)',
      ring: '#64dcff'
    }
  },
  vulcan: {
    label: 'Vulcan',
    collapsedBg: '#000',
    outerBg: 'linear-gradient(180deg, rgba(255,50,50,0.3) 0%, rgba(150,0,0,0.25) 100%)',
    outerBorder: 'rgba(255,100,100,0.35)',
    outerShadow: '0 18px 48px rgba(150,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)',
    innerBg: 'linear-gradient(180deg, rgba(15,5,5,0.98) 0%, rgba(8,2,2,0.97) 100%)',
    innerOverlay: 'radial-gradient(120% 80% at 50% 100%, rgba(255,50,50,0.1) 0%, transparent 60%)',
    preview: {
      gradient: 'linear-gradient(135deg, #ff3232 0%, #960000 100%)',
      ring: '#ff6464'
    }
  },
  prism: {
    label: 'Prism',
    collapsedBg: '#000',
    outerBg: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)',
    outerBorder: 'rgba(255,255,255,0.3)',
    outerShadow: '0 18px 48px rgba(255,255,255,0.1), inset 0 1px 0 rgba(255,255,255,0.2)',
    innerBg: 'linear-gradient(135deg, rgba(20,20,20,0.98) 0%, rgba(10,10,10,0.97) 100%)',
    innerOverlay: 'linear-gradient(135deg, rgba(255,0,0,0.05) 0%, rgba(0,255,0,0.05) 50%, rgba(0,0,255,0.05) 100%)',
    preview: {
      gradient: 'linear-gradient(135deg, #ff0000 0%, #00ff00 50%, #0000ff 100%)',
      ring: '#ffffff'
    }
  }
}

export function getNotchTheme(id: NotchThemeId | undefined): NotchThemeStyle {
  return NOTCH_THEMES[id ?? 'obsidian'] ?? NOTCH_THEMES.obsidian
}
