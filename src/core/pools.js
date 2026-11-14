import { CONFIG } from '../config.js';
import { modeRules } from './modes.js';
import {orientPuzzleForWhite} from './orientation.js';
import {position,play} from './chess.js';
import { validatePuzzle } from './puzzle.js';
export function validatePool(pool,difficulty){
 const rules=modeRules(difficulty),errors=[];
 if(pool.length!==CONFIG.chapterCount+2)errors.push('Expected ten chapters, tutorial and bonus');
 if(new Set(pool.map(p=>p.id)).size!==pool.length)errors.push('Duplicate puzzle IDs in pool');
 for(const chapter of [0,...Array.from({length:CONFIG.chapterCount},(_,i)=>i+1),'bonus'])if(pool.filter(p=>p.chapter===chapter).length!==1)errors.push('Missing or duplicate chapter '+chapter);
 for(const puzzle of pool){
  const failures=[...validatePuzzle(puzzle).errors];
  if(puzzle.orientation){try{const adapted=orientPuzzleForWhite({fen:puzzle.sourceFen,moves:puzzle.sourceMoves});if(adapted.fen!==puzzle.fen||JSON.stringify(adapted.moves)!==JSON.stringify(puzzle.moves))failures.push('Adapted position differs from recorded source');}catch{failures.push('Missing adapted-position provenance');}}
  if(!Number.isFinite(puzzle.rating)||puzzle.rating<rules.rating.min||puzzle.rating>rules.rating.max)failures.push('Rating outside '+rules.rating.min+'–'+rules.rating.max);
  if(!puzzle.modes?.includes(rules.id))failures.push('Missing modes tag');
  const mate=puzzle.theme.match(/mateIn(\d+)/);
  if(mate&&(Number(mate[1])<rules.mate.min||Number(mate[1])>rules.mate.max))failures.push('Mate length outside mode limits');
  const motif=typeof puzzle.chapter==='number'&&puzzle.chapter>0?rules.chapterThemes[puzzle.chapter-1]:null;
  if(motif&&!puzzle.theme.split(' ').includes(motif))failures.push('Chapter motif must include '+motif);
  if(puzzle.chapter===7&&!failures.length){const b=position(puzzle.fen),whiteRoles=puzzle.moves.map((m,i)=>{const move=play(b,m);return i%2===1?move?.piece:null;});if(!whiteRoles.includes('n'))failures.push('White Knight chapter must include a White knight tactic');}
  for(const locale of ['en','ar'])if(!puzzle.hint1?.[locale]||!puzzle.hint2?.[locale]||!puzzle.whyWrong?.[locale])failures.push('Missing '+locale+' hints/explanation');
  if(failures.length)errors.push(puzzle.id+': '+failures.join('; '));
 }
 return {valid:errors.length===0,errors};
}
