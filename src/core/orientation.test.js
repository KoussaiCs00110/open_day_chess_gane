import {it,expect} from 'vitest';
import {orientPuzzleForWhite} from './orientation.js';
import {chapterPuzzle} from '../data/pools.js';
import {validatePuzzle} from './puzzle.js';
it('retains the original source and produces the same legal White boss mate in three',()=>{
 const boss=chapterPuzzle('hardcore',10),adapted=orientPuzzleForWhite({fen:boss.sourceFen,moves:boss.sourceMoves});
 expect(adapted.fen).toBe(boss.fen);expect(adapted.moves).toEqual(boss.moves);expect(validatePuzzle(boss).valid).toBe(true);expect(boss.rating).toBe(1881);
});
it('rank reflection exchanges castling rights, en-passant ranks and preserves promotions',()=>{
 const p=orientPuzzleForWhite({fen:'r3k2r/8/8/8/3Pp3/8/8/R3K2R w Kq e6 3 20',moves:['a7a8q','h2h1n']});
 expect(p.fen.split(' ').slice(1)).toEqual(['b','Qk','e3','3','20']);expect(p.moves).toEqual(['a2a1q','h7h8n']);
});
it('already White-to-solve Lichess positions stay unchanged',()=>{
 const p=chapterPuzzle('normal',1);expect(orientPuzzleForWhite(p)).toBe(p);
});
