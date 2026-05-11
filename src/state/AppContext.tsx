import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { useUser, useAuth, useClerk } from '@clerk/clerk-react'
import { syncUser, recordResult as apiRecordResult, getInventory, buyItem as apiBuyItem, equipItem as apiEquipItem } from '../api/client'

export interface UserStats {
  played: number
  wins: number
  streak: number
  perfect: number
}

export interface AppUser {
  initials: string
  username: string
  avatarColor: string
  memberSince: string
  friendCode: string
  coins: number
  stats: UserStats
  playHistory: string[]
  dailyPlayedDate: string
}

export interface GameResult {
  won: boolean
  strikes: number
  durationSeconds: number
  puzzleId?: number
  mode?: 'daily' | 'freeplay'
}

interface StoredData {
  coins: number
  stats: UserStats
  avatarColor: string
  playHistory: string[]  // ISO date strings 'YYYY-MM-DD' of days played
  dailyPlayedDate: string  // last date a daily Sort was completed, 'YYYY-MM-DD' or ''
}

interface AppState {
  user: AppUser
  isLoaded: boolean
  isSignedIn: boolean
  guestMode: boolean
  guestGamePlayed: boolean
  inventory: InventoryItem[]
  setGuestMode: () => void
  recordResult: (result: GameResult) => void
  buyItem: (itemType: string, itemId: string, price: number) => Promise<void>
  equipItem: (itemType: string, itemId: string) => Promise<void>
  signOut: () => void
}

export interface InventoryItem {
  item_type: string
  item_id: string
  equipped: number
}

const DEFAULT_STORED: StoredData = {
  coins: 0,
  stats: { played: 0, wins: 0, streak: 0, perfect: 0 },
  avatarColor: '#5DCAA5',
  playHistory: [],
  dailyPlayedDate: '',
}

const BASE_COINS = 100
const STRIKE_PENALTY = 20
const PERFECT_BONUS = 50

export function calcCoins(result: GameResult): number {
  if (!result.won) return 0
  let coins = BASE_COINS
  coins -= result.strikes * STRIKE_PENALTY
  if (result.strikes === 0) coins += PERFECT_BONUS
  if (result.durationSeconds < 60) {
    coins += Math.round((1 - result.durationSeconds / 60) * 30)
  }
  return Math.max(coins, 0)
}

function getInitials(name: string | null | undefined): string {
  if (!name) return 'G'
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  return parts[0].slice(0, 2).toUpperCase()
}

function makeFriendCode(userId: string, fullName: string | null | undefined): string {
  const initials = getInitials(fullName)
  const suffix = userId.replace(/[^a-z0-9]/gi, '').slice(-5).toUpperCase()
  return `TRVL-${initials}${suffix}`
}

function formatMemberSince(date: Date | null | undefined): string {
  if (!date) return ''
  return new Date(date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

const AppContext = createContext<AppState | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const { user: clerkUser } = useUser()
  const { isLoaded, isSignedIn: clerkIsSignedIn } = useAuth()
  const { signOut: clerkSignOut } = useClerk()
  const [guestMode, setGuestModeState] = useState(false)
  const [guestGamePlayed, setGuestGamePlayed] = useState(false)
  const [inventory, setInventory] = useState<InventoryItem[]>([])

  const userId = clerkUser?.id ?? (guestMode ? 'guest' : null)
  const storageKey = userId ? `trvlplay_${userId}` : null

  const [storedData, setStoredData] = useState<StoredData>(DEFAULT_STORED)

  useEffect(() => {
    if (!storageKey) { setStoredData(DEFAULT_STORED); return }
    try {
      const raw = localStorage.getItem(storageKey)
      setStoredData(raw ? { ...DEFAULT_STORED, ...JSON.parse(raw) } : DEFAULT_STORED)
    } catch {
      setStoredData(DEFAULT_STORED)
    }
  }, [storageKey])

  function saveData(data: StoredData) {
    if (storageKey) {
      try { localStorage.setItem(storageKey, JSON.stringify(data)) } catch { /* quota full */ }
    }
    setStoredData(data)
  }

  const isSignedIn = !!clerkIsSignedIn

  const user: AppUser = clerkUser
    ? {
        initials: getInitials(clerkUser.fullName),
        username: clerkUser.username ?? clerkUser.firstName ?? clerkUser.fullName ?? 'Player',
        avatarColor: storedData.avatarColor,
        memberSince: formatMemberSince(clerkUser.createdAt),
        friendCode: makeFriendCode(clerkUser.id, clerkUser.fullName),
        coins: storedData.coins,
        stats: storedData.stats,
        playHistory: storedData.playHistory,
        dailyPlayedDate: storedData.dailyPlayedDate,
      }
    : {
        initials: 'G',
        username: 'Guest',
        avatarColor: '#9FE1CB',
        memberSince: '',
        friendCode: '',
        coins: storedData.coins,
        stats: storedData.stats,
        playHistory: storedData.playHistory,
        dailyPlayedDate: storedData.dailyPlayedDate,
      }

  // Sync user to D1 after Clerk loads.
  // IMPORTANT: reads localStorage directly — not from React state — because both effects
  // fire simultaneously when clerkUser appears and the state may still be DEFAULT_STORED.
  useEffect(() => {
    if (!clerkUser) return
    const key = `trvlplay_${clerkUser.id}`
    let local: StoredData = DEFAULT_STORED
    try {
      const raw = localStorage.getItem(key)
      if (raw) local = { ...DEFAULT_STORED, ...JSON.parse(raw) }
    } catch { /* ignore */ }

    const initials = getInitials(clerkUser.fullName)
    const friendCode = makeFriendCode(clerkUser.id, clerkUser.fullName)
    syncUser({
      id: clerkUser.id,
      username: clerkUser.username ?? clerkUser.firstName ?? clerkUser.fullName ?? 'Player',
      initials,
      avatarColor: local.avatarColor,
      friendCode,
      localCoins: local.coins,
      localStats: local.stats,
    }).then((res: { user?: { coins?: number; played?: number; wins?: number; streak?: number; perfect?: number } }) => {
      const remote = res?.user
      if (!remote) return
      // D1 has reconciled all devices — trust it completely and write back locally
      const synced: StoredData = {
        ...local,
        coins: remote.coins ?? local.coins,
        stats: {
          played: remote.played ?? local.stats.played,
          wins: remote.wins ?? local.stats.wins,
          streak: remote.streak ?? local.stats.streak,
          perfect: remote.perfect ?? local.stats.perfect,
        },
      }
      try { localStorage.setItem(key, JSON.stringify(synced)) } catch { /* quota */ }
      setStoredData(synced)
    }).catch(console.error)

    // Load inventory
    getInventory(clerkUser.id)
      .then((res: { inventory?: InventoryItem[] }) => {
        if (res?.inventory) {
          setInventory(res.inventory)
          // Seed default items locally if inventory is empty (table may not exist on older accounts)
          if (res.inventory.length === 0) {
            setInventory([
              { item_type: 'avatar_color', item_id: 'teal', equipped: 1 },
              { item_type: 'theme', item_id: 'classic', equipped: 1 },
              { item_type: 'card_back', item_id: 'teal', equipped: 1 },
            ])
          }
        }
      }).catch(() => {
        // Fallback to defaults if API unavailable
        setInventory([
          { item_type: 'avatar_color', item_id: 'teal', equipped: 1 },
          { item_type: 'theme', item_id: 'classic', equipped: 1 },
          { item_type: 'card_back', item_id: 'teal', equipped: 1 },
        ])
      })
  }, [clerkUser?.id])

  function recordResult(result: GameResult) {
    const earned = calcCoins(result)
    const today = new Date().toISOString().slice(0, 10)
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
    const history = storedData.playHistory.includes(today)
      ? storedData.playHistory
      : [...storedData.playHistory.slice(-29), today]

    // Streak: only recalculate if this is the first game today
    const alreadyPlayedToday = storedData.playHistory.includes(today)
    let newStreak = storedData.stats.streak
    if (!alreadyPlayedToday && result.won) {
      if (storedData.playHistory.includes(yesterday)) {
        newStreak = storedData.stats.streak + 1
      } else {
        newStreak = 1
      }
    } else if (!alreadyPlayedToday && !result.won) {
      // A loss on a new day: streak resets only if they haven't won today yet
      // (we keep it if they already have a win today — but we can't know that from local data alone)
      // Conservative: don't touch streak on first loss of the day if they haven't built today's yet
      newStreak = storedData.stats.streak
    }
    const newData: StoredData = {
      ...storedData,
      playHistory: history,
      dailyPlayedDate: result.mode === 'daily' ? today : storedData.dailyPlayedDate,
      coins: storedData.coins + earned,
      stats: {
        played: storedData.stats.played + 1,
        wins: storedData.stats.wins + (result.won ? 1 : 0),
        streak: newStreak,
        perfect: storedData.stats.perfect + (result.won && result.strikes === 0 ? 1 : 0),
      },
    }
    saveData(newData)
    if (guestMode && !guestGamePlayed) setGuestGamePlayed(true)

    // Persist to D1 for signed-in users
    if (clerkUser) {
      apiRecordResult({
        userId: clerkUser.id,
        puzzleId: result.puzzleId ?? 0,
        mode: result.mode ?? 'freeplay',
        won: result.won,
        strikes: result.strikes,
        durationSeconds: result.durationSeconds,
        coinsEarned: earned,
      }).catch(console.error)
    }
  }

  async function buyItem(itemType: string, itemId: string, price: number) {
    if (!clerkUser) return
    const res = await apiBuyItem({ userId: clerkUser.id, itemType, itemId, price })
    // Update local coin balance
    const newData: StoredData = { ...storedData, coins: res.coins ?? storedData.coins - price }
    saveData(newData)
    // Add to local inventory
    setInventory(prev => [...prev, { item_type: itemType, item_id: itemId, equipped: 0 }])
  }

  async function equipItem(itemType: string, itemId: string) {
    if (!clerkUser) return
    await apiEquipItem({ userId: clerkUser.id, itemType, itemId })
    // Update avatar color in stored data if relevant
    if (itemType === 'avatar_color') {
      const colorMap: Record<string, string> = {
        teal: '#5DCAA5', blue: '#185FA5', amber: '#EF9F27', coral: '#E24B4A',
        indigo: '#5B5EA6', mint: '#9FE1CB', slate: '#4A6FA5', gold: '#D4A017',
      }
      const hex = colorMap[itemId]
      if (hex) saveData({ ...storedData, avatarColor: hex })
    }
    setInventory(prev =>
      prev.map(item =>
        item.item_type === itemType
          ? { ...item, equipped: item.item_id === itemId ? 1 : 0 }
          : item
      )
    )
  }

  async function signOut() {
    await clerkSignOut()
    setGuestModeState(false)
    setGuestGamePlayed(false)
  }

  function setGuestMode() {
    setGuestModeState(true)
  }

  return (
    <AppContext.Provider
      value={{ user, isLoaded, isSignedIn, guestMode, guestGamePlayed, inventory, setGuestMode, recordResult, buyItem, equipItem, signOut }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside AppProvider')
  return ctx
}
