# Puzzle pools and provenance

Source: [Lichess puzzle database, CC0](https://database.lichess.org/#puzzles). Most records were transcribed from this [CC0 export sample mirror](https://github.com/aKevinM/Lichess-Puzzles-Analysis/blob/main/lichess_db_puzzle_uncleaned_sample.csv); `27K6c` came from this [Lichess-derived dataset](https://huggingface.co/datasets/imecai/chess-apo-bench/viewer/default/train?p=1). Each record retains its game URL and source/license fields. Ratings are recorded snapshots, not live ratings. No puzzle is fetched during play.

All three pools have ten chapters, one tutorial and one secret. The first move is the opponent’s automatic setup; the visitor then plays White. Original FENs/lines are preserved except Hardcore boss `005wy`: its original Black solution is adapted by exchanging colors and reflecting ranks. Its unchanged rating is 1881. `sourceFen`, `sourceMoves` and `orientation` preserve that provenance; validation checks the adaptation exactly. The tactics are symmetric under this transformation.

Normal’s approved replacements: tutorial `00FHX` (495) → `00ERL` (729); chapter 8 `001XA` (1648) → `00O37` (1300), still discovered attack; chapter 9 `006pe` (1628) → `00P6j` (1326), still mate in two. Other Normal positions and scoring remain intact. The legacy `puzzles.json` file mirrors `puzzles.normal.json`.

## Easy

| Chapter | ID | Snapshot rating | Themes | Source |
| --- | --- | --- | --- | --- |
| Tutorial | `00FHX` | 495 | endgame hangingPiece mate mateIn1 oneMove | [Lichess](https://lichess.org/training/00FHX) |
| 1 | `00465` | 573 | backRankMate endgame mate mateIn1 oneMove queenRookEndgame | [Lichess](https://lichess.org/training/00465) |
| 2 | `27K6c` | 739 | advantage endgame hangingPiece oneMove | [Lichess](https://lichess.org/training/27K6c) |
| 3 | `00Bn4` | 691 | crushing endgame fork short | [Lichess](https://lichess.org/training/00Bn4) |
| 4 | `001KR` | 658 | mate mateIn1 middlegame oneMove | [Lichess](https://lichess.org/training/001KR) |
| 5 | `00bns` | 959 | crushing fork master middlegame pin short | [Lichess](https://lichess.org/training/00bns) |
| 6 | `0030b` | 771 | backRankMate mate mateIn2 middlegame short | [Lichess](https://lichess.org/training/0030b) |
| 7 | `00cud` | 926 | crushing endgame fork master short | [Lichess](https://lichess.org/training/00cud) |
| 8 | `00GBX` | 932 | advantage discoveredAttack fork middlegame short | [Lichess](https://lichess.org/training/00GBX) |
| 9 | `004XI` | 982 | endgame mate mateIn2 short | [Lichess](https://lichess.org/training/004XI) |
| 10 | `00CtS` | 948 | endgame mate mateIn2 short | [Lichess](https://lichess.org/training/00CtS) |
| bonus | `0061g` | 801 | endgame mate mateIn2 short | [Lichess](https://lichess.org/training/0061g) |

## Normal

| Chapter | ID | Snapshot rating | Themes | Source |
| --- | --- | --- | --- | --- |
| Tutorial | `00ERL` | 729 | mate mateIn1 middlegame oneMove | [Lichess](https://lichess.org/training/00ERL) |
| 1 | `001KR` | 658 | mate mateIn1 middlegame oneMove | [Lichess](https://lichess.org/training/001KR) |
| 2 | `27K6c` | 739 | advantage endgame hangingPiece oneMove | [Lichess](https://lichess.org/training/27K6c) |
| 3 | `004nd` | 898 | crushing fork middlegame short | [Lichess](https://lichess.org/training/004nd) |
| 4 | `002Z9` | 1237 | endgame hangingPiece master mate mateIn1 oneMove | [Lichess](https://lichess.org/training/002Z9) |
| 5 | `005Bm` | 1322 | endgame mate mateIn2 pin short | [Lichess](https://lichess.org/training/005Bm) |
| 6 | `00MFe` | 1384 | endgame mate mateIn2 short | [Lichess](https://lichess.org/training/00MFe) |
| 7 | `003mh` | 1419 | advantage attraction fork long middlegame sacrifice | [Lichess](https://lichess.org/training/003mh) |
| 8 | `00O37` | 1300 | advantage discoveredAttack middlegame short | [Lichess](https://lichess.org/training/00O37) |
| 9 | `00P6j` | 1326 | kingsideAttack mate mateIn2 middlegame short | [Lichess](https://lichess.org/training/00P6j) |
| 10 | `00JR7` | 1500 | kingsideAttack long mate mateIn3 middlegame | [Lichess](https://lichess.org/training/00JR7) |
| bonus | `001w5` | 1039 | advancedPawn attraction mate mateIn2 middlegame promotion short | [Lichess](https://lichess.org/training/001w5) |

## Hardcore

| Chapter | ID | Snapshot rating | Themes | Source |
| --- | --- | --- | --- | --- |
| Tutorial | `005Bm` | 1322 | endgame mate mateIn2 pin short | [Lichess](https://lichess.org/training/005Bm) |
| 1 | `00P6j` | 1326 | kingsideAttack mate mateIn2 middlegame short | [Lichess](https://lichess.org/training/00P6j) |
| 2 | `00008` | 1800 | crushing hangingPiece long middlegame | [Lichess](https://lichess.org/training/00008) |
| 3 | `005do` | 1444 | attraction crushing deflection endgame fork long sacrifice | [Lichess](https://lichess.org/training/005do) |
| 4 | `007ku` | 1627 | mate mateIn2 middlegame short | [Lichess](https://lichess.org/training/007ku) |
| 5 | `002rd` | 1795 | crushing kingsideAttack long middlegame pin | [Lichess](https://lichess.org/training/002rd) |
| 6 | `00CBU` | 1822 | deflection endgame mate mateIn2 short | [Lichess](https://lichess.org/training/00CBU) |
| 7 | `006om` | 1816 | crushing endgame fork long master | [Lichess](https://lichess.org/training/006om) |
| 8 | `004RF` | 1746 | attraction crushing discoveredAttack endgame long sacrifice | [Lichess](https://lichess.org/training/004RF) |
| 9 | `00NEO` | 1961 | mate mateIn2 middlegame pin short | [Lichess](https://lichess.org/training/00NEO) |
| 10 | `005wy` | 1881 | long mate mateIn3 middlegame queensideAttack sacrifice | [Lichess](https://lichess.org/training/005wy) |
| bonus | `00Zks` | 1776 | advancedPawn advantage defensiveMove endgame promotion short | [Lichess](https://lichess.org/training/00Zks) |

## Human difficulty review before the open day

Every record passes legal-line, mate-length, rating-range and motif validation. These checks do not establish how beginners experience a tactic or how much thinking time a touchscreen visitor needs. Playtest each pool, especially:

- **Easy `00bns` (chapter 5, 959)**: a pin/fork near the top of the Easy range; check whether its teaching explanation is enough.
- **Easy `00GBX` (chapter 8, 932)**: combined discovered attack and fork; check novice recognition.
- **Hardcore `00008` (chapter 2, 1800)**: early free-piece tactic with a longer defensive continuation; it creates a deliberate rating jump.
- **Hardcore `005do` (chapter 3, 1444)**: a rook sacrifice sets up a knight fork. Confirm that its forcing idea feels appropriate despite its lower snapshot rating.
- **Hardcore `006om` (chapter 7, 1816)**: a multi-jump knight tactic; check the countdown budget on touch hardware.
- **Hardcore `005wy` (chapter 10, 1881)**: the reflected mate-in-three boss. Compare the documented original and adapted orientation, and review its 120-second budget.
- **Normal replacements `00ERL`, `00O37`, `00P6j`**: confirm teaching continuity with club members after the authorized range correction.

All Hardcore `timer.parSeconds` and `bonusPar` values are initial club-playtest budgets, not Lichess-derived par times. All are configurable in `MODES`. The chapter-9 rating (1961) is slightly above the boss rating (1881); puzzle length and narrative role also shape the order. Hints and `whyWrong` tips are authored bilingual teaching copy, not engine analysis of each possible mistake; extend these after visitor testing.

Run `npm run validate-puzzles` after changing any pool. It validates all 36 records and the chapter-7 White knight tactic as well as the rating and mate limits from config. Alternative legal checkmates remain accepted at runtime.
