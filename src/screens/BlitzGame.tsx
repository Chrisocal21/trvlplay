import { useState, useRef, useEffect, useCallback } from 'react'
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

interface BlitzItem {
  text: string
  correctSide: 'left' | 'right'
  leftLabel: string
  rightLabel: string
}

const GAME_DURATION = 30   // seconds
const FEEDBACK_DURATION = 450  // ms of green/red flash before next item

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** Build a flat shuffled list of items tagged with which side is correct */
function buildItems(groups: PuzzleGroup[]): BlitzItem[] {
  const picked = shuffle([...groups]).slice(0, 2)
  const [left, right] = picked
  const allItems: BlitzItem[] = []

  left.items.forEach(item => allItems.push({
    text: item,
    correctSide: 'left',
    leftLabel: left.label,
    rightLabel: right.label,
  }))
  right.items.forEach(item => allItems.push({
    text: item,
    correctSide: 'right',
    leftLabel: left.label,
    rightLabel: right.label,
  }))

  // Cycle the shuffled list to fill 20 items for the 30s run
  const base = shuffle(allItems)
  const result: BlitzItem[] = []
  while (result.length < 20) {
    result.push(...shuffle([...base]))
  }
  return result.slice(0, 20)
}

type Feedback = 'correct' | 'wrong' | null

export default function BlitzGame({ onBack, onSignUp, mode = 'freeplay' }: Props) {
  const { recordResult, user, userId, guestMode } = useApp()

  const [items, setItems] = useState<BlitzItem[]>([])
  const [puzzleId, setPuzzleId] = useState(0)
  const [loading, setLoading] = useState(true)
  const [started, setStarted] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [mistakes, setMistakes] = useState(0)
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION)
  const [feedback, setFeedback] = useState<Feedback>(null)
  const [finished, setFinished] = useState(false)
  const [isMonthlySpecial, setIsMonthlySpecial] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const gameStart = useRef(Date.now())

  useEffect(() => {
    const fetch = mode === 'daily' ? getDailyPuzzle() : getFreePuzzle(userId)
    fetch
      .then((res: { puzzle: { id: number; groups: PuzzleGroup[]; isMonthlySpecial?: boolean } }) => {
        setItems(buildItems(res.puzzle.groups))
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
        setItems(buildItems(fallback))
        setPuzzleId(0)
      })
      .finally(() => setLoading(false))
  }, [mode])

  const endGame = useCallback((finalScore: number, finalMistakes: number) => {
    if (timerRef.current) clearInterval(timerRef.current)
    const duration = Math.round((Date.now() - gameStart.current) / 1000)
    const won = finalScore >= 5  // at least 5 correct to "win"
    const result: GameResult = {
      won,
      strikes: finalMistakes,
      durationSeconds: duration,
      streak: user.stats.streak,
      puzzleId,
      mode: mode === 'daily' ? 'daily' : 'freeplay',
      gameType: 'blitz' as const,
      isMonthlySpecial,
    }
    recordResult(result)
    setFinished(true)
  }, [recordResult, user.stats.streak, puzzleId, mode, isMonthlySpecial])

  function startGame() {
    setStarted(true)
    gameStart.current = Date.now()
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // Will trigger endGame via the finished path
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  // Watch timeLeft — when it hits 0, end the game
  useEffect(() => {
    if (timeLeft === 0 && started && !finished) {
      endGame(score, mistakes)
    }
  }, [timeLeft, started, finished, score, mistakes, endGame])

  // Cleanup timer on unmount
  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [])

  function handleAnswer(side: 'left' | 'right') {
    if (feedback !== null) return
    const item = items[currentIndex]
    const isCorrect = side === item.correctSide

    setFeedback(isCorrect ? 'correct' : 'wrong')
    const newScore = isCorrect ? score + 1 : score
    const newMistakes = isCorrect ? mistakes : mistakes + 1

    setTimeout(() => {
      setFeedback(null)
      const next = currentIndex + 1
      if (next >= items.length) {
        endGame(newScore, newMistakes)
        return
      }
      setCurrentIndex(next)
      setScore(newScore)
      setMistakes(newMistakes)
    }, FEEDBACK_DURATION)
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
    const won = score >= 5
    const result: GameResult = {
      won,
      strikes: mistakes,
      durationSeconds: duration,
      streak: user.stats.streak,
      puzzleId,
      mode: mode === 'daily' ? 'daily' : 'freeplay',
      gameType: 'blitz' as const,
      isMonthlySpecial,
    }
    const coinsEarned = calcCoins(result)
    const perfectBonus = mistakes === 0 && won

    return (
      <div className="min-h-screen bg-[#E1F5EE] flex flex-col">
        <div className="bg-[#085041] px-5 pt-5 pb-8">
          <button onClick={onBack} className="text-[#5DCAA5] text-sm font-bold mb-4">Back</button>
          <p className="text-[#5DCAA5] text-[11px] font-black uppercase tracking-[0.15em]">
            {mode === 'daily' ? 'Daily Blitz' : 'Blitz'}
          </p>
          <h1 className="text-[#E1F5EE] text-2xl font-black tracking-tight mt-1">
            {score >= 15 ? 'Blazing fast.' : score >= 10 ? 'Solid run.' : score >= 5 ? 'Nice reflexes.' : 'Keep at it.'}
          </h1>
        </div>

        <div className="flex-1 px-4 pt-5 flex flex-col gap-3 pb-10">
          {/* Stats */}
          <div className="rounded-2xl bg-[#5DCAA5] overflow-hidden flex shadow-sm">
            <div className="w-1.5 bg-[#F5A623] shrink-0" />
            <div className="flex-1 px-4 py-4 flex justify-between">
              <div className="text-center">
                <p className="text-[#085041] font-black text-2xl">{score}</p>
                <p className="text-[#0F6E56] text-xs font-semibold">correct</p>
              </div>
              <div className="text-center">
                <p className="text-[#085041] font-black text-2xl">{mistakes}</p>
                <p className="text-[#0F6E56] text-xs font-semibold">wrong</p>
              </div>
              <div className="text-center">
                <p className="text-[#085041] font-black text-2xl">{score + mistakes}</p>
                <p className="text-[#0F6E56] text-xs font-semibold">total</p>
              </div>
            </div>
          </div>

          {/* Monthly special */}
          {won && isMonthlySpecial && (
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
          {won && (
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
                    <span className="text-[#0F6E56] font-semibold">{mistakes} wrong</span>
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
          )}

          {/* Not won message */}
          {!won && (
            <div className="rounded-2xl bg-[#5DCAA5] overflow-hidden flex shadow-sm">
              <div className="w-1.5 bg-[#E24B4A] shrink-0" />
              <div className="flex-1 px-4 py-3">
                <p className="text-[#085041] text-sm font-semibold">Get 5+ correct to earn coins. You got {score}.</p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-3 mt-auto pt-2">
            {mode === 'freeplay' && (
              <button
                onClick={() => {
                  setLoading(true)
                  setFinished(false)
                  setStarted(false)
                  setCurrentIndex(0)
                  setScore(0)
                  setMistakes(0)
                  setTimeLeft(GAME_DURATION)
                  setFeedback(null)
                  setIsMonthlySpecial(false)
                  getFreePuzzle(userId)
                    .then((res: { puzzle: { id: number; groups: PuzzleGroup[] } }) => {
                      setItems(buildItems(res.puzzle.groups))
                      setPuzzleId(res.puzzle.id)
                    })
                    .catch(() => {
                      const fallback: PuzzleGroup[] = [
                        { label: 'Animals in a zoo',   items: ['LION', 'TIGER', 'GIRAFFE', 'PENGUIN'] },
                        { label: 'Types of pasta',     items: ['PENNE', 'RIGATONI', 'FUSILLI', 'LINGUINE'] },
                        { label: 'Card games',         items: ['POKER', 'RUMMY', 'SNAP', 'SOLITAIRE'] },
                        { label: 'Weather events',     items: ['HAIL', 'SLEET', 'DRIZZLE', 'THUNDER'] },
                      ]
                      setItems(buildItems(fallback))
                      setPuzzleId(0)
                    })
                    .finally(() => setLoading(false))
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

  // ── Pre-game start screen ──────────────────────────────────
  if (!started) {
    const item = items[0]
    return (
      <div className="min-h-screen bg-[#085041] flex flex-col">
        <div className="px-5 pt-5 pb-8">
          <button onClick={onBack} className="text-[#5DCAA5] text-sm font-bold mb-4">Back</button>
          <p className="text-[#5DCAA5] text-[11px] font-black uppercase tracking-[0.15em]">
            {mode === 'daily' ? 'Daily Blitz' : 'Blitz'}
          </p>
          <h1 className="text-[#E1F5EE] text-2xl font-black tracking-tight mt-1">Sort as fast as you can</h1>
          <p className="text-[#5DCAA5] text-sm mt-2">{GAME_DURATION} seconds. Tap the correct side for each item.</p>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6">
          {/* Category labels preview */}
          <div className="w-full flex gap-3">
            <div className="flex-1 rounded-2xl bg-[#0F6E56] px-4 py-4 text-center">
              <p className="text-[#5DCAA5] font-black text-sm">{item.leftLabel}</p>
            </div>
            <div className="flex-1 rounded-2xl bg-[#0F6E56] px-4 py-4 text-center">
              <p className="text-[#5DCAA5] font-black text-sm">{item.rightLabel}</p>
            </div>
          </div>

          <button
            onClick={startGame}
            className="bg-[#EF9F27] text-[#085041] font-black text-xl rounded-2xl px-12 py-5 shadow-lg"
          >
            Start
          </button>
        </div>
      </div>
    )
  }

  // ── Active game ────────────────────────────────────────────
  const item = items[currentIndex]
  const progressPct = (timeLeft / GAME_DURATION) * 100

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-200 ${
        feedback === 'correct' ? 'bg-[#5DCAA5]' : feedback === 'wrong' ? 'bg-[#E24B4A]' : 'bg-[#085041]'
      }`}
    >
      {/* Timer bar */}
      <div className="h-2 bg-[#0F6E56]">
        <div
          className="h-full bg-[#EF9F27] transition-all duration-1000"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      <div className="px-5 pt-4 flex items-center justify-between">
        <button onClick={onBack} className="text-[#5DCAA5] text-sm font-bold">Back</button>
        <div className="flex items-center gap-3">
          <span className="text-[#5DCAA5] text-sm font-semibold">{score} right</span>
          <span className="text-[#EF9F27] font-black text-xl">{timeLeft}s</span>
        </div>
      </div>

      {/* Item card */}
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="bg-[#0F6E56] rounded-3xl px-8 py-10 w-full max-w-xs text-center shadow-lg">
          <p className="text-[#E1F5EE] font-black text-3xl">{item.text}</p>
        </div>
      </div>

      {/* Two tap targets */}
      <div className="flex gap-3 px-4 pb-12">
        <button
          onClick={() => handleAnswer('left')}
          className="flex-1 bg-[#185FA5] text-[#E1F5EE] font-black text-base rounded-2xl py-6 px-3 text-center shadow-md"
        >
          {item.leftLabel}
        </button>
        <button
          onClick={() => handleAnswer('right')}
          className="flex-1 bg-[#185FA5] text-[#E1F5EE] font-black text-base rounded-2xl py-6 px-3 text-center shadow-md"
        >
          {item.rightLabel}
        </button>
      </div>
    </div>
  )
}
