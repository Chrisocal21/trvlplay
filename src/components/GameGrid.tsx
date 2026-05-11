interface GameCardProps {
  name: string
  tagline: string
  accentColor: string
  available: boolean
  onPlay?: () => void
}

function GameCard({ name, tagline, accentColor, available, onPlay }: GameCardProps) {
  return (
    <div className={`rounded-2xl bg-[#5DCAA5] overflow-hidden flex shadow-lg ${!available ? 'opacity-60' : ''}`}>
      <div className="w-1.5 shrink-0" style={{ backgroundColor: accentColor }} />
      <div className="flex-1 px-4 py-4 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-[#085041] font-black text-lg leading-tight">{name}</h3>
          <p className="text-[#0F6E56] text-sm mt-0.5">{tagline}</p>
        </div>
        {available ? (
          <button onClick={onPlay} className="bg-[#185FA5] text-[#E1F5EE] text-sm font-bold px-5 py-2.5 rounded-xl shadow-md shrink-0">
            Play
          </button>
        ) : (
          <span className="text-[#0F6E56] text-xs font-black bg-[#9FE1CB] px-3 py-1.5 rounded-full shrink-0 uppercase tracking-wide">
            Soon
          </span>
        )}
      </div>
    </div>
  )
}

export default function GameGrid({
  onPlaySort,
  onPlayImpostor,
  onPlayPairs,
  onPlayBlitz,
}: {
  onPlaySort: () => void
  onPlayImpostor: () => void
  onPlayPairs: () => void
  onPlayBlitz: () => void
}) {
  const games = [
    {
      name: 'Sort',
      tagline: 'Group 16 items into 4 categories',
      accentColor: '#085041',
      available: true,
      onPlay: onPlaySort,
    },
    {
      name: 'Impostor',
      tagline: 'Spot the item that does not belong',
      accentColor: '#E24B4A',
      available: true,
      onPlay: onPlayImpostor,
    },
    {
      name: 'Pairs',
      tagline: 'Flip and match items from the same category',
      accentColor: '#9D5FD0',
      available: true,
      onPlay: onPlayPairs,
    },
    {
      name: 'Blitz',
      tagline: 'Sort as many items as you can in 30 seconds',
      accentColor: '#EF9F27',
      available: true,
      onPlay: onPlayBlitz,
    },
    {
      name: 'Word Hunt',
      tagline: 'Guess the hidden word',
      accentColor: '#185FA5',
      available: false,
      onPlay: undefined,
    },
    {
      name: 'Grid Lock',
      tagline: 'Fill the grid without conflict',
      accentColor: '#9FE1CB',
      available: false,
      onPlay: undefined,
    },
  ]

  return (
    <section className="px-4 mt-6 pb-4">
      <h2 className="text-[#085041] font-black text-lg mb-3 uppercase tracking-wide">Games</h2>
      <div className="flex flex-col gap-3">
        {games.map((game) => (
          <GameCard key={game.name} {...game} onPlay={game.available ? game.onPlay : undefined} />
        ))}
      </div>
    </section>
  )
}
