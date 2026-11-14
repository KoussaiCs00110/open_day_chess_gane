import easy from './puzzles.easy.json' with {type:'json'};
import normal from './puzzles.normal.json' with {type:'json'};
import hardcore from './puzzles.hardcore.json' with {type:'json'};
import {MODES} from '../config.js';
import { modeRules } from '../core/modes.js';
const files={'puzzles.easy.json':easy,'puzzles.normal.json':normal,'puzzles.hardcore.json':hardcore};
export const POOLS=Object.fromEntries(Object.values(MODES).map(r=>[r.id,files[r.poolFile]]));
export const puzzlePool = difficulty => POOLS[modeRules(difficulty).id];
export const chapterPuzzle = (difficulty,chapter) => puzzlePool(difficulty).find(puzzle=>puzzle.chapter===chapter);
