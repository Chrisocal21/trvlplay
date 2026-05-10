import Logo from './Logo'
import { useApp } from '../state/AppContext'

export default function Header() {
  const { user } = useApp()
  return (
    <header className="bg-[#085041] px-5 py-5 flex items-center justify-between">
      <Logo />
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 bg-[#0F6E56] rounded-full px-4 py-2.5">
          <div className="w-4 h-4 rounded-full bg-[#EF9F27] shrink-0" />
          <span className="text-[#FAC775] text-sm font-bold leading-none">{user.coins}</span>
        </div>
        <div className="w-11 h-11 rounded-full flex items-center justify-center shadow-md" style={{ backgroundColor: user.avatarColor }}>
          <span className="text-[#085041] text-xs font-black">{user.initials}</span>
        </div>
      </div>
    </header>
  )
}
