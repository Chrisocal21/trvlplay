import { useState } from 'react'
import { useApp } from '../state/AppContext'

interface Friend {
  id: string
  name: string
  initials: string
  color: string
  streak: number
  lastActive: string
  online: boolean
}

interface PendingRequest {
  id: string
  name: string
  initials: string
  color: string
  friendCode: string
  direction: 'incoming' | 'outgoing'
}

// Mock data — replace with real API calls when backend is ready
const MOCK_FRIENDS: Friend[] = []
const MOCK_PENDING: PendingRequest[] = []

function FriendRow({ friend }: { friend: Friend }) {
  return (
    <div className="bg-[#5DCAA5] rounded-2xl overflow-hidden flex shadow-sm">
      <div className="w-1.5 bg-[#9FE1CB] shrink-0" />
      <div className="flex-1 px-4 py-3 flex items-center gap-3">
        <div className="relative shrink-0">
          <div
            className="w-11 h-11 rounded-full flex items-center justify-center"
            style={{ backgroundColor: friend.color }}
          >
            <span className="text-[#085041] text-sm font-black">{friend.initials}</span>
          </div>
          {friend.online && (
            <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#5DCAA5] border-2 border-[#085041]" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[#085041] font-black text-base leading-tight truncate">{friend.name}</p>
          <p className="text-[#0F6E56] text-xs mt-0.5">{friend.online ? 'Online now' : friend.lastActive}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-[#085041] font-black text-lg leading-none">{friend.streak}</p>
          <p className="text-[#0F6E56] text-[10px] uppercase tracking-wide font-bold">Streak</p>
        </div>
      </div>
    </div>
  )
}

function PendingRow({
  request,
  onAccept,
  onDecline,
}: {
  request: PendingRequest
  onAccept: (id: string) => void
  onDecline: (id: string) => void
}) {
  return (
    <div className="bg-[#5DCAA5] rounded-2xl overflow-hidden flex shadow-sm">
      <div className="w-1.5 bg-[#EF9F27] shrink-0" />
      <div className="flex-1 px-4 py-3">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
            style={{ backgroundColor: request.color }}
          >
            <span className="text-[#085041] text-xs font-black">{request.initials}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[#085041] font-black text-sm leading-tight truncate">{request.name}</p>
            <p className="text-[#0F6E56] text-xs">{request.friendCode}</p>
          </div>
          {request.direction === 'outgoing' && (
            <span className="text-[#0F6E56] text-xs font-bold shrink-0">Pending</span>
          )}
        </div>
        {request.direction === 'incoming' && (
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => onAccept(request.id)}
              className="flex-1 bg-[#185FA5] text-[#E1F5EE] text-sm font-black py-2 rounded-xl"
            >
              Accept
            </button>
            <button
              onClick={() => onDecline(request.id)}
              className="flex-1 bg-[#0F6E56] text-[#9FE1CB] text-sm font-black py-2 rounded-xl"
            >
              Decline
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default function FriendsScreen() {
  const { user, isSignedIn } = useApp()
  const [friends, setFriends] = useState<Friend[]>(MOCK_FRIENDS)
  const [pending, setPending] = useState<PendingRequest[]>(MOCK_PENDING)
  const [showAddPanel, setShowAddPanel] = useState(false)
  const [codeInput, setCodeInput] = useState('')
  const [addStatus, setAddStatus] = useState<'idle' | 'sent' | 'error'>('idle')
  const [copied, setCopied] = useState(false)

  function copyCode() {
    navigator.clipboard.writeText(user.friendCode).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  function shareCode() {
    if (navigator.share) {
      navigator.share({ text: `Add me on TrvlPlay! My code is ${user.friendCode}` })
    } else {
      copyCode()
    }
  }

  function submitFriendCode() {
    const code = codeInput.trim().toUpperCase()
    if (!code.startsWith('TRVL-') || code.length < 8) {
      setAddStatus('error')
      return
    }
    if (code === user.friendCode) {
      setAddStatus('error')
      return
    }
    // TODO: send real API request when backend is ready
    setAddStatus('sent')
    setCodeInput('')
    setTimeout(() => {
      setShowAddPanel(false)
      setAddStatus('idle')
    }, 2000)
  }

  function acceptRequest(id: string) {
    const req = pending.find(r => r.id === id)
    if (!req) return
    setFriends(prev => [
      ...prev,
      {
        id: req.id,
        name: req.name,
        initials: req.initials,
        color: req.color,
        streak: 0,
        lastActive: 'Just joined',
        online: false,
      },
    ])
    setPending(prev => prev.filter(r => r.id !== id))
  }

  function declineRequest(id: string) {
    setPending(prev => prev.filter(r => r.id !== id))
  }

  const incomingRequests = pending.filter(r => r.direction === 'incoming')
  const outgoingRequests = pending.filter(r => r.direction === 'outgoing')

  return (
    <div className="min-h-screen bg-[#E1F5EE] pb-24">

      {/* Header */}
      <div className="bg-[#085041] px-5 pt-5 pb-8">
        <p className="text-[#5DCAA5] text-[11px] font-black uppercase tracking-[0.15em] mb-4">Friends</p>
        <div className="flex items-center justify-between">
          <h1 className="text-[#E1F5EE] text-2xl font-black tracking-tight">
            {friends.length > 0 ? `${friends.length} Friend${friends.length !== 1 ? 's' : ''}` : 'No Friends Yet'}
          </h1>
          {isSignedIn && (
            <button
              onClick={() => { setShowAddPanel(v => !v); setAddStatus('idle'); setCodeInput('') }}
              className="bg-[#185FA5] text-[#E1F5EE] text-sm font-black px-4 py-2 rounded-xl shadow-sm"
            >
              {showAddPanel ? 'Cancel' : 'Add Friend'}
            </button>
          )}
        </div>
      </div>

      <div className="px-4 -mt-4 flex flex-col gap-5">

        {/* Add friend panel */}
        {showAddPanel && isSignedIn && (
          <div className="bg-[#5DCAA5] rounded-2xl overflow-hidden flex shadow-lg">
            <div className="w-1.5 bg-[#185FA5] shrink-0" />
            <div className="flex-1 px-4 py-4">
              <p className="text-[#085041] text-[10px] font-black uppercase tracking-[0.14em] mb-3">Enter Friend Code</p>
              {addStatus === 'sent' ? (
                <p className="text-[#085041] font-black text-sm">Request sent! Waiting for them to accept.</p>
              ) : (
                <>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={codeInput}
                      onChange={e => { setCodeInput(e.target.value.toUpperCase()); setAddStatus('idle') }}
                      onKeyDown={e => e.key === 'Enter' && submitFriendCode()}
                      placeholder="TRVL-AB12345"
                      maxLength={14}
                      className="flex-1 bg-[#9FE1CB] text-[#085041] placeholder-[#0F6E56] font-bold text-sm px-3 py-2.5 rounded-xl outline-none tracking-widest"
                    />
                    <button
                      onClick={submitFriendCode}
                      className="bg-[#185FA5] text-[#E1F5EE] text-sm font-black px-4 py-2.5 rounded-xl shrink-0"
                    >
                      Send
                    </button>
                  </div>
                  {addStatus === 'error' && (
                    <p className="text-[#E24B4A] text-xs font-bold mt-2">
                      {codeInput.trim().toUpperCase() === user.friendCode
                        ? "That's your own code."
                        : 'Enter a valid friend code (e.g. TRVL-AB12345)'}
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* Your code — always visible for signed-in users */}
        {isSignedIn && (
          <div className="bg-[#5DCAA5] rounded-2xl overflow-hidden flex shadow-sm">
            <div className="w-1.5 bg-[#EF9F27] shrink-0" />
            <div className="flex-1 px-4 py-4">
              <p className="text-[#085041] text-[10px] font-black uppercase tracking-[0.14em] mb-2">Your Friend Code</p>
              <div className="flex items-center justify-between gap-3">
                <span className="text-[#085041] text-lg font-black tracking-widest">{user.friendCode}</span>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={copyCode}
                    className="bg-[#9FE1CB] text-[#085041] text-xs font-black px-3 py-2 rounded-xl"
                  >
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                  <button
                    onClick={shareCode}
                    className="bg-[#085041] text-[#E1F5EE] text-xs font-black px-3 py-2 rounded-xl"
                  >
                    Share
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Incoming requests */}
        {incomingRequests.length > 0 && (
          <div>
            <h2 className="text-[#085041] font-black text-base uppercase tracking-wide mb-3">
              Requests ({incomingRequests.length})
            </h2>
            <div className="flex flex-col gap-3">
              {incomingRequests.map(req => (
                <PendingRow
                  key={req.id}
                  request={req}
                  onAccept={acceptRequest}
                  onDecline={declineRequest}
                />
              ))}
            </div>
          </div>
        )}

        {/* Outgoing requests */}
        {outgoingRequests.length > 0 && (
          <div>
            <h2 className="text-[#085041] font-black text-base uppercase tracking-wide mb-3">Sent</h2>
            <div className="flex flex-col gap-3">
              {outgoingRequests.map(req => (
                <PendingRow
                  key={req.id}
                  request={req}
                  onAccept={acceptRequest}
                  onDecline={declineRequest}
                />
              ))}
            </div>
          </div>
        )}

        {/* Friend list */}
        {friends.length > 0 ? (
          <div>
            <h2 className="text-[#085041] font-black text-base uppercase tracking-wide mb-3">Friends</h2>
            <div className="flex flex-col gap-3">
              {friends.map(friend => (
                <FriendRow key={friend.id} friend={friend} />
              ))}
            </div>
          </div>
        ) : (
          pending.length === 0 && (
            <div className="bg-[#5DCAA5] rounded-2xl overflow-hidden flex shadow-sm">
              <div className="w-1.5 bg-[#9FE1CB] shrink-0" />
              <div className="flex-1 px-4 py-8 text-center">
                <p className="text-[#085041] font-black text-base">Add a friend to see how you stack up</p>
                {isSignedIn ? (
                  <p className="text-[#0F6E56] text-sm mt-1">Share your code to get started</p>
                ) : (
                  <p className="text-[#0F6E56] text-sm mt-1">Sign in to add friends</p>
                )}
              </div>
            </div>
          )
        )}

        {/* Guest prompt */}
        {!isSignedIn && (
          <div className="bg-[#5DCAA5] rounded-2xl overflow-hidden flex shadow-sm">
            <div className="w-1.5 bg-[#EF9F27] shrink-0" />
            <div className="flex-1 px-4 py-4 text-center">
              <p className="text-[#085041] font-black text-base">Playing as Guest</p>
              <p className="text-[#0F6E56] text-sm mt-1">Sign in to add friends and track streaks</p>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
