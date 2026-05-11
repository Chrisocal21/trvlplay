import { useState, useEffect } from 'react'
import { useApp } from '../state/AppContext'
import { getFriends, sendFriendRequest, respondFriendRequest } from '../api/client'
import { useUser } from '@clerk/clerk-react'

interface Friend {
  id: string
  username: string
  initials: string
  avatar_color: string
  streak: number
  last_played_date: string | null
}

interface PendingRequest {
  request_id: number
  id: string
  username: string
  initials: string
  avatar_color: string
  friend_code: string
  direction: 'incoming' | 'outgoing'
}

function FriendRow({ friend }: { friend: Friend }) {
  const today = new Date().toISOString().slice(0, 10)
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
  const lastActive = friend.last_played_date === today
    ? 'Active today'
    : friend.last_played_date === yesterday
    ? 'Active yesterday'
    : friend.last_played_date
    ? `Last seen ${friend.last_played_date}`
    : 'Never played'

  return (
    <div className="bg-[#5DCAA5] rounded-2xl overflow-hidden flex shadow-sm">
      <div className="w-1.5 bg-[#9FE1CB] shrink-0" />
      <div className="flex-1 px-4 py-3 flex items-center gap-3">
        <div className="shrink-0">
          <div
            className="w-11 h-11 rounded-full flex items-center justify-center"
            style={{ backgroundColor: friend.avatar_color }}
          >
            <span className="text-[#085041] text-sm font-black">{friend.initials}</span>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[#085041] font-black text-base leading-tight truncate">{friend.username}</p>
          <p className="text-[#0F6E56] text-xs mt-0.5">{lastActive}</p>
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
  onAccept: (requesterId: string) => void
  onDecline: (requesterId: string) => void
}) {
  return (
    <div className="bg-[#5DCAA5] rounded-2xl overflow-hidden flex shadow-sm">
      <div className="w-1.5 bg-[#EF9F27] shrink-0" />
      <div className="flex-1 px-4 py-3">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
            style={{ backgroundColor: request.avatar_color }}
          >
            <span className="text-[#085041] text-xs font-black">{request.initials}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[#085041] font-black text-sm leading-tight truncate">{request.username}</p>
            <p className="text-[#0F6E56] text-xs">{request.friend_code}</p>
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
  const { user: clerkUser } = useUser()
  const [friends, setFriends] = useState<Friend[]>([])
  const [pending, setPending] = useState<PendingRequest[]>([])
  const [loading, setLoading] = useState(false)
  const [showAddPanel, setShowAddPanel] = useState(false)
  const [codeInput, setCodeInput] = useState('')
  const [addStatus, setAddStatus] = useState<'idle' | 'sent' | 'error' | 'not_found'>('idle')
  const [copied, setCopied] = useState(false)

  // Load friends list when signed in
  useEffect(() => {
    if (!clerkUser) return
    setLoading(true)
    getFriends(clerkUser.id)
      .then((res: { friends?: Friend[]; pending?: PendingRequest[] }) => {
        setFriends(res.friends ?? [])
        setPending(res.pending ?? [])
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [clerkUser?.id])

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

  async function submitFriendCode() {
    if (!clerkUser) return
    const code = codeInput.trim().toUpperCase()
    if (!code.startsWith('TRVL-') || code.length < 8) { setAddStatus('error'); return }
    if (code === user.friendCode) { setAddStatus('error'); return }

    try {
      const res = await sendFriendRequest(clerkUser.id, code)
      if (res?.status === 'accepted') {
        // Already friends — just reload
        getFriends(clerkUser.id).then((r: { friends?: Friend[]; pending?: PendingRequest[] }) => {
          setFriends(r.friends ?? [])
          setPending(r.pending ?? [])
        })
      }
      setAddStatus('sent')
      setCodeInput('')
      setTimeout(() => { setShowAddPanel(false); setAddStatus('idle') }, 2000)
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : ''
      setAddStatus(msg === 'Friend code not found' ? 'not_found' : 'error')
    }
  }

  async function acceptRequest(requesterId: string) {
    if (!clerkUser) return
    await respondFriendRequest(clerkUser.id, requesterId, 'accept')
    const res = await getFriends(clerkUser.id)
    setFriends((res as { friends?: Friend[] }).friends ?? [])
    setPending((res as { pending?: PendingRequest[] }).pending ?? [])
  }

  async function declineRequest(requesterId: string) {
    if (!clerkUser) return
    await respondFriendRequest(clerkUser.id, requesterId, 'decline')
    setPending(prev => prev.filter(r => r.id !== requesterId))
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
            {loading ? 'Friends' : friends.length > 0 ? `${friends.length} Friend${friends.length !== 1 ? 's' : ''}` : 'No Friends Yet'}
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
                  {(addStatus === 'error' || addStatus === 'not_found') && (
                    <p className="text-[#E24B4A] text-xs font-bold mt-2">
                      {codeInput.trim().toUpperCase() === user.friendCode
                        ? "That's your own code."
                        : addStatus === 'not_found'
                        ? 'No player found with that code.'
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
                  <button onClick={copyCode} className="bg-[#9FE1CB] text-[#085041] text-xs font-black px-3 py-2 rounded-xl">
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                  <button onClick={shareCode} className="bg-[#085041] text-[#E1F5EE] text-xs font-black px-3 py-2 rounded-xl">
                    Share
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {loading && (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 rounded-full border-4 border-[#9FE1CB] border-t-[#085041] animate-spin" />
          </div>
        )}

        {/* Incoming requests */}
        {!loading && incomingRequests.length > 0 && (
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
        {!loading && outgoingRequests.length > 0 && (
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

        {/* Friends list */}
        {!loading && friends.length > 0 && (
          <div className="flex flex-col gap-3">
            {friends.map(f => <FriendRow key={f.id} friend={f} />)}
          </div>
        )}

        {/* Empty state */}
        {!loading && isSignedIn && friends.length === 0 && pending.length === 0 && (
          <div className="bg-[#5DCAA5] rounded-2xl overflow-hidden flex shadow-sm mt-2">
            <div className="w-1.5 bg-[#9FE1CB] shrink-0" />
            <div className="flex-1 px-4 py-6 text-center">
              <p className="text-[#085041] font-black text-base mb-1">Add a friend to see how you stack up</p>
              <p className="text-[#0F6E56] text-xs">Share your code or enter theirs to get started</p>
            </div>
          </div>
        )}

        {/* Guest state */}
        {!isSignedIn && (
          <div className="bg-[#5DCAA5] rounded-2xl overflow-hidden flex shadow-sm mt-2">
            <div className="w-1.5 bg-[#9FE1CB] shrink-0" />
            <div className="flex-1 px-4 py-6 text-center">
              <p className="text-[#085041] font-black text-base mb-1">Sign in to add friends</p>
              <p className="text-[#0F6E56] text-xs">Create a free account to connect with other players</p>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
