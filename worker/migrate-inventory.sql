-- Add user_inventory table for cosmetics
-- Run: wrangler d1 execute trvlplay-db --remote --file=migrate-inventory.sql

CREATE TABLE IF NOT EXISTS user_inventory (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL,   -- 'avatar_color' | 'theme' | 'card_back'
  item_id TEXT NOT NULL,     -- matches the id in the frontend AVATAR_COLORS / THEMES / CARD_BACKS arrays
  equipped INTEGER NOT NULL DEFAULT 0,  -- 1 = currently equipped
  purchased_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(user_id, item_type, item_id)
);

-- Seed the free/default items for all existing users
INSERT OR IGNORE INTO user_inventory (user_id, item_type, item_id, equipped)
SELECT id, 'avatar_color', 'teal', 1 FROM users;

INSERT OR IGNORE INTO user_inventory (user_id, item_type, item_id, equipped)
SELECT id, 'theme', 'classic', 1 FROM users;

INSERT OR IGNORE INTO user_inventory (user_id, item_type, item_id, equipped)
SELECT id, 'card_back', 'teal', 1 FROM users;

CREATE INDEX IF NOT EXISTS idx_inventory_user ON user_inventory(user_id);
