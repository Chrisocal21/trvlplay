/**
 * Local puzzle cache — stores up to MAX_CACHED free-play puzzles in localStorage.
 * Used as a fallback when the API is unreachable (offline play).
 */

const CACHE_KEY = 'trvlplay_puzzle_cache'
const MAX_CACHED = 7

export interface CachedPuzzle {
  id: number
  groups: { label: string; items: string[] }[]
}

function load(): CachedPuzzle[] {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    return raw ? (JSON.parse(raw) as CachedPuzzle[]) : []
  } catch {
    return []
  }
}

function save(puzzles: CachedPuzzle[]) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(puzzles))
  } catch { /* storage quota */ }
}

/** Add a puzzle to the cache. Deduplicates by id. Keeps newest MAX_CACHED. */
export function cachePuzzle(puzzle: CachedPuzzle) {
  const existing = load().filter(p => p.id !== puzzle.id)
  const updated = [...existing, puzzle].slice(-MAX_CACHED)
  save(updated)
}

/** Pull one puzzle from the cache (removes it so it isn't served twice in a row). */
export function popCachedPuzzle(excludeIds: number[] = []): CachedPuzzle | null {
  const all = load()
  const available = all.filter(p => !excludeIds.includes(p.id))
  if (available.length === 0) {
    // All excluded — serve any cached puzzle without removing
    return all.length > 0 ? all[Math.floor(Math.random() * all.length)] : null
  }
  const pick = available[Math.floor(Math.random() * available.length)]
  save(all.filter(p => p.id !== pick.id))
  return pick
}

/** How many puzzles are currently cached. */
export function cacheSize(): number {
  return load().length
}
