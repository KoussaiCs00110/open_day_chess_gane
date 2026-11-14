import eventLogo from '../assets/svg/event-logo.svg?raw';
import { modeRules, isCountdown } from '../core/modes.js';
import { modeBadge } from './mode-ui.js';
import { CONFIG } from '../config.js';
import { cup,clock,character,piece } from '../assets/svg/art.js';
import {formatTime} from '../core/timer.js';
export const esc=value=>String(value??'').replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
export const button=(text,action,cls='',attrs='')=>`<button class="button ${cls}" data-action="${action}" ${attrs}>${text}</button>`;
export const eyebrow=text=>`<div class="eyebrow"><i>✦</i><span>${text}</span><i>✦</i></div>`;
export const brand=c=>`<div class="brand event-brand"><span class="event-logo" role="img" aria-label="${esc(c.t('eventLogo'))}">${eventLogo}</span><span class="brand-copy">${esc(c.lang==='ar'?CONFIG.clubNameAr:CONFIG.clubName)}</span></div>`;
export const back=c=>button(`← <span>${c.t('back')}</span>`,'back','back-button quiet');
export const frame=(c,body,cls='')=>`<section class="page ${cls}"><header class="page-header">${back(c)}${brand(c)}</header>${body}</section>`;
export const cups=(count,t,difficulty='normal')=>{
 const rules=modeRules(difficulty);
 return `<div class="lives lives-${rules.id}" aria-label="${t('lives')}: ${Math[rules.roundLives](count)}">${Array.from({length:rules.lives},(_,i)=>{const fill=Math.max(0,Math.min(1,count-i));return `<span data-flip-id="life-${i}" class="life-cup ${fill===0?'broken':fill<1?'half-cracked':''}" aria-label="${fill} ${t('modeCups')}">${cup(null,fill<1)}${count===0&&i===rules.lives-1?'<i class="cup-shard" data-flip-id="cup-shard">◭</i>':''}</span>`;}).join('')}</div>`;
};
export const hud=c=>`<header class="game-hud"><div class="hud-player"><span class="hud-suit">♠</span><div><small>${c.t('ready')}</small><div class="hud-identity"><strong>${esc(c.session.name)}</strong>${modeBadge(c.session.difficulty??'normal',c.t)}</div></div></div><div class="hud-score"><small>${c.t('score')}</small><strong id="score" data-flip-id="score">${c.number(c.session.score)}</strong></div><div class="watch ${c.session.freezeRemaining>0?'frozen':''} ${isCountdown(c.session)?'countdown-watch':''}">${clock(isCountdown(c.session)?'hardcore':'')}<div><small>${c.t(isCountdown(c.session)?'timeLeft':'time')}</small><strong id="timer">${formatTime(isCountdown(c.session)?Math.ceil(c.session.remaining):c.session.elapsed)}</strong></div><span class="freeze-clock" id="freeze-clock">❄</span>${isCountdown(c.session)?'<div class="timer-fuse"><span id="timer-fuse-fill"></span><i>✦</i></div>':''}</div>${cups(c.session.lives,c.t,c.session.difficulty)}</header>`;
export const actor=(id,side='left',extra='',variant='')=>`<div class="actor actor-${side} ${id}" data-character="${id}">${character(id,variant)}${id==='alice'?'<div class="alice-crown">♛</div>':''}${extra}<div class="speech-bubble" data-bubble="${id}"><span class="speech-text"></span></div></div>`;
export const objective=(p,t)=>{const key=['mateIn1','mateIn2','mateIn3','mateIn4','discoveredAttack','fork','pin','hangingPiece'].find(k=>p.theme.includes(k))||'tactic';return t(key);};
