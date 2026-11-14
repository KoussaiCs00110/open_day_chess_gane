import { MODES } from '../config.js';
export const DEFAULT_MODE = 'normal';
export function modeRules(value = DEFAULT_MODE) {
  const id = typeof value === 'string' ? value : value?.difficulty ?? DEFAULT_MODE;
  if (!Object.hasOwn(MODES, id)) throw new RangeError('Unknown difficulty: ' + id);
  return MODES[id];
}
export const normalizedScore = entry => entry.score / modeRules(entry.mode ?? DEFAULT_MODE).scoring.multiplier;
export const shownLives = state => Math[modeRules(state).roundLives](state.lives);
export const isCountdown = state => modeRules(state).timer.type === 'countdown' && state.mode !== 'tutorial' && (state.mode !== 'bonus' || modeRules(state).secret.timed);
export const parTime = state => {
  const timer = modeRules(state).timer;
  return (state.mode === 'bonus' ? timer.bonusPar : timer.parSeconds[state.chapter - 1]) * timer.parFactor;
};
