import { useState, useRef, useEffect } from 'react'
import { useApp } from '../state/AppContext'
import type { GameResult } from '../state/AppContext'
import { getDailyPuzzle, getFreePuzzle } from '../api/client'
import { calcCoins } from '../state/AppContext'

interface PuzzleGroup {
  label: string
  items: string[]
}

interface Props {
  onBack: () => void
  onSignUp?: () => void
  mode?: 'daily' | 'freeplay'
}

interface Card {
  id: string       // unique — groupIndex + itemIndex
  text: string
  groupIndex: number
  label: string
  flipped: boolean
  matched: boolean
}

const FLIP_BACK_DELAY = 900   // ms before unmatched pair flips back
const MATCH_STAGGER   = 120   // ms delay between match reveals

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** Pick 2 items each from 2 randomly-selected groups to make an 8-card board */
function buildBoard(groups: PuzzleGroup[]): Card[] {
  const picked = shuffle([...groups]).slice(0, 2)
  const cards: Card[] = []
  picked.forEach((group, gi) => {
    const two = shuffle([...group.items]).slice(0, 2)
    two.forEach((item, ii) => {
      // Two cards per item (the pair)
      for (let copy = 0; copy < 2; copy++) {
        cards.push({
          id: `${gi}-${ii}-${copy}`,
          text: item,
          groupIndex: gi,
          label: group.label,
          flipped: false,
          matched: false,
        })
      }
    })
  })
  return shuffle(cards)
}

export default function PairsGame({ onBack, onSignUp, mode = 'freeplay' }: Props) {
  const { recordResult, user, userId, guestMode } = useApp()

  const [cards, setCards] = useState<Card[]>([])
  const [puzzleId, setPuzzleId] = useState(0)
  const [loading, setLoading] = useState(true)
  const [flippedIds, setFlippedIds] = useState<string[]>([])
  const [locked, setLocked] = useState(false)   // true while evaluating a pair
  const [mistakes, setMistakes] = useState(0)
  const [matchCount, setMatchCount] = useState(0)
  const [finished, setFinished] = useState(false)
  const [isMonthlySpecial, setIsMonthlySpecial] = useState(false)
  const gameStart = useRef(Date.now())

  useEffect(() => {
    const fetch = mode === 'daily' ? getDailyPuzzle() : getFreePuzzle(userId)
    fetch
      .then((res: { puzzle: { id: number; groups: PuzzleGroup[]; isMonthlySpecial?: boolean } }) => {
        setCards(buildBoard(res.puzzle.groups))
        setPuzzleId(res.puzzle.id)
        if (res.puzzle.isMonthlySpecial) setIsMonthlySpecial(true)
      })
      .catch(() => {
        const fallback: PuzzleGroup[] = [
          { label: 'Animals in a zoo',   items: ['LION', 'TIGER', 'GIRAFFE', 'PENGUIN'] },
          { label: 'Types of pasta',     items: ['PENNE', 'RIGATONI', 'FUSILLI', 'LINGUINE'] },
          { label: 'Card games',         items: ['POKER', 'RUMMY', 'SNAP', 'SOLITAIRE'] },
          { label: 'Weather events',     items: ['HAIL', 'SLEET', 'DRIZZLE', 'THUNDER'] },
        ]
        setCards(buildBoard(fallback))
        setPuzzleId(0)
      })
      .finally(() => {
        setLoading(false)
        gameStart.current = Date.now()
      })
  }, [mode])

  const totalPairs = cards.length / 2   // 4

  function handleFlip(card: Card) {
    if (locked) return
    if (card.flipped || card.matched) return
    if (flippedIds.includes(card.id)) return

    const newFlipped = [...flippedIds, card.id]
    setCards(prev => prev.map(c => c.id === card.id ? { ...c, flipped: true } : c))
    setFlippedIds(newFlipped)

    if (newFlipped.length < 2) return

    // Evaluate the pair
    setLocked(true)
    const [idA, idB] = newFlipped
    const cardA = cards.find(c => c.id === idA)!
    const cardB = cards.find(c => c.id === idB)!
    // Make sure the updated flip state is reflected
    const isMatch = cardA.text === cardB.text

    if (isMatch) {
      setTimeout(() => {
        setCards(prev => prev.map(c =>
          c.id === idA || c.id === idB ? { ...c, matched: true, flipped: true } : c
        ))
        const newMatchCount = matchCount + 1
        setMatchCount(newMatchCount)
        setFlippedIds([])
        setLocked(false)
        if (newMatchCount >= totalPairs) {
          const duration = Math.round((Date.now() - gameStart.current) / 1000)
          const result: GameResult = {
            won: true,
            strikes: mistakes,
            durationSeconds: duration,
            streak: user.stats.streak,
            puzzleId,
            mode: mode === 'daily' ? 'daily' : 'freeplay',
            gameType: 'pairs' as const,
            isMonthlySpecial,
          }
          recordResult(result)
          setFinished(true)
        }
      }, MATCH_STAGGER)
    } else {
      setTimeout(() => {
        setCards(prev => prev.map(c =>
          c.id === idA || c.id === idB ? { ...c, flipped: false } : c
        ))
        setMistakes(prev => prev + 1)
        setFlippedIds([])
        setLocked(false)
      }, FLIP_BACK_DELAY)
    }
  }

  // ── Loading ────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-[#085041] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-[#5DCAA5] border-t-transparent animate-spin" />
      </div>
    )
  }

  // ── Result screen ──────────────────────────────────────────
  if (finished) {
    const duration = Math.round((Date.now() - gameStart.current) / 1000)
    const result: GameResult = {
      won: true,
      strikes: mistakes,
      durationSeconds: duration,
      streak: user.stats.streak,
      puzzleId,
      mode: mode === 'daily' ? 'daily' : 'freeplay',
      gameType: 'pairs' as const,
      isMonthlySpecial,
    }
    const coinsEarned = calcCoins(result)
    const perfectBonus = mistakes === 0

    return (
      <div className="min-h-screen bg-[#E1F5EE] flex flex-col">
        <div className="bg-[#085041] px-5 pt-5 pb-8">
          <button onClick={onBack} className="text-[#5DCAA5] text-sm font-bold mb-4">Back</button>
          <p className="text-[#5DCAA5] text-[11px] font-black uppercase tracking-[0.15em]">
            {mode === 'daily' ? 'Daily Pairs' : 'Pairs'}
          </p>
          <h1 className="text-[#E1F5EE] text-2xl font-black tracking-tight mt-1">
            {mistakes === 0 ? 'Flawless.' : mistakes <= 3 ? 'Nice memory.' : 'Board cleared.'}
          </h1>
        </div>

        <div className="flex-1 px-4 pt-5 flex flex-col gap-3 pb-10">
          {/* Stats row */}
          <div className="rounded-2xl bg-[#5DCAA5] overflow-hidden flex shadow-sm">
            <div className="w-1.5 bg-[#9D5FD0] shrink-0" />
            <div className="flex-1 px-4 py-4 flex justify-between">
              <div className="text-center">
                <p className="text-[#085041] font-black text-2xl">{totalPairs}</p>
                <p className="text-[#0F6E56] text-xs font-semibold">pairs found</p>
              </div>
              <div className="text-center">
                <p className="text-[#085041] font-black text-2xl">{mistakes}</p>
                <p className="text-[#0F6E56] text-xs font-semibold">misses</p>
              </div>
              <div className="text-center">
                <p className="text-[#085041] font-black text-2xl">{duration}s</p>
                <p className="text-[#0F6E56] text-xs font-semibold">time</p>
              </div>
            </div>
          </div>

          {/* Monthly special */}
          {isMonthlySpecial && (
            <div className="rounded-2xl bg-[#085041] overflow-hidden flex shadow-sm">
              <div className="w-1.5 bg-[#EF9F27] shrink-0" />
              <div className="flex-1 px-4 py-4 flex items-center justify-between">
                <div>
                  <p className="text-[#EF9F27] font-black text-sm">Monthly Special</p>
                  <p className="text-[#5DCAA5] text-xs mt-0.5">Medallion earned</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-[#EF9F27] flex items-center justify-center">
                  <span className="text-[#085041] font-black text-base">
                    {new Date().toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Coin breakdown */}
          <div className="rounded-2xl bg-[#5DCAA5] overflow-hidden flex shadow-sm">
            <div className="w-1.5 bg-[#EF9F27] shrink-0" />
            <div className="flex-1 px-4 py-4 flex flex-col gap-2">
              <p className="text-[#085041] text-[10px] font-black uppercase tracking-[0.14em] mb-1">Coins Earned</p>
              <div className="flex justify-between text-sm">
                <span className="text-[#0F6E56] font-semibold">{isMonthlySpecial ? 'Monthly special (3x)' : 'Base reward'}</span>
                <span className="text-[#085041] font-black">+{isMonthlySpecial ? 300 : 100}</span>
              </div>
              {mistakes > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-[#0F6E56] font-semibold">{mistakes} {mistakes === 1 ? 'miss' : 'misses'}</span>
                  <span className="text-[#E24B4A] font-black">-{mistakes * 20}</span>
                </div>
              )}
              {perfectBonus && (
                <div className="flex justify-between text-sm">
                  <span className="text-[#0F6E56] font-semibold">Perfect bonus</span>
                  <span className="text-[#085041] font-black">+50</span>
                </div>
              )}
              {result.streak > 1 && (
                <div className="flex justify-between text-sm">
                  <span className="text-[#0F6E56] font-semibold">{result.streak}-day streak</span>
                  <span className="text-[#085041] font-black">
                    +{coinsEarned - (isMonthlySpecial ? 300 : 100) + mistakes * 20 - (perfectBonus ? 50 : 0)}
                  </span>
                </div>
              )}
              <div className="border-t border-[#9FE1CB] mt-1 pt-2 flex justify-between items-center">
                <span className="text-[#085041] font-black text-base">Total</span>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-[#EF9F27]" />
                  <span className="text-[#EF9F27] font-black text-xl">{coinsEarned}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3 mt-auto pt-2">
            {mode === 'freeplay' && (
              <button
                onClick={() => {
                  setLoading(true)
                  setFinished(false)
                  setFlippedIds([])
                  setLocked(false)
                  setMistakes(0)
                  setMatchCount(0)
                  setIsMonthlySpecial(false)
                  getFreePuzzle(userId)
                    .then((res: { puzzle: { id: number; groups: PuzzleGroup[] } }) => {
                      setCards(buildBoard(res.puzzle.groups))
                      setPuzzleId(res.puzzle.id)
                    })
                    .catch(() => {
                      const fallback: PuzzleGroup[] = [
                        { label: 'Animals in a zoo',   items: ['LION', 'TIGER', 'GIRAFFE', 'PENGUIN'] },
                        { label: 'Types of pasta',     items: ['PENNE', 'RIGATONI', 'FUSILLI', 'LINGUINE'] },
                        { label: 'Card games',         items: ['POKER', 'RUMMY', 'SNAP', 'SOLITAIRE'] },
                        { label: 'Weather events',     items: ['HAIL', 'SLEET', 'DRIZZLE', 'THUNDER'] },
                      ]
                      setCards(buildBoard(fallback))
                      setPuzzleId(0)
                    })
                    .finally(() => {
                      setLoading(false)
                      gameStart.current = Date.now()
                    })
                }}
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

          {/* Guest nudge */}
          {guestMode && (
            <div className="rounded-2xl bg-[#5DCAA5] overflow-hidden flex shadow-sm">
              <div className="w-1.5 bg-[#EF9F27] shrink-0" />
              <div className="flex-1 px-4 py-4 text-center">
                <p className="text-[#085041] font-black text-sm">Want to keep your progress?</p>
                <p className="text-[#0F6E56] text-xs mt-0.5">Create a free account to save your stats, coins, and streak.</p>
                <button
                  onClick={onSignUp}
                  className="mt-3 bg-[#185FA5] text-[#E1F5EE] text-sm font-bold px-5 py-2 rounded-xl"
                >
                  Create account
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  // ── Active game ────────────────────────────────────────────
  const groupLabels = [...new Set(cards.map(c => c.label))]

  return (
    <div className="min-h-screen bg-[#E1F5EE] flex flex-col">
      {/* Header */}
      <div className="bg-[#085041] px-5 pt-5 pb-8">
        <button onClick={onBack} className="text-[#5DCAA5] text-sm font-bold mb-4">Back</button>
        <p className="text-[#5DCAA5] text-[11px] font-black uppercase tracking-[0.15em]">
          {mode === 'daily' ? 'Daily Pairs' : 'Pairs'}
        </p>
        <p className="text-[#E1F5EE] text-base font-semibold mt-1 leading-snug">
          Match items from the same category
        </p>
        {/* Group labels hint */}
        <div className="flex gap-2 mt-3 flex-wrap">
          {groupLabels.map(label => (
            <span key={label} className="bg-[#0F6E56] text-[#5DCAA5] text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wide">
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* Stats bar */}
      <div className="bg-[#0F6E56] px-5 py-2 flex justify-between text-sm">
        <span className="text-[#5DCAA5] font-semibold">{matchCount} / {totalPairs} matched</span>
        <span className="text-[#5DCAA5] font-semibold">{mistakes} {mistakes === 1 ? 'miss' : 'misses'}</span>
      </div>

      {/* Card grid */}
      <div className="flex-1 px-4 pt-6 grid grid-cols-2 gap-3 content-start">
        {cards.map(card => {
          const isFlipped = card.flipped || card.matched
          return (
            <button
              key={card.id}
              onClick={() => handleFlip(card)}
              disabled={card.matched || locked}
              className={`
                rounded-2xl min-h-[90px] flex items-center justify-center px-3 py-4 font-black text-base text-center shadow-sm transition-colors duration-200
                ${card.matched
                  ? 'bg-[#5DCAA5] text-[#085041]'
                  : isFlipped
                    ? 'bg-[#9D5FD0] text-[#E1F5EE]'
                    : 'bg-[#B5D4F4] text-[#085041]'
                }
              `}
            >
              {isFlipped ? card.text : '?'}
            </button>
          )
        })}
      </div>
    </div>
  )
}
