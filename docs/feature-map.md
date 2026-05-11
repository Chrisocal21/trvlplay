# TrvlPlay -- Feature Map

**Domain:** trvlplay.com
**Status:** Active -- Soft Launch (no fixed timeline)
**Last updated:** May 9, 2026

---

## What TrvlPlay Is

A lightweight, playful collection of thinking games -- word puzzles, grouping games, trivia, card games, sudoku -- with a shared profile, earn-only currency, and multiplayer that works same-room or remote. Built to run smooth on low battery and work offline. Designed for people killing time while traveling or waiting.

---

## Phase 1 -- MVP

**Goal:** One game, one profile, one economy. Prove the core loop works.

---

### Sort (Flagship Game)

- Grouping puzzle: 16 items sorted into 4 groups of 4
- Three strikes and you lose
- Hand-curated puzzles with AI-assisted brainstorming
- Shared word bank across all word games with per-player tracking
- Daily Sort: one puzzle per day, same for all players, UTC reset with visible countdown
- Free Play: unlimited puzzles from the bank, lower coin reward than daily
- Difficulty tiers: easy, medium, hard
- Scoring: base 100 coins, minus 20 per strike, speed bonus, perfect bonus 50, streak multiplier
- Scoring flagged for adjustment after testing

---

### Guest Play

- First-time users can play one round without creating an account
- No saving, no coins earned during guest play
- Prompt to create a profile after the first game
- Guest play data carries over if they sign up

---

### Profile System

- Username, avatar (initials circle with selectable color), friend code
- Friend code format: TRVL-[initials][5 random alphanumeric characters]
- Stats: games played, win rate, current streak, perfect games, coin balance
- Auth via Clerk: Google and Apple sign-in only, no Facebook
- Clerk will be replaced with custom auth in later phases

---

### Friend System

- Add friends via friend codes
- Share code via native share sheet (text, copy, etc.)
- Friend list showing name, avatar, streak, last active
- Empty state: "Add a friend to see how you stack up" with friend code prominent and share button
- Friend requests require acceptance (not instant)
- Contact matching noted as native-app-only feature -- not possible in PWA

---

### Coin Economy

- Earn-only currency -- no real money purchases in MVP or soft launch
- Coins earned from: completing games (base 100, -20 per strike, +50 perfect, up to +30 speed bonus)
- Coin balance visible in header across all screens
- Amber color reserved for all coin-related UI
- Streak multiplier and speed bonus formula flagged for post-testing tuning
- Phase 2 will add a second earn-only currency (streak gems) exclusive to daily completions -- see Phase 2

---

### Cosmetic Shop (Soft Launch)

- Avatar colors (8 options: teal free, others 150-500 coins)
- Game themes (4 options: classic free, others 400-600 coins)
- Card backs (4 options: teal free, others 250-350 coins)
- All items purchased with coins -- no real money in soft launch
- Minimal cosmetics until real usage data drives what to add next
- Phase 2 will add a premium section purchasable with streak gems only

---

### Offline Mode

- Solo games playable without a connection
- Seven puzzles pre-cached for offline play (adjustable later)
- Progress syncs when connection returns
- Conflict resolution for offline/online overlap
- Offline indicator visible so the user knows their state

---

### PWA Setup

- Service worker for offline caching
- App manifest: icon, name, splash screen, theme color
- Installable from browser on iOS and Android
- Minimum supported browsers and devices defined
- This app will likely remain a PWA for the foreseeable future

---

### Auth (Clerk -- Temporary)

- Google and Apple sign-in via Clerk
- Clerk user ID connected to profile and game data
- Session handling and token refresh
- Clerk will eventually be replaced with custom auth -- no timeline set

---

## Phase 2 -- The Collection

**Goal:** Multiple games, social multiplayer, daily engagement hooks.

---

### Word Hunt (Word Puzzle Game)

- Original word guessing mechanic -- TrvlPlay's own twist
- Pulls from the shared word bank
- Own name, own scoring, connected to coin economy

---

### Grid Lock (Sudoku / Crossword Variant)

- Choose which to build first, define the twist
- Own name, own difficulty tiers
- Connected to coin economy

---

### Same-Room Multiplayer

- Define which games support same-room play
- Room creation and join flow
- Turn-based versus real-time mechanics per game
- Device handoff for single-device play

---

### Remote Multiplayer

- Cloudflare Durable Objects for WebSocket connections
- Friend invite flow for remote games
- Room codes for quick join
- Graceful disconnection and reconnection
- Latency tolerance defined per game type

---

### Daily Challenges

- Cross-game daily challenge system
- UTC reset with countdown (same as daily Sort)

---

### Streak Gems (Second Currency)

- Earned exclusively by completing the daily puzzle each day
- Cannot be earned through free play -- daily login only
- Separate balance from coins, shown in header alongside coins
- Used to unlock a premium section of the shop (limited-edition cosmetics not available with coins)
- This creates a daily return loop beyond coins alone
- Paid premium currency (Phase 3) will layer on top of this once we have usage data on what players actually want

---

### Friend Leaderboards

- Rankings: daily score, weekly score, streaks, all-time
- Leaderboard screen design
- Update frequency: real-time or periodic

---

## Phase 3 -- The World

**Goal:** A living platform people come back to every day.

---

### Additional Games

- Pipeline for adding new games
- Consistent framework so new games plug into economy and profile
- Cadence for new game releases

---

### Seasonal Events

- Themed puzzles, limited cosmetics, bonus coins
- Event calendar
- Event-exclusive rewards

---

### Achievement System

- Categories: per game, cross-game, social
- Achievement display on profile
- Connected to coin or cosmetic rewards

---

### Real-Money Currency

- Define what can be purchased versus earned only
- Payment provider: Stripe or platform-native for app stores
- Purchase flow, refunds, fraud prevention
- Legal and tax compliance

---

### App Store Releases (If / When)

- Wrap PWA or rebuild as native (Capacitor or similar)
- App Store and Play Store listings
- App review requirements
- Push notifications for friend invites and daily challenges
- Contact matching becomes possible here -- native-app-only feature

---

### Stats and History

- Game history: every game or highlights only
- Stats dashboard per game and overall
- Data retention policy

---

## Things Considered and Set Aside

| Feature | Why |
|---|---|
| Facebook login | Not worth the complexity or association |
| Random matchmaking | Keeps it personal -- friends and codes only |
| Real-money purchases at launch | Need security and scale first |
| Fixed launch timeline | Soft launch runs as long as it needs to |
| Contact matching in PWA | Not technically feasible -- browsers cannot access contacts |
| Custom art cosmetics at launch | Wait for real usage data before investing in assets |

---

## Third-Party Connections and Infrastructure Notes

| Service | Status | Notes |
|---|---|---|
| GitHub | Chris connects on his own | No assistance needed |
| Vercel | Chris connects on his own | No assistance needed |
| Cloudflare (Workers, D1, R2) | Will need help setting up | Chris will ask when ready |
| Clerk | Temporary auth provider | Will be replaced with custom auth eventually |

---

## Visual Identity

- Color palette: soft teal base, deep blue actions, amber rewards, dark teal text
- Left accent bar as framing motif throughout
- No white backgrounds -- colored card fills
- Playful and clean, suitable for all ages
- Lightweight enough for 24-hour play sessions
- Easy on the eyes across extended use

---

## Build Rules

- No HTML in any output
- No emojis in any output
- SVG icons only when genuinely needed
