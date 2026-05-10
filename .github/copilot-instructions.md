# TrvlPlay -- Claude Code Guide

> This file gives Claude Code the full context of the TrvlPlay project, the team that planned it, and how to work with Chris. Read this before writing any code. This is your brain for this project.

---

## Who You Are Working With

Chris is a solo developer and creative builder based in San Diego. He thinks fast, talks through ideas rather than writing specs, and has ADHD -- which means how you communicate matters as much as what you build.

**How to work with Chris:**

- He guides, you build. He gives direction, you write all the code and handle implementation.
- One question at a time. Never stack multiple questions.
- Short responses. No walls of text. Lead with the action or answer.
- When something is unclear, ask. Never assume.
- When something does not make sense architecturally, push back. Explain why in one or two sentences. Let him decide.
- When a session starts to loop or spin, gently redirect.
- Do not over-explain things he already knows. Match his level.
- Do not restart or re-plan. Build on what is already decided below.
- When he brings new ideas mid-build, fold them in. Do not throw out existing work.

---

## Who Planned This Project

This project was planned by The Forge -- a six-perspective founding team that lives inside a Claude Project. The Forge does not write code. It thinks, plans, challenges, and documents. You are the builder that executes what The Forge planned.

The six perspectives that shaped every decision below:

- **The Visionary** -- validated the idea, stress-tested the vision
- **The Engineer** -- chose the architecture and technical approach
- **The Product Mind** -- designed the user experience and flows
- **The Business Strategist** -- evaluated viability and positioning
- **The Operator** -- organized the plan, tracked decisions, kept the docs clean
- **The Teacher** -- explained concepts to Chris along the way

You do not need to roleplay these perspectives. But you should respect the decisions they made. If Chris wants to change something, that is his call. But do not deviate from the plan on your own.

---

## The Project -- TrvlPlay

**Domain:** trvlplay.com
**What it is:** A lightweight, playful collection of thinking games with a shared profile, earn-only currency, and multiplayer. Built for people killing time while traveling or waiting.
**Audience:** Everyone. All ages.
**Platform:** Web app / PWA. Likely staying as a PWA for the foreseeable future. App stores only if and when justified.
**Status:** Active -- Soft Launch with no fixed timeline. Could be in soft launch for years. No artificial deadlines.

---

## Tech Stack

These are the defaults. Do not deviate without Chris asking.

| Layer | Tool |
|---|---|
| Frontend | React + Vite + Tailwind + TypeScript |
| Backend | Cloudflare Workers |
| Database | Cloudflare D1 |
| File Storage | Cloudflare R2 (if needed for assets later) |
| Deployment | Vercel (frontend), Cloudflare (backend) |
| Auth | Clerk (temporary -- Google and Apple sign-in only, no Facebook) |
| Real-time (Phase 2) | Cloudflare Durable Objects for WebSocket connections |
| Local dev | localhost:3000 always |

**Third-party connection notes:**
- GitHub: Chris handles on his own
- Vercel: Chris handles on his own
- Cloudflare (Workers, D1, R2, Durable Objects): Chris will need help setting these up

---

## Visual Design System

**Palette:**

| Role | Color | Hex |
|---|---|---|
| Primary background (soft teal) | Soft teal | #E1F5EE |
| Cards and surfaces | Teal | #5DCAA5 |
| Solved groups, accents | Mid teal | #9FE1CB |
| Buttons and actions | Deep blue | #185FA5 |
| Selected tiles | Deep blue | #185FA5 |
| Unselected tiles | Light blue | #B5D4F4 |
| Coins and rewards | Amber | #EF9F27 |
| Coin text | Light amber | #FAC775 |
| Dark text, nav, headers | Dark teal | #085041 |
| Secondary dark surfaces | Mid dark teal | #0F6E56 |
| Subtitle text on dark | Muted teal | #5DCAA5 |
| Light text on dark | Light teal | #E1F5EE |
| Strikes | Red | #E24B4A |

**Design rules:**

- No white backgrounds anywhere. Use colored card fills.
- Left accent bar (3px) as a framing motif on cards throughout the app. Teal accent on content, amber accent on reward/coin elements.
- Playful and clean. Suitable for all ages. Easy on the eyes for extended play sessions.
- Rounded corners on cards and tiles.
- No emojis anywhere in the UI.
- SVG icons only when genuinely needed.
- Bottom navigation: Games, Friends, Shop, Profile.
- Coin balance always visible in the header (amber circle + count).

**Typography:** Not yet decided. Needs to match playful-but-clean aesthetic. Flag this for Chris when you get to styling.

**App icon:** Not yet designed. Flag this for Chris when needed.

---

## The Flagship Game -- Sort

**Mechanic:**
- 16 items displayed in a grid
- Player sorts them into 4 groups of 4
- 3 strikes (wrong guesses) and you lose
- Tap items to select, submit when 4 are selected
- Correct group reveals at the top with its category name
- Shuffle button to rearrange remaining tiles

**Puzzles:**
- Hand-curated with AI-assisted brainstorming
- Shared word bank across all word games stored in D1
- Words tagged by difficulty, category, and length
- Per-player tracking of words already seen per game -- no repeats until pool is exhausted
- Minimum 30 puzzles needed before launch (one month of dailies plus free play)
- Difficulty tiers: easy, medium, hard (what makes each tier different is still an open question)

**Modes:**
- Daily Sort: one puzzle per day, same for all players, UTC midnight reset, visible countdown timer on home screen below the daily Sort card
- Free Play: unlimited puzzles from the bank, lower coin reward than daily

**Scoring:**
- Base: 100 coins for completing the puzzle
- Penalty: -20 coins per strike used
- Speed bonus: small bonus for fast solves (formula not yet defined)
- Perfect bonus: +50 coins for zero mistakes
- Streak multiplier: increases with consecutive daily completions (curve not yet defined)
- All scoring values flagged for adjustment after testing

---

## Core Systems

### Guest Play
- First-time users can play one round of Sort without creating an account
- No saving, no coins during guest play
- After the first game: prompt to create a profile
- If they sign up: guest game data (stats and coins) carries over to the new account
- Behavior for guest trying to play a second time without signing up: not yet decided

### Profile System
- Fields: username, avatar (initials circle with selectable background color), friend code
- Friend code format: TRVL-[initials][5 random alphanumeric characters] (example: TRVL-CJ5XBF7)
- Initials derived from whatever name they sign in with
- Stats displayed: games played, win rate, current streak, perfect games, coin balance
- Auth via Clerk: Google and Apple sign-in only

### Friend System
- Add friends via friend code input
- Share code via native share sheet (copy, text, etc.)
- Friend requests require acceptance (not instant add)
- Friend list shows: name, avatar, streak, last active, online status
- Empty state: "Add a friend to see how you stack up" with friend code prominent and share button
- Contact matching is not feasible in PWA -- noted for native app only, no phase assigned

### Coin Economy
- Earn-only currency. No real money purchases during MVP or soft launch.
- Coins earned from: completing games, daily bonus, streaks, perfect games
- Coin balance visible in header across all screens
- Amber color reserved for all coin UI
- Exact coin amounts set but flagged for post-testing adjustment

### Cosmetic Shop (Soft Launch)
- Avatar colors (swap circle background color)
- Game themes (alternate color schemes for Sort tile grid)
- Card backs (different accent colors on profile card when friends view)
- Coin prices for items: not yet defined
- Shop stays minimal for entire soft launch period

### Offline Mode
- Solo games playable without a connection
- 7 puzzles pre-cached locally (adjustable later)
- Profile, coin balance, and game state stored locally
- Syncs when connection returns
- Conflict resolution for offline/online overlap: not yet defined
- Offline indicator visible to the user

### PWA
- Service worker for offline caching (configured in Vite build)
- App manifest with icon, name, splash screen, theme color
- Installable from browser on iOS and Android
- Minimum supported browsers: not yet defined

---

## Database Schema Direction

This has not been fully designed yet but here is what D1 needs to store:

- User profiles (username, avatar color, friend code, Clerk user ID, created date)
- Friend relationships (user pairs, request status, accepted date)
- Word bank (words with difficulty, category, length tags)
- Puzzles (groups of 4 items, category labels, difficulty tier)
- Game results (user, puzzle, score, strikes used, time, date, mode)
- Per-player word tracking (which words a player has seen per game)
- Coin balances and transaction history
- Cosmetic inventory (what each user owns and has equipped)
- Streak tracking (current streak, longest streak, last play date)

---

## Screens to Build

Based on mockups created during planning:

1. **Home screen** -- dark teal header with TrvlPlay logo, coin balance, avatar. Daily Sort card with left accent bar. Play button. Streak and win rate stats. Game grid below on soft teal surface with colored game cards (each game has its own accent color). Bottom nav.

2. **Sort gameplay** -- back button and game title at top. Solved groups stack at the top as they are found (teal background). Remaining tiles in a grid (2 columns on mobile). Selected tiles turn deep blue, unselected are light blue. Strikes indicator (filled red circles for used, muted circles for remaining). Shuffle and Submit buttons at bottom.

3. **Profile screen** -- avatar circle with initials, username, member since date. Friend code in a pill with copy/share. Coin balance. Stats grid (games played, win rate, streak, perfect games). Friend list with left accent bars. Add friend button.

4. **Shop screen** -- not yet mocked up. Build when ready.

5. **Friend list screen** -- not yet mocked up. May be part of profile or its own tab.

---

## Phase Plan

### Phase 1 -- MVP (current focus)
One game (Sort), one profile, one economy. Prove the core loop works.

### Phase 2 -- The Collection
Add Word Hunt (word guessing), Grid Lock (sudoku/crossword variant), same-room and remote multiplayer, daily challenges across games, friend leaderboards.

### Phase 3 -- The World (if/when)
More games, seasonal events, achievements, real-money currency, app store releases. No timeline. Features activate only when the foundation justifies them.

---

## Open Questions (Do Not Guess -- Ask Chris)

These are unresolved. If you hit one while building, ask Chris. Do not assume an answer.

- What makes each Sort difficulty tier different?
- How are puzzles validated before going live?
- What happens when a guest tries to play a second time without signing up?
- What specific avatar colors are available at launch?
- What game themes are available at launch?
- What card back options are available?
- What are the coin prices for cosmetic items?
- How does offline conflict resolution work?
- What are the minimum supported browsers and devices?
- What is the speed bonus formula?
- What is the streak multiplier curve?
- How is the word bank initially populated?
- What is the minimum word bank size for launch?
- What happens when a player exhausts the word bank?
- Should friend requests show a profile preview?
- What typography / font to use?
- What is the app icon?

---

## Build Rules

- Use Chris's stack unless he says otherwise
- localhost:3000 for local dev always
- No emojis in any UI or output
- SVG icons only when genuinely needed
- No white backgrounds in the UI
- No Facebook auth
- No real-money purchases during soft launch
- Clerk is temporary -- build auth integration knowing it will be swapped later
- Keep everything lightweight -- low processing, low battery usage
- PWA-first -- offline capability is a core requirement, not an afterthought
- When in doubt, ask Chris. Do not assume.
- Push back on scope creep. If something feels like it is growing beyond MVP, say so.
- Explain technical decisions briefly when they matter. Do not over-explain.
- One question at a time. Never a list of questions.

---

## What This File Is Not

This file is the plan. It is not a spec. Details will evolve as Chris builds. New decisions will be made in VS Code that are not captured here yet. That is fine. The Forge (in the Claude Project) stays the planning partner. You (Claude Code) are the builder. Chris bridges both.

When Chris says something contradicts this file, Chris wins. Always.
