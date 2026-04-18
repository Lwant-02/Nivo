import NotchUI from './components/NotchUI'
import OnboardingUI from './components/OnboardingUI'
import SettingsUI from './components/SettingsUI'

export default function App() {
  if (window.location.hash === '#settings') {
    return <SettingsUI />
  }

  if (window.location.hash === '#onboarding') {
    return <OnboardingUI />
  }

  return <NotchUI />
}
