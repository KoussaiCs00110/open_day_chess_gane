import {it,expect,vi,afterEach} from 'vitest';
import {CutsceneEngine} from '../anim/cutscenes/engine.js';
import {gsap} from '../anim/easings.js';
import {CONFIG} from '../config.js';
const target=()=>({x:0,y:0,xPercent:0,yPercent:0,scale:1,rotation:0,opacity:1,clearProps:''});
function setup(low=false,presentation={}){
 const content={textContent:''},bubble={...target(),classList:{add:vi.fn(),remove:vi.fn()},querySelector:()=>content};
 const alice={...target(),querySelector:()=>target()},camera=target();
 const root={...target(),querySelector:s=>s.startsWith('[data-character')?alice:s.startsWith('[data-bubble')?bubble:camera,querySelectorAll:()=>[bubble]};
 const rig={emote:vi.fn(),talk:vi.fn(()=>gsap.to(target(),{scale:1.2,duration:.2}))};
 const onDone=vi.fn(),audio={cue:vi.fn()},particles={burst:vi.fn()};
 const engine=new CutsceneEngine({root,rigs:new Map([['alice',rig]]),text:()=> 'A curious new move.',audio,particles,low:()=>low,presentation,onDone});
 const scene={duration:'chapter',steps:[{type:'enter',actor:'alice',from:'left'},{type:'emote',actor:'alice',emotion:'happy'},{type:'say',actor:'alice',key:'line'},{type:'sfx',name:'move'},{type:'wait',duration:.2},{type:'exit',actor:'alice',to:'right'}]};
 return {engine,scene,onDone,rig,audio,content,bubble,alice,camera};
}
afterEach(()=>{gsap.globalTimeline.clear();gsap.ticker.sleep();});
it('skipping completes the narrative exactly once, including repeated taps',()=>{const s=setup();s.engine.play(s.scene);s.engine.skip();s.engine.skip();expect(s.onDone).toHaveBeenCalledTimes(1);expect(s.content.textContent).toBe('A curious new move.');expect(s.audio.cue).not.toHaveBeenCalled();expect(s.engine.finished).toBe(true);});
it('destroying a scene cancels completion and stops effects',()=>{const s=setup();s.engine.play(s.scene);s.engine.destroy();expect(s.onDone).not.toHaveBeenCalled();expect(s.engine.finished).toBe(true);expect(s.engine.timeline.isActive()).toBe(false);});
it('normal scenes last the configured length and hurry accelerates them',()=>{const s=setup();s.engine.play(s.scene);expect(s.engine.timeline.duration()/s.engine.timeline.timeScale()).toBeCloseTo(CONFIG.cutsceneSeconds);s.engine.hurry();expect(s.engine.timeline.timeScale()).toBeCloseTo(s.engine.baseSpeed*3);s.engine.skip();});
it('reduced-motion scenes shorten without changing the completion path',()=>{const s=setup(true);s.engine.play(s.scene);expect(s.engine.timeline.duration()/s.engine.timeline.timeScale()).toBeCloseTo(CONFIG.reducedSceneSeconds);s.engine.skip();expect(s.onDone).toHaveBeenCalledTimes(1);});

it('Hardcore chapters shorten by the mode factor, while its reaction has its own duration',()=>{const s=setup(false,{sceneFactor:.6,reactionSeconds:1.2});s.engine.play(s.scene);expect(s.engine.timeline.duration()/s.engine.timeline.timeScale()).toBeCloseTo(CONFIG.cutsceneSeconds*.6);s.engine.destroy();s.engine.finished=false;s.engine.play({...s.scene,duration:'reaction'});expect(s.engine.timeline.duration()/s.engine.timeline.timeScale()).toBeCloseTo(1.2);s.engine.skip();expect(s.onDone).toHaveBeenCalledTimes(1);});
it('a prepared cutscene stays hidden and paused until its transition reveals it',()=>{
 const s=setup();s.engine.play(s.scene,{paused:true});expect(s.engine.timeline.paused()).toBe(true);expect(s.engine.finished).toBe(false);s.engine.start();expect(s.engine.timeline.paused()).toBe(false);s.engine.skip();expect(s.onDone).toHaveBeenCalledTimes(1);
});
it('pause, hurry and resume apply to the dialogue and its independent lip motion',()=>{
 const s=setup();s.engine.play(s.scene);s.engine.timeline.time(.7);expect(s.engine.effects.length).toBeGreaterThan(0);s.engine.pause();expect(s.engine.timeline.paused()).toBe(true);expect(s.engine.effects.every(t=>t.paused())).toBe(true);s.engine.hurry();s.engine.resume();expect(s.engine.timeline.paused()).toBe(false);expect(s.engine.effects.every(t=>!t.paused())).toBe(true);s.engine.destroy();expect(s.onDone).not.toHaveBeenCalled();
});
it('a late entrance such as the crown cannot flash or jump into position during construction',()=>{
 const crown={...target(),scale:0},alice={...target(),querySelector:()=>crown},root={querySelector:()=>alice,querySelectorAll:()=>[]};
 const engine=new CutsceneEngine({root,rigs:new Map(),text:()=>'',audio:{cue:vi.fn()},particles:{burst:vi.fn()},low:()=>false,onDone:vi.fn()});
 engine.play({duration:'win',steps:[{type:'enter',actor:'alice'},{type:'wait',duration:2},{type:'enter',actor:'alice',part:'.alice-crown',from:'above'}]},{paused:true});expect(crown.opacity).toBe(0);expect(crown.scale).toBe(0);engine.timeline.time(.7);expect(alice.opacity).toBe(1);expect(crown.opacity).toBe(0);expect(crown.scale).toBe(0);engine.timeline.time(2.8);expect(crown.opacity).toBeGreaterThan(0);engine.destroy();
});
it('skipping never bursts all queued sounds, particles and talking animations at once',()=>{
 const s=setup();s.scene.steps.push({type:'sfx',name:'roar'});s.engine.play(s.scene,{paused:true});s.engine.skip();expect(s.audio.cue).not.toHaveBeenCalled();expect(s.rig.talk).not.toHaveBeenCalled();expect(s.engine.effects).toHaveLength(0);expect(s.onDone).toHaveBeenCalledTimes(1);
});

it('low effects clamp camera movement and exits rather than flying across the screen',()=>{
 const s=setup(true);s.engine.play({duration:'chapter',steps:[{type:'camera',scale:1.6,x:120},{type:'exit',actor:'alice',to:'left'}]});s.engine.skip();expect(s.camera.scale).toBeCloseTo(1.01);expect(s.camera.x).toBe(4);expect(s.alice.xPercent).toBe(-4);expect(s.alice.opacity).toBe(0);
});

it('speech reveals at a steady pace and its entrance pauses with the dialogue',()=>{
 const s=setup();s.engine.play({duration:'chapter',steps:[{type:'say',actor:'alice',key:'line',duration:2}]},{paused:true});
 s.engine.timeline.time(1);expect(s.content.textContent).toBe('A curious ');expect(s.bubble.opacity).toBe(1);expect(s.bubble.y).toBe(0);expect(s.engine.timeline.duration()).toBe(2);
 s.engine.timeline.time(.08);s.engine.pause();expect(s.engine.timeline.paused()).toBe(true);expect(s.bubble.y).toBeGreaterThan(0);s.engine.skip();expect(s.content.textContent).toBe('A curious new move.');
});
it('Arabic diacritics and emoji variants appear as complete glyphs during typing',()=>{
 const s=setup();s.engine.text=()=> 'قِ ♟️';s.engine.play({duration:'chapter',steps:[{type:'say',actor:'alice',key:'line',duration:2}]},{paused:true});
 s.engine.timeline.time(.2);expect(s.content.textContent).toBe('قِ');s.engine.timeline.time(1.5);expect(s.content.textContent).toBe('قِ ♟️');s.engine.destroy();
});
