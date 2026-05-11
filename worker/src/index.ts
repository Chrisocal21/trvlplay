export interface Env {
  trvlplay_db: D1Database
}

const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://trvlplay.vercel.app',
  'https://trvlplay.com',
  'https://www.trvlplay.com',
]

function cors(request: Request): HeadersInit {
  const origin = request.headers.get('Origin') ?? ''
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  }
}

function json(data: unknown, status = 200, request?: Request): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...(request ? cors(request) : {}),
    },
  })
}

function err(message: string, status: number, request?: Request): Response {
  return json({ error: message }, status, request)
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors(request) })
    }

    const url = new URL(request.url)
    const path = url.pathname

    try {
      // Health check
      if (path === '/api/health' && request.method === 'GET') {
        return json({ ok: true }, 200, request)
      }

      // POST /api/users/sync — upsert user after Clerk auth, reconcile local data
      if (path === '/api/users/sync' && request.method === 'POST') {
        const body = await request.json() as {
          id: string; username: string; initials: string;
          avatarColor?: string; friendCode: string;
          localCoins?: number;
          localStats?: { played: number; wins: number; streak: number; perfect: number }
        }
        const { id, username, initials, avatarColor = '#5DCAA5', friendCode, localCoins, localStats } = body
        if (!id || !username || !initials || !friendCode) {
          return err('Missing required fields', 400, request)
        }

        await env.trvlplay_db.prepare(`
          INSERT INTO users (id, username, initials, avatar_color, friend_code)
          VALUES (?, ?, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET
            username = excluded.username,
            initials = excluded.initials
        `).bind(id, username, initials, avatarColor, friendCode).run()

        await env.trvlplay_db.prepare(`
          INSERT OR IGNORE INTO user_stats (user_id) VALUES (?)
        `).bind(id).run()

        // Reconcile: if local device had data, merge into D1 taking the higher value
        if (typeof localCoins === 'number' && localCoins > 0) {
          await env.trvlplay_db.prepare(
            'UPDATE users SET coins = MAX(coins, ?) WHERE id = ?'
          ).bind(localCoins, id).run()
        }

        if (localStats) {
          await env.trvlplay_db.prepare(`
            UPDATE user_stats SET
              played = MAX(played, ?),
              wins   = MAX(wins, ?),
              streak = MAX(streak, ?),
              perfect = MAX(perfect, ?)
            WHERE user_id = ?
          `).bind(localStats.played, localStats.wins, localStats.streak, localStats.perfect, id).run()
        }

        const user = await env.trvlplay_db.prepare(
          'SELECT u.*, s.played, s.wins, s.streak, s.perfect FROM users u LEFT JOIN user_stats s ON u.id = s.user_id WHERE u.id = ?'
        ).bind(id).first()

        return json({ user }, 200, request)
      }

      // GET /api/users/:id
      if (path.startsWith('/api/users/') && request.method === 'GET') {
        const userId = path.split('/')[3]
        if (!userId) return err('Missing user id', 400, request)

        const user = await env.trvlplay_db.prepare(
          'SELECT u.*, s.played, s.wins, s.streak, s.perfect FROM users u LEFT JOIN user_stats s ON u.id = s.user_id WHERE u.id = ?'
        ).bind(userId).first()

        if (!user) return err('User not found', 404, request)
        return json({ user }, 200, request)
      }

      // POST /api/results — record a game result and award coins
      if (path === '/api/results' && request.method === 'POST') {
        const body = await request.json() as {
          userId: string; puzzleId: number; mode: string;
          won: boolean; strikes: number; durationSeconds: number; coinsEarned: number
        }
        const { userId, puzzleId, mode, won, strikes, durationSeconds, coinsEarned } = body
        if (!userId || !puzzleId || !mode) return err('Missing required fields', 400, request)

        await env.trvlplay_db.prepare(`
          INSERT INTO game_results (user_id, puzzle_id, mode, won, strikes, duration_seconds, coins_earned)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `).bind(userId, puzzleId, mode, won ? 1 : 0, strikes, durationSeconds, coinsEarned).run()

        // Update stats
        await env.trvlplay_db.prepare(`
          UPDATE user_stats SET
            played = played + 1,
            wins = wins + ?,
            streak = CASE WHEN ? = 1 THEN streak + 1 ELSE 0 END,
            perfect = perfect + ?,
            last_played_date = date('now')
          WHERE user_id = ?
        `).bind(
          won ? 1 : 0,
          won ? 1 : 0,
          won && strikes === 0 ? 1 : 0,
          userId
        ).run()

        // Award coins
        if (coinsEarned > 0) {
          await env.trvlplay_db.prepare(
            'UPDATE users SET coins = coins + ? WHERE id = ?'
          ).bind(coinsEarned, userId).run()

          await env.trvlplay_db.prepare(
            'INSERT INTO coin_transactions (user_id, amount, reason) VALUES (?, ?, ?)'
          ).bind(userId, coinsEarned, `${mode}_game`).run()
        }

        const coins = (await env.trvlplay_db.prepare(
          'SELECT coins FROM users WHERE id = ?'
        ).bind(userId).first<{ coins: number }>())?.coins ?? 0

        return json({ ok: true, coins }, 200, request)
      }

      // GET /api/puzzles/daily
      if (path === '/api/puzzles/daily' && request.method === 'GET') {
        const puzzle = await env.trvlplay_db.prepare(
          "SELECT * FROM puzzles WHERE daily_date = date('now') LIMIT 1"
        ).first()
        if (!puzzle) return err('No daily puzzle today', 404, request)
        return json({ puzzle: parsePuzzle(puzzle) }, 200, request)
      }

      // GET /api/puzzles/freeplay?exclude=1,2,3
      if (path === '/api/puzzles/freeplay' && request.method === 'GET') {
        const exclude = url.searchParams.get('exclude') ?? ''
        const excludeIds = exclude.split(',').map(Number).filter(Boolean)

        let query = 'SELECT * FROM puzzles'
        const binds: unknown[] = []
        if (excludeIds.length) {
          query += ` WHERE id NOT IN (${excludeIds.map(() => '?').join(',')})`
          binds.push(...excludeIds)
        }
        query += ' ORDER BY RANDOM() LIMIT 1'

        const puzzle = await env.trvlplay_db.prepare(query).bind(...binds).first()
        if (!puzzle) return err('No puzzles available', 404, request)
        return json({ puzzle: parsePuzzle(puzzle) }, 200, request)
      }

      return err('Not found', 404, request)
    } catch (e) {
      console.error(e)
      return err('Internal server error', 500, request)
    }
  },
}

function parsePuzzle(row: Record<string, unknown>) {
  return {
    id: row.id,
    dailyDate: row.daily_date,
    difficulty: row.difficulty,
    groups: [
      { label: row.group1_label, items: JSON.parse(row.group1_items as string) },
      { label: row.group2_label, items: JSON.parse(row.group2_items as string) },
      { label: row.group3_label, items: JSON.parse(row.group3_items as string) },
      { label: row.group4_label, items: JSON.parse(row.group4_items as string) },
    ],
  }
}
