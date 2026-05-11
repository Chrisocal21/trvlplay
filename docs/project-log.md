# TrvlPlay -- Project Log

---

## Active Projects

| Project | Status | Last Session | Next Focus |
|---|---|---|---|
| TrvlPlay | Active -- Soft Launch | May 10, 2026 | App icon, friends screen polish, coin prices, font decision |

---

## Session History

All entries below, newest first.

---

## TrvlPlay -- Session 2 -- May 10, 2026

**Status:** Active -- Soft Launch (~75% MVP complete)

---

### What We Built

- Full Sort gameplay screen -- tile grid, group solving, strikes, shuffle, submit
- Win and lose result screens -- coin breakdown on win, unsolved groups revealed on loss
- Guest play flow -- guestMode state, single-game gate, sign-up nudge on result screen
- Guest data carry-over -- first game stats and coins merge into new Clerk account on sign-in
- Per-player puzzle deduplication -- server-side via game_results subquery for signed-in users; client-supplied excludeIds list for guests
- First-time onboarding screen -- username + avatar color picker; setupComplete flag gates it
- Profile inline editing -- username and avatar color, saved to localStorage and synced to D1
- Offline puzzle cache -- puzzleCache.ts stores up to 7 puzzles in localStorage; background prefetch fills cache at startup; SortGame falls back to cache when offline
- Friends screen -- add friend by code, pending requests, friend list with avatar and streak
- Shop screen -- avatar color purchases, inventory tracked in D1
- Worker syncUser bug fix -- avatar_color now included in ON CONFLICT UPDATE clause
- June 2026 daily puzzles -- 30 puzzles seeded to D1 (June 1-30, mix of easy/medium/hard)
- App deployed to trvlplay.com after each major feature via Vercel

---

### What Was Decided

- Guest second-game behavior: currently calls exitGuestMode (returns to WelcomeScreen) -- may revisit UX
- Avatar colors at onboarding: 8 options (teal, blue, amber, coral, indigo, mint, slate, gold)
- Clerk is live with pk_test key; Google and Apple sign-in working in production
- Puzzles stored as four labeled groups of JSON arrays in D1 -- no separate word bank table built
- Speed bonus and streak multiplier are placeholders in scoring -- formulas not yet defined
- Shop items have no prices set yet -- coin prices are still an open question

---

### What Changed

- progress-tracker.md: all features updated from 0% to reflect actual build state
- open-questions.md: answered questions moved to resolved section

---

### Open Questions Added

- None new -- all open questions carried from Session 1 still apply

---

### Open Questions Resolved

- Guest data carry-over behavior: implemented (localStorage merge on first sign-in)
- Avatar colors available at launch: 8 defined (teal, blue, amber, coral, indigo, mint, slate, gold)

---

## TrvlPlay -- Session 1 -- May 9, 2026

**Status:** Active -- Soft Launch (no fixed timeline)

---

### What We Decided

- App name: TrvlPlay (trvlplay.com -- Chris buying the domain)
- Flagship game: Sort -- grouping puzzle, 16 items, 4 groups of 4, 3 strikes
- Hand-curated puzzles with AI-assisted brainstorming
- Shared word bank across all word games with per-player tracking to avoid repeats
- Scoring: base 100 coins, -20 per strike, speed bonus, perfect +50, streak multiplier (flagged for post-testing adjustment)
- Daily Sort plus free play from launch, UTC reset with visible countdown
- Guest play: one free round, then profile required. Guest data carries over on signup.
- Auth: Clerk with Google and Apple only. No Facebook. Clerk is temporary.
- Friend code format: TRVL-[initials][5 random alphanumeric characters]
- Seven puzzles pre-cached for offline play
- Color palette: soft teal base (#E1F5EE), deep blue actions (#185FA5), amber rewards (#EF9F27), dark teal text (#085041)
- Left accent bar as framing motif, no white backgrounds, colored card fills
- Playful and clean aesthetic for all ages, easy on eyes for extended play
- Cosmetic shop at launch: avatar colors, game themes, card backs only
- Earn-only currency for entire soft launch period
- PWA first, likely for the foreseeable future. App stores if/when justified.
- Contact matching is native-app-only -- no phase assigned
- Soft launch with no fixed timeline -- could be years

---

### What Was Learned

- First session -- all foundational knowledge established
- Chris does not want to commit to artificial timelines
- Chris prefers honest scoping over optimistic phase plans
- The app will likely stay as a PWA for a long time
- Chris will handle GitHub and Vercel connections on his own
- Chris will need help with Cloudflare setup when ready

---

### What Changed

- Nothing -- first session, all decisions are new

---

### Open Questions Added

- What makes each difficulty tier different in Sort?
- How are puzzles validated before going live?
- What happens when a guest tries to play a second time without signing up?
- What specific cosmetics (colors, themes, card backs) are available at launch?
- What are the coin prices for cosmetic items?
- How does offline conflict resolution work?
- What are the minimum supported browsers and devices?
- What does the speed bonus formula look like?
- What is the streak multiplier curve?
- How is the word bank initially populated and how large does it need to be?
- What happens when a player exhausts the word bank?
- What typography / font is used?
- What is the app icon?

---

### Open Questions Closed

- All answered questions documented in open-questions.md (27 questions answered this session)

---

### Progress Updates

- Project created at 0%. All phases, features, and subtasks defined.

---

### Documents Created

- docs/feature-map.md
- docs/progress-tracker.md
- docs/open-questions.md
- docs/project-log.md

---

### Mockups Created

- Home screen mockup (dark teal header, daily Sort, game grid with colored cards)
- Sort gameplay screen mockup (solved group, tile grid, strikes, submit)
- Profile screen mockup (avatar, stats, friend list, add friend)
- Color palette exploration (three directions, landed on blend of cool/crisp and bold/punchy)

---

### Third-Party Connection Notes

- GitHub: Chris connects on his own
- Vercel: Chris connects on his own
- Cloudflare (Workers, D1, R2, Durable Objects): Chris will need Forge help when ready

---

### Next Session

Set up the repo and dev environment, build the home screen with the TrvlPlay palette, and start defining the D1 database schema for profiles, games, word bank, and coins. Cloudflare setup help when Chris is ready.

---
