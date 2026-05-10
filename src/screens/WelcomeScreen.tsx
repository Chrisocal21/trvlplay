import { useSignIn } from '@clerk/clerk-react'
import { useApp } from '../state/AppContext'
import Logo from '../components/Logo'

export default function WelcomeScreen() {
  const { signIn, isLoaded } = useSignIn()
  const { setGuestMode } = useApp()

  async function handleOAuth(strategy: 'oauth_google' | 'oauth_apple') {
    if (!signIn) return
    await signIn.authenticateWithRedirect({
      strategy,
      redirectUrl: window.location.origin,
      redirectUrlComplete: window.location.origin,
    })
  }

  return (
    <div className="min-h-screen bg-[#085041] flex flex-col items-center justify-center px-6 gap-10">

      {/* Logo + tagline */}
      <div className="flex flex-col items-center gap-4">
        <Logo />
        <p className="text-[#9FE1CB] text-sm font-semibold text-center max-w-xs leading-relaxed">
          Think fast. Play anywhere. Compete with friends.
        </p>
      </div>

      {/* Auth buttons */}
      <div className="w-full max-w-sm flex flex-col gap-3">
        <button
          onClick={() => handleOAuth('oauth_google')}
          disabled={!isLoaded}
          className="w-full flex items-center justify-center gap-3 bg-white text-[#1a1a1a] font-bold text-base rounded-2xl py-4 shadow-md active:scale-95 transition-transform disabled:opacity-50"
        >
          <GoogleIcon />
          Continue with Google
        </button>

        <button
          onClick={() => handleOAuth('oauth_apple')}
          disabled={!isLoaded}
          className="w-full flex items-center justify-center gap-3 bg-[#1a1a1a] text-white font-bold text-base rounded-2xl py-4 shadow-md active:scale-95 transition-transform disabled:opacity-50"
        >
          <AppleIcon />
          Continue with Apple
        </button>
      </div>

      {/* Guest link */}
      <button
        onClick={setGuestMode}
        className="text-[#5DCAA5] text-sm font-semibold underline underline-offset-2"
      >
        Play as Guest
      </button>

    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  )
}

function AppleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
    </svg>
  )
}
