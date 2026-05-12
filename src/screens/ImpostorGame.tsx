import { useState, useRef, useEffect } from 'react'
import { useApp } from '../state/AppContext'
import type { GameResult } from '../state/AppContext'
import { getDailyPuzzle, getFreePuzzle } from '../api/client'
import { calcCoins } from '../state/AppContext'

interface PuzzleGroup {
  label: string
  items: string[]
}

interface Round {
  categoryLabel: string
  tiles: string[]
  impostorItem: string
}

interface Props {
  onBack: () => void
  onSignUp?: () => void
  mode?: 'daily' | 'freeplay'
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function generateRounds(groups: PuzzleGroup[]): Round[] {
  return shuffle(groups).map((hostGroup, hostIdx) => {
    // Pick impostor from a different group
    const otherGroups = groups.filter((_, i) => i !== groups.indexOf(hostGroup))
    const impostorGroup = otherGroups[hostIdx % otherGroups.length]
    const impostor = impostorGroup.items[Math.floor(Math.random() * impostorGroup.items.length)]

    // Take 3 items from host group (shuffled)
    const hostItems = shuffle([...hostGroup.items]).slice(0, 3)

    return {
      categoryLabel: hostGroup.label,
      tiles: shuffle([...hostItems, impostor]),
      impostorItem: impostor,
    }
  })
}

const FEEDBACK_DELAY = 900 // ms before advancing to next round

export default function ImpostorGame({ onBack, onSignUp, mode = 'freeplay' }: Props) {
  const { recordResult, user, userId, guestMode } = useApp()

  const [rounds, setRounds] = useState<Round[]>([])
  const [puzzleId, setPuzzleId] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [currentRound, setCurrentRound] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)   // tile tapped this round
  const [correct, setCorrect] = useState<boolean | null>(null)    // null = not answered yet
  const [score, setScore] = useState(0)                           // correct answers count
  const [roundTimes, setRoundTimes] = useState<number[]>([])      // seconds per correct round
  const [finished, setFinished] = useState(false)
  const [isMonthlySpecial, setIsMonthlySpecial] = useState(false)
  const roundStart = useRef(Date.now())
  const gameStart = useRef(Date.now())

  useEffect(() => {
    const fetch = mode === 'daily' ? getDailyPuzzle() : getFreePuzzle(userId)
    fetch
      .then((res: { puzzle: { id: number; groups: PuzzleGroup[]; isMonthlySpecial?: boolean } }) => {
        setRounds(generateRounds(res.puzzle.groups))
        setPuzzleId(res.puzzle.id)
        if (res.puzzle.isMonthlySpecial) setIsMonthlySpecial(true)
      })
      .catch(() => {
        // Fallback puzzle
        const fallback: PuzzleGroup[] = [
          { label: 'Animals in a zoo',   items: ['LION', 'TIGER', 'GIRAFFE', 'PENGUIN'] },
          { label: 'Types of pasta',     items: ['PENNE', 'RIGATONI', 'FUSILLI', 'LINGUINE'] },
          { label: 'Card games',         items: ['POKER', 'RUMMY', 'SNAP', 'SOLITAIRE'] },
          { label: 'Weather events',     items: ['HAIL', 'SLEET', 'DRIZZLE', 'THUNDER'] },
        ]
        setRounds(generateRounds(fallback))
        setPuzzleId(0)
      })
      .finally(() => {
        setLoading(false)
        roundStart.current = Date.now()
        gameStart.current = Date.now()
      })
  }, [mode])

  function handleTap(tile: string) {
    if (selected !== null) return  // already answered this round
    const round = rounds[currentRound]
    const isCorrect = tile === round.impostorItem
    setSelected(tile)
    setCorrect(isCorrect)

    const elapsed = Math.round((Date.now() - roundStart.current) / 1000)
    const newScore = isCorrect ? score + 1 : score
    const newTimes = isCorrect ? [...roundTimes, elapsed] : roundTimes

    setTimeout(() => {
      const nextRound = currentRound + 1
      if (nextRound >= rounds.length) {
        // Game over
        const totalDuration = Math.round((Date.now() - gameStart.current) / 1000)
        setScore(newScore)
        setRoundTimes(newTimes)
        setFinished(true)
        const result: GameResult = {
          won: newScore >= Math.ceil(rounds.length / 2),
          strikes: rounds.length - newScore,
          durationSeconds: totalDuration,
          streak: user.stats.streak,
          puzzleId,
          mode: mode === 'daily' ? 'daily' : 'freeplay',
          gameType: 'impostor',
          isMonthlySpecial,
        }
        recordResult(result)
      } else {
        setCurrentRound(nextRound)
        setSelected(null)
        setCorrect(null)
        setScore(newScore)
        setRoundTimes(newTimes)
        roundStart.current = Date.now()
      }
    }, FEEDBACK_DELAY)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#085041] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-[#5DCAA5] border-t-transparent animate-spin" />
      </div>
    )
  }

  const round = rounds[currentRound]
  const totalRounds = rounds.length

  // ── Result screen ──────────────────────────────────────────
  if (finished) {
    const won = score >= Math.ceil(totalRounds / 2)
    const totalDuration = Math.round((Date.now() - gameStart.current) / 1000)
    const avgTime = roundTimes.length > 0
      ? Math.round(roundTimes.reduce((a, b) => a + b, 0) / roundTimes.length)
      : totalDuration
    const result: GameResult = {
      won,
      strikes: totalRounds - score,
      durationSeconds: avgTime,
      streak: user.stats.streak,
      puzzleId,
      mode: mode === 'daily' ? 'daily' : 'freeplay',
      gameType: 'impostor' as const,
      isMonthlySpecial,
    }
    const coinsEarned = calcCoins(result)

    return (
      <div className="min-h-screen bg-[#E1F5EE] flex flex-col">
        {/* Header */}
        <div className="bg-[#085041] px-5 pt-5 pb-8">
          <button onClick={onBack} className="text-[#5DCAA5] text-sm font-bold mb-4">
            Back
          </button>
          <p className="text-[#5DCAA5] text-[11px] font-black uppercase tracking-[0.15em]">
            {mode === 'daily' ? 'Daily Impostor' : 'Impostor'}
          </p>
          <h1 className="text-[#E1F5EE] text-2xl font-black tracking-tight mt-1">
            {won ? 'Nice work.' : 'Tough round.'}
          </h1>
        </div>

        <div className="flex-1 px-4 pt-5 flex flex-col gap-3 pb-10">
          {/* Score card */}
          <div className="rounded-2xl bg-[#5DCAA5] overflow-hidden flex shadow-sm">
            <div className="w-1.5 bg-[#E24B4A] shrink-0" />
            <div className="flex-1 px-4 py-4 flex items-center justify-between">
              <span className="text-[#085041] font-black text-sm">Score</span>
              <span className="text-[#085041] font-black text-2xl">{score} / {totalRounds}</span>
            </div>
          </div>

          {/* Monthly special badge */}
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
                {result.strikes > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-[#0F6E56] font-semibold">{result.strikes} missed</span>
                    <span className="text-[#E24B4A] font-black">-{result.strikes * 20}</span>
                  </div>
                )}
                {result.strikes === 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-[#0F6E56] font-semibold">Perfect bonus</span>
                    <span className="text-[#085041] font-black">+50</span>
                  </div>
                )}
                {result.streak > 1 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-[#0F6E56] font-semibold">{result.streak}-day streak</span>
                    <span className="text-[#085041] font-black">+{coinsEarned - (isMonthlySpecial ? 300 : 100) + result.strikes * 20 - (result.strikes === 0 ? 50 : 0)}</span>
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

          {/* Actions */}
          <div className="flex flex-col gap-3 mt-auto pt-2">
            {mode === 'freeplay' && (
              <button
                onClick={() => {
                  setLoading(true)
                  setFinished(false)
                  setCurrentRound(0)
                  setSelected(null)
                  setCorrect(null)
                  setScore(0)
                  setRoundTimes([])
                  setIsMonthlySpecial(false)
                  getFreePuzzle(userId)
                    .then((res: { puzzle: { id: number; groups: PuzzleGroup[] } }) => {
                      setRounds(generateRounds(res.puzzle.groups))
                      setPuzzleId(res.puzzle.id)
                    })
                    .catch(() => {
                      const fallback: PuzzleGroup[] = [
                        { label: 'Animals in a zoo',   items: ['LION', 'TIGER', 'GIRAFFE', 'PENGUIN'] },
                        { label: 'Types of pasta',     items: ['PENNE', 'RIGATONI', 'FUSILLI', 'LINGUINE'] },
                        { label: 'Card games',         items: ['POKER', 'RUMMY', 'SNAP', 'SOLITAIRE'] },
                        { label: 'Weather events',     items: ['HAIL', 'SLEET', 'DRIZZLE', 'THUNDER'] },
                      ]
                      setRounds(generateRounds(fallback))
                      setPuzzleId(0)
                    })
                    .finally(() => {
                      setLoading(false)
                      roundStart.current = Date.now()
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
  return (
    <div className="min-h-screen bg-[#E1F5EE] flex flex-col">
      {/* Header */}
      <div className="bg-[#085041] px-5 pt-5 pb-8">
        <button onClick={onBack} className="text-[#5DCAA5] text-sm font-bold mb-4">
          Back
        </button>
        <p className="text-[#5DCAA5] text-[11px] font-black uppercase tracking-[0.15em]">
          {mode === 'daily' ? 'Daily Impostor' : 'Impostor'}
        </p>
        {/* Progress dots */}
        <div className="flex gap-2 mt-3">
          {rounds.map((_, i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all duration-300 ${
                i < currentRound
                  ? 'bg-[#5DCAA5] flex-1'
                  : i === currentRound
                    ? 'bg-[#EF9F27] flex-1'
                    : 'bg-[#0F6E56] flex-1 opacity-40'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Round */}
      <div className="flex-1 px-4 pt-6 flex flex-col gap-4">
        {/* Category label */}
        <div className="rounded-2xl bg-[#5DCAA5] overflow-hidden flex shadow-sm">
          <div className="w-1.5 bg-[#E24B4A] shrink-0" />
          <div className="flex-1 px-4 py-4">
            <p className="text-[#085041] text-[10px] font-black uppercase tracking-[0.14em] mb-1">Find the impostor</p>
            <p className="text-[#085041] font-black text-lg leading-tight">{round.categoryLabel}</p>
          </div>
        </div>

        {/* 2×2 tile grid */}
        <div className="grid grid-cols-2 gap-3">
          {round.tiles.map(tile => {
            const isSelected = selected === tile
            const isImpostor = tile === round.impostorItem
            let bg = 'bg-[#B5D4F4]'
            let text = 'text-[#085041]'

            if (isSelected !== null && selected !== null) {
              if (isImpostor && isSelected) {
                bg = 'bg-[#5DCAA5]'   // tapped the impostor — correct
              } else if (isImpostor && !isSelected) {
                bg = 'bg-[#E24B4A]'   // this was the impostor, player missed it
                text = 'text-[#E1F5EE]'
              } else if (isSelected && !isImpostor) {
                bg = 'bg-[#E24B4A]'   // wrong tap
                text = 'text-[#E1F5EE]'
              }
            }

            return (
              <button
                key={tile}
                onClick={() => handleTap(tile)}
                disabled={selected !== null}
                className={`${bg} ${text} rounded-2xl px-4 py-6 font-black text-base shadow-sm transition-colors duration-200 flex items-center justify-center text-center min-h-[80px]`}
              >
                {tile}
              </button>
            )
          })}
        </div>

        {/* Feedback message */}
        {selected !== null && (
          <p className={`text-center font-black text-sm mt-1 ${
            correct ? 'text-[#085041]' : 'text-[#E24B4A]'
          }`}>
            {correct
              ? 'Correct!'
              : `The impostor was ${round.impostorItem}`}
          </p>
        )}
      </div>
    </div>
  )
}
