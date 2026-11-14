# Animation repair and verification

Audit date: 14 November 2026. This records observed code defects, their fixes, and the checks actually executed. It does not certify every browser/device as 100% tested.

| Area | Defect and repair | Evidence |
| --- | --- | --- |
| Clock pivots | `80px 80px` CSS origins were offset from the hands' bounding box. Replaced these with explicit local SVG rotations around `(80,80)`, including nested hero and Rabbit watches. | Local-transform GSAP tests; rendered clock-angle sheet |
| Clock accuracy | Both hands rotated together independently of the game timer and restarted on rerender. Added separate hour/minute/second hands and state-driven HUD poses. | Minute/hour boundary, frozen/paused time, countdown and rerender tests |
| Clock wipe | The sweep now uses the same local hub and removes its gradient mask at the covered swap, guaranteeing an opaque layer. Prefixed masks are cleared before reuse. | Real GSAP cover/angle/mask tests |
| Scene entrances | Future `fromTo` animations could render their initial pose while being built; the crown could appear early. Entrances are hidden and prepared while covered, with deferred initial rendering. | Prepared-scene and delayed-crown tests |
| Scene pause and skip | Independent lip animation continued when the scene paused; lips could stop too early. They now last the dialogue duration and pause/hurry/resume with it. Skip suppresses queued transient sound, speech and particles. | Pause/resume/hurry, duration, silent-skip and repeated completion tests |
| Actor placement | Happy hops changed the same outer actor transform used for stage motion. Added a separate reaction layer. | Actor-position preservation tests |
| Cat hints | Clearing SVG transforms removed the grin's original translation and scale; eyebrows also survived disappearance. Hints now rebuild their rig from the original vector, and the grin is the last part to vanish. | Layer/vanish/cleanup tests; browser repeated-hint regression supplied |
| Lifetimes | Dynamic emotions, lip animation, piece motion, map/Flip motion, score popups and captures could outlive their screen. They now belong to animation contexts or explicit teardown. | Real GSAP rig cleanup tests and browser cleanup assertions supplied |
| Camera and pieces | Overlapping selection/dealing/move tweens and unbalanced shakes could leave offsets or compete. Added ownership, selective overwrite, balanced camera/check shakes and explicit screen-pose cleanup before a transition. | Camera settlement tests; native board geometry checks remain in the browser suite |
| Hardcore alarm | An infinite vignette pulse could continue after leaving the puzzle. Its tween is now scoped and cancelled before a screen reset. | Browser timeout/cleanup assertion supplied; page teardown paths inspected |
| Reduced motion | Large exits/camera moves and old particles could remain. These now clamp or clear; an interrupted automatic reply is rescheduled when a puzzle is rebuilt. | Low-effects scene/rig/particle tests; browser preference-change regression supplied |
| Recovery | An exception while force-seeking a failed transition could leave input blocked. Cleanup now runs through a final release path and stops the old timeline. Audio/callback failures also settle the navigation promise. | Failed-seek, failed-audio/callback, destroy, normal and low-effects tests |
| Missing targets | Optional rig parts and page-specific decorations produced GSAP target warnings. Calls now check for targets before animating. | Optional-part warning test; browser warning capture supplied |
| Shatter snapshot | Stripping duplicate DOM IDs removed native board styling from the clone. Snapshot boards now share the same CSS through `.mirror-board`; definitions/shards are disposed after use. | Shared CSS/markup inspection; actual foreignObject rasterization still needs browser QA |
| Piece travel | Pieces previously teleported before bouncing. Artwork now travels from the source square while Chessground retains the destination geometry. Knights have a higher arc, dropped pieces settle in place, both castling pieces move together, and promotion shares the travel timeline. Replacement and teardown clear the motion and stacking class. | Eight piece-animation tests, including full-board dealing; real-browser geometry/travel assertion supplied |
| Dealing and captures | Dealing now finishes before the first automatic move, regardless of piece count. Captured cards remain until the incoming move approaches, then fly and fade. Solved-move travel finishes before the reaction exit, including Hardcore. | Dealing-duration test; capture and solved-delay paths inspected; impact timing still needs browser review |
| Speech presentation | Bubbles have a brief entrance owned by the scene timeline. Typewriter pacing is linear, and Arabic diacritics and emoji variants reveal as complete graphemes. Initial blink delays vary between characters and pieces. | Dialogue timing, pause, duration and grapheme tests; all scene tests pass |
| Reduced-motion polish | Screen transitions crossfade under an opaque cover. Piece moves, card flips, shared elements, map movement, modals and pause overlays avoid large motion. Preference changes clear particles and recover an in-progress transition before rebuilding. | Opaque crossfade, static piece/flight and reduced-scene tests; live preference-change browser regression supplied |
| Idle animation cost | Particle drawing now subscribes only during bursts; trajectories rise, fall and fade. HUD clock updates no longer retain three GSAP sets per second for the lifetime of a screen. | Burst/sleep/arc test and one-hour clock-history test |

## Executed checks

- `npm test`: 194 tests pass across fifteen files, including complete core gameplay runs in all three modes.
- The earlier puzzle-validation pass covered all 36 records; puzzle data and rules were untouched by this polish pass.
- `npm --offline run build`: local production bundle and service-worker cache generation pass.
- JavaScript syntax checks pass.
- Forty-eight generated/SVG documents parse successfully. Clock poses at 0:00, 0:15, 1:00 and 1:30 were rendered using the local SVG renderer and visually inspected.
- All ten real GSAP transition timelines pass cover-before-swap, nominal duration, fast-forward and completion checks with instrumented targets.
- Every scene's cast and animated part hooks are present in the actual templates/rig markup in English and Arabic across Easy, Normal and Hardcore.

## Browser/device verification limit

`npm run test:browser` was attempted again during the polish work; the preview process exits before it can serve `127.0.0.1:4173`. A separate direct Chromium launch also fails with `setsockopt: Operation not permitted`, so rendering cannot be checked here. No browser-rendering, pointer integration, screenshot, wall-clock frame-rate, or mid-range-tablet performance pass is claimed. SVG rendering and headless GSAP protocol checks are useful but do not replace a browser pass.

On the kiosk, run:

```sh
npm run test:all
```

The browser runner includes the live clock-hub/angle checks, all ten transitions, repeated hints, late crown visibility, reduced-motion changes during replies, freeze/resume, timeout cleanup, gameplay, promotion, all mode controls, RTL and offline reload. Review `/transitions-test` at normal speed and slow motion, then profile the actual tablet during clock wipes, shattering and piece dealing. New console errors or animation warnings fail the browser checks.
