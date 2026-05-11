import { useState, useRef, useEffect } from 'react'
import { useApp } from '../state/AppContext'
import type { GameResult } from '../state/AppContext'
import { getDailyPuzzle, getFreePuzzle } from '../api/client'
import { cachePuzzle, popCachedPuzzle } from '../api/puzzleCache'

interface Tile {
  id: number
  word: string
  group: string
}

interface Group {
  label: string
  color: string
  tiles: string[]
}

const GROUP_COLORS = ['#9FE1CB', '#5DCAA5', '#185FA5', '#EF9F27']

// Fallback puzzle used only when API is unavailable
const FALLBACK_PUZZLE: Group[] = [
  { label: 'Animals in a zoo', color: '#9FE1CB', tiles: ['LION', 'TIGER', 'GIRAFFE', 'PENGUIN'] },
  { label: 'Types of pasta',   color: '#5DCAA5', tiles: ['PENNE', 'RIGATONI', 'FUSILLI', 'LINGUINE'] },
  { label: 'Card games',       color: '#185FA5', tiles: ['POKER', 'RUMMY', 'SNAP', 'SOLITAIRE'] },
  { label: 'Weather events',   color: '#EF9F27', tiles: ['HAIL', 'SLEET', 'DRIZZLE', 'THUNDER'] },
]

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function buildTiles(puzzle: Group[]): Tile[] {
  let id = 0
  return shuffle(
    puzzle.flatMap(group =>
      group.tiles.map(word => ({ id: id++, word, group: group.label }))
    )
  )
}

const MAX_STRIKES = 3

interface Props {
  onBack: () => void
  onSignUp?: () => void
  mode?: 'daily' | 'freeplay'
}

export default function SortGame({ onBack, onSignUp, mode = 'freeplay' }: Props) {
  const { recordResult, user, userId, guestMode } = useApp()
  const [puzzle, setPuzzle] = useState<Group[] | null>(null)
  const [puzzleId, setPuzzleId] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [tiles, setTiles] = useState<Tile[]>([])
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [solvedGroups, setSolvedGroups] = useState<Group[]>([])
  const [strikes, setStrikes] = useState(0)
  const [shaking, setShaking] = useState(false)
  const [result, setResult] = useState<GameResult | null>(null)
  const [guestSeenIds, setGuestSeenIds] = useState<number[]>([])
  const startTime = useRef(Date.now())

  // Fetch puzzle from API on mount
  useEffect(() => {
    const fetch = mode === 'daily' ? getDailyPuzzle() : getFreePuzzle(userId)
    fetch
      .then((res: { puzzle: { id: number; groups: { label: string; items: string[] }[] } }) => {
        const groups: Group[] = res.puzzle.groups.map((g, i) => ({
          label: g.label,
          color: GROUP_COLORS[i],
          tiles: g.items,
        }))
        setPuzzleId(res.puzzle.id)
        setPuzzle(groups)
        setTiles(buildTiles(groups))
        if (!userId && mode === 'freeplay') setGuestSeenIds(prev => [...prev, res.puzzle.id])
        // Cache free-play puzzles for offline use
        if (mode === 'freeplay') cachePuzzle({ id: res.puzzle.id, groups: res.puzzle.groups })
      })
      .catch(() => {
        // API unavailable — serve from local cache, fall back to hardcoded if empty
        const cached = popCachedPuzzle()
        if (cached) {
          const groups: Group[] = cached.groups.map((g, i) => ({
            label: g.label,
            color: GROUP_COLORS[i],
            tiles: g.items,
          }))
          setPuzzleId(cached.id)
          setPuzzle(groups)
          setTiles(buildTiles(groups))
        } else {
          setPuzzle(FALLBACK_PUZZLE)
          setTiles(buildTiles(FALLBACK_PUZZLE))
        }
      })
      .finally(() => setLoading(false))
  }, [mode])

  // When game ends, record into global state
  useEffect(() => {
    if (result) recordResult(result)
  }, [result])

  function toggleTile(id: number) {
    if (result || shaking) return
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else if (next.size < 4) {
        next.add(id)
      }
      return next
    })
  }

  function endGame(won: boolean, finalStrikes: number) {
    const duration = Math.round((Date.now() - startTime.current) / 1000)
    setResult({ won, strikes: finalStrikes, durationSeconds: duration, streak: user.stats.streak, puzzleId, mode })
  }

  function handleSubmit() {
    if (selected.size !== 4 || shaking) return

    const selectedTiles = tiles.filter(t => selected.has(t.id))
    const groupLabel = selectedTiles[0].group
    const isCorrect = selectedTiles.every(t => t.group === groupLabel)

    if (isCorrect) {
      const solvedGroup = puzzle!.find(g => g.label === groupLabel)!
      const newSolved = [...solvedGroups, solvedGroup]
      setSolvedGroups(newSolved)
      setTiles(prev => prev.filter(t => !selected.has(t.id)))
      setSelected(new Set())
      if (newSolved.length === puzzle!.length) endGame(true, strikes)
    } else {
      const newStrikes = strikes + 1
      setShaking(true)
      setTimeout(() => {
        setShaking(false)
        setSelected(new Set())
        setStrikes(newStrikes)
        if (newStrikes >= MAX_STRIKES) endGame(false, newStrikes)
      }, 500)
    }
  }

  function handleShuffle() {
    setTiles(prev => shuffle(prev))
  }

  function handlePlayAgain() {
    setResult(null)
    setStrikes(0)
    setSolvedGroups([])
    setSelected(new Set())
    setLoading(true)
    startTime.current = Date.now()
    getFreePuzzle(userId, userId ? [] : guestSeenIds)
      .then((res: { puzzle: { id: number; groups: { label: string; items: string[] }[] } }) => {
        const groups: Group[] = res.puzzle.groups.map((g, i) => ({
          label: g.label,
          color: GROUP_COLORS[i],
          tiles: g.items,
        }))
        setPuzzleId(res.puzzle.id)
        setPuzzle(groups)
        setTiles(buildTiles(groups))
        if (!userId) setGuestSeenIds(prev => [...prev, res.puzzle.id])
        cachePuzzle({ id: res.puzzle.id, groups: res.puzzle.groups })
      })
      .catch(() => {
        const cached = popCachedPuzzle(userId ? [] : guestSeenIds)
        if (cached) {
          const groups: Group[] = cached.groups.map((g, i) => ({
            label: g.label,
            color: GROUP_COLORS[i],
            tiles: g.items,
          }))
          setPuzzleId(cached.id)
          setPuzzle(groups)
          setTiles(buildTiles(groups))
        } else {
          setPuzzle(FALLBACK_PUZZLE)
          setTiles(buildTiles(FALLBACK_PUZZLE))
        }
      })
      .finally(() => setLoading(false))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#E1F5EE] flex flex-col">
        <div className="bg-[#085041] px-5 py-5 flex items-center gap-4">
          <button onClick={onBack} className="text-[#5DCAA5] -ml-1 p-1">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
          </button>
          <h1 className="text-[#E1F5EE] text-lg font-black tracking-tight">Sort</h1>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 rounded-full border-4 border-[#9FE1CB] border-t-[#085041] animate-spin" />
            <p className="text-[#085041] font-bold text-sm">Loading puzzle...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#E1F5EE] flex flex-col">

      {/* Top bar */}
      <div className="bg-[#085041] px-5 py-5 flex items-center gap-4">
        <button onClick={onBack} className="text-[#5DCAA5] -ml-1 p-1">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
        </button>
        <h1 className="text-[#E1F5EE] text-lg font-black tracking-tight">Sort</h1>
        {mode === 'daily' && (
          <span className="ml-auto text-[#9FE1CB] text-xs font-black uppercase tracking-widest">Daily</span>
        )}
      </div>

      <div className="flex-1 flex flex-col px-4 pt-5 pb-6 gap-4">

        {/* Solved groups — stack at top as found */}
        {solvedGroups.map(group => (
          <div key={group.label} className="rounded-2xl overflow-hidden flex shadow-sm">
            <div className="w-1.5 bg-[#085041] shrink-0" />
            <div className="flex-1 px-4 py-3" style={{ backgroundColor: group.color }}>
              <p className="text-[#085041] text-[10px] font-black uppercase tracking-[0.14em]">{group.label}</p>
              <p className="text-[#085041] text-sm font-bold mt-0.5">{group.tiles.join(' · ')}</p>
            </div>
          </div>
        ))}

        {/* Strikes — hidden once game ends */}
        {!result && (
          <div className="flex items-center gap-2.5">
            <span className="text-[#085041] text-xs font-black uppercase tracking-widest">Strikes</span>
            <div className="flex gap-2">
              {Array.from({ length: MAX_STRIKES }).map((_, i) => (
                <div
                  key={i}
                  className={`w-4 h-4 rounded-full transition-all duration-300 ${
                    i < strikes ? 'bg-[#E24B4A] scale-110' : 'bg-[#9FE1CB]'
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Tile grid or result screen */}
        {result ? (
          <div className="flex-1 flex flex-col gap-3">

            {/* Reveal unsolved groups on loss */}
            {!result.won && puzzle!.filter(g => !solvedGroups.some(sg => sg.label === g.label)).map(group => (
              <div key={group.label} className="rounded-2xl overflow-hidden flex shadow-sm opacity-70">
                <div className="w-1.5 bg-[#E24B4A] shrink-0" />
                <div className="flex-1 px-4 py-3" style={{ backgroundColor: group.color }}>
                  <p className="text-[#085041] text-[10px] font-black uppercase tracking-[0.14em]">{group.label}</p>
                  <p className="text-[#085041] text-sm font-bold mt-0.5">{group.tiles.join(' · ')}</p>
                </div>
              </div>
            ))}

            {/* Result header */}
            <div className="rounded-3xl bg-[#5DCAA5] overflow-hidden flex shadow-xl">
              <div className={`w-1.5 shrink-0 ${result.won ? 'bg-[#085041]' : 'bg-[#E24B4A]'}`} />
              <div className="flex-1 px-5 py-5 flex flex-col gap-1">
                <p className="text-[#085041] text-[11px] font-black uppercase tracking-[0.15em]">
                  {result.won ? (mode === 'daily' ? 'Daily Sort' : 'Sort') : 'Game over'}
                </p>
                <h2 className="text-[#085041] text-2xl font-black leading-tight tracking-tight">
                  {result.won ? 'All 4 groups found.' : 'You used all your strikes.'}
                </h2>
                <div className="flex items-center gap-2 mt-2">
                  {Array.from({ length: MAX_STRIKES }).map((_, i) => (
                    <div key={i} className={`w-3 h-3 rounded-full ${i < result.strikes ? 'bg-[#E24B4A]' : 'bg-[#9FE1CB]'}`} />
                  ))}
                  <span className="text-[#0F6E56] text-xs font-bold ml-1">
                    {result.strikes === 0 ? 'No strikes' : `${result.strikes} strike${result.strikes !== 1 ? 's' : ''}`}
                  </span>
                  {result.won && (
                    <span className="ml-auto text-[#0F6E56] text-xs font-bold">
                      {Math.floor(result.durationSeconds / 60)}:{String(result.durationSeconds % 60).padStart(2, '0')}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Streak */}
            {result.won && user.stats.streak > 0 && (
              <div className="rounded-2xl bg-[#5DCAA5] overflow-hidden flex shadow-sm">
                <div className="w-1.5 bg-[#085041] shrink-0" />
                <div className="flex-1 px-4 py-4 flex items-center justify-between">
                  <span className="text-[#085041] font-black text-sm">Current streak</span>
                  <span className="text-[#085041] font-black text-2xl">{user.stats.streak}</span>
                </div>
              </div>
            )}

            {/* Coin breakdown */}
            {result.won && (() => {
              const base = 100
              const penalty = result.strikes * 20
              const perfectBonus = result.strikes === 0 ? 50 : 0
              const speedBonus = result.durationSeconds < 60
                ? Math.round((1 - result.durationSeconds / 60) * 30)
                : 0
              const subtotal = base - penalty + perfectBonus + speedBonus
              const streakMultiplier = result.streak > 1 ? Math.min((result.streak - 1) * 0.05, 0.5) : 0
              const streakBonus = streakMultiplier > 0 ? Math.round(subtotal * streakMultiplier) : 0
              const total = subtotal + streakBonus
              return (
                <div className="rounded-2xl bg-[#5DCAA5] overflow-hidden flex shadow-sm">
                  <div className="w-1.5 bg-[#EF9F27] shrink-0" />
                  <div className="flex-1 px-4 py-4 flex flex-col gap-2">
                    <p className="text-[#085041] text-[10px] font-black uppercase tracking-[0.14em] mb-1">Coins Earned</p>
                    <div className="flex justify-between text-sm">
                      <span className="text-[#0F6E56] font-semibold">Base reward</span>
                      <span className="text-[#085041] font-black">+{base}</span>
                    </div>
                    {penalty > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-[#0F6E56] font-semibold">{result.strikes} strike{result.strikes !== 1 ? 's' : ''}</span>
                        <span className="text-[#E24B4A] font-black">-{penalty}</span>
                      </div>
                    )}
                    {perfectBonus > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-[#0F6E56] font-semibold">Perfect bonus</span>
                        <span className="text-[#085041] font-black">+{perfectBonus}</span>
                      </div>
                    )}
                    {speedBonus > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-[#0F6E56] font-semibold">Speed bonus</span>
                        <span className="text-[#085041] font-black">+{speedBonus}</span>
                      </div>
                    )}
                    {streakBonus > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-[#0F6E56] font-semibold">{result.streak}-day streak</span>
                        <span className="text-[#085041] font-black">+{streakBonus}</span>
                      </div>
                    )}
                    <div className="border-t border-[#9FE1CB] mt-1 pt-2 flex justify-between items-center">
                      <span className="text-[#085041] font-black text-base">Total</span>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-[#EF9F27]" />
                        <span className="text-[#EF9F27] font-black text-xl">{total}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })()}

            {/* Actions */}
            <div className="flex flex-col gap-3 mt-auto pt-2">
              {mode === 'freeplay' && (
                <button
                  onClick={handlePlayAgain}
                  className="w-full bg-[#185FA5] text-[#E1F5EE] font-bold rounded-2xl py-4 text-base shadow-lg"
                >
                  Play again
                </button>
              )}
              <button
                onClick={onBack}
                className={`w-full font-bold rounded-2xl py-4 text-base ${
                  mode === 'freeplay'
                    ? 'bg-[#9FE1CB] text-[#085041] shadow-sm'
                    : 'bg-[#185FA5] text-[#E1F5EE] shadow-lg'
                }`}
              >
                Back to home
              </button>
            </div>

            {/* Guest sign-up nudge */}
            {guestMode && (
              <div className="rounded-2xl bg-[#5DCAA5] overflow-hidden flex shadow-sm">
                <div className="w-1.5 bg-[#185FA5] shrink-0" />
                <div className="flex-1 px-4 py-4 flex flex-col gap-3">
                  <div>
                    <p className="text-[#085041] font-black text-sm">Save your progress</p>
                    <p className="text-[#0F6E56] text-xs mt-0.5">Create a free account to keep your stats, coins, and streak.</p>
                  </div>
                  <button
                    onClick={onSignUp}
                    className="w-full bg-[#185FA5] text-[#E1F5EE] font-bold rounded-xl py-3 text-sm shadow-sm"
                  >
                    Create account
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div
            className={`grid grid-cols-4 gap-2.5 transition-transform ${shaking ? 'animate-shake' : ''}`}
          >
            {tiles.map(tile => {
              const isSelected = selected.has(tile.id)
              return (
                <button
                  key={tile.id}
                  onClick={() => toggleTile(tile.id)}
                  className={`aspect-square rounded-2xl flex items-center justify-center text-center text-[11px] font-black leading-tight px-1 transition-all duration-150 select-none shadow-sm ${
                    isSelected
                      ? 'bg-[#185FA5] text-[#E1F5EE] shadow-md scale-[0.96]'
                      : 'bg-[#B5D4F4] text-[#085041] active:scale-95'
                  }`}
                >
                  {tile.word}
                </button>
              )
            })}
          </div>
        )}

        {/* Shuffle + Submit */}
        {!result && (
          <div className="flex gap-3 mt-auto pt-2">
            <button
              onClick={handleShuffle}
              className="flex-1 bg-[#9FE1CB] text-[#085041] font-bold rounded-2xl py-4 text-sm shadow-sm"
            >
              Shuffle
            </button>
            <button
              onClick={handleSubmit}
              disabled={selected.size !== 4}
              className={`flex-1 rounded-2xl py-4 text-sm font-bold transition-all shadow-sm ${
                selected.size === 4
                  ? 'bg-[#185FA5] text-[#E1F5EE] shadow-md'
                  : 'bg-[#9FE1CB] text-[#0F6E56] opacity-40 cursor-not-allowed'
              }`}
            >
              Submit
            </button>
          </div>
        )}

      </div>
    </div>
  )
}
