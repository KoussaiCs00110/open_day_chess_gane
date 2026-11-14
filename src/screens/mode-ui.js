import { MODES } from '../config.js';
import { modeRules } from '../core/modes.js';
const esc=value=>String(value).replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
const button=(text,action,cls,attrs)=>`<button class="button ${cls}" data-action="${action}" ${attrs}>${text}</button>`;
export function modeIcon(mode){
 const rules=modeRules(mode),art={
  rabbit:'<path d="M10 15C2 1 10-2 14 13M19 13C20-3 28 0 23 16" fill="#f5edd7" stroke="#385b4b" stroke-width="2"/><ellipse cx="17" cy="22" rx="12" ry="10" fill="#f5edd7" stroke="#385b4b" stroke-width="2"/><path d="M12 21h1m8 0h1m-6 4h2" stroke="#385b4b" stroke-width="2.5" stroke-linecap="round"/>',
  cat:'<path d="M6 17 4 5l10 8h7l10-8-2 14q4 14-12 15Q1 31 6 17Z" fill="#b4a0b7" stroke="#554c64" stroke-width="2"/><path d="M9 21q9 11 18 0-2 13-9 12T9 21Z" fill="#fbefd0" stroke="#554c64"/><path d="M10 17h3m9 0h3" stroke="#554c64" stroke-width="2"/>',
  crown:'<path d="m3 10 7 6 8-12 8 12 7-6-4 20H7Z" fill="#b73646" stroke="#a88335" stroke-width="2"/><path d="M9 27h18" stroke="#efce7b" stroke-width="2"/>',
 }[rules.icon];
 return `<svg class="mode-icon" viewBox="0 0 36 36" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">${art}</svg>`;
}
export const modeBadge=(mode,t)=>{const rules=modeRules(mode);return `<span class="mode-badge badge-${rules.id}" title="${esc(t(rules.titleKey))}" aria-label="${esc(t(rules.nameKey))}">${modeIcon(rules.id)}<span class="mode-name">${t(rules.nameKey)}</span></span>`;};
export function modeTabs(c,action,selected='normal',all=false){
 return `<div class="mode-tabs" role="group" aria-label="${c.t('modeBoards')}">${Object.values(MODES).map(r=>button(`${modeIcon(r.id)}<span>${c.t(r.nameKey)}</span>`,action,'mode-tab '+(selected===r.id?'active':''),`data-mode="${r.id}" aria-pressed="${selected===r.id}"`)).join('')}${all?button(c.t('allModes'),action,'mode-tab '+(selected==='all'?'active':''),'data-mode="all" aria-pressed="'+(selected==='all')+'"'):''}</div>`;
}

export function hintCostLabel(mode,t,number=String){const r=modeRules(mode);return r.hints.pointPenalty||r.hints.timePenalty?t('hintPenaltyLabel').replace('{seconds}',number(r.hints.timePenalty)).replace('{points}',number(Math.round(r.hints.pointPenalty*r.scoring.multiplier))):t('freeHints');}
