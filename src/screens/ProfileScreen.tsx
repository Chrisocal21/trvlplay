import { useState } from 'react'
import { useApp } from '../state/AppContext'

const MOCK_FRIENDS: { name: string; initials: string; color: string; streak: number; lastActive: string; online: boolean }[] = []

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-[#5DCAA5] rounded-2xl px-4 py-4 flex flex-col gap-1">
      <p className="text-[#085041] text-2xl font-black leading-none">{value}</p>
      <p className="text-[#0F6E56] text-xs font-bold uppercase tracking-wide">{label}</p>
    </div>
  )
}

export default function ProfileScreen() {
  const { user, isSignedIn, signOut } = useApp()
  const [copied, setCopied] = useState(false)

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

  return (
    <div className="min-h-screen bg-[#E1F5EE] pb-24">

      {/* Header */}
      <div className="bg-[#085041] px-5 pt-5 pb-8">
        <p className="text-[#5DCAA5] text-[11px] font-black uppercase tracking-[0.15em] mb-4">Profile</p>

        {/* Avatar + name */}
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
        <div className="mt-5 flex items-center gap-2 bg-[#0F6E56] rounded-2xl px-4 py-3 w-fit">
          <div className="w-4 h-4 rounded-full bg-[#EF9F27] shrink-0" />
          <span className="text-[#FAC775] font-black text-base">{user.coins}</span>
          <span className="text-[#5DCAA5] text-sm font-semibold">coins</span>
        </div>
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

        {/* Friends */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[#085041] font-black text-base uppercase tracking-wide">Friends</h2>
            <button className="bg-[#185FA5] text-[#E1F5EE] text-xs font-bold px-4 py-2 rounded-xl shadow-sm">
              Add Friend
            </button>
          </div>

          {MOCK_FRIENDS.length === 0 ? (
            <div className="bg-[#5DCAA5] rounded-2xl overflow-hidden flex shadow-sm">
              <div className="w-1.5 bg-[#9FE1CB] shrink-0" />
              <div className="flex-1 px-4 py-6 text-center">
                <p className="text-[#085041] font-black text-base">Add a friend to see how you stack up</p>
                <p className="text-[#0F6E56] text-sm mt-1">Share your code: <span className="font-bold">{user.friendCode}</span></p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {MOCK_FRIENDS.map(friend => (
                <div key={friend.name} className="bg-[#5DCAA5] rounded-2xl overflow-hidden flex shadow-sm">
                  <div className="w-1.5 bg-[#9FE1CB] shrink-0" />
                  <div className="flex-1 px-4 py-3 flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                      style={{ backgroundColor: friend.color }}
                    >
                      <span className="text-[#085041] text-xs font-black">{friend.initials}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[#085041] font-black text-base leading-tight">{friend.name}</p>
                      <p className="text-[#0F6E56] text-xs">{friend.lastActive}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[#085041] font-black text-sm">{friend.streak}</p>
                      <p className="text-[#0F6E56] text-[10px] uppercase tracking-wide">Streak</p>
                    </div>
                    {friend.online && (
                      <div className="w-2.5 h-2.5 rounded-full bg-[#5DCAA5] border-2 border-[#085041] shrink-0" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sign-out / sign-in */}
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
