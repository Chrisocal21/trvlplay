# TrvlPlay -- Progress Tracker

**Overall progress:** ~75%
**Last updated:** May 10, 2026
**Status:** Active -- Soft Launch (no fixed timeline)

---

## Phase 1 -- MVP

**Phase progress:** ~75%
**Goal:** One game, one profile, one economy. Prove the core loop works.

---

### Feature 1.1 -- Sort (Flagship Game)
**Progress:** 90%

- [x] Define final game rules (16 items, 4 groups of 4, 3 strikes -- confirmed)
- [x] Name confirmed: Sort
- [ ] Design difficulty tiers (easy, medium, hard) -- what makes each tier different is still open
- [x] Build the puzzle structure in D1 (daily_date, difficulty, 4 labeled groups of 4 items)
- [x] Create daily puzzles -- May 17-31 and all of June seeded and applied to D1
- [x] Build the scoring system (base 100, -20 per strike, perfect +50 -- speed bonus and streak multiplier flagged)
- [x] Build daily Sort with UTC reset and countdown timer on home screen
- [x] Build free play mode pulling from the puzzle bank (Worker GET /api/puzzles/freeplay)
- [x] Implement per-player puzzle tracking (server-side dedup via game_results; guest-side via excludeIds list)
- [x] Build win state screen with coin breakdown (streak card, coins earned, perfect bonus shown)
- [x] Build lose state screen (unsolved groups revealed with red accent, result card shown)

---

### Feature 1.2 -- Guest Play
**Progress:** 90%

- [x] Build guest play flow -- one round without an account (guestMode state in AppContext)
- [x] Design the post-game sign-up nudge (shown at result screen bottom when guestMode is true)
- [ ] Final behavior when guest tries to play a second time without signing up -- currently exitGuestMode is called which returns to WelcomeScreen; may want to revisit UX
- [x] Build guest data carry-over on account creation (guest localStorage merged into new Clerk account on first sign-in)

---

### Feature 1.3 -- Profile System
**Progress:** 95%

- [x] Set up Clerk with Google and Apple sign-in (pk_test live, deployed)
- [x] Build first-time onboarding screen (username + avatar color picker, setupComplete flag)
- [x] Generate friend code on profile creation (TRVL-[initials][5 random chars], stored in D1)
- [x] Build profile screen (avatar circle, username, friend code copy/share, stats grid, coin balance)
- [x] Build inline profile editing (username + avatar color, saved to localStorage and synced to D1)
- [x] Connect Clerk user ID to all game and profile data in D1
- [x] Avatar color syncs to D1 on every syncUser call (Worker ON CONFLICT now updates avatar_color)

---

### Feature 1.4 -- Friend System
**Progress:** 60%

- [x] Build friend code sharing (copy button + native share sheet in profile screen)
- [x] Build add friend flow via friend code input (FriendsScreen with input field)
- [x] Build friend request acceptance/rejection flow (Worker endpoints, FriendsScreen UI)
- [x] Build friend list view (name, avatar initials, streak, last active)
- [x] Design empty friend state ("Add a friend to see how you stack up")
- [ ] Online status indicator (not yet built -- last active shown but no live presence)
- [ ] Define what is visible on a friend's profile when viewing it (open question)

---

### Feature 1.5 -- Coin Economy
**Progress:** 85%

- [x] Build coin earning (base 100 per game, -20 per strike, +50 perfect)
- [x] Speed bonus placeholder in scoring -- formula not yet defined
- [x] Streak multiplier placeholder -- curve not yet defined
- [x] Build coin balance display in header (amber coin circle + count)
- [x] Store coin balance in D1 (user_coins table) with local cache in localStorage
- [x] Enforce earn-only constraint (no purchase flow beyond cosmetics)

---

### Feature 1.6 -- Cosmetic Shop
**Progress:** 70%

- [x] Define available avatar colors (8 options: teal, blue, amber, coral, indigo, mint, slate, gold)
- [ ] Define available game themes -- not yet designed
- [ ] Define available card backs -- not yet designed
- [ ] Set coin prices for each cosmetic item (open question)
- [x] Build shop screen layout (ShopScreen.tsx -- avatar colors + placeholder sections)
- [x] Build cosmetic purchase flow (Worker buyItem + equipItem endpoints, inventory table in D1)
- [x] Build cosmetic application (equipped avatar color applies to header avatar and profile)

---

### Feature 1.7 -- Offline Mode
**Progress:** 75%

- [x] Set up service worker via vite-plugin-pwa (dev-dist/sw.js generated)
- [x] Build puzzle pre-caching (puzzleCache.ts -- up to 7 puzzles in localStorage)
- [x] Background puzzle prefetch at app startup (App.tsx useEffect, fills cache to 7)
- [x] Puzzle fallback from cache when offline (SortGame fetches from cache if network fails)
- [x] Build offline indicator UI (OfflineBanner.tsx -- shown when navigator.onLine is false)
- [ ] Full sync logic when connection returns -- partial (coins and stats sync on next sign-in; no explicit sync trigger yet)
- [ ] Conflict resolution for offline/online overlap -- not yet defined (open question)

---

### Feature 1.8 -- PWA Setup
**Progress:** 70%

- [x] Configure service worker in Vite build (vite-plugin-pwa)
- [x] Create app manifest (public/manifest.webmanifest -- name, theme color, display standalone)
- [ ] App icon -- not yet designed (open question -- needed for manifest and install prompt)
- [ ] Test install flow on iOS Safari
- [ ] Test install flow on Android Chrome
- [ ] Define minimum supported browsers and devices (open question)

---

### Feature 1.9 -- Visual Design and Frontend
**Progress:** 85%

- [x] Finalize color palette tokens (all colors hardcoded via Tailwind arbitrary values)
- [x] Build home screen (dark teal header, daily Sort card, stats, game grid, bottom nav)
- [x] Build Sort gameplay screen (solved groups stack at top, tile grid, strikes, shuffle, submit)
- [x] Build profile screen (avatar, username, friend code, stats, edit mode)
- [x] Build shop screen (avatar colors, placeholder for themes and card backs)
- [x] Build friends screen (add friend input, pending requests, friend list)
- [x] Build onboarding screen (first-time username + color setup)
- [x] Build welcome screen (sign-in prompt, guest play option)
- [x] Left accent bar motif across all card components
- [x] Colored card fills throughout (no white backgrounds)
- [x] Bottom navigation (Games, Friends, Shop, Profile tabs)
- [x] UTC countdown timer on home screen below daily Sort card
- [ ] Typography / font not yet decided (open question)

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
