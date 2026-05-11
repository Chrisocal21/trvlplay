# TrvlPlay -- Open Questions

**Last updated:** May 10, 2026

---

## Still Open

Questions that have come up and are not yet resolved.

| Question | Why It Matters |
|---|---|
| What makes each difficulty tier different in Sort? | Affects puzzle creation -- do harder tiers have more ambiguous groupings, trickier red herrings, or more abstract categories? |
| How are puzzles validated before going live? | Bad puzzles with unclear groupings will frustrate players. Need a QA step. |
| What is the final UX when a guest tries to play a second time? | Currently returns to WelcomeScreen. May want a softer nudge instead of a hard wall. |
| What game themes are available at launch for Sort? | Alternate color schemes for the tile grid -- need to design them. |
| What card back options are available at launch? | Accent color variations for profile cards when friends view. |

| How does conflict resolution work when someone plays offline and online simultaneously? | Edge case but needs a clear rule. Last write wins? Merge? |
| What are the minimum supported browsers and devices? | Affects testing scope and PWA behavior. |
| What does the speed bonus formula look like? | Needs to reward fast solves without punishing careful thinkers. |
| What is the streak multiplier curve? | Does the multiplier cap out? How fast does it grow? |
| What happens when a player exhausts the puzzle pool? | Do puzzles start recycling? Is there a message? Currently auto-resets silently. |
| Should friend requests show a preview of the requester's profile? | Helps decide whether to accept someone you do not recognize. |
| What does the daily Sort countdown look like on the home screen? | Timer format, placement, animation on reaching zero. |
| What typography / font is used? | Needs to match the playful-but-clean aesthetic. |
| What is the app icon? | Needed for PWA manifest and install prompt -- currently missing. |

---

## Answered Questions

Questions that have been resolved. Kept here so nothing gets repeated.

| Question | Answer | Session |
|---|---|---|
| What is the app name? | TrvlPlay (trvlplay.com) | May 9, 2026 |
| What is the flagship game? | Sort -- a grouping puzzle | May 9, 2026 |
| How many groups and items? | 4 groups of 4, 16 items total | May 9, 2026 |
| How many strikes? | 3 | May 9, 2026 |
| How are puzzles created? | Hand-curated with AI-assisted brainstorming | May 9, 2026 |
| Is there a shared word bank? | Yes, one centralized bank across all word games with per-player tracking | May 9, 2026 |
| What is the scoring system? | Base 100, -20 per strike, speed bonus, perfect +50, streak multiplier. Flagged for post-testing adjustment. | May 9, 2026 |
| Daily puzzle, free play, or both? | Both from launch. Daily Sort has higher coin reward. | May 9, 2026 |
| What is the color palette? | Soft teal base, deep blue actions, amber rewards, dark teal text. No white backgrounds. | May 9, 2026 |
| What is the visual framing motif? | Left accent bar on cards throughout the app | May 9, 2026 |
| What auth provider? | Clerk (temporary) with Google and Apple sign-in only. No Facebook. | May 9, 2026 |
| Does guest data carry over? | Yes, first game stats and coins transfer on account creation | May 10, 2026 |
| What is the friend code format? | TRVL-[initials][5 random alphanumeric characters] | May 9, 2026 |
| How many puzzles pre-cached offline? | 7 (adjustable later) | May 9, 2026 |
| What is the daily reset time? | Midnight UTC | May 9, 2026 |
| Is there a countdown timer? | Yes, on the home screen below the daily Sort card | May 9, 2026 |
| What platform does this launch on? | Web app / PWA first. App stores if and when it makes sense. | May 9, 2026 |
| Does it need to work offline? | Yes. Solo games playable offline, syncs when back online. | May 9, 2026 |
| Who is the audience? | Everyone. All ages. Broad. | May 9, 2026 |
| Is there in-game currency? | Yes, earn-only for MVP and soft launch. Real money later when security is solid. | May 9, 2026 |
| What cosmetics at launch? | Avatar colors, game themes, card backs. Minimal until real usage data. | May 9, 2026 |
| How long is soft launch? | No fixed timeline. Could be years. Manual control. | May 9, 2026 |
| What about multiplayer? | Same-room and remote. Depends on the game. Phase 2. | May 9, 2026 |
| How do players find each other? | Friend codes, friend lists, room codes. No random matchmaking. | May 9, 2026 |
| What about contact matching? | Native-app-only feature. Not feasible in PWA. No phase assigned. | May 9, 2026 |
| Who handles third-party setup? | GitHub and Vercel: Chris. Cloudflare: Chris with Forge help. | May 9, 2026 |
| What visual personality? | Playful but clean, all ages, easy on eyes for extended play | May 9, 2026 |
| White backgrounds? | No. Colored card fills throughout. | May 9, 2026 |
| What avatar colors are available at launch? | 8 options: teal (#5DCAA5), blue (#185FA5), amber (#EF9F27), coral (#E24B4A), indigo (#6366F1), mint (#A7F3D0), slate (#64748B), gold (#F59E0B) | May 10, 2026 |
| What are the coin prices for cosmetic items? | Avatars 0-500, themes 0-600, card backs 0-350. Full table in ShopScreen.tsx. | May 10, 2026 |
| Will there be a second currency? | Yes -- streak gems in Phase 2. Earned daily-only, spent on premium shop items. Paid currency in Phase 3 after usage data. | May 10, 2026 |

---

## Build Rules

- No HTML in any output
- No emojis in any output
- SVG icons only when genuinely needed
