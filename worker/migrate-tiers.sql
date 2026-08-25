-- TrvlPlay Migration -- Difficulty Tiers
-- Allows a second puzzle row per calendar date (an 'expert' hard-mode variant
-- alongside the standard 'k12' daily), by relaxing the UNIQUE constraint from
-- daily_date alone to (daily_date, difficulty).
-- Run: wrangler d1 execute trvlplay-db --remote --file=migrate-tiers.sql

CREATE TABLE puzzles_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  daily_date TEXT,
  difficulty TEXT NOT NULL DEFAULT 'k12',
  group1_label TEXT NOT NULL,
  group1_items TEXT NOT NULL,
  group2_label TEXT NOT NULL,
  group2_items TEXT NOT NULL,
  group3_label TEXT NOT NULL,
  group3_items TEXT NOT NULL,
  group4_label TEXT NOT NULL,
  group4_items TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(daily_date, difficulty)
);

INSERT INTO puzzles_new SELECT * FROM puzzles;

DROP TABLE puzzles;

ALTER TABLE puzzles_new RENAME TO puzzles;

CREATE INDEX IF NOT EXISTS idx_puzzles_daily ON puzzles(daily_date);
