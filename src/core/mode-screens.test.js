import {it,expect} from 'vitest';
import {MODES} from '../config.js';
import {createSession,loadPuzzle,makeMove,autoReply,advanceChapter,enterBonus} from './game.js';
import {chapterPuzzle} from '../data/pools.js';
import {puzzlePoints} from './scoring.js';
import dictionary from '../data/i18n.json';
import dialogue from '../data/dialogue.json';
import chapters from '../data/chapters.json';
import {LocalLeaderboard} from '../storage/leaderboard.js';
import modeScreen from '../screens/mode.js';
import puzzleScreen from '../screens/puzzle.js';
import leaderboard from '../screens/leaderboard.js';
import admin from '../screens/admin.js';
import result from '../screens/result.js';
import {cups} from '../screens/ui.js';
function controller(mode,lang='en'){
 const session=loadPuzzle(createSession('Alice',mode,mode),chapterPuzzle(mode,1));
 return{session,screen:'PUZZLE',lang,t:key=>dictionary[lang][key]??key,number:String,chapter:chapters[0],chapterText:dialogue[lang].chapters[1],puzzle:chapterPuzzle(mode,1),board:new LocalLeaderboard({getItem:()=>null,setItem:()=>{}}),rank:1,pin:'',adminUnlocked:true,idleSeconds:60,hardcoreEnabled:true,boardMode:mode,adminMode:mode};
}
function solve(state){
 for(let ply=0;ply<30&&state.phase==='PUZZLE';ply++){
  const move=state.attempt.moves[state.attempt.index];
  if(state.attempt.status==='reply'){state=autoReply(state);continue;}
  const answer=makeMove(state,move.slice(0,2),move.slice(2,4),move[4]);
  expect(['correct','solved']).toContain(answer.event);state=answer.state;
 }
 expect(state.phase).toBe('REACTION');return state;
}
for(const mode of Object.keys(MODES))it(`${mode}: tutorial, all ten chapters, secret restoration and victory use their own pool`,()=>{
 let s=loadPuzzle(createSession('Alice',mode,mode),chapterPuzzle(mode,0),'tutorial');
 s=advanceChapter(solve(s));expect(s.score).toBe(0);let points=0;
 for(let chapter=1;chapter<=10;chapter++){
  s=loadPuzzle(s,chapterPuzzle(mode,chapter));
  if(chapter===6){const original=s.attempt.fen;s=enterBonus(s,chapterPuzzle(mode,'bonus'));s=advanceChapter(solve(s));points+=Math.round(MODES[mode].scoring.secretBonus*MODES[mode].scoring.multiplier);expect(s.mode).toBe('chapter');expect(s.attempt.fen).toBe(original);}
  s=solve(s);points+=puzzlePoints(chapter,0,0,mode);expect(s.score).toBe(points);s=advanceChapter(s);
 }
 expect(s.phase).toBe('WIN');expect(s.solved).toHaveLength(10);expect(s.lives).toBe(MODES[mode].lives);
});
for(const lang of ['en','ar'])for(const mode of Object.keys(MODES)){
 it(`${mode} screens expose the correct controls and localized mode in ${lang}`,()=>{
  const c=controller(mode,lang),rules=MODES[mode],html=puzzleScreen(c);
  expect(html).toContain(c.t(rules.nameKey));expect(html.match(/class="life-cup /g)).toHaveLength(rules.lives);
  expect(html.includes('data-action="drink"')).toBe(Boolean(rules.powers.drink));expect(html.includes('data-action="eat"')).toBe(Boolean(rules.powers.eat));
  expect(html.includes('id="timer-fuse-fill"')).toBe(rules.timer.type==='countdown');
  if(rules.presentation.queenAlwaysVisible)expect(html).toContain('actor-right redQueen');
  for(const render of [modeScreen,leaderboard,admin,result]){
   const output=render(c);expect(output).not.toMatch(/undefined|NaN/);expect(output).toContain('<section');
  }
  expect(leaderboard(c).match(/data-action="board-mode"/g)).toHaveLength(4);
  expect(admin(c).match(/data-action="admin-mode"/g)).toHaveLength(3);
 });
}
it('mode cards show all configured supplies, ratings, multipliers and the disabled Hardcore action',()=>{
 const c=controller('normal');c.hardcoreEnabled=false;const html=modeScreen(c);
 for(const mode of Object.keys(MODES)){const rules=MODES[mode];expect(html).toContain('data-mode-card="'+mode+'"');expect(html).toContain('×'+rules.scoring.multiplier);expect(html).toContain(rules.rating.min+'–'+rules.rating.max);}
 expect(html).toMatch(/data-action="choose-mode"[^>]*data-mode="hardcore" disabled/);
});
it('Easy renders exact half damage while rounding the visible lives count upward',()=>{
 const html=cups(4.5,key=>key,'easy');expect(html).toContain('lives: 5');expect(html.match(/half-cracked/g)).toHaveLength(1);expect(html).toContain('0.5 modeCups');
});
