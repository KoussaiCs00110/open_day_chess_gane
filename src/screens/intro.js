import {modeRules} from '../core/modes.js';
import {frame,button,eyebrow,hud,actor} from './ui.js';
import {miniBoard,character,cup} from '../assets/svg/art.js';
export default function(c){
 const kind=c.screen,chapter=c.chapter,wrong=c.payload?.wrong;
 let cast,title,scene;
 if(kind==='INTRO'){cast=[['alice','left'],['whiteQueen','right']];title=c.t('introTitle');scene='intro';}
 else if(kind==='SCENE'){cast=modeRules(c.session).presentation.queenAlwaysVisible?[['alice','left'],[chapter.character,'center'],['redQueen','right']]:[['alice','left'],[chapter.character,'right']];title=c.chapterText.title;scene='chapter-'+chapter.id;}
 else if(kind==='WIN'){cast=[['whiteQueen','left'],['alice','center'],['redQueen','right']];title=c.t('victory');scene='win';}
 else if(kind==='LOSE'){cast=[['alice','left'],['cat','center'],['redQueen','right']];title=c.t('defeat');scene='lose';}
 else if(wrong){cast=[['cat','left'],['redQueen','right']];title=c.chapterText.failure;scene='mistake';}
 else{cast=[['whiteQueen','left'],['redQueen','right']];title=c.session.mode==='tutorial'?c.t('tutorialSuccess'):c.t('splendid');scene='reaction';}
 c.activeScene=scene;
 return `<section class="story-screen ${scene==='intro'?'intro-story':''} ${kind.toLowerCase()}-story" data-scene="${scene}">${hud(c)}<div class="story-heading">${eyebrow(kind==='SCENE'?`${c.t('chapter')} ${c.number(chapter.id)} / ${c.number(10)}`:c.t('edition'))}<h1>${title}</h1></div><div class="scene-stage" id="scene-stage"><div class="scene-camera"><div class="scene-board-floor">${miniBoard()}</div>${scene==='intro'?`<div class="story-mirror"><div>${character('alice')}</div></div>`:''}${cast.map(([id,side])=>actor(id,side,'',id==='redQueen'&&modeRules(c.session).presentation.queenAlwaysVisible?'hardcore':'')).join('')}${kind==='LOSE'?'<div class="lose-shard" data-flip-id="cup-shard">◭</div>':''}${kind==='SCENE'&&chapter.id===6?`<div class="actor cameo-hare" data-character="hare">${character('hare')}</div><div class="tea-table-prop">${cup()}</div>`:''}</div></div><footer class="scene-footer"><span>${c.t('hurry')}</span>${button(`${c.t('skip')} ↗`,'skip','outline')}</footer></section>`;
}
