import { useEffect, useState } from 'react'
import { useApp } from '../state/AppContext'

function useCountdown() {
  const [timeLeft, setTimeLeft] = useState('')

  useEffect(() => {
    function tick() {
      const now = new Date()
      const midnight = new Date()
      midnight.setUTCHours(24, 0, 0, 0)
      const diff = midnight.getTime() - now.getTime()
      const h = Math.floor(diff / 3600000)
      const m = Math.floor((diff % 3600000) / 60000)
      const s = Math.floor((diff % 60000) / 1000)
      setTimeLeft(
        `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
      )
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  return timeLeft
}

// Returns last N calendar dates as 'YYYY-MM-DD', today last
function getLastNDates(n: number): string[] {
  const dates: string[] = []
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    dates.push(d.toISOString().slice(0, 10))
  }
  return dates
}

const DAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

export default function DailySortCard({ onPlay }: { onPlay: () => void }) {
  const countdown = useCountdown()
  const { user } = useApp()
  const { stats, playHistory, dailyPlayedDates } = user

  const today = new Date().toISOString().slice(0, 10)
  const alreadyPlayedToday = (dailyPlayedDates?.sort ?? '') === today

  const winRate = stats.played > 0
    ? Math.round((stats.wins / stats.played) * 100)
    : null

  // Show 7 days ending today
  const last7 = getLastNDates(7)

  return (
    <div className="mx-4 mt-6">
      <div className="rounded-3xl bg-[#5DCAA5] overflow-hidden flex shadow-2xl relative">
        <div className="w-1.5 bg-[#085041] shrink-0" />
        <div className="absolute top-5 right-5 grid grid-cols-4 gap-[5px] opacity-[0.15]">
          {Array.from({ length: 16 }).map((_, i) => (
            <div key={i} className="w-[9px] h-[9px] rounded-[2px] bg-[#085041]" />
          ))}
        </div>
        <div className="flex-1 px-5 py-6">
          <p className="text-[#085041] text-[11px] font-black uppercase tracking-[0.15em] mb-2">Daily Sort</p>
          <h2 className="text-[#085041] text-4xl font-black leading-[1.1] tracking-tight">
            Today's<br />Puzzle
          </h2>

          {/* Stats row */}
          <div className="flex gap-6 mt-5">
            <div>
              <p className="text-[#085041] text-2xl font-black leading-none">
                {stats.streak > 0 ? stats.streak : '--'}
              </p>
              <p className="text-[#0F6E56] text-xs font-bold mt-1 uppercase tracking-wide">Streak</p>
            </div>
            <div>
              <p className="text-[#085041] text-2xl font-black leading-none">
                {playHistory.length > 0 ? playHistory.length : '--'}
              </p>
              <p className="text-[#0F6E56] text-xs font-bold mt-1 uppercase tracking-wide">Days</p>
            </div>
            <div>
              <p className="text-[#085041] text-2xl font-black leading-none">
                {winRate !== null ? `${winRate}%` : '--%'}
              </p>
              <p className="text-[#0F6E56] text-xs font-bold mt-1 uppercase tracking-wide">Win rate</p>
            </div>
          </div>

          {/* 7-day play history dots */}
          <div className="mt-4 flex gap-1.5">
            {last7.map(date => {
              const played = playHistory.includes(date)
              const isToday = date === last7[last7.length - 1]
              const dayLabel = DAY_LABELS[new Date(date + 'T12:00:00').getDay()]
              return (
                <div key={date} className="flex flex-col items-center gap-1 flex-1">
                  <div
                    className={`w-full h-2 rounded-full transition-all ${
                      played
                        ? 'bg-[#085041]'
                        : isToday
                        ? 'bg-[#085041] opacity-30'
                        : 'bg-[#9FE1CB]'
                    }`}
                  />
                  <span className={`text-[9px] font-black uppercase ${
                    isToday ? 'text-[#085041]' : 'text-[#0F6E56]'
                  }`}>
                    {isToday ? 'Today' : dayLabel}
                  </span>
                </div>
              )
            })}
          </div>

          <div className="mt-4 flex items-center gap-2 bg-[#9FE1CB] rounded-2xl px-4 py-2.5 self-start w-fit">
            <span className="text-[#085041] text-xs font-bold">Next puzzle in</span>
            <span className="text-[#085041] text-sm font-black font-mono">{countdown || '--:--:--'}</span>
          </div>
          {alreadyPlayedToday ? (
            <div className="mt-4 w-full bg-[#0F6E56] text-[#9FE1CB] font-bold rounded-2xl py-4 text-base text-center">
              Come back tomorrow
            </div>
          ) : (
            <button onClick={onPlay} className="mt-4 w-full bg-[#185FA5] text-[#E1F5EE] font-bold rounded-2xl py-4 text-base shadow-lg">
              Play Daily Sort
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
