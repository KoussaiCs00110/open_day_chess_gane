import { modeRules, isCountdown } from './modes.js';

/** Story/transition pauses are authoritative; optional kiosk pauses are mode rules. */
export function timerPaused(state, context = false) {
 if (state.phase !== 'PUZZLE' || state.mode === 'tutorial' || state.attempt?.status === 'solved') return true;
 if (typeof context === 'boolean') return context;
 if (context.transition || context.cutscene) return true;
 return modeRules(state).timer.pausePolicy === 'standard' && Boolean(context.paused || context.hidden || context.loading || context.moveBusy);
}
export function advanceTimer(state, delta, context = false) {
 if (timerPaused(state, context)) return state;
 const dt = Math.max(0, Number.isFinite(delta) ? delta : 0);
 const frozen = Math.min(dt, state.freezeRemaining), elapsed = dt - frozen;
 const next = {...state,freezeRemaining:Math.max(0,state.freezeRemaining-dt),elapsed:state.elapsed+elapsed,puzzleElapsed:state.puzzleElapsed+elapsed};
 if (isCountdown(state)) next.remaining = Math.max(0, state.remaining - elapsed);
 return next;
}
/** Resolve after the frame's move: a mate at zero time has precedence over loss. */
export function checkTimeout(state) {
 if (!isCountdown(state) || !modeRules(state).timer.timeoutLoses || state.phase !== 'PUZZLE' || state.attempt?.status === 'solved' || state.remaining > 0) return state;
 return {...state,lives:0,mistakes:state.mistakes+1,puzzleMistakes:state.puzzleMistakes+1,phase:'LOSE',lossReason:'timeout'};
}
export function advanceFrame(state, delta, {context=false,move=null,applyMove}={}) {
 if(timerPaused(state,context))return state;
 const timed = advanceTimer(state,delta,context);
 const moved = move && applyMove ? applyMove(timed, ...move).state : timed;
 return checkTimeout(moved);
}
export const formatTime=seconds=>`${Math.floor(Math.max(0,seconds)/60).toString().padStart(2,'0')}:${Math.floor(Math.max(0,seconds)%60).toString().padStart(2,'0')}`;
