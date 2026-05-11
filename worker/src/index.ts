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
            initials = excluded.initials,
            avatar_color = excluded.avatar_color
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
          won: boolean; strikes: number; durationSeconds: number; coinsEarned: number;
          isMonthlySpecial?: boolean
        }
        const { userId, puzzleId, mode, won, strikes, durationSeconds, coinsEarned, isMonthlySpecial } = body
        if (!userId || !puzzleId || !mode) return err('Missing required fields', 400, request)

        await env.trvlplay_db.prepare(`
          INSERT INTO game_results (user_id, puzzle_id, mode, won, strikes, duration_seconds, coins_earned)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `).bind(userId, puzzleId, mode, won ? 1 : 0, strikes, durationSeconds, coinsEarned).run()

        // Update stats — streak only increments on a win where last_played_date was yesterday
        // (first win of the day) or streak resets to 1 if the chain was broken
        await env.trvlplay_db.prepare(`
          UPDATE user_stats SET
            played = played + 1,
            wins = wins + ?,
            streak = CASE
              WHEN ? = 0 THEN streak                          -- loss: keep streak unchanged
              WHEN last_played_date = date('now') THEN streak  -- already played today: no change
              WHEN last_played_date = date('now', '-1 day') THEN streak + 1  -- played yesterday: extend
              ELSE 1                                           -- gap: reset to 1
            END,
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

        // Award medallion if this was a monthly special win
        let medallionEarned: string | null = null
        if (won && isMonthlySpecial) {
          const month = new Date().toISOString().slice(0, 7)  // 'YYYY-MM'
          await env.trvlplay_db.prepare(
            'INSERT OR IGNORE INTO user_medallions (user_id, month) VALUES (?, ?)'
          ).bind(userId, month).run()
          medallionEarned = month
        }

        return json({ ok: true, coins, medallionEarned }, 200, request)
      }

      // GET /api/puzzles/daily
      if (path === '/api/puzzles/daily' && request.method === 'GET') {
        const puzzle = await env.trvlplay_db.prepare(
          "SELECT * FROM puzzles WHERE daily_date = date('now') LIMIT 1"
        ).first()
        if (!puzzle) return err('No daily puzzle today', 404, request)
        const todayStr = new Date().toISOString().slice(0, 10)  // 'YYYY-MM-DD'
        const isMonthlySpecial = todayStr.slice(8, 10) === '01'
        return json({ puzzle: { ...parsePuzzle(puzzle), isMonthlySpecial } }, 200, request)
      }

      // GET /api/puzzles/freeplay?userId=xxx   (signed-in: dedup via game_results)
      // GET /api/puzzles/freeplay?exclude=1,2,3 (guest: client-supplied exclude list)
      if (path === '/api/puzzles/freeplay' && request.method === 'GET') {
        const userId = url.searchParams.get('userId')
        const exclude = url.searchParams.get('exclude') ?? ''
        const excludeIds = exclude.split(',').map(Number).filter(Boolean)

        let puzzle = null

        if (userId) {
          // Exclude puzzles this user has already played (from game_results)
          puzzle = await env.trvlplay_db.prepare(`
            SELECT * FROM puzzles
            WHERE id NOT IN (
              SELECT puzzle_id FROM game_results WHERE user_id = ?
            )
            ORDER BY RANDOM() LIMIT 1
          `).bind(userId).first()

          // Pool exhausted — reset and serve any puzzle
          if (!puzzle) {
            puzzle = await env.trvlplay_db.prepare(
              'SELECT * FROM puzzles ORDER BY RANDOM() LIMIT 1'
            ).first()
          }
        } else {
          // Guest path: use client-supplied exclude list
          let query = 'SELECT * FROM puzzles'
          const binds: unknown[] = []
          if (excludeIds.length) {
            query += ` WHERE id NOT IN (${excludeIds.map(() => '?').join(',')})`
            binds.push(...excludeIds)
          }
          query += ' ORDER BY RANDOM() LIMIT 1'
          puzzle = await env.trvlplay_db.prepare(query).bind(...binds).first()

          // Pool exhausted for guest — reset
          if (!puzzle) {
            puzzle = await env.trvlplay_db.prepare(
              'SELECT * FROM puzzles ORDER BY RANDOM() LIMIT 1'
            ).first()
          }
        }

        if (!puzzle) return err('No puzzles available', 404, request)
        return json({ puzzle: parsePuzzle(puzzle) }, 200, request)
      }

      // GET /api/inventory/:userId
      if (path.startsWith('/api/inventory/') && request.method === 'GET') {
        const userId = path.split('/')[3]
        if (!userId) return err('Missing user id', 400, request)

        const items = await env.trvlplay_db.prepare(
          'SELECT item_type, item_id, equipped FROM user_inventory WHERE user_id = ?'
        ).bind(userId).all()

        return json({ inventory: items.results }, 200, request)
      }

      // POST /api/shop/buy — deduct coins, add to inventory
      if (path === '/api/shop/buy' && request.method === 'POST') {
        const body = await request.json() as {
          userId: string; itemType: string; itemId: string; price: number
        }
        const { userId, itemType, itemId, price } = body
        if (!userId || !itemType || !itemId || price == null) {
          return err('Missing required fields', 400, request)
        }

        // Check if already owned
        const existing = await env.trvlplay_db.prepare(
          'SELECT id FROM user_inventory WHERE user_id = ? AND item_type = ? AND item_id = ?'
        ).bind(userId, itemType, itemId).first()
        if (existing) return err('Already owned', 409, request)

        // Check balance
        const userRow = await env.trvlplay_db.prepare(
          'SELECT coins FROM users WHERE id = ?'
        ).bind(userId).first<{ coins: number }>()
        if (!userRow) return err('User not found', 404, request)
        if (userRow.coins < price) return err('Insufficient coins', 402, request)

        // Deduct coins + add to inventory
        await env.trvlplay_db.prepare(
          'UPDATE users SET coins = coins - ? WHERE id = ?'
        ).bind(price, userId).run()

        await env.trvlplay_db.prepare(
          'INSERT INTO user_inventory (user_id, item_type, item_id) VALUES (?, ?, ?)'
        ).bind(userId, itemType, itemId).run()

        await env.trvlplay_db.prepare(
          'INSERT INTO coin_transactions (user_id, amount, reason) VALUES (?, ?, ?)'
        ).bind(userId, -price, `shop_${itemType}_${itemId}`).run()

        const newCoins = (await env.trvlplay_db.prepare(
          'SELECT coins FROM users WHERE id = ?'
        ).bind(userId).first<{ coins: number }>())?.coins ?? 0

        return json({ ok: true, coins: newCoins }, 200, request)
      }

      // POST /api/shop/equip — set equipped item for a type
      if (path === '/api/shop/equip' && request.method === 'POST') {
        const body = await request.json() as {
          userId: string; itemType: string; itemId: string
        }
        const { userId, itemType, itemId } = body
        if (!userId || !itemType || !itemId) return err('Missing required fields', 400, request)

        // Verify owned
        const owned = await env.trvlplay_db.prepare(
          'SELECT id FROM user_inventory WHERE user_id = ? AND item_type = ? AND item_id = ?'
        ).bind(userId, itemType, itemId).first()
        if (!owned) return err('Item not owned', 403, request)

        // Unequip all of this type, then equip the selected one
        await env.trvlplay_db.prepare(
          'UPDATE user_inventory SET equipped = 0 WHERE user_id = ? AND item_type = ?'
        ).bind(userId, itemType).run()

        await env.trvlplay_db.prepare(
          'UPDATE user_inventory SET equipped = 1 WHERE user_id = ? AND item_type = ? AND item_id = ?'
        ).bind(userId, itemType, itemId).run()

        return json({ ok: true }, 200, request)
      }

      // POST /api/friends/request — send a friend request by friend code
      if (path === '/api/friends/request' && request.method === 'POST') {
        const body = await request.json() as { userId: string; friendCode: string }
        const { userId, friendCode } = body
        if (!userId || !friendCode) return err('Missing required fields', 400, request)

        const target = await env.trvlplay_db.prepare(
          'SELECT id FROM users WHERE friend_code = ?'
        ).bind(friendCode).first<{ id: string }>()
        if (!target) return err('Friend code not found', 404, request)
        if (target.id === userId) return err('Cannot add yourself', 400, request)

        // Check for existing relationship
        const existing = await env.trvlplay_db.prepare(
          'SELECT id, status FROM friends WHERE (requester_id = ? AND addressee_id = ?) OR (requester_id = ? AND addressee_id = ?)'
        ).bind(userId, target.id, target.id, userId).first<{ status: string }>()
        if (existing) {
          return json({ ok: true, status: existing.status }, 200, request)
        }

        await env.trvlplay_db.prepare(
          'INSERT INTO friends (requester_id, addressee_id, status) VALUES (?, ?, ?)'
        ).bind(userId, target.id, 'pending').run()

        return json({ ok: true, status: 'pending' }, 200, request)
      }

      // POST /api/friends/respond — accept or decline a request
      if (path === '/api/friends/respond' && request.method === 'POST') {
        const body = await request.json() as { userId: string; requesterId: string; action: 'accept' | 'decline' }
        const { userId, requesterId, action } = body
        if (!userId || !requesterId || !action) return err('Missing required fields', 400, request)

        if (action === 'accept') {
          await env.trvlplay_db.prepare(
            "UPDATE friends SET status = 'accepted' WHERE requester_id = ? AND addressee_id = ?"
          ).bind(requesterId, userId).run()
        } else {
          await env.trvlplay_db.prepare(
            'DELETE FROM friends WHERE requester_id = ? AND addressee_id = ?'
          ).bind(requesterId, userId).run()
        }

        return json({ ok: true }, 200, request)
      }

      // GET /api/friends/:userId — list accepted friends + pending requests
      if (path.startsWith('/api/friends/') && request.method === 'GET') {
        const userId = path.split('/')[3]
        if (!userId) return err('Missing user id', 400, request)

        // Accepted friends (both directions)
        const friendsResult = await env.trvlplay_db.prepare(`
          SELECT
            u.id, u.username, u.initials, u.avatar_color,
            COALESCE(s.streak, 0) AS streak,
            s.last_played_date
          FROM friends f
          JOIN users u ON u.id = CASE WHEN f.requester_id = ? THEN f.addressee_id ELSE f.requester_id END
          LEFT JOIN user_stats s ON s.user_id = u.id
          WHERE (f.requester_id = ? OR f.addressee_id = ?) AND f.status = 'accepted'
        `).bind(userId, userId, userId).all()

        // Pending requests (incoming: I am addressee; outgoing: I am requester)
        const pendingResult = await env.trvlplay_db.prepare(`
          SELECT
            f.id AS request_id,
            u.id, u.username, u.initials, u.avatar_color, u.friend_code,
            CASE WHEN f.requester_id = ? THEN 'outgoing' ELSE 'incoming' END AS direction
          FROM friends f
          JOIN users u ON u.id = CASE WHEN f.requester_id = ? THEN f.addressee_id ELSE f.requester_id END
          WHERE (f.requester_id = ? OR f.addressee_id = ?) AND f.status = 'pending'
        `).bind(userId, userId, userId, userId).all()

        return json({ friends: friendsResult.results, pending: pendingResult.results }, 200, request)
      }

      // GET /api/medallions/:userId
      if (path.startsWith('/api/medallions/') && request.method === 'GET') {
        const userId = path.split('/')[3]
        if (!userId) return err('Missing userId', 400, request)
        const result = await env.trvlplay_db.prepare(
          'SELECT month FROM user_medallions WHERE user_id = ? ORDER BY month ASC'
        ).bind(userId).all<{ month: string }>()
        return json({ medallions: result.results.map(r => r.month) }, 200, request)
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
