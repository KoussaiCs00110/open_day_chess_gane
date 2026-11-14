# Alice and the Looking-Glass Chess

A Wonderland chess-puzzle adventure for a club open day. Visitors play White, follow Alice through ten chapters, and help the White Queen reclaim her kingdom. Choose Curious Alice, Normal, or Hardcore after entering a name. The Cheshire Cat offers limited hints, a bottle reveals a move, a cake freezes the clock, and a hidden Hatter’s hat opens a secret bonus puzzle.

The previous tea-serving game has been replaced. Its original generated artwork is retained only in `src/assets/legacy/`.

## Run

Use Node 22.12+; Node 24 or 26 is recommended.

```sh
npm ci
npm run dev
```

Open Vite’s printed local URL. For a tablet on the same local network, use the computer’s LAN address and port. Fullscreen and audio activation need a user gesture.

```sh
npm run validate-puzzles   # all 3 pools: 10 chapters + tutorial + secret each
npm test                  # pure logic, bilingual screens, transitions and storage
npm run build             # Vite production bundle + offline service worker
npm run preview           # serve the production build
npm run test:browser      # real Chromium integration tests, after build
npm run test:all           # validator, unit tests, build, browser tests
```

The chess libraries are file dependencies in `vendor/`; their source is included. Other npm packages need to be installed once. After installation, `npm test` and `npm run build` work with the internet disabled. No CDN, remote font, online chess API, or server is used during play.

To run the finished kiosk without npm, copy `dist/` and serve it locally:

```sh
python3 -m http.server 8000 --directory dist
```

Open `http://localhost:8000`. Opening `index.html` directly through `file://` is not supported by browser ES modules. All build assets are local. After one complete visit on localhost or HTTPS, the service worker caches the whole game for offline reloads. LAN HTTP works with the host running and internet disconnected; service workers require localhost or HTTPS.

## Play and story flow

Start → physical-keyboard name entry → three mode cards → skippable intro → unscored guided tutorial → chapter map → skippable chapter scene → puzzle → reaction → next chapter. Chapter ten leads to the coronation finale; running out of cups leads to the Red Queen finale. Both finish with a scored result card and persistent leaderboard.

Tap a cream card soldier, then a highlighted legal square, or drag it to the destination. Red replies are automatic. Illegal moves do nothing. In Normal, a wrong legal move resets that puzzle to its position after the Black setup move and cracks one cup. An alternative legal checkmate is always accepted. Promotions offer Queen, Rook, Bishop, or Knight in a touch dialog.

The tutorial is never scored, timed, or life-consuming in any mode. In Normal, hints have two levels per puzzle and three uses per game: a riddle, then a piece highlight. Each costs 20 seconds and 50 points. Drink Me reveals the next White move once. Eat Me freezes 15 seconds of active puzzle time once; story scenes and transitions do not consume its duration. The hidden hat in chapter six opens a bonus puzzle and restores the exact main-puzzle position afterward. Normal and Easy bonuses never cost a life; Hardcore’s secret has a countdown and fatal mistakes.

Normal puzzle points are `100 × chapter + max(0, 300 − floor(puzzleSeconds × 2)) + 150 if no mistake`. Hint penalties are charged immediately, once. All values are in `src/config.js`. In Normal and Easy, the global timer pauses during transitions, cutscenes, dealing, automatic move animations, hidden tabs, and explicit pause. Escape pauses a puzzle; use the on-screen button to resume.

## Difficulty modes

Every difficulty rule is in `MODES` in `src/config.js`, including pool filenames, rating/mate limits, resources, damage, penalties, score coefficients, countdown budgets, timing, motion factors, palettes and badges. Legacy flat `CONFIG` scoring fields alias Normal for existing integrations. Normal’s formulas and resource rules are unchanged.

| | Curious Alice | Normal | Hardcore |
| --- | --- | --- | --- |
| Recorded rating range | 400–1000 | 600–1600 | 1300–2200 |
| Cups / damage | 5 / half a cup | 3 / one cup | 1 / instant loss |
| Cat hints | 5 free | 3; +20 seconds, −50 points each | Taunts only |
| Drink Me / Eat Me | 3 / 2 | 1 / 1 | None |
| Clock | Count-up; no time bonus | Count-up with original time bonus | Per-puzzle countdown; par × 1.0 |
| Mate lengths | 1–2 | 1–3 | 2–4 |
| Score multiplier | ×0.5 | ×1 | ×2.5 |

Easy keeps already-correct progress after a wrong move, undoes the incorrect move with a soft bounce, and gives the puzzle’s bilingual `whyWrong` explanation. Half-cup damage is stored exactly: two mistakes consume one cup; the headline count rounds upward and the partial cup displays a crack and ½. Legal destinations are visible. After 20 seconds without input, a free piece glow appears without consuming a hint or affecting the Cat badge. Easy cannot earn Speedrunner.

Hardcore’s watch uses wall-clock elapsed time. It runs during setup, replies, dialogs, hidden tabs and attempted manual pauses; only story/cutscene and transition boundaries pause it. Pure `checkTimeout` resolves expiry. A move is evaluated before that frame’s timeout, so a checkmate on the last frame wins. Wrong moves go directly to Mirror Shatter without resetting pieces. The five-second warning adds a vignette, quicker heartbeat and small board movement; low effects suppress these motions. The Red Queen stays on the right, chapter scenes take 60% of their original duration, successful reactions are shorter, and the finale adds black/gold confetti, Alice’s gold crown and the Queen’s bow. Exclusive victory badges are **Off With Whose Head?** and **Flawless Queen**.

The selected card grows while the others fall away. Entering mode selection always uses `cards`; Hardcore starts through `stomp`. The last selection is remembered while the page remains open, but every new player sees the cards. The first loaded tutorial locks the mode. The ↶ control quits to Start and discards the run. Idle reset also discards it.

Each mode has 10 chapters, a safe tutorial and a secret in `src/data/puzzles.{mode}.json`. Pools intentionally share a few suitable positions; they are independently validated against their own limits. `puzzles.json` remains a compatibility snapshot of Normal. The approved Normal replacements are tutorial `00ERL` (729), chapter 8 `00O37` (1300), and chapter 9 `00P6j` (1326). Their old records were outside the requested range. Review the difficulty notes in `src/data/PUZZLE_SOURCES.md` before an event.

## Transition theatre

Open `/transitions-test`, or use **Transition theatre** in admin. It has ten preview buttons, a playback-speed slider, and measured wall-clock duration. Tap an overlay to fast-forward it to 3×. Slow-motion previews intentionally exceed the normal duration.

Registry names:

- `cards`: Card Shuffle Wipe
- `rabbit`: Rabbit-Hole Spiral
- `glass`: Through the Looking-Glass
- `curtain`: Theater Curtain
- `clock`: Clock Hands Sweep
- `ink`: Caterpillar’s Smoke
- `shatter`: Mirror Shatter
- `grin`: Cheshire Grin Iris
- `checker`: Chessboard Checker Dissolve
- `stomp`: Red Queen Stomp

`TransitionManager.go(fromScreen, toScreen, transitionName, payload)` owns a reusable overlay. Factories return GSAP timelines accepting `{ duration, onCover, onDone }`. Only the fully-covered callback mounts the next screen. Input is blocked with `inert` and the overlay. Safety recovery installs an opaque cover before forcing a swap, then clears all stage transforms and releases input. Low effects use the same callbacks with a short crossfade.

Flip handles the invitation morph, HUD-to-result score, result row into the ranked list, Alice’s map hop, and the broken-cup shard. Pieces are inline SVG children inside Chessground nodes; all additional piece movement is GSAP on those children, preserving Chessground’s placement transforms. The mirror shards reference one frozen DOM snapshot through SVG rather than adding another canvas.

## Event branding

The supplied **CIC in Wonderland** event logo appears on the welcome screen and shared page headers. `src/assets/svg/event-logo.svg` preserves its original lettering and keyhole paths, recolored in the game’s red, teal and gold. The original files remain in `cic design/`. The logo is bundled locally and has an Arabic/English accessible label.

## Admin and configuration

Press **Ctrl + Shift + A**, then use the on-screen PIN keyboard. The development PIN is **1865**. Admin provides mode tabs for local entry deletion, reset and CSV export, plus sound, idle timeout, the transition theatre, and an Enable/Disable Hardcore toggle. Disabling Hardcore affects new adventures and persists locally; it does not invalidate an existing run. Reset confirms deletion. This is a local kiosk convenience lock, not an account-security system.

Before your open day:

- Set `clubName`, `clubNameAr`, `adminPin`, `signupUrl`, and desired tuning in `src/config.js`.
- Replace the clearly labelled QR placeholder in `src/screens/result.js` with a real QR SVG encoding your final club URL.
- Optionally replace art using `src/assets/svg/overrides/` and individual rig parts using `overrides/parts/`. No source changes are needed for these drop-in files. See `ASSETS.md`.
- Optionally add `music.ogg` and matching SFX in `src/assets/audio/`. Missing or undecodable audio falls back to local Web Audio synthesis. Rebuild after replacing assets.
- Review the Arabic wording and extend `src/data/profanity.json` for your audience.

The in-game Low effects toggle and `prefers-reduced-motion` shorten transitions and cutscenes. System reduced-motion settings take priority. Language, effects, mute, and idle preferences persist. The name field focuses automatically after its transition. Type with a physical keyboard and press Enter to continue, or use the Continue button. Names retain the 15-character limit and bilingual profanity filter. The custom name keyboard is removed; `inputmode="none"` suppresses a mobile software keyboard. The admin PIN keypad remains available. Each completed entry has its own session UUID. Scores remain local to each browser/device. Each stored result includes its mode and the result card shows its icon.

`src/storage/leaderboard.js` is the swappable persistence boundary: `all`, `top`, `add`, `rank`, `delete`, `reset`, `exportCSV`. Pass a mode to each method (`add(entry, mode)`, `rank(id, mode)`, `top(mode)`, etc.). Keys are `leaderboard:easy`, `leaderboard:normal`, and `leaderboard:hardcore`; existing pre-mode scores migrate into Normal only when that board has never been created. Sort order is score descending, time ascending, then creation date. The optional All modes tab divides scores by each mode’s multiplier before sorting; it is multiplier normalization, not a rating-adjusted competition. Per-mode reset/export never touches the others. It falls back to session memory when localStorage is blocked. CSV export quotes fields and neutralizes formula-like names. Replace the adapter factory later with Node/Firebase methods.

## Data and libraries

The three pools contain 36 records from the [Lichess CC0 puzzle database](https://database.lichess.org/#puzzles), bundled locally. `src/data/PUZZLE_SOURCES.md` records IDs, snapshot ratings, provenance, source links, and review notes. Most retain the original pre-opponent FEN/UCI line. Hardcore boss `005wy` is color-exchanged and rank-reflected to let visitors play White; its original FEN and moves are retained as provenance, and its rating is unchanged. The validator checks that transformation as well as legal positions/moves, turn order, true mate endings/lengths, required chapter motifs, rating ranges, mode tags and bilingual hints/explanations. Ratings are snapshot values and do not guarantee a smooth visitor difficulty curve.

Chessground supplies the board UI; chess.js supplies rules and legal moves. Their locally bundled sources, versions, licenses, and the small Chessground compatibility patch are documented in `vendor/NOTICE.md`. Fonts are self-hosted Noto Serif, Noto Sans Arabic, and DejaVu Sans, with license notices included.

## Project map

- `src/core/`: pure puzzle engine, session actions, scoring, timer, flow validation, names, and tests.
- `src/board/board.js`: Chessground adapter and inline card-soldier art/animation. `board.css` owns the board layout/theme on top of the bundled upstream Chessground base stylesheet; `layout.js` fits an exact square into its available space. Chessground mounts only after screen-reveal transforms finish.
- `src/screens/`: screen templates; `src/main.js` handles lifecycle and interactions.
- `src/anim/transitions/`: manager, registry, and ten effects.
- `src/anim/cutscenes/`: GSAP engine plus one JSON data file per scene; all spoken lines are in bilingual `src/data/dialogue.json`.
- `src/anim/characters/`: layered rigs, moods, blinking, talking, and Cat disappearance.
- `src/anim/particles.js`: one pooled, capped canvas; audio, camera, and shared-element helpers are adjacent.
- `scripts/offline.mjs`: content-versioned whole-build cache generation.

`window.lookingGlass` exposes state, controller, board, scene, manager, moves, and navigation for QA. Remove this diagnostics surface before an event if visitors will have access to developer tools.

## Verification status

Passed here: 194 Vitest tests, JavaScript syntax checks, and the production build with networking unavailable. The earlier pool-validation pass covered all 36 records; animation polish leaves puzzle data and rules untouched. Tests simulate complete tutorial/secret/ten-chapter victories in each mode, exact Easy half-cup depletion and move undo, Hardcore timeout/pause/resume/final-frame mates, Normal’s original numerical rules, independent storage/migration/normalization, bilingual mode templates, and shortened scenes. Real GSAP timeline tests check all ten nominal durations (<1.7 seconds), cover-before-swap order, fast-forward control, opaque safety recovery, and low-effects input release. Piece tests cover square-to-square travel, knight arcs, drag settlement, castling, promotion, teardown, reduced motion and bounded dealing time. Cutscene tests check repeated skips, cancellation, configured duration, shortened completion, steady speech pacing and complete Arabic/emoji glyphs. Particle drawing sleeps between bursts, and clock tests guard against retained animation history. Offline tests exercise installation, cache cleanup, local assets, and disconnected navigation using a simulated service-worker environment.

Browser verification is blocked by this environment: binding a preview port fails with `listen EPERM`, and Chromium exits with `setsockopt: Operation not permitted`. Consequently real browser rendering, SVG snapshot behavior, pointer/touch integration, measured wall-clock transition performance, and 60 fps tablet performance have **not** been verified. `tests/browser.mjs` is supplied for that pass; it can use `BASE_URL` for an existing server and `CHROMIUM_PATH` for a browser. See `QA.md` for the exact acceptance matrix. Do not treat unexecuted browser checks as passed.

The board regression checks cover desktop/tablet/phone sizing and the actual puzzle-template nesting in both languages. The browser runner additionally asserts every piece matches its square, checks all eight rank/file labels, compares cached pointer bounds with the visible board, and resizes through desktop, tablet, and phone layouts. Browser execution remains blocked in this environment.

## Animation audit — 14 November 2026

See `ANIMATION_QA.md` for the concrete fixes and verification limits. Clock hands now rotate about the local SVG hub and the HUD is driven by the same elapsed/remaining time as the digits, including freeze, pause and countdown. Cutscenes prepare entrances under cover, pause their lip motion with their timelines, and skip without dumping queued sounds/particles. Character, board, shared and camera motion is cleaned up on screen changes; repeated Cat hints preserve the original grin placement. Transition safety recovery releases input even if a seek or callback throws. Changes to reduced motion also resume an interrupted automatic reply.
