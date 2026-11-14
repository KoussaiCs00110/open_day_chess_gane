import {it,expect} from 'vitest';
import dictionary from '../data/i18n.json';
import dialogue from '../data/dialogue.json';
import chapters from '../data/chapters.json';
import puzzles from '../data/puzzles.json';
import {createSession,loadPuzzle} from './game.js';
import {FLOW,changeScreen} from './state.js';
import {piece,character,background,hero} from '../assets/svg/art.js';
import {LocalLeaderboard} from '../storage/leaderboard.js';
const modules=import.meta.glob('../screens/*.js',{eager:true});
for(const lang of ['en','ar'])for(const [file,screen] of [['start','START'],['name','NAME'],['mode','MODE'],['intro','INTRO'],['intro','SCENE'],['intro','REACTION'],['intro','WIN'],['intro','LOSE'],['map','MAP'],['puzzle','TUTORIAL'],['puzzle','PUZZLE'],['result','RESULT'],['leaderboard','LEADERBOARD'],['admin','ADMIN'],['transitions-test','TEST']]){
 it(`${screen} renders completely in ${lang}`,()=>{
  const c={screen,lang,name:'Alice',t:key=>dictionary[lang][key]??dictionary.en[key]??key,number:String,session:loadPuzzle(createSession('Alice','test'),puzzles.find(p=>p.chapter===1)),chapter:chapters[0],chapterText:dialogue[lang].chapters['1'],puzzle:puzzles[1],payload:{},previousChapter:1,rank:1,board:new LocalLeaderboard({getItem:()=>null}),manager:{speed:1,lastDuration:0},pin:'',idleSeconds:60};
  const html=modules[`../screens/${file}.js`].default(c);expect(html).toContain('<section');expect(html).not.toContain('undefined');expect(html).not.toContain('NaN');
 });
}
it('dictionaries are complete and have identical keys',()=>expect(Object.keys(dictionary.en).sort()).toEqual(Object.keys(dictionary.ar).sort()));
it('all ten chapter stories have bilingual intro, success and failure',()=>{for(const lang of ['en','ar'])for(let i=1;i<=10;i++){const c=dialogue[lang].chapters[i];expect(c.intro.length).toBeGreaterThanOrEqual(2);expect(c.title.length).toBeGreaterThan(2);expect(c.success.length).toBeGreaterThan(2);expect(c.failure.length).toBeGreaterThan(2);}});
it('the complete success and recovery paths are valid',()=>{const chain=['START','NAME','MODE','INTRO','TUTORIAL','REACTION','MAP','SCENE','PUZZLE','REACTION','PUZZLE','REACTION','MAP','SCENE','PUZZLE','LOSE','RESULT','LEADERBOARD','START'];for(let i=1;i<chain.length;i++)expect(changeScreen(chain[i-1],chain[i])).toBe(chain[i]);expect(changeScreen('REACTION','WIN')).toBe('WIN');expect(changeScreen('WIN','RESULT')).toBe('RESULT');expect(()=>changeScreen('START','WIN')).toThrow();});
it('every piece has a distinct role and side, suit, rank and layered rig',()=>{const sources=new Set();for(const color of ['white','black'])for(const role of ['pawn','rook','knight','bishop','queen','king']){const art=piece(role,color);sources.add(art);expect(art).toContain('piece-rig');expect(art).toContain('piece-eyes');expect(art).toContain(color==='white'?'#faf1d9':'#f4d4c3');expect(art).toMatch(/[♠♣♥♦]/);}expect(sources.size).toBe(12);});
it('large characters have independent eyes, mouth and body layers',()=>{for(const id of ['alice','whiteQueen','redQueen','cat','rabbit','hare','hatter','humpty','caterpillar','tweedles','flowers','knight','jabberwock']){const art=character(id);expect(art).toContain('class="eyes"');expect(art).toContain('class="mouth"');expect(art).toContain('class="body"');expect(art).toContain('character-rig');}});
it('each background has three parallax layers; no external artwork URLs',()=>{for(const theme of ['garden','tea','forest','castle','sky']){const art=background(theme);for(const layer of ['far','mid','near'])expect(art).toContain('parallax '+layer);expect(art).not.toMatch(/(?:href|src)="https?:/);}expect(hero()).not.toContain('<image');});
it('result names are HTML escaped',()=>{const c={session:createSession('<img src=x onerror=1>','x'),lang:'en',rank:1,t:k=>dictionary.en[k]??k,number:String};const html=modules['../screens/result.js'].default(c);expect(html).not.toContain('<img src=x');expect(html).toContain('&lt;img');});
