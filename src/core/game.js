import { CONFIG } from '../config.js';
import { beginPuzzle,attemptMove,resetAttempt,reply,solutionArrow } from './puzzle.js';
import { puzzlePoints } from './scoring.js';
import { modeRules, parTime } from './modes.js';
export function createSession(name,id,difficulty='normal'){
 const rules=modeRules(difficulty);
 return {id,name,difficulty:rules.id,modeLocked:false,chapter:1,score:0,lives:rules.lives,mistakes:0,elapsed:0,puzzleElapsed:0,puzzleMistakes:0,hintsRemaining:rules.hints.count,hintsUsed:0,hintStage:0,powers:{drink:rules.powers.drink,eat:rules.powers.eat},freezeRemaining:0,solved:[],secretFound:false,secretSolved:false,bonusReturn:null,mode:'tutorial',attempt:null,phase:'INTRO',remaining:null,lossReason:null};
}
export function selectMode(state,difficulty){
 if(state.modeLocked)return state;
 return createSession(state.name,state.id,difficulty);
}
export function loadPuzzle(state,puzzle,mode='chapter'){
 const next={...state,mode,modeLocked:true,attempt:beginPuzzle(puzzle),puzzleId:puzzle.id,puzzleElapsed:0,puzzleMistakes:0,hintStage:0,phase:'PUZZLE',lossReason:null};
 return {...next,remaining:mode==='tutorial'?null:parTime(next)};
}
export function makeMove(state,from,to,promotion){
 if(state.phase!=='PUZZLE'||state.lives<=0)return {state,event:'blocked'};
 const result=attemptMove(state.attempt,from,to,promotion),rules=modeRules(state);
 if(['illegal','blocked','promotion'].includes(result.event))return {state,...result};
 if(result.event==='wrong'){
  const scored=state.mode==='chapter',cost=scored?rules.lifeCost:state.mode==='bonus'?rules.secret.lifeCost:0;
  const lives=cost?Math.max(0,state.lives-cost):state.lives;
  const terminal=cost>0&&rules.wrong.instantLose;
  return {event:'wrong',move:result.move,state:{...state,lives:terminal?0:lives,mistakes:state.mistakes+(cost>0?1:0),puzzleMistakes:state.puzzleMistakes+1,attempt:rules.wrong.reset?resetAttempt(state.attempt):state.attempt,phase:terminal||lives===0?'LOSE':'PUZZLE',lossReason:terminal||lives===0?'mistake':null}};
 }
 let next={...state,attempt:result.attempt};
 if(result.event==='solved'){
  if(state.mode==='chapter'){const points=puzzlePoints(state.chapter,state.puzzleElapsed,state.puzzleMistakes,state.difficulty);next={...next,score:state.score+points,solved:[...state.solved,state.chapter],phase:'REACTION'};result.points=points;}
  if(state.mode==='bonus'){const points=Math.round(rules.scoring.secretBonus*rules.scoring.multiplier);next={...next,score:state.score+points,secretSolved:true,phase:'REACTION'};result.points=points;}
  if(state.mode==='tutorial')next.phase='REACTION';
 }
 return {...result,state:next};
}
export const autoReply=state=>state.phase==='PUZZLE'&&state.attempt?.status==='reply'?{...state,attempt:reply(state.attempt)}:state;
export function useHint(state){
 const rules=modeRules(state);
 if(state.phase!=='PUZZLE'||state.mode==='tutorial'||state.attempt?.status!=='ready')return {state,event:'blocked'};
 if(rules.hints.behavior==='taunt')return {state,event:'taunt'};
 if(state.hintsRemaining<=0||state.hintStage>=rules.hints.maxStage)return {state,event:'blocked'};
 const stage=state.hintStage+1;
 return {state:{...state,hintStage:stage,hintsRemaining:state.hintsRemaining-1,hintsUsed:state.hintsUsed+1,score:state.score-Math.round(rules.hints.pointPenalty*rules.scoring.multiplier),elapsed:state.elapsed+rules.hints.timePenalty,puzzleElapsed:state.puzzleElapsed+rules.hints.timePenalty},event:'hint',stage,arrow:solutionArrow(state.attempt)};
}
export function autoHint(state,inactiveSeconds){
 const seconds=modeRules(state).hints.autoAfterSeconds;
 if(!seconds||inactiveSeconds<seconds||state.phase!=='PUZZLE'||state.attempt?.status!=='ready')return null;
 return {orig:solutionArrow(state.attempt).orig,brush:'gold'};
}
export function usePower(state,power){
 if(state.phase!=='PUZZLE'||!state.powers[power]||state.mode==='tutorial'||state.attempt?.status!=='ready')return {state,event:'blocked'};
 return {state:{...state,powers:{...state.powers,[power]:state.powers[power]-1},freezeRemaining:power==='eat'?modeRules(state).powers.freezeSeconds:state.freezeRemaining},event:power,arrow:solutionArrow(state.attempt)};
}
export function advanceChapter(state){
 if(state.phase!=='REACTION')return state;
 if(state.mode==='bonus')return returnFromBonus(state);
 if(state.mode==='tutorial')return {...state,mode:'chapter',phase:'MAP'};
 if(state.solved.length>=CONFIG.chapterCount)return {...state,phase:'WIN'};
 return {...state,chapter:state.chapter+1,phase:'MAP'};
}
export function enterBonus(state,puzzle){
 if(!modeRules(state).secret.enabled||state.phase!=='PUZZLE'||state.attempt?.status!=='ready'||state.chapter!==CONFIG.secretChapter||state.secretFound||state.mode!=='chapter')return state;
 return loadPuzzle({...state,secretFound:true,bonusReturn:{attempt:state.attempt,puzzleId:state.puzzleId,puzzleElapsed:state.puzzleElapsed,puzzleMistakes:state.puzzleMistakes,hintStage:state.hintStage,remaining:state.remaining}},puzzle,'bonus');
}
export function returnFromBonus(state){return state.bonusReturn?{...state,...state.bonusReturn,bonusReturn:null,mode:'chapter',phase:'PUZZLE'}:state;}
