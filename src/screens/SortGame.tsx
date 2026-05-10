import { useState, useRef, useEffect } from 'react'
import { useApp } from '../state/AppContext'
import type { GameResult } from '../state/AppContext'

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

const PUZZLE: Group[] = [
  { label: 'Animals in a zoo', color: '#9FE1CB', tiles: ['LION', 'TIGER', 'GIRAFFE', 'PENGUIN'] },
  { label: 'Types of pasta', color: '#5DCAA5', tiles: ['PENNE', 'RIGATONI', 'FUSILLI', 'LINGUINE'] },
  { label: 'Card games', color: '#185FA5', tiles: ['POKER', 'RUMMY', 'SNAP', 'SOLITAIRE'] },
  { label: 'Weather events', color: '#EF9F27', tiles: ['HAIL', 'SLEET', 'DRIZZLE', 'THUNDER'] },
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
}

export default function SortGame({ onBack }: Props) {
  const { recordResult } = useApp()
  const [tiles, setTiles] = useState<Tile[]>(() => buildTiles(PUZZLE))
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [solvedGroups, setSolvedGroups] = useState<Group[]>([])
  const [strikes, setStrikes] = useState(0)
  const [shaking, setShaking] = useState(false)
  const [result, setResult] = useState<GameResult | null>(null)
  const startTime = useRef(Date.now())

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
    setResult({ won, strikes: finalStrikes, durationSeconds: duration })
  }

  function handleSubmit() {
    if (selected.size !== 4 || shaking) return

    const selectedTiles = tiles.filter(t => selected.has(t.id))
    const groupLabel = selectedTiles[0].group
    const isCorrect = selectedTiles.every(t => t.group === groupLabel)

    if (isCorrect) {
      const solvedGroup = PUZZLE.find(g => g.label === groupLabel)!
      const newSolved = [...solvedGroups, solvedGroup]
      setSolvedGroups(newSolved)
      setTiles(prev => prev.filter(t => !selected.has(t.id)))
      setSelected(new Set())
      if (newSolved.length === PUZZLE.length) endGame(true, strikes)
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

        {/* Strikes */}
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

        {/* Tile grid or result screen */}
        {result ? (
          <div className="flex-1 flex flex-col gap-4">
            <div className="rounded-3xl bg-[#5DCAA5] overflow-hidden flex shadow-xl">
              <div className={`w-1.5 shrink-0 ${result.won ? 'bg-[#085041]' : 'bg-[#E24B4A]'}`} />
              <div className="flex-1 px-5 py-6">
                <p className="text-[#085041] text-[11px] font-black uppercase tracking-[0.15em] mb-1">
                  {result.won ? 'Sorted!' : 'Nice try'}
                </p>
                <h2 className="text-[#085041] text-3xl font-black leading-tight tracking-tight">
                  {result.won ? 'You found all 4 groups.' : 'You used all your strikes.'}
                </h2>
              </div>
            </div>

            {/* Coin breakdown */}
            {result.won && (() => {
              const base = 100
              const penalty = result.strikes * 20
              const perfectBonus = result.strikes === 0 ? 50 : 0
              const speedBonus = result.durationSeconds < 60
                ? Math.round((1 - result.durationSeconds / 60) * 30)
                : 0
              const total = base - penalty + perfectBonus + speedBonus
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

            <button
              onClick={onBack}
              className="w-full bg-[#185FA5] text-[#E1F5EE] font-bold rounded-2xl py-4 text-base shadow-lg mt-auto"
            >
              Back to home
            </button>
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
