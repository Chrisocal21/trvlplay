import { type ReactNode } from 'react'
import { useApp } from '../state/AppContext'
import WelcomeScreen from '../screens/WelcomeScreen'

export default function AuthGate({ children }: { children: ReactNode }) {
  const { isLoaded, isSignedIn, guestMode } = useApp()

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

  return <>{children}</>
}
