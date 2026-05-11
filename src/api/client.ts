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

export async function getFreePuzzle(excludeIds: number[] = []) {
  const qs = excludeIds.length ? `?exclude=${excludeIds.join(',')}` : ''
  return apiFetch(`/api/puzzles/freeplay${qs}`)
}
