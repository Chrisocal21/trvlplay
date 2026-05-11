import { type ReactNode } from 'react'
import { AuthenticateWithRedirectCallback } from '@clerk/clerk-react'
import { useApp } from '../state/AppContext'
import WelcomeScreen from '../screens/WelcomeScreen'
import OnboardingScreen from '../screens/OnboardingScreen'

export default function AuthGate({ children }: { children: ReactNode }) {
  const { isLoaded, isSignedIn, guestMode, user } = useApp()

  // Handle the OAuth callback at /sso-callback
  if (window.location.pathname === '/sso-callback') {
    return <AuthenticateWithRedirectCallback />
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#085041] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-[#5DCAA5] border-t-transparent animate-spin" />
      </div>
    )
  }

  if (!isSignedIn && !guestMode) {
    return <WelcomeScreen />
  }

  // First-time signed-in user: show onboarding before the app
  if (isSignedIn && !user.setupComplete) {
    return <OnboardingScreen />
  }

  return <>{children}</>
}
