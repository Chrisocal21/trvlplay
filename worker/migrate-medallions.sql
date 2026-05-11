-- TrvlPlay Migration -- Medallions
-- Run: wrangler d1 execute trvlplay-db --remote --file=migrate-medallions.sql

CREATE TABLE IF NOT EXISTS user_medallions (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  month   TEXT NOT NULL,  -- 'YYYY-MM', e.g. '2026-05'
  earned_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (user_id, month)
);
