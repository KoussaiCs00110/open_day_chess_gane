# Locally bundled chess libraries

Network-independent file dependencies are used so the build does not require fetching chess packages.

- `chess.js/chess.js`: upstream chess.js v0.13.4, https://github.com/jhlywa/chess.js/tree/v0.13.4. BSD-2-Clause; the complete copyright/license notice is preserved at the top of the source. This release is a complete standalone ES module. The game wraps its documented snake_case check APIs.
- `chessground/src`: upstream Lichess Chessground TypeScript sources retrieved from https://github.com/lichess-org/chessground/tree/master/src on 2026-11-13, version line 10.5.0. GPL-3.0-or-later: https://www.gnu.org/licenses/gpl-3.0.html. Sources are included for users. `src/sync.ts` is a small local compatibility patch for the autoPieces renderer because the retrieved upstream snapshots referenced an unavailable shared helper. No chess rules are implemented in that patch. `dist/chessground.js` is bundled from these sources with esbuild. To rebuild: `node_modules/.bin/esbuild vendor/chessground/src/chessground.ts --bundle --format=esm --outfile=vendor/chessground/dist/chessground.js`.

Other runtime dependencies retain their licenses in node_modules. All original game source is supplied in this project. Retain the notices and provide the Chessground source when distributing it.

The unmodified upstream `assets/chessground.base.css` is included locally from https://github.com/lichess-org/chessground/blob/master/assets/chessground.base.css. Game-specific square colors, SVG containment, coordinates, and responsive framing are in `src/board/board.css`.
