import {it,expect} from 'vitest';
import story from '../screens/intro.js';
import {createSession} from './game.js';
import chapters from '../data/chapters.json';
import dialogue from '../data/dialogue.json';
import dictionary from '../data/i18n.json';
const scenes=import.meta.glob('../anim/cutscenes/*.json',{eager:true,import:'default'});
for(const lang of ['en','ar'])for(const difficulty of ['easy','normal','hardcore'])it(`${lang} ${difficulty}: every scene contains its complete animated cast`,()=>{
 const cases=[['INTRO','intro',1],...chapters.map(ch=>['SCENE','chapter-'+ch.id,ch.id]),['REACTION','reaction',1],['REACTION','mistake',1],['WIN','win',10],['LOSE','lose',1],['WIN','win-hardcore',10],['REACTION','reaction-hardcore',1]];
 for(const [screen,name,chapter] of cases){
  const c={screen,lang,session:{...createSession('Alice','cast',difficulty),chapter},chapter:chapters[chapter-1],chapterText:dialogue[lang].chapters[chapter],payload:{wrong:name==='mistake'},t:key=>dictionary[lang][key]??key,number:String};
  const html=story(c),scene=scenes['../anim/cutscenes/'+name+'.json'];
  for(const step of scene.steps)if(step.actor)expect(html,name+' needs '+step.actor).toContain('data-character="'+step.actor+'"');
 }
});
