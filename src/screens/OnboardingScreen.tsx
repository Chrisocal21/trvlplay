import { useState } from 'react'
import { useApp } from '../state/AppContext'

const AVATAR_COLORS = [
  { id: 'teal',   hex: '#5DCAA5', label: 'Teal'   },
  { id: 'blue',   hex: '#185FA5', label: 'Blue'   },
  { id: 'amber',  hex: '#EF9F27', label: 'Amber'  },
  { id: 'coral',  hex: '#E24B4A', label: 'Coral'  },
  { id: 'indigo', hex: '#5B5EA6', label: 'Indigo' },
  { id: 'mint',   hex: '#9FE1CB', label: 'Mint'   },
  { id: 'slate',  hex: '#4A6FA5', label: 'Slate'  },
  { id: 'gold',   hex: '#D4A017', label: 'Gold'   },
]

export default function OnboardingScreen() {
  const { user, completeSetup } = useApp()
  const [username, setUsername] = useState(user.username === 'Player' ? '' : user.username)
  const [selectedColor, setSelectedColor] = useState('#5DCAA5')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleContinue() {
    const trimmed = username.trim()
    if (!trimmed) { setError('Choose a username to continue.'); return }
    if (trimmed.length < 2) { setError('Username must be at least 2 characters.'); return }
    if (trimmed.length > 20) { setError('Username must be 20 characters or less.'); return }
    if (!/^[a-zA-Z0-9_]+$/.test(trimmed)) { setError('Letters, numbers, and underscores only.'); return }
    setSaving(true)
    setError('')
    await completeSetup(trimmed, selectedColor)
    setSaving(false)
  }

  return (
    <div className="min-h-screen bg-[#085041] flex flex-col px-6 pt-12 pb-8 gap-8">

      {/* Header */}
      <div className="flex flex-col gap-2">
        <p className="text-[#5DCAA5] text-[11px] font-black uppercase tracking-[0.15em]">Welcome to TrvlPlay</p>
        <h1 className="text-[#E1F5EE] text-3xl font-black tracking-tight leading-tight">
          Set up your profile
        </h1>
        <p className="text-[#9FE1CB] text-sm font-semibold leading-relaxed">
          Pick a username and avatar color. You can change these later from your profile.
        </p>
      </div>

      {/* Username */}
      <div className="flex flex-col gap-2">
        <label className="text-[#9FE1CB] text-xs font-black uppercase tracking-[0.14em]">
          Username
        </label>
        <input
          type="text"
          value={username}
          onChange={e => { setUsername(e.target.value); setError('') }}
          placeholder="e.g. traveler42"
          maxLength={20}
          autoCapitalize="none"
          autoCorrect="off"
          className="bg-[#0F6E56] text-[#E1F5EE] font-bold text-base rounded-2xl px-4 py-4 placeholder:text-[#5DCAA5] placeholder:font-normal outline-none focus:ring-2 focus:ring-[#5DCAA5]"
        />
        {error && (
          <p className="text-[#E24B4A] text-xs font-bold">{error}</p>
        )}
        <p className="text-[#5DCAA5] text-xs">Letters, numbers, and underscores. 2–20 characters.</p>
      </div>

      {/* Avatar color picker */}
      <div className="flex flex-col gap-3">
        <label className="text-[#9FE1CB] text-xs font-black uppercase tracking-[0.14em]">
          Avatar Color
        </label>
        <div className="grid grid-cols-4 gap-3">
          {AVATAR_COLORS.map(c => (
            <button
              key={c.id}
              onClick={() => setSelectedColor(c.hex)}
              className="flex flex-col items-center gap-2"
            >
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center shadow-md transition-all ${
                  selectedColor === c.hex ? 'ring-4 ring-[#E1F5EE] scale-105' : ''
                }`}
                style={{ backgroundColor: c.hex }}
              >
                <span className="text-[#085041] text-sm font-black">
                  {user.initials}
                </span>
              </div>
              <span className="text-[#9FE1CB] text-[10px] font-bold">{c.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Continue */}
      <button
        onClick={handleContinue}
        disabled={saving}
        className="mt-auto w-full bg-[#5DCAA5] text-[#085041] font-black text-base rounded-2xl py-4 shadow-lg active:scale-95 transition-transform disabled:opacity-50"
      >
        {saving ? 'Saving...' : 'Continue'}
      </button>

    </div>
  )
}
