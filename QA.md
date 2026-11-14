# Acceptance and verification

The chess project replaces the previous tea-serving project. This matrix separates implementation from executed checks.

| Requirement | Implementation | Executed verification |
| --- | --- | --- |
| Named transitions for every screen change | Central navigation, flow validation, ten-effect registry | Flow and rendered-screen tests pass; browser review pending |
| Ten effects under 1.7 s and fast-forward | Reused overlay, GSAP factories, CustomEase, 3× tap | Real GSAP nominal-duration and callback tests pass; browser wall-clock timing pending |
| Covered swaps and no stuck input | Idempotent callbacks, opaque forced cover, safety timeout, inert release, stage cleanup | Real GSAP protocol/safety/low-effects tests pass; CSS rasterization pending |
| Five Flip shared elements | Invitation, score, ranked row, map token, cup shard | Implemented; browser visual review pending |
| Ten puzzles + tutorial + bonus | Real Lichess records, Black setup, automatic replies, legal White moves, alternative mates, promotion dialog | All 36 pool records validate; engine tests pass; touch dialog integration pending |
| Three mistakes lose, ten solved win | Immutable session actions and terminal-state guards | Passed, including complete ten-chapter simulation |
| Twelve card-soldier pieces | Distinct suits, roles, ranks, red/white colors; inline SVG | Structural checks pass; 40 generated SVG documents parse; small-screen legibility pending |
| Large, layered characters with moods | Alice, queens, Cat, Rabbit, Hatter, Hare, Caterpillar, Humpty, Tweedles, flowers, Knight, dragon, guards | Layer checks and templates pass; creative/browser review pending |
| Intro, ten chapters, reactions, finales | Data-driven GSAP engine + fifteen scene JSON files | Dialogue/step checks, skip/cancel/duration tests pass |
| Timer, lives, hints, powers, score | Config-driven pure functions; timer blocked by scene/transition state | Passed including freeze boundary, penalties, bonus restoration, and terminal states |
| Persistent sorted leaderboard | Local adapter; descending score, ascending time, stable date | Storage, sorting, corruption/fallback, unique IDs, deletion, CSV tests pass |
| Idle, admin, keyboard, RTL | PIN keyboard, settings, reset/delete/export, idle grin reset, bilingual dictionaries | English/Arabic rendering and dictionary parity pass; real interactions pending |
| Touch/mouse, 60 fps, clean console | Chessground board, touch-sized controls, GSAP SVG motion, pooled 140 particles | Real-browser and intended-tablet pass blocked here |
| Tests and offline build | Vitest, validator, Vite bundle, local fonts/assets, versioned worker | 181 tests pass; validator passes; production build passes with networking unavailable; simulated offline worker passes |

Executed commands:

- `npm install --offline --ignore-scripts --no-audit --no-fund` — linked the two vendored chess libraries successfully into the already installed toolchain.
- `npm run validate-puzzles` — all 36 pass.
- `npm test` — 181 tests pass across fourteen files.
- `npm run build` — passes; Vite emits a local bundle and the offline cache generator lists all seven final build files.
- Generated SVGs parsed using Python’s XML parser — 40 pass.
- `node --check` — all original JavaScript modules pass.
- `npm run dev` — blocked by `listen EPERM` on both all-interface and localhost bindings.
- Chromium/Playwright launch — blocked by sandbox socket restrictions.
- `npm run test:browser` — blocked before browser tests because the preview server cannot bind.

The real-browser runner starts a built preview unless `BASE_URL` is supplied. It previews all ten effects and their fast-forward/safety paths; uses the actual board for tap/drag moves; solves tutorial and chapters; checks hints/powers; discovers and solves the promotion bonus; verifies exact main-position restoration; walks victory and three-mistake loss; checks persistence, Arabic RTL, low effects, admin, idle reset, phone name-field layout with physical keyboard input, and disconnected reload. Screenshots go in `test-results/`. This runner is written but not executed successfully in this environment.

Before the open day, run `npm run test:all` on the kiosk machine. Review every effect at 1× and 0.25×, especially the SVG mirror snapshot and even-odd grin iris. Use the tablet’s performance profiler during piece dealing, moves, captures, particles, and transitions. Check the tutorial with a first-time visitor. Replace the PIN, club URL, and QR placeholder.

## Board layout correction

Chessground now uses the bundled upstream base CSS with a separate board theme, a square size computed from untransformed layout dimensions, and independent header/board/help/control tracks. Native board creation is deferred until the screen transition has completed. Static SVG piece bounds stay inside their squares; resizing refreshes native rendering and pointer bounds. Thirteen new regression checks cover slot sizing and English/Arabic tutorial, chapter, and bonus structure. The browser harness checks exact piece placement and cached bounds across four viewport sizes and RTL. Those real-browser geometry checks have not executed here because server/browser startup remains blocked.

## Difficulty modes verification

- `npm test`: 181 passing checks across fourteen files, including all three complete runs, mode-specific supplies/scoring/badges, Easy exact half damage and single-move undo, free/automatic hints, Hardcore instant failure without reset, timeout, context-specific pause/resume, a last-frame mate, timed secret restoration, three storage keys and migration, normalized ranking, config-based pools, and English/Arabic screen templates.
- `npm run validate-puzzles`: all 36 records pass config rating/mate limits, source adaptation, chapter motifs, knight presence for chapter seven, legal lines and true mate endings.
- `npm run build`: local bundle plus offline cache generation; all mode data and asset hooks are bundled, with no runtime puzzle/font/asset fetch from a remote origin.
- Actual browser execution is still blocked by the sandbox preview-server failure. The browser runner now selects Normal explicitly in its original regression path and adds Easy half cups/free hints/automatic guidance, Hardcore taunts/instant shatter/timeout while a dialog is open, mode leaderboard tabs, admin disable, mode-screen RTL and quit/discard checks. These additions are supplied but are **not reported as executed passes**.
- Human difficulty review and Hardcore clock-budget tuning: see `src/data/PUZZLE_SOURCES.md`. Tablet 60 fps, touch geometry, mode-card overflow/flip readability, crown/finale art and spoken Arabic still need a real-device pass.

## Physical keyboard name entry

Name entry now uses a native text input, focused only after its transition releases input. Physical typing, editing, paste, Arabic input and Enter use the existing required-name/profanity validation and mode-selection flow. The 15-character limit and idle activity tracking remain. The custom name keyboard is removed; the numeric admin PIN keypad is unchanged. The browser harness now types names through the physical-keyboard API and checks automatic focus and Enter submission. Actual browser execution remains blocked in this environment.

## Animation audit — 14 November 2026

`ANIMATION_QA.md` records this pass. The suite now has 181 tests in fourteen files. New checks cover actual GSAP lifetimes, local clock rotations, state-synchronized freeze/countdown and rebuilding, late prop entrances, pause/hurry/resume, silent skipping, actor placement, complete casts/parts in both languages and every mode, reduced effects, capped particle teardown, fully opaque clock swaps, and failed safety-seek/audio/callback recovery. Forty-eight SVG documents parse, and clock poses at 0:00, 0:15, 1:00 and 1:30 were rendered and inspected with the local SVG renderer.

The production bundle and all 36 puzzle records remain valid. Browser QA was attempted again: both the runner and direct preview are blocked by `listen EPERM` on `127.0.0.1:4173`. The browser runner now checks live SVG hand pivots and HUD angles, delayed crowns, reduced-motion changes during pending replies, animation warnings, and lingering timeout effects. These browser checks are not counted as executed passes; device-level 60 fps and full visual integration still need the kiosk.
