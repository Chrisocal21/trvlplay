import React from 'react'

type Tab = 'games' | 'friends' | 'shop' | 'profile'

interface BottomNavProps {
  active: Tab
  onSelect: (tab: Tab) => void
}

const GamesIcon: React.FC = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
    <rect x="3" y="3" width="8" height="8" rx="2" />
    <rect x="13" y="3" width="8" height="8" rx="2" />
    <rect x="3" y="13" width="8" height="8" rx="2" />
    <rect x="13" y="13" width="8" height="8" rx="2" />
  </svg>
)

const FriendsIcon: React.FC = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
    <circle cx="9" cy="7" r="4" />
    <path d="M1 21c0-4.4 3.6-8 8-8s8 3.6 8 8H1z" />
    <circle cx="19" cy="8" r="3" />
    <path d="M17 21c0-3 1.8-5.4 4.5-6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
  </svg>
)

const ShopIcon: React.FC = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <path d="M16 10a4 4 0 01-8 0" />
  </svg>
)

const ProfileIcon: React.FC = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
    <circle cx="12" cy="8" r="5" />
    <path d="M2 21c0-5.5 4.5-10 10-10s10 4.5 10 10H2z" />
  </svg>
)

const iconMap: Record<Tab, React.FC> = {
  games: GamesIcon,
  friends: FriendsIcon,
  shop: ShopIcon,
  profile: ProfileIcon,
}

const tabs: { id: Tab; label: string }[] = [
  { id: 'games', label: 'Games' },
  { id: 'friends', label: 'Friends' },
  { id: 'shop', label: 'Shop' },
  { id: 'profile', label: 'Profile' },
]

export default function BottomNav({ active, onSelect }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#085041] border-t border-[#0F6E56] pb-safe">
      <div className="max-w-md mx-auto flex">
        {tabs.map(({ id, label }) => {
          const Icon = iconMap[id]
          const isActive = active === id
          return (
            <button
              key={id}
              onClick={() => onSelect(id)}
              className={`flex-1 flex flex-col items-center gap-1.5 py-3 transition-colors ${
                isActive ? 'text-[#E1F5EE]' : 'text-[#5DCAA5]'
              }`}
            >
              <Icon />
              <span className="text-[10px] font-bold tracking-wide">{label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
