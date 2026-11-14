import { CONFIG } from '../config.js';
import { modeRules } from './modes.js';
// Normal is the original formula; modes supply coefficients and a final multiplier.
export function puzzlePoints(chapter,seconds,mistakes,difficulty='normal') {
 const score=modeRules(difficulty).scoring;
 return Math.round((score.chapterPoints*chapter+Math.max(0,score.timeBonus-Math.floor(seconds*score.timeBonusPerSecond))+(mistakes===0?score.perfectBonus:0))*score.multiplier);
}
export function badges(state){
 const rules=modeRules(state),won=state.solved.length===CONFIG.chapterCount;
 const earned=[state.mistakes===0&&'noMistakes',won&&state.elapsed<=CONFIG.speedrunnerSeconds&&'speedrunner',state.hintsUsed===0&&'noCat',state.secretFound&&'secretBadge',won&&rules.badges.exclusive.includes('offWithWhoseHead')&&'offWithWhoseHead',won&&state.mistakes===0&&rules.badges.exclusive.includes('flawlessQueen')&&'flawlessQueen'].filter(Boolean);
 return earned.filter(badge=>!rules.badges.excluded.includes(badge));
}
