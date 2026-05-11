import { useState } from 'react'
import { useApp } from '../state/AppContext'

const AVATAR_COLORS = [
  { id: 'teal',   hex: '#5DCAA5' },
  { id: 'blue',   hex: '#185FA5' },
  { id: 'amber',  hex: '#EF9F27' },
  { id: 'coral',  hex: '#E24B4A' },
  { id: 'indigo', hex: '#5B5EA6' },
  { id: 'mint',   hex: '#9FE1CB' },
  { id: 'slate',  hex: '#4A6FA5' },
  { id: 'gold',   hex: '#D4A017' },
]

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-[#5DCAA5] rounded-2xl px-4 py-4 flex flex-col gap-1">
      <p className="text-[#085041] text-2xl font-black leading-none">{value}</p>
      <p className="text-[#0F6E56] text-xs font-bold uppercase tracking-wide">{label}</p>
    </div>
  )
}

interface Props {
  onGoToFriends: () => void
}

export default function ProfileScreen({ onGoToFriends }: Props) {
  const { user, isSignedIn, signOut, updateProfile, medallions } = useApp()
  const [copied, setCopied] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editUsername, setEditUsername] = useState(user.username)
  const [editColor, setEditColor] = useState(user.avatarColor)
  const [editError, setEditError] = useState('')
  const [saving, setSaving] = useState(false)

  function copyCode() {
    navigator.clipboard.writeText(user.friendCode).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  function shareCode() {
    if (navigator.share) {
      navigator.share({ text: `Add me on TrvlPlay! My code is ${user.friendCode}` })
    } else {
      copyCode()
    }
  }

  function startEdit() {
    setEditUsername(user.username)
    setEditColor(user.avatarColor)
    setEditError('')
    setEditing(true)
  }

  function cancelEdit() {
    setEditing(false)
    setEditError('')
  }

  async function saveEdit() {
    const trimmed = editUsername.trim()
    if (!trimmed) { setEditError('Username cannot be empty.'); return }
    if (trimmed.length < 2) { setEditError('At least 2 characters.'); return }
    if (trimmed.length > 20) { setEditError('20 characters max.'); return }
    if (!/^[a-zA-Z0-9_]+$/.test(trimmed)) { setEditError('Letters, numbers, and underscores only.'); return }
    setSaving(true)
    await updateProfile(trimmed, editColor)
    setSaving(false)
    setEditing(false)
  }

  return (
    <div className="min-h-screen bg-[#E1F5EE] pb-24">

      {/* Header */}
      <div className="bg-[#085041] px-5 pt-5 pb-8">
        <div className="flex items-center justify-between mb-4">
          <p className="text-[#5DCAA5] text-[11px] font-black uppercase tracking-[0.15em]">Profile</p>
          {isSignedIn && !editing && (
            <button
              onClick={startEdit}
              className="text-[#9FE1CB] text-xs font-black uppercase tracking-wide"
            >
              Edit
            </button>
          )}
        </div>

        {editing ? (
          /* Edit mode */
          <div className="flex flex-col gap-4">
            {/* Color picker row */}
            <div className="flex gap-2 overflow-x-auto pb-1">
              {AVATAR_COLORS.map(c => (
                <button
                  key={c.id}
                  onClick={() => setEditColor(c.hex)}
                  className={`w-12 h-12 rounded-full shrink-0 flex items-center justify-center shadow-md transition-all ${
                    editColor === c.hex ? 'ring-3 ring-[#E1F5EE] scale-110' : 'opacity-70'
                  }`}
                  style={{ backgroundColor: c.hex }}
                >
                  {editColor === c.hex && (
                    <span className="text-[#085041] text-xs font-black">{user.initials}</span>
                  )}
                </button>
              ))}
            </div>

            {/* Username input */}
            <input
              type="text"
              value={editUsername}
              onChange={e => { setEditUsername(e.target.value); setEditError('') }}
              maxLength={20}
              autoCapitalize="none"
              autoCorrect="off"
              className="bg-[#0F6E56] text-[#E1F5EE] font-bold text-base rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#5DCAA5]"
            />
            {editError && <p className="text-[#E24B4A] text-xs font-bold -mt-2">{editError}</p>}

            <div className="flex gap-3">
              <button
                onClick={cancelEdit}
                className="flex-1 bg-[#0F6E56] text-[#9FE1CB] font-bold rounded-xl py-3 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={saveEdit}
                disabled={saving}
                className="flex-1 bg-[#5DCAA5] text-[#085041] font-black rounded-xl py-3 text-sm disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        ) : (
          /* View mode */
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-4">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg shrink-0"
                style={{ backgroundColor: user.avatarColor }}
              >
                <span className="text-[#085041] text-xl font-black">{user.initials}</span>
              </div>
              <div>
                <h1 className="text-[#E1F5EE] text-2xl font-black tracking-tight leading-tight">{user.username}</h1>
                <p className="text-[#5DCAA5] text-sm font-semibold mt-0.5">Member since {user.memberSince}</p>
              </div>
            </div>

            {/* Coin balance */}
            <div className="flex items-center gap-2 bg-[#0F6E56] rounded-2xl px-4 py-3 w-fit">
              <div className="w-4 h-4 rounded-full bg-[#EF9F27] shrink-0" />
              <span className="text-[#FAC775] font-black text-base">{user.coins}</span>
              <span className="text-[#5DCAA5] text-sm font-semibold">coins</span>
            </div>
          </div>
        )}
      </div>

      <div className="px-4 -mt-4 flex flex-col gap-5">

        {/* Friend code card — signed-in users only */}
        {isSignedIn && (
          <div className="bg-[#5DCAA5] rounded-2xl overflow-hidden flex shadow-lg">
            <div className="w-1.5 bg-[#EF9F27] shrink-0" />
            <div className="flex-1 px-4 py-4">
              <p className="text-[#085041] text-[10px] font-black uppercase tracking-[0.14em] mb-2">Your Friend Code</p>
              <div className="flex items-center justify-between gap-3">
                <span className="text-[#085041] text-lg font-black tracking-widest">{user.friendCode}</span>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={copyCode}
                    className="bg-[#9FE1CB] text-[#085041] text-xs font-black px-3 py-2 rounded-xl"
                  >
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                  <button
                    onClick={shareCode}
                    className="bg-[#085041] text-[#E1F5EE] text-xs font-black px-3 py-2 rounded-xl"
                  >
                    Share
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats grid */}
        <div>
          <h2 className="text-[#085041] font-black text-base uppercase tracking-wide mb-3">Stats</h2>
          <div className="grid grid-cols-2 gap-3">
            <StatCard label="Games played" value={user.stats.played} />
            <StatCard label="Win rate" value={user.stats.played > 0 ? `${Math.round((user.stats.wins / user.stats.played) * 100)}%` : '--%'} />
            <StatCard label="Streak" value={user.stats.streak} />
            <StatCard label="Perfect games" value={user.stats.perfect} />
          </div>
        </div>

        {/* Medallions */}
        {isSignedIn && (() => {
          const MONTHS = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC']
          const year = new Date().getFullYear()
          return (
            <div className="bg-[#5DCAA5] rounded-2xl overflow-hidden flex shadow-sm">
              <div className="w-1.5 bg-[#EF9F27] shrink-0" />
              <div className="flex-1 px-4 py-4">
                <p className="text-[#085041] text-[10px] font-black uppercase tracking-[0.14em] mb-3">Monthly Medallions</p>
                <div className="flex gap-2 flex-wrap">
                  {MONTHS.map((m, i) => {
                    const key = `${year}-${String(i + 1).padStart(2, '0')}`
                    const earned = medallions.includes(key)
                    return (
                      <div
                        key={m}
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          earned ? 'bg-[#EF9F27]' : 'bg-[#9FE1CB] opacity-40'
                        }`}
                      >
                        <span className={`text-[9px] font-black ${
                          earned ? 'text-[#085041]' : 'text-[#0F6E56]'
                        }`}>{m}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )
        })()}

        {/* Friends nudge */}
        {isSignedIn && (
          <div className="bg-[#5DCAA5] rounded-2xl overflow-hidden flex shadow-sm">
            <div className="w-1.5 bg-[#9FE1CB] shrink-0" />
            <div className="flex-1 px-4 py-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-[#085041] font-black text-sm">Friends</p>
                <p className="text-[#0F6E56] text-xs mt-0.5">Add friends and see how you stack up</p>
              </div>
              <button
                onClick={onGoToFriends}
                className="bg-[#185FA5] text-[#E1F5EE] text-xs font-bold px-4 py-2 rounded-xl shadow-sm shrink-0"
              >
                View
              </button>
            </div>
          </div>
        )}

        {/* Sign-out / guest notice */}
        {isSignedIn ? (
          <button
            onClick={signOut}
            className="w-full text-center text-[#5DCAA5] text-sm font-semibold py-2 mb-2"
          >
            Sign out
          </button>
        ) : (
          <div className="bg-[#5DCAA5] rounded-2xl overflow-hidden flex shadow-sm">
            <div className="w-1.5 bg-[#EF9F27] shrink-0" />
            <div className="flex-1 px-4 py-4 text-center">
              <p className="text-[#085041] font-black text-base">Playing as Guest</p>
              <p className="text-[#0F6E56] text-sm mt-1">Sign in to save your coins and stats</p>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

