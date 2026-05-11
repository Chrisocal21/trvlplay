import { useState } from 'react'
import { useApp } from '../state/AppContext'

type Category = 'avatars' | 'themes' | 'cardbacks'

const AVATAR_COLORS = [
  { id: 'teal',    label: 'Teal',    color: '#5DCAA5', price: 0    },
  { id: 'blue',    label: 'Blue',    color: '#185FA5', price: 200  },
  { id: 'amber',   label: 'Amber',   color: '#EF9F27', price: 200  },
  { id: 'coral',   label: 'Coral',   color: '#E24B4A', price: 300  },
  { id: 'indigo',  label: 'Indigo',  color: '#5B5EA6', price: 300  },
  { id: 'mint',    label: 'Mint',    color: '#9FE1CB', price: 150  },
  { id: 'slate',   label: 'Slate',   color: '#4A6FA5', price: 250  },
  { id: 'gold',    label: 'Gold',    color: '#D4A017', price: 500  },
]

const THEMES = [
  { id: 'classic',  label: 'Classic',  desc: 'The original teal palette',   price: 0,   accent: '#5DCAA5' },
  { id: 'ocean',    label: 'Ocean',    desc: 'Deep blues and sea greens',    price: 400, accent: '#185FA5' },
  { id: 'sunset',   label: 'Sunset',   desc: 'Warm ambers and coral tones', price: 400, accent: '#EF9F27' },
  { id: 'midnight', label: 'Midnight', desc: 'Dark tiles, high contrast',   price: 600, accent: '#4A6FA5' },
]

const CARD_BACKS = [
  { id: 'teal',  label: 'Teal',  accent: '#5DCAA5', price: 0   },
  { id: 'amber', label: 'Amber', accent: '#EF9F27', price: 250 },
  { id: 'blue',  label: 'Blue',  accent: '#185FA5', price: 250 },
  { id: 'coral', label: 'Coral', accent: '#E24B4A', price: 350 },
]

function CoinIcon() {
  return <div className="w-3.5 h-3.5 rounded-full bg-[#EF9F27] shrink-0 inline-block" />
}

export default function ShopScreen() {
  const { user, inventory, buyItem, equipItem, isSignedIn } = useApp()
  const [activeCategory, setActiveCategory] = useState<Category>('avatars')
  const [buying, setBuying] = useState<string | null>(null)

  function isOwned(itemType: string, itemId: string) {
    return inventory.some(i => i.item_type === itemType && i.item_id === itemId)
  }

  function isEquipped(itemType: string, itemId: string) {
    return inventory.some(i => i.item_type === itemType && i.item_id === itemId && i.equipped === 1)
  }

  async function handleBuy(itemType: string, itemId: string, price: number) {
    if (!isSignedIn || buying) return
    setBuying(`${itemType}:${itemId}`)
    try {
      await buyItem(itemType, itemId, price)
    } catch {
      // insufficient coins or API error — silently ignore for now
    } finally {
      setBuying(null)
    }
  }

  async function handleEquip(itemType: string, itemId: string) {
    if (!isSignedIn) return
    await equipItem(itemType, itemId)
  }

  const categories: { id: Category; label: string }[] = [
    { id: 'avatars',   label: 'Avatars'    },
    { id: 'themes',    label: 'Themes'     },
    { id: 'cardbacks', label: 'Card Backs' },
  ]

  return (
    <div className="min-h-screen bg-[#E1F5EE] pb-24">

      {/* Header */}
      <div className="bg-[#085041] px-5 pt-5 pb-8">
        <p className="text-[#5DCAA5] text-[11px] font-black uppercase tracking-[0.15em] mb-4">Shop</p>
        <div className="flex items-center justify-between">
          <h1 className="text-[#E1F5EE] text-2xl font-black tracking-tight">Cosmetics</h1>
          <div className="flex items-center gap-2 bg-[#0F6E56] rounded-2xl px-3 py-2">
            <CoinIcon />
            <span className="text-[#FAC775] font-black text-base">{user.coins}</span>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-4 flex flex-col gap-5">

        {/* Category tabs */}
        <div className="bg-[#5DCAA5] rounded-2xl p-1 flex gap-1 shadow-sm">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex-1 py-2 rounded-xl text-xs font-black transition-all ${
                activeCategory === cat.id
                  ? 'bg-[#085041] text-[#E1F5EE]'
                  : 'text-[#085041]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Avatar colors */}
        {activeCategory === 'avatars' && (
          <div>
            <p className="text-[#0F6E56] text-xs font-bold mb-3">Change your avatar circle color</p>
            <div className="grid grid-cols-4 gap-3">
              {AVATAR_COLORS.map(item => {
                const owned = isOwned('avatar_color', item.id)
                const equipped = isEquipped('avatar_color', item.id)
                const isBuying = buying === `avatar_color:${item.id}`
                return (
                  <div key={item.id} className="flex flex-col items-center gap-2">
                    <div className="relative">
                      <div
                        className="w-16 h-16 rounded-full flex items-center justify-center shadow-md"
                        style={{ backgroundColor: item.color }}
                      >
                        <span className="text-[#085041] text-sm font-black">{user.initials}</span>
                      </div>
                      {equipped && (
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#085041] flex items-center justify-center">
                          <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                            <path d="M2 6l3 3 5-5" stroke="#9FE1CB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      )}
                    </div>
                    <span className="text-[#085041] text-[10px] font-black">{item.label}</span>
                    {equipped ? (
                      <span className="text-[#0F6E56] text-[10px] font-bold">Equipped</span>
                    ) : owned ? (
                      <button
                        onClick={() => handleEquip('avatar_color', item.id)}
                        className="text-[#185FA5] text-[10px] font-black"
                      >
                        Equip
                      </button>
                    ) : (
                      <button
                        onClick={() => handleBuy('avatar_color', item.id, item.price)}
                        disabled={isBuying || user.coins < item.price || !isSignedIn}
                        className={`flex items-center gap-1 ${
                          user.coins < item.price || !isSignedIn ? 'opacity-40' : ''
                        }`}
                      >
                        <CoinIcon />
                        <span className="text-[#085041] text-[10px] font-black">
                          {isBuying ? '...' : item.price}
                        </span>
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Game themes */}
        {activeCategory === 'themes' && (
          <div>
            <p className="text-[#0F6E56] text-xs font-bold mb-3">Change the look of the Sort tile grid</p>
            <div className="flex flex-col gap-3">
              {THEMES.map(item => {
                const owned = isOwned('theme', item.id)
                const equipped = isEquipped('theme', item.id)
                const isBuying = buying === `theme:${item.id}`
                return (
                  <div key={item.id} className="bg-[#5DCAA5] rounded-2xl overflow-hidden flex shadow-sm">
                    <div className="w-1.5 shrink-0" style={{ backgroundColor: item.accent }} />
                    <div className="flex-1 px-4 py-4 flex items-center gap-4">
                      <div className="grid grid-cols-2 gap-1 shrink-0">
                        {[0,1,2,3].map(i => (
                          <div
                            key={i}
                            className="w-7 h-7 rounded-lg"
                            style={{ backgroundColor: i % 2 === 0 ? item.accent : '#9FE1CB', opacity: i < 2 ? 1 : 0.6 }}
                          />
                        ))}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[#085041] font-black text-base leading-tight">{item.label}</p>
                        <p className="text-[#0F6E56] text-xs mt-0.5">{item.desc}</p>
                      </div>
                      {equipped ? (
                        <span className="text-[#085041] text-xs font-black shrink-0">Equipped</span>
                      ) : owned ? (
                        <button
                          onClick={() => handleEquip('theme', item.id)}
                          className="text-[#185FA5] text-xs font-black shrink-0"
                        >
                          Equip
                        </button>
                      ) : (
                        <button
                          onClick={() => handleBuy('theme', item.id, item.price)}
                          disabled={isBuying || user.coins < item.price || !isSignedIn}
                          className={`flex items-center gap-1 shrink-0 ${
                            user.coins < item.price || !isSignedIn ? 'opacity-40' : ''
                          }`}
                        >
                          <CoinIcon />
                          <span className="text-[#085041] text-sm font-black">
                            {isBuying ? '...' : item.price}
                          </span>
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Card backs */}
        {activeCategory === 'cardbacks' && (
          <div>
            <p className="text-[#0F6E56] text-xs font-bold mb-3">Change your accent color when friends view your profile</p>
            <div className="grid grid-cols-2 gap-3">
              {CARD_BACKS.map(item => {
                const owned = isOwned('card_back', item.id)
                const equipped = isEquipped('card_back', item.id)
                const isBuying = buying === `card_back:${item.id}`
                return (
                  <div key={item.id} className="bg-[#5DCAA5] rounded-2xl overflow-hidden flex shadow-sm">
                    <div className="w-2 shrink-0 rounded-l-2xl" style={{ backgroundColor: item.accent }} />
                    <div className="flex-1 px-3 py-4 flex flex-col gap-2">
                      <div className="bg-[#9FE1CB] rounded-xl px-3 py-3">
                        <div className="w-8 h-8 rounded-full mb-2" style={{ backgroundColor: item.accent }} />
                        <div className="h-2 bg-[#5DCAA5] rounded-full w-3/4 mb-1" />
                        <div className="h-1.5 bg-[#5DCAA5] rounded-full w-1/2 opacity-60" />
                      </div>
                      <p className="text-[#085041] font-black text-sm">{item.label}</p>
                      {equipped ? (
                        <span className="text-[#0F6E56] text-xs font-bold">Equipped</span>
                      ) : owned ? (
                        <button
                          onClick={() => handleEquip('card_back', item.id)}
                          className="text-[#185FA5] text-xs font-black text-left"
                        >
                          Equip
                        </button>
                      ) : (
                        <button
                          onClick={() => handleBuy('card_back', item.id, item.price)}
                          disabled={isBuying || user.coins < item.price || !isSignedIn}
                          className={`flex items-center gap-1 ${
                            user.coins < item.price || !isSignedIn ? 'opacity-40' : ''
                          }`}
                        >
                          <CoinIcon />
                          <span className="text-[#085041] text-xs font-black">
                            {isBuying ? '...' : item.price}
                          </span>
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Earn more coins nudge */}
        <div className="bg-[#5DCAA5] rounded-2xl overflow-hidden flex shadow-sm">
          <div className="w-1.5 bg-[#EF9F27] shrink-0" />
          <div className="flex-1 px-4 py-4 flex items-center gap-3">
            <CoinIcon />
            <div>
              <p className="text-[#085041] font-black text-sm">Earn coins by playing</p>
              <p className="text-[#0F6E56] text-xs">Complete daily puzzles and build your streak</p>
            </div>
          </div>
        </div>

        {!isSignedIn && (
          <div className="bg-[#5DCAA5] rounded-2xl overflow-hidden flex shadow-sm">
            <div className="w-1.5 bg-[#E24B4A] shrink-0" />
            <div className="flex-1 px-4 py-4">
              <p className="text-[#085041] font-black text-sm">Sign in to buy cosmetics</p>
              <p className="text-[#0F6E56] text-xs">Create a free account to spend your coins</p>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
