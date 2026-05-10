import { createContext, useContext, useState, ReactNode } from 'react'

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

interface AppState {
  user: AppUser
  recordResult: (result: GameResult) => void
}

export interface GameResult {
  won: boolean
  strikes: number
  durationSeconds: number
}

const DEFAULT_USER: AppUser = {
  initials: 'CJ',
  username: 'ChrisJ',
  avatarColor: '#5DCAA5',
  memberSince: 'May 2026',
  friendCode: 'TRVL-CJ5XBF7',
  coins: 0,
  stats: { played: 0, wins: 0, streak: 0, perfect: 0 },
}

const MAX_STRIKES = 3
const BASE_COINS = 100
const STRIKE_PENALTY = 20
const PERFECT_BONUS = 50

export function calcCoins(result: GameResult): number {
  if (!result.won) return 0
  let coins = BASE_COINS
  coins -= result.strikes * STRIKE_PENALTY
  if (result.strikes === 0) coins += PERFECT_BONUS
  // Speed bonus: up to 30 coins for solving in under 60s
  if (result.durationSeconds < 60) {
    coins += Math.round((1 - result.durationSeconds / 60) * 30)
  }
  return Math.max(coins, 0)
}

const AppContext = createContext<AppState | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser>(DEFAULT_USER)

  function recordResult(result: GameResult) {
    const earned = calcCoins(result)
    setUser(prev => ({
      ...prev,
      coins: prev.coins + earned,
      stats: {
        played: prev.stats.played + 1,
        wins: prev.stats.wins + (result.won ? 1 : 0),
        streak: result.won ? prev.stats.streak + 1 : 0,
        perfect: prev.stats.perfect + (result.won && result.strikes === 0 ? 1 : 0),
      },
    }))
  }

  return <AppContext.Provider value={{ user, recordResult }}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside AppProvider')
  return ctx
}
