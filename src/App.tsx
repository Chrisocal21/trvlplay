import { useState } from 'react'
import './index.css'
import Header from './components/Header'
import DailySortCard from './components/DailySortCard'
import GameGrid from './components/GameGrid'
import BottomNav from './components/BottomNav'
import SortGame from './screens/SortGame'
import ProfileScreen from './screens/ProfileScreen'
import FriendsScreen from './screens/FriendsScreen'
import OfflineBanner from './components/OfflineBanner'

type Tab = 'games' | 'friends' | 'shop' | 'profile'
type Screen = 'home' | 'sort'

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('games')
  const [screen, setScreen] = useState<Screen>('home')

  if (screen === 'sort') {
    return <SortGame onBack={() => setScreen('home')} />
  }

  return (
    <div className="min-h-screen bg-[#E1F5EE] pb-20">
      <OfflineBanner />
      <Header />
      <main>
        {activeTab === 'games' && (
          <>
            <DailySortCard onPlay={() => setScreen('sort')} />
            <GameGrid onPlaySort={() => setScreen('sort')} />
          </>
        )}
        {activeTab === 'profile' && <ProfileScreen />}
        {activeTab === 'friends' && <FriendsScreen />}
        {activeTab === 'shop' && (
          <div className="px-4 pt-8 text-center text-[#085041] font-black text-lg">Shop coming soon</div>
        )}
      </main>
      <BottomNav active={activeTab} onSelect={setActiveTab} />
    </div>
  )
}

export default App
