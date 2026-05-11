const API = import.meta.env.VITE_API_URL as string

async function apiFetch(path: string, options?: RequestInit) {
  const res = await fetch(`${API}${path}`, options)
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error((body as { error?: string }).error ?? 'Request failed')
  }
  return res.json()
}

export async function syncUser(data: {
  id: string
  username: string
  initials: string
  avatarColor: string
  friendCode: string
  localCoins?: number
  localStats?: { played: number; wins: number; streak: number; perfect: number }
}) {
  return apiFetch('/api/users/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
}

export async function recordResult(data: {
  userId: string
  puzzleId: number
  mode: string
  won: boolean
  strikes: number
  durationSeconds: number
  coinsEarned: number
}) {
  return apiFetch('/api/results', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
}

export async function getDailyPuzzle() {
  return apiFetch('/api/puzzles/daily')
}

export async function getFreePuzzle(userId?: string | null, excludeIds: number[] = []) {
  const params = new URLSearchParams()
  if (userId) {
    params.set('userId', userId)
  } else if (excludeIds.length) {
    params.set('exclude', excludeIds.join(','))
  }
  const qs = params.toString() ? `?${params.toString()}` : ''
  return apiFetch(`/api/puzzles/freeplay${qs}`)
}

export async function getInventory(userId: string) {
  return apiFetch(`/api/inventory/${userId}`)
}

export async function buyItem(data: {
  userId: string; itemType: string; itemId: string; price: number
}) {
  return apiFetch('/api/shop/buy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
}

export async function equipItem(data: {
  userId: string; itemType: string; itemId: string
}) {
  return apiFetch('/api/shop/equip', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
}

export async function getFriends(userId: string) {
  return apiFetch(`/api/friends/${userId}`)
}

export async function sendFriendRequest(userId: string, friendCode: string) {
  return apiFetch('/api/friends/request', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, friendCode }),
  })
}

export async function respondFriendRequest(
  userId: string,
  requesterId: string,
  action: 'accept' | 'decline'
) {
  return apiFetch('/api/friends/respond', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, requesterId, action }),
  })
}
