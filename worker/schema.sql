-- TrvlPlay D1 Schema
-- Run: wrangler d1 execute trvlplay-db --remote --file=schema.sql

-- Users
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,              -- Clerk user ID
  username TEXT NOT NULL,
  initials TEXT NOT NULL,
  avatar_color TEXT NOT NULL DEFAULT '#5DCAA5',
  friend_code TEXT UNIQUE NOT NULL,
  coins INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Stats (one row per user, updated in place)
CREATE TABLE IF NOT EXISTS user_stats (
  user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  played INTEGER NOT NULL DEFAULT 0,
  wins INTEGER NOT NULL DEFAULT 0,
  streak INTEGER NOT NULL DEFAULT 0,
  perfect INTEGER NOT NULL DEFAULT 0,
  last_played_date TEXT
);

-- Coin transaction ledger
CREATE TABLE IF NOT EXISTS coin_transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  reason TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Puzzles
CREATE TABLE IF NOT EXISTS puzzles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  daily_date TEXT UNIQUE,           -- NULL = free play only, 'YYYY-MM-DD' = daily
  difficulty TEXT NOT NULL DEFAULT 'medium',
  group1_label TEXT NOT NULL,
  group1_items TEXT NOT NULL,       -- JSON array of 4 strings
  group2_label TEXT NOT NULL,
  group2_items TEXT NOT NULL,
  group3_label TEXT NOT NULL,
  group3_items TEXT NOT NULL,
  group4_label TEXT NOT NULL,
  group4_items TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Game results
CREATE TABLE IF NOT EXISTS game_results (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  puzzle_id INTEGER NOT NULL REFERENCES puzzles(id),
  mode TEXT NOT NULL,               -- 'daily' | 'freeplay'
  won INTEGER NOT NULL DEFAULT 0,   -- boolean 0/1
  strikes INTEGER NOT NULL DEFAULT 0,
  duration_seconds INTEGER NOT NULL DEFAULT 0,
  coins_earned INTEGER NOT NULL DEFAULT 0,
  played_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Friends
CREATE TABLE IF NOT EXISTS friends (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  requester_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  addressee_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending',  -- 'pending' | 'accepted'
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(requester_id, addressee_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_results_user ON game_results(user_id);
CREATE INDEX IF NOT EXISTS idx_results_puzzle ON game_results(puzzle_id);
CREATE INDEX IF NOT EXISTS idx_friends_requester ON friends(requester_id);
CREATE INDEX IF NOT EXISTS idx_friends_addressee ON friends(addressee_id);
CREATE INDEX IF NOT EXISTS idx_puzzles_daily ON puzzles(daily_date);

-- Seed puzzles (same as the in-app puzzle for now)
INSERT OR IGNORE INTO puzzles (id, daily_date, difficulty, group1_label, group1_items, group2_label, group2_items, group3_label, group3_items, group4_label, group4_items)
VALUES (
  1,
  date('now'),
  'medium',
  'Animals in a zoo',        '["Lion","Elephant","Giraffe","Penguin"]',
  'Types of pasta',          '["Penne","Fusilli","Rigatoni","Farfalle"]',
  'Card games',              '["Poker","Rummy","Snap","Solitaire"]',
  'Weather events',          '["Blizzard","Typhoon","Drought","Hailstorm"]'
);
