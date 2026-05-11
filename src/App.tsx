import { useState } from 'react'
import './index.css'
import Header from './components/Header'
import DailySortCard from './components/DailySortCard'
import GameGrid from './components/GameGrid'
import BottomNav from './components/BottomNav'
import SortGame from './screens/SortGame'
import ProfileScreen from './screens/ProfileScreen'
import FriendsScreen from './screens/FriendsScreen'
import ShopScreen from './screens/ShopScreen'
import OfflineBanner from './components/OfflineBanner'

type Tab = 'games' | 'friends' | 'shop' | 'profile'
type Screen = 'home' | 'sort'

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('games')
  const [screen, setScreen] = useState<Screen>('home')
  const [sortMode, setSortMode] = useState<'daily' | 'freeplay'>('freeplay')

  if (screen === 'sort') {
    return <SortGame onBack={() => setScreen('home')} mode={sortMode} />
  }

  return (
    <div className="min-h-screen bg-[#E1F5EE] pb-20">
      <OfflineBanner />
      <Header />
      <main>
        {activeTab === 'games' && (
          <>
            <DailySortCard onPlay={() => { setSortMode('daily'); setScreen('sort') }} />
            <GameGrid onPlaySort={() => { setSortMode('freeplay'); setScreen('sort') }} />
          </>
        )}
        {activeTab === 'profile' && <ProfileScreen />}
        {activeTab === 'friends' && <FriendsScreen />}
        {activeTab === 'shop' && <ShopScreen />}
      </main>
      <BottomNav active={activeTab} onSelect={setActiveTab} />
    </div>
  )
}

export default App
