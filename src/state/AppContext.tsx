import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { useUser, useAuth, useClerk } from '@clerk/clerk-react'
import { syncUser, recordResult as apiRecordResult } from '../api/client'

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
}

export interface GameResult {
  won: boolean
  strikes: number
  durationSeconds: number
}

interface StoredData {
  coins: number
  stats: UserStats
  avatarColor: string
}

interface AppState {
  user: AppUser
  isLoaded: boolean
  isSignedIn: boolean
  guestMode: boolean
  guestGamePlayed: boolean
  setGuestMode: () => void
  recordResult: (result: GameResult) => void
  signOut: () => void
}

const DEFAULT_STORED: StoredData = {
  coins: 0,
  stats: { played: 0, wins: 0, streak: 0, perfect: 0 },
  avatarColor: '#5DCAA5',
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
      }
    : {
        initials: 'G',
        username: 'Guest',
        avatarColor: '#9FE1CB',
        memberSince: '',
        friendCode: '',
        coins: storedData.coins,
        stats: storedData.stats,
      }

  // Sync user to D1 after Clerk loads — hydrate coins/stats from D1 as source of truth
  useEffect(() => {
    if (!clerkUser) return
    const initials = getInitials(clerkUser.fullName)
    const friendCode = makeFriendCode(clerkUser.id, clerkUser.fullName)
    syncUser({
      id: clerkUser.id,
      username: clerkUser.username ?? clerkUser.firstName ?? clerkUser.fullName ?? 'Player',
      initials,
      avatarColor: storedData.avatarColor,
      friendCode,
    }).then((res: { user?: { coins?: number; played?: number; wins?: number; streak?: number; perfect?: number } }) => {
      const remote = res?.user
      if (!remote) return
      // Use D1 as source of truth — take the higher coin value to protect local offline plays
      setStoredData(prev => {
        const merged: StoredData = {
          ...prev,
          coins: Math.max(prev.coins, remote.coins ?? 0),
          stats: {
            played: Math.max(prev.stats.played, remote.played ?? 0),
            wins: Math.max(prev.stats.wins, remote.wins ?? 0),
            streak: Math.max(prev.stats.streak, remote.streak ?? 0),
            perfect: Math.max(prev.stats.perfect, remote.perfect ?? 0),
          },
        }
        if (storageKey) {
          try { localStorage.setItem(storageKey, JSON.stringify(merged)) } catch { /* quota */ }
        }
        return merged
      })
    }).catch(console.error)
  }, [clerkUser?.id])

  function recordResult(result: GameResult) {
    const earned = calcCoins(result)
    const newData: StoredData = {
      ...storedData,
      coins: storedData.coins + earned,
      stats: {
        played: storedData.stats.played + 1,
        wins: storedData.stats.wins + (result.won ? 1 : 0),
        streak: result.won ? storedData.stats.streak + 1 : 0,
        perfect: storedData.stats.perfect + (result.won && result.strikes === 0 ? 1 : 0),
      },
    }
    saveData(newData)
    if (guestMode && !guestGamePlayed) setGuestGamePlayed(true)

    // Persist to D1 for signed-in users
    if (clerkUser) {
      apiRecordResult({
        userId: clerkUser.id,
        puzzleId: 1, // TODO: use actual puzzle id once SortGame loads from API
        mode: 'freeplay',
        won: result.won,
        strikes: result.strikes,
        durationSeconds: result.durationSeconds,
        coinsEarned: earned,
      }).catch(console.error)
    }
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
      value={{ user, isLoaded, isSignedIn, guestMode, guestGamePlayed, setGuestMode, recordResult, signOut }}
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
