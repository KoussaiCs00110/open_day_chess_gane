import {describe,it,expect} from 'vitest';
import puzzles from '../data/puzzles.json';
import {CONFIG} from '../config.js';
import {position,uci} from './chess.js';
import {validatePuzzle,beginPuzzle,attemptMove,reply,solutionArrow} from './puzzle.js';
import {createSession,loadPuzzle,makeMove,autoReply,useHint,usePower,advanceChapter,enterBonus,returnFromBonus} from './game.js';
import {advanceTimer} from './timer.js';
import {puzzlePoints,badges} from './scoring.js';
import {validateName} from './names.js';
const chapter=n=>puzzles.find(p=>p.chapter===n);
const start=n=>loadPuzzle({...createSession('Alice','test-id'),chapter:n},chapter(n));
const solve=s=>{while(s.attempt.status!=='solved'){const move=s.attempt.moves[s.attempt.index];const r=makeMove(s,move.slice(0,2),move.slice(2,4),move[4]);s=r.state;if(s.attempt.status==='reply')s=autoReply(s);}return s;};
describe('all sourced puzzles',()=>{for(const puzzle of puzzles){it(`${puzzle.id} has legal setup and a full legal White solution`,()=>{expect(validatePuzzle(puzzle)).toEqual({valid:true,errors:[]});const a=beginPuzzle(puzzle);expect(position(a.fen).turn()).toBe('w');expect(solve(loadPuzzle(createSession('Alice','x'),puzzle)).attempt.status).toBe('solved');});}
 it('rejects malformed FEN, illegal setup, and fake checkmate',()=>{expect(validatePuzzle({...chapter(1),fen:'bad'}).valid).toBe(false);expect(validatePuzzle({...chapter(1),moves:['a1a8','f1f8']}).valid).toBe(false);expect(validatePuzzle({...chapter(2),theme:'mateIn1'}).valid).toBe(false);});
 it('contains ten chapters, tutorial, secret, unique IDs',()=>{expect(new Set(puzzles.map(p=>p.id)).size).toBe(12);expect(puzzles.filter(p=>Number.isInteger(p.chapter)&&p.chapter>0)).toHaveLength(10);});
});
describe('moves and promotion',()=>{
 it('silently ignores illegal and blocked moves',()=>{const s=start(1);expect(makeMove(s,'a1','h8').state).toBe(s);expect(attemptMove({...s.attempt,status:'reply'},'f1','f8').event).toBe('blocked');});
 it('a legal wrong move resets the position and costs exactly one cup',()=>{const s=start(1),wrong=position(s.attempt.fen).moves({verbose:true}).find(m=>uci(m)!==s.attempt.moves[1]&&!positionAfter(s.attempt.fen,m).in_checkmate());const r=makeMove(s,wrong.from,wrong.to,wrong.promotion);expect(r.event).toBe('wrong');expect(r.state.lives).toBe(2);expect(r.state.attempt.fen).toBe(s.attempt.fen);expect(s.lives).toBe(3);});
 it('terminal games reject further moves, hints and powers',()=>{const s={...start(1),phase:'LOSE',lives:0};expect(makeMove(s,'f1','f8').state).toBe(s);expect(useHint(s).event).toBe('blocked');expect(usePower(s,'drink').event).toBe('blocked');expect(advanceChapter(start(1))).toEqual(start(1));});
 it('three legal mistakes lose',()=>{let s=start(1);for(let i=0;i<3;i++){const wrong=position(s.attempt.fen).moves({verbose:true}).find(m=>uci(m)!==s.attempt.moves[1]&&!positionAfter(s.attempt.fen,m).in_checkmate());s=makeMove(s,wrong.from,wrong.to,wrong.promotion).state;}expect(s.lives).toBe(0);expect(s.phase).toBe('LOSE');});
 it('queues one automatic Black reply, never two',()=>{let s=start(6);const move=s.attempt.moves[1];s=makeMove(s,move.slice(0,2),move.slice(2,4)).state;expect(s.attempt.status).toBe('reply');s=autoReply(s);expect(s.attempt.status).toBe('ready');const a=autoReply(s);expect(a.attempt.fen).toBe(s.attempt.fen);});
 it('accepts an alternative legal checkmate',()=>{const attempt={id:'test',fen:'7k/5K2/6Q1/8/8/8/8/8 w - - 0 1',readyFen:'7k/5K2/6Q1/8/8/8/8/8 w - - 0 1',index:1,moves:['a8a7','g6g7'],status:'ready',played:[]};const mates=position(attempt.fen).moves({verbose:true}).filter(m=>positionAfter(attempt.fen,m).in_checkmate());expect(mates.length).toBeGreaterThan(1);const alt=mates.find(m=>uci(m)!==attempt.moves[1]);expect(attemptMove(attempt,alt.from,alt.to,alt.promotion).event).toBe('solved');});
 it('requires a promotion choice and supports all four legal choices',()=>{const p=chapter('bonus');let a=beginPuzzle(p);a=attemptMove(a,'c2','h7').attempt;a=reply(a);expect(attemptMove(a,'g7','g8').event).toBe('promotion');expect(attemptMove(a,'g7','g8').choices.sort()).toEqual(['b','n','q','r']);expect(attemptMove(a,'g7','g8','q').event).toBe('solved');});
});
function positionAfter(fen,move){const board=position(fen);board.move(move);return board;}
describe('timers, hints and scoring',()=>{
 it('pauses all story phases and explicit transitions',()=>{const s=start(1);for(const phase of ['START','MAP','SCENE','REACTION','WIN','LOSE','RESULT'])expect(advanceTimer({...s,phase},10).elapsed).toBe(0);expect(advanceTimer(s,10,true).elapsed).toBe(0);});
 it('never scores or times the tutorial and never loses its lives',()=>{const s=loadPuzzle(createSession('Alice','x'),chapter(0),'tutorial');expect(advanceTimer(s,10).elapsed).toBe(0);expect(solve(s).score).toBe(0);});
 it('Eat Me freezes exactly 15 seconds including a boundary-crossing tick',()=>{let s=usePower(start(1),'eat').state;s=advanceTimer(s,17);expect(s.elapsed).toBe(2);expect(s.freezeRemaining).toBe(0);expect(usePower(s,'eat').event).toBe('blocked');});
 it('each hint costs exactly config points and time; only two levels per puzzle',()=>{let s=start(1);const first=useHint(s);expect(first.stage).toBe(1);s=first.state;expect(s.elapsed).toBe(CONFIG.hintSeconds);expect(s.score).toBe(-CONFIG.hintPenalty);s=useHint(s).state;expect(s.hintStage).toBe(2);expect(s.hintsRemaining).toBe(1);expect(useHint(s).event).toBe('blocked');s=loadPuzzle(s,chapter(2));s=useHint(s).state;expect(s.hintsRemaining).toBe(0);expect(useHint(loadPuzzle(s,chapter(3))).event).toBe('blocked');});
 it('Drink Me returns the next White arrow only once',()=>{const s=start(1),r=usePower(s,'drink');expect(r.arrow).toEqual(solutionArrow(s.attempt));expect(usePower(r.state,'drink').event).toBe('blocked');});
 it('scoring respects chapter, time bonus, and no-mistake bonus',()=>{expect(puzzlePoints(2,10,0)).toBe(200+280+150);expect(puzzlePoints(2,200,1)).toBe(200);expect(solve(start(1)).score).toBe(550);});
});
describe('story progression and secret',()=>{
 it('solves ten chapters and enters the win finale',()=>{let s=createSession('Alice','x');for(let i=1;i<=10;i++){s=loadPuzzle({...s,chapter:i},chapter(i));s=advanceChapter(solve(s));}expect(s.phase).toBe('WIN');expect(s.solved).toHaveLength(10);expect(s.lives).toBe(3);});
 it('secret puzzle is only in chapter six, cannot cost a life, resumes exact main position',()=>{expect(enterBonus(start(1),chapter('bonus')).secretFound).toBe(false);const s=start(6),b=enterBonus(s,chapter('bonus'));expect(b.secretFound).toBe(true);const wrong=position(b.attempt.fen).moves({verbose:true}).find(m=>uci(m)!==b.attempt.moves[1]&&!positionAfter(b.attempt.fen,m).in_checkmate());const r=makeMove(b,wrong.from,wrong.to,wrong.promotion).state;expect(r.lives).toBe(3);const solved=solve(r);expect(solved.score).toBe(CONFIG.secretBonus);const restored=returnFromBonus(solved);expect(restored.attempt.fen).toBe(s.attempt.fen);expect(restored.mode).toBe('chapter');expect(restored.secretSolved).toBe(true);});
 it('badges reflect actual achievements',()=>{expect(badges({...start(1),solved:[1,2,3,4,5,6,7,8,9,10],secretFound:true})).toEqual(['noMistakes','speedrunner','noCat','secretBadge']);});
 it('names are required, capped, escaped by UI, and filter both languages',()=>{expect(validateName(' Alice ').name).toBe('Alice');for(const name of ['', 'x'.repeat(16),'f.u.c.k','قَحبة'])expect(validateName(name).valid).toBe(false);});
});
