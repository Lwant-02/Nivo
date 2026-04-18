import NotchUI from './components/NotchUI'
import OnboardingUI from './components/OnboardingUI'
import SettingsUI from './components/SettingsUI'

export default function App() {
  const hash = window.location.hash || '#/'

  if (hash.includes('settings')) {
    return <SettingsUI />
  }

  if (hash.includes('onboarding')) {
    return <OnboardingUI />
  }

  return <NotchUI />
}
