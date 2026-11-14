import { position, play, uci } from './chess.js';
export function validatePuzzle(puzzle) {
 const errors=[];
 try {
  const board=position(puzzle.fen),pieces=board.board().flat().filter(Boolean);
  for(const color of ['w','b'])if(pieces.filter(p=>p.color===color&&p.type==='k').length!==1)errors.push('Exactly one king per side is required');
  if(board.turn()!=='b')errors.push('The setup move must be Black');
  if(!Array.isArray(puzzle.moves)||puzzle.moves.length<2)errors.push('Missing setup/solution');
  for(const [index,move] of puzzle.moves.entries()){
   if(!/^[a-h][1-8][a-h][1-8][qrbn]?$/.test(move)){errors.push('Invalid UCI '+move);break;}
   if(index>0&&board.turn()!==(index%2?'w':'b'))errors.push('Unexpected side to move');
   if(!play(board,move)){errors.push('Illegal move '+move+' at ply '+index);break;}
   if(board.in_checkmate()&&index<puzzle.moves.length-1)errors.push('Solution continues after checkmate');
  }
  const mate=puzzle.theme.match(/mateIn([1-4])/);
  if(mate){if(!board.in_checkmate())errors.push('Mate solution does not end in checkmate');if(puzzle.moves.length!==Number(mate[1])*2)errors.push('Wrong mate length');if(board.turn()!=='b')errors.push('White must deliver the mate');}
 }catch(error){errors.push(error.message);}
 return {valid:errors.length===0,errors};
}
export function beginPuzzle(puzzle) {
 const board=position(puzzle.fen),setup=play(board,puzzle.moves[0]);
 if(!setup||board.turn()!=='w')throw new Error('Invalid puzzle setup '+puzzle.id);
 return {id:puzzle.id,fen:board.fen(),readyFen:board.fen(),index:1,moves:[...puzzle.moves],lastMove:[setup.from,setup.to],status:'ready',played:[]};
}
export function attemptMove(attempt,from,to,promotion) {
 if(attempt.status!=='ready')return {attempt,event:'blocked'};
 const board=position(attempt.fen),legal=board.moves({verbose:true}).filter(m=>m.from===from&&m.to===to);
 if(!legal.length)return {attempt,event:'illegal'};
 if(legal.some(m=>m.promotion)&&!promotion)return {attempt,event:'promotion',choices:legal.map(m=>m.promotion)};
 const move=play(board,{from,to,...(promotion?{promotion}:{})});
 if(!move)return {attempt,event:'illegal'};
 if(uci(move)!==attempt.moves[attempt.index]&&!board.in_checkmate())return {attempt,event:'wrong',move};
 const solved=board.in_checkmate()||attempt.index===attempt.moves.length-1;
 return {attempt:{...attempt,fen:board.fen(),index:attempt.index+1,lastMove:[from,to],status:solved?'solved':'reply',played:[...attempt.played,uci(move)]},event:solved?'solved':'correct',move};
}
export function reply(attempt) {
 if(attempt.status!=='reply')return attempt;
 const board=position(attempt.fen),move=play(board,attempt.moves[attempt.index]);
 if(!move)throw new Error('Invalid stored reply');
 return {...attempt,fen:board.fen(),index:attempt.index+1,lastMove:[move.from,move.to],status:'ready',played:[...attempt.played,uci(move)]};
}
export const resetAttempt = attempt => ({...attempt,fen:attempt.readyFen,index:1,lastMove:attempt.moves[0]?[attempt.moves[0].slice(0,2),attempt.moves[0].slice(2,4)]:null,status:'ready',played:[]});
export const solutionArrow = attempt => ({orig:attempt.moves[attempt.index]?.slice(0,2),dest:attempt.moves[attempt.index]?.slice(2,4),brush:'gold'});
