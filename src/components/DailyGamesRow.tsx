import { useApp } from '../state/AppContext'

interface Props {
  onPlayImpostor: () => void
  onPlayPairs: () => void
  onPlayBlitz: () => void
}

const GAMES = [
  { key: 'impostor', label: 'Impostor', accent: '#E24B4A' },
  { key: 'pairs',    label: 'Pairs',    accent: '#9D5FD0' },
  { key: 'blitz',    label: 'Blitz',    accent: '#EF9F27' },
] as const

export default function DailyGamesRow({ onPlayImpostor, onPlayPairs, onPlayBlitz }: Props) {
  const { user } = useApp()
  const today = new Date().toISOString().slice(0, 10)
  const dates = user.dailyPlayedDates ?? {}

  const handlers: Record<string, () => void> = {
    impostor: onPlayImpostor,
    pairs: onPlayPairs,
    blitz: onPlayBlitz,
  }

  return (
    <div className="mx-4 mt-4">
      <p className="text-[#085041] text-[11px] font-black uppercase tracking-[0.15em] mb-2">More dailies</p>
      <div className="flex gap-2">
        {GAMES.map(game => {
          const played = dates[game.key] === today
          return (
            <div key={game.key} className="flex-1 rounded-2xl bg-[#5DCAA5] overflow-hidden flex shadow-sm">
              <div className="w-1 shrink-0" style={{ backgroundColor: game.accent }} />
              <div className="flex-1 px-3 py-3 flex flex-col gap-2">
                <p className="text-[#085041] font-black text-sm leading-tight">{game.label}</p>
                {played ? (
                  <span className="text-[#0F6E56] text-[11px] font-black">Done</span>
                ) : (
                  <button
                    onClick={handlers[game.key]}
                    className="bg-[#185FA5] text-[#E1F5EE] text-[11px] font-black px-3 py-1.5 rounded-xl self-start"
                  >
                    Play
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
