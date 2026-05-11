import { useState, useEffect } from 'react'
import './index.css'
import Header from './components/Header'
import DailySortCard from './components/DailySortCard'
import GameGrid from './components/GameGrid'
import BottomNav from './components/BottomNav'
import SortGame from './screens/SortGame'
import ImpostorGame from './screens/ImpostorGame'
import PairsGame from './screens/PairsGame'
import BlitzGame from './screens/BlitzGame'
import ProfileScreen from './screens/ProfileScreen'
import FriendsScreen from './screens/FriendsScreen'
import ShopScreen from './screens/ShopScreen'
import OfflineBanner from './components/OfflineBanner'
import { useApp } from './state/AppContext'
import { getFreePuzzle } from './api/client'
import { cachePuzzle, cacheSize } from './api/puzzleCache'

const CACHE_TARGET = 7

type Tab = 'games' | 'friends' | 'shop' | 'profile'
type Screen = 'home' | 'sort' | 'impostor' | 'pairs' | 'blitz'

function App() {
  const { guestMode, guestGamePlayed, exitGuestMode, userId } = useApp()
  const [activeTab, setActiveTab] = useState<Tab>('games')
  const [screen, setScreen] = useState<Screen>('home')

  // Background puzzle pre-fetch — silently fill the offline cache up to CACHE_TARGET
  useEffect(() => {
    if (!navigator.onLine) return
    const needed = CACHE_TARGET - cacheSize()
    if (needed <= 0) return

    async function prefetch() {
      for (let i = 0; i < needed; i++) {
        try {
          const res = await getFreePuzzle(userId) as { puzzle: { id: number; groups: { label: string; items: string[] }[] } }
          cachePuzzle({ id: res.puzzle.id, groups: res.puzzle.groups })
          // Small gap between requests — don't hammer the API
          await new Promise(r => setTimeout(r, 300))
        } catch {
          break // offline or rate-limited — stop silently
        }
      }
    }

    // Defer until after first render so it doesn't block UI
    const timer = setTimeout(prefetch, 3000)
    return () => clearTimeout(timer)
  }, [userId])
  const [sortMode, setSortMode] = useState<'daily' | 'freeplay'>('freeplay')
  const [impostorMode, setImpostorMode] = useState<'daily' | 'freeplay'>('freeplay')
  const [pairsMode, setPairsMode] = useState<'daily' | 'freeplay'>('freeplay')
  const [blitzMode, setBlitzMode] = useState<'daily' | 'freeplay'>('freeplay')

  function launchSort(mode: 'daily' | 'freeplay') {
    // Guest who already played one game must sign up to play again
    if (guestMode && guestGamePlayed) {
      exitGuestMode()
      return
    }
    setSortMode(mode)
    setScreen('sort')
  }

  function launchImpostor(mode: 'daily' | 'freeplay') {
    if (guestMode && guestGamePlayed) {
      exitGuestMode()
      return
    }
    setImpostorMode(mode)
    setScreen('impostor')
  }

  function launchPairs(mode: 'daily' | 'freeplay') {
    if (guestMode && guestGamePlayed) {
      exitGuestMode()
      return
    }
    setPairsMode(mode)
    setScreen('pairs')
  }

  function launchBlitz(mode: 'daily' | 'freeplay') {
    if (guestMode && guestGamePlayed) {
      exitGuestMode()
      return
    }
    setBlitzMode(mode)
    setScreen('blitz')
  }

  if (screen === 'sort') {
    return (
      <SortGame
        onBack={() => setScreen('home')}
        onSignUp={exitGuestMode}
        mode={sortMode}
      />
    )
  }

  if (screen === 'impostor') {
    return (
      <ImpostorGame
        onBack={() => setScreen('home')}
        onSignUp={exitGuestMode}
        mode={impostorMode}
      />
    )
  }

  if (screen === 'pairs') {
    return (
      <PairsGame
        onBack={() => setScreen('home')}
        onSignUp={exitGuestMode}
        mode={pairsMode}
      />
    )
  }

  if (screen === 'blitz') {
    return (
      <BlitzGame
        onBack={() => setScreen('home')}
        onSignUp={exitGuestMode}
        mode={blitzMode}
      />
    )
  }

  return (
    <div className="min-h-screen bg-[#E1F5EE] pb-20">
      <OfflineBanner />
      <Header />
      <main>
        {activeTab === 'games' && (
          <>
            <DailySortCard onPlay={() => launchSort('daily')} />
            <GameGrid
              onPlaySort={() => launchSort('freeplay')}
              onPlayImpostor={() => launchImpostor('freeplay')}
              onPlayPairs={() => launchPairs('freeplay')}
              onPlayBlitz={() => launchBlitz('freeplay')}
            />
          </>
        )}
        {activeTab === 'profile' && <ProfileScreen onGoToFriends={() => setActiveTab('friends')} />}
        {activeTab === 'friends' && <FriendsScreen />}
        {activeTab === 'shop' && <ShopScreen />}
      </main>
      <BottomNav active={activeTab} onSelect={setActiveTab} />
    </div>
  )
}

export default App
