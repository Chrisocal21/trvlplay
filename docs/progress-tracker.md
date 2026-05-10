# TrvlPlay -- Progress Tracker

**Overall progress:** 0%
**Last updated:** May 9, 2026
**Status:** Active -- Soft Launch (no fixed timeline)

---

## Phase 1 -- MVP

**Phase progress:** 0%
**Goal:** One game, one profile, one economy. Prove the core loop works.

---

### Feature 1.1 -- Sort (Flagship Game)
**Progress:** 0%

- [ ] Define final game rules (16 items, 4 groups of 4, 3 strikes -- confirmed)
- [ ] Name confirmed: Sort
- [ ] Design difficulty tiers (easy, medium, hard) -- define what makes each tier different
- [ ] Build the shared word bank structure in D1 with difficulty, category, and length tags
- [ ] Populate initial word bank (minimum viable set for launch)
- [ ] Create first 30 hand-curated puzzles (covers one month of daily puzzles plus free play)
- [ ] Build the scoring system (base 100, -20 per strike, speed bonus, perfect +50, streak multiplier)
- [ ] Build daily Sort with UTC reset and countdown timer on home screen
- [ ] Build free play mode pulling from the puzzle bank
- [ ] Implement per-player word tracking so no repeats until pool is exhausted
- [ ] Design and build win state screen with coin reward display
- [ ] Design and build lose state screen (3 strikes)

---

### Feature 1.2 -- Guest Play
**Progress:** 0%

- [ ] Build guest play flow -- one round without an account
- [ ] Design the post-game prompt to create a profile
- [ ] Define behavior when guest tries to play a second time without signing up
- [ ] Build guest data carry-over on account creation (stats and coins from first game transfer)

---

### Feature 1.3 -- Profile System
**Progress:** 0%

- [ ] Set up Clerk with Google and Apple sign-in
- [ ] Build profile creation flow (username, avatar color selection)
- [ ] Generate friend code on profile creation (TRVL-[initials][5 random chars])
- [ ] Build profile screen (avatar, username, friend code, stats, coin balance)
- [ ] Connect Clerk user ID to all game and profile data in D1
- [ ] Build session handling and token refresh

---

### Feature 1.4 -- Friend System
**Progress:** 0%

- [ ] Build friend code sharing (copy, native share sheet)
- [ ] Build add friend flow via friend code input
- [ ] Build friend request acceptance flow
- [ ] Build friend list view (name, avatar, streak, last active, online status)
- [ ] Design empty friend state ("Add a friend to see how you stack up" with code and share button)
- [ ] Define what is visible on a friend's profile when viewing it

---

### Feature 1.5 -- Coin Economy
**Progress:** 0%

- [ ] Build coin earning system (per game, per streak, daily bonus, perfect bonus)
- [ ] Set initial coin reward amounts for all actions
- [ ] Build coin balance display in header (amber coin icon + count)
- [ ] Store coin balance and transaction history in D1
- [ ] Enforce earn-only constraint -- no purchase flow in MVP

---

### Feature 1.6 -- Cosmetic Shop
**Progress:** 0%

- [ ] Define available avatar colors at launch
- [ ] Define available game themes at launch (alternate color schemes for Sort tiles)
- [ ] Define available card backs at launch
- [ ] Set coin prices for each cosmetic item
- [ ] Build shop screen layout
- [ ] Build cosmetic purchase flow (spend coins, unlock item)
- [ ] Build cosmetic application (select and apply owned cosmetics)

---

### Feature 1.7 -- Offline Mode
**Progress:** 0%

- [ ] Set up service worker for offline caching
- [ ] Build puzzle pre-caching (7 puzzles stored locally)
- [ ] Build local storage for profile, coin balance, and game state
- [ ] Build sync logic when connection returns
- [ ] Build conflict resolution for offline/online overlap
- [ ] Design and build offline indicator UI

---

### Feature 1.8 -- PWA Setup
**Progress:** 0%

- [ ] Configure service worker in Vite build
- [ ] Create app manifest (icon, name, splash screen, theme color matching TrvlPlay palette)
- [ ] Test install flow on iOS Safari
- [ ] Test install flow on Android Chrome
- [ ] Define and document minimum supported browsers and devices

---

### Feature 1.9 -- Visual Design and Frontend
**Progress:** 0%

- [ ] Finalize color palette tokens (soft teal, deep blue, amber, dark teal -- confirmed direction)
- [ ] Build home screen layout (dark teal header, daily Sort card, stats, game grid, bottom nav)
- [ ] Build Sort gameplay screen (solved groups, tile grid, strikes, shuffle, submit)
- [ ] Build profile screen
- [ ] Build shop screen
- [ ] Build friend list screen
- [ ] Implement left accent bar framing motif across all card components
- [ ] Implement colored card fills (no white backgrounds)
- [ ] Build bottom navigation (Games, Friends, Shop, Profile)
- [ ] Build UTC countdown timer component for home screen

---

## Phase 2 -- The Collection

**Phase progress:** 0%
**Goal:** Multiple games, social multiplayer, daily engagement hooks.

---

### Feature 2.1 -- Word Hunt (Word Puzzle Game)
**Progress:** 0%

- [ ] Define the mechanic (original twist on word guessing)
- [ ] Name the game
- [ ] Design difficulty and scoring
- [ ] Connect to shared word bank and coin economy

---

### Feature 2.2 -- Grid Lock (Sudoku or Crossword Variant)
**Progress:** 0%

- [ ] Choose which to build first and define the twist
- [ ] Name the game
- [ ] Design difficulty tiers
- [ ] Connect to coin economy

---

### Feature 2.3 -- Same-Room Multiplayer
**Progress:** 0%

- [ ] Define which games support same-room play
- [ ] Design room creation and join flow
- [ ] Design turn-based versus real-time mechanics per game
- [ ] Handle device handoff for single-device play

---

### Feature 2.4 -- Remote Multiplayer
**Progress:** 0%

- [ ] Set up Cloudflare Durable Objects for WebSocket connections
- [ ] Design friend invite flow for remote games
- [ ] Design room codes for quick join
- [ ] Handle disconnection and reconnection gracefully
- [ ] Define latency tolerance per game type

---

### Feature 2.5 -- Daily Challenges
**Progress:** 0%

- [ ] Define what a daily challenge is (one puzzle across all games or one per game)
- [ ] Design reward structure for daily completion
- [ ] Design streak tracking and streak rewards
- [ ] Reset time: UTC (same as daily Sort)

---

### Feature 2.6 -- Friend Leaderboards
**Progress:** 0%

- [ ] Define what is ranked (daily score, weekly score, streaks, all-time)
- [ ] Design leaderboard screen
- [ ] Define update frequency (real-time or periodic)

---

## Phase 3 -- The World (If / When)

**Phase progress:** 0%
**Goal:** A living platform people come back to every day. No timeline. Features here activate only when the foundation justifies them.

---

### Feature 3.1 -- Additional Games
**Progress:** 0%

- [ ] Define pipeline for adding new games
- [ ] Design consistent framework so new games plug into economy and profile
- [ ] Decide cadence for new game releases

---

### Feature 3.2 -- Seasonal Events
**Progress:** 0%

- [ ] Define what a seasonal event looks like (themed puzzles, limited cosmetics, bonus coins)
- [ ] Design event calendar
- [ ] Define event-exclusive rewards

---

### Feature 3.3 -- Achievement System
**Progress:** 0%

- [ ] Define achievement categories (per game, cross-game, social)
- [ ] Design achievement display on profile
- [ ] Connect achievements to coin or cosmetic rewards

---

### Feature 3.4 -- Real-Money Currency
**Progress:** 0%

- [ ] Define what can be purchased with real money versus earned only
- [ ] Choose payment provider (Stripe or platform-native for app stores)
- [ ] Design purchase flow
- [ ] Handle refunds and fraud prevention
- [ ] Legal and tax compliance

---

### Feature 3.5 -- App Store Releases (If / When)
**Progress:** 0%

- [ ] Wrap PWA or rebuild as native (Capacitor or similar)
- [ ] Prepare App Store and Play Store listings
- [ ] Handle app review requirements
- [ ] Set up push notifications for friend invites and daily challenges
- [ ] Implement contact matching (native-app-only feature)

---

### Feature 3.6 -- Stats and History
**Progress:** 0%

- [ ] Define what game history is stored (every game or highlights)
- [ ] Design stats dashboard per game and overall
- [ ] Define data retention policy

---

## Session Update Log

| Date | What Moved | New Overall |
|---|---|---|
| May 9, 2026 | Project created. All phases, features, and subtasks defined. Game rules, scoring, color palette, auth, friend codes, offline strategy, and visual direction locked in. | 0% |

---

## What to Tackle Next

- [ ] Set up the repo, Vite project, and Tailwind config -- get the dev environment running
- [ ] Build the home screen layout with the TrvlPlay color palette
- [ ] Set up Cloudflare D1 and define the database schema (profiles, games, word bank, coins) -- Chris will need help with Cloudflare setup
- [ ] Start curating the first batch of Sort puzzles

---

## Third-Party Connection Notes

| Service | Who Handles Setup | Notes |
|---|---|---|
| GitHub | Chris | Connects on his own |
| Vercel | Chris | Connects on his own |
| Cloudflare (Workers, D1, R2, Durable Objects) | Chris with Forge help | Will need assistance when ready |
| Clerk | Chris with Forge help | Temporary -- replaced with custom auth later |

---

## Build Rules

- No HTML in any output
- No emojis in any output
- SVG icons only when genuinely needed
