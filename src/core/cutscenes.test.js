import {actor} from '../screens/ui.js';
import {it,expect} from 'vitest';
import dialogue from '../data/dialogue.json';
import {replacePart,character} from '../assets/svg/art.js';
import {transitionLabels,cues} from '../data/transitions.js';
const scenes=import.meta.glob('../anim/cutscenes/*.json',{eager:true,import:'default'});
it('contains intro, ten chapters, success/failure reactions, and both finales',()=>{for(const name of ['intro',...Array.from({length:10},(_,i)=>'chapter-'+(i+1)),'reaction','mistake','win','lose'])expect(scenes['../anim/cutscenes/'+name+'.json']).toBeTruthy();});
it('every scene uses supported steps and all spoken lines exist in both languages',()=>{const kinds=['enter','move','emote','say','shake','camera','sfx','wait','exit'];for(const scene of Object.values(scenes))for(const step of scene.steps){expect(kinds).toContain(step.type);if(step.type==='say'&&!['success','mistakeCat','mistakeQueen'].includes(step.key)){for(const lang of ['en','ar'])expect(step.key.split('.').reduce((v,k)=>v?.[k],dialogue[lang])).toBeTypeOf('string');}}});
it('registers precisely ten unique named effects with matching audio cues',()=>{expect(Object.keys(transitionLabels)).toHaveLength(10);expect(Object.keys(cues).sort()).toEqual(Object.keys(transitionLabels).sort());expect(new Set(Object.values(transitionLabels)).size).toBe(10);});
it('drop-in part replacements preserve the containing rig and sibling groups',()=>{const art=character('alice'),changed=replacePart(art,'eyes','<svg><circle id="new-eyes" cx="150" cy="108" r="5"/></svg>');expect(changed).toContain('id="new-eyes"');expect(changed).toContain('class="head"');expect(changed).toContain('class="mouth"');expect(changed).toContain('class="body"');expect(changed.match(/<svg/g)).toHaveLength(1);expect(replacePart(art,'absent','<svg/>')).toBe(art);});

it('every animated character part exists in its actual SVG or surrounding actor markup',()=>{
 for(const scene of Object.values(scenes))for(const step of scene.steps)if(step.part){const html=actor(step.actor),classes=[...html.matchAll(/class="([^"]*)"/g)].flatMap(m=>m[1].split(/\s+/));expect(classes,step.actor+' '+step.part).toContain(step.part.slice(1));}
});
