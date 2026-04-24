import type React from 'react'
import NotchUI from './components/NotchUI'
import { OnboardingUI } from './components/OnboardingUI'
import SettingsUI from './components/SettingsUI'
import { useSettings } from './hooks/useSettings'
import { useAppliedTheme } from './hooks/useAppliedTheme'
import { useCalendarReminders } from './hooks/useCalendarReminders'

export default function App(): React.JSX.Element {
  const { settings } = useSettings()
  useAppliedTheme(settings.theme)
  useCalendarReminders()

  const hash = window.location.hash || '#/'

  if (hash.includes('settings')) {
    return <SettingsUI />
  }

  if (hash.includes('onboarding')) {
    return <OnboardingUI />
  }

  return <NotchUI />
}
