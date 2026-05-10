import { useEffect, useState } from 'react'

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

export default function DailySortCard({ onPlay }: { onPlay: () => void }) {
  const countdown = useCountdown()

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
          <div className="flex gap-8 mt-5">
            <div>
              <p className="text-[#085041] text-2xl font-black leading-none">--</p>
              <p className="text-[#0F6E56] text-xs font-bold mt-1 uppercase tracking-wide">Streak</p>
            </div>
            <div>
              <p className="text-[#085041] text-2xl font-black leading-none">--%</p>
              <p className="text-[#0F6E56] text-xs font-bold mt-1 uppercase tracking-wide">Win rate</p>
            </div>
          </div>
          <div className="mt-5 flex items-center gap-2 bg-[#9FE1CB] rounded-2xl px-4 py-2.5 self-start w-fit">
            <span className="text-[#085041] text-xs font-bold">Next puzzle in</span>
            <span className="text-[#085041] text-sm font-black font-mono">{countdown || '--:--:--'}</span>
          </div>
          <button onClick={onPlay} className="mt-4 w-full bg-[#185FA5] text-[#E1F5EE] font-bold rounded-2xl py-4 text-base shadow-lg">
            Play Daily Sort
          </button>
        </div>
      </div>
    </div>
  )
}
