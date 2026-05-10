import { useEffect, useState } from 'react'

const DEFAULTS: AppSettings = {
  theme: 'midnight',
  notchTheme: 'glass',
  launchAtLogin: false,
  hideInFullscreen: false,
  hideFromScreenCapture: false,
  hapticFeedback: true,
  hideWhenPaused: false,
  showAlbumArt: true,
  showVisualizer: true,
  enableCalendar: true,
  calendarNextEventOnly: true,
  calendarClickToJoin: true,
  calendarReminderMin: 5,
  showLottieOnPause: false,
  lottieStyle: 0,
  showWeather: false,
  weatherLocation: '',
  weatherLat: 0,
  weatherLon: 0,
  sonicFeedback: false,
  sonicSoundPack: 'cherrymx-black-abs',
  hasSeenWelcome: false,
  enableClipboardHistory: true,
  enableBeam: true
}

export function useSettings(): {
  settings: AppSettings
  ready: boolean
  update: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => Promise<void>
} {
  const [settings, setSettings] = useState<AppSettings>(DEFAULTS)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let active = true

    window.api.getSettings().then((s) => {
      if (!active) return
      if (s) setSettings(s)
      setReady(true)
    })

    const off = window.api.onSettingsUpdate((next) => {
      if (active) setSettings(next)
    })

    return () => {
      active = false
      off()
    }
  }, [])

  const update = async <K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K]
  ): Promise<void> => {
    setSettings((prev) => ({ ...prev, [key]: value }))
    const next = await window.api.updateSetting(key, value)
    if (next) setSettings(next)
  }

  return { settings, ready, update }
}
