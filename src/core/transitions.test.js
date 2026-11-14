/** Timeline protocol tests use real GSAP with plain-object targets.
 * Browser rasterization, SVG <use>, and touch hit-testing are checked separately. */
import {it,expect,afterEach,vi} from 'vitest';
import {gsap} from '../anim/easings.js';
import {registry} from '../anim/transitions/registry.js';
import {TransitionManager} from '../anim/transitions/manager.js';
const target=()=>{const attrs={};return{getAttribute:key=>attrs[key]??null,setAttribute:(key,value)=>attrs[key]=String(value),removeAttribute:key=>delete attrs[key],x:0,y:0,xPercent:0,yPercent:0,scale:1,scaleX:1,scaleY:1,rotation:0,rotationX:0,rotationY:0,opacity:1,display:'none',clipPath:'none',maskImage:'none',webkitMaskImage:'none',clearProps:'',transformOrigin:'center',transformPerspective:0,'--sweep':'0deg'};};
function environment(){
 const layers=Object.fromEntries(Object.keys(registry).concat('reduced').map(name=>[name,target()]));
 for(const [name,layer] of Object.entries(layers)){
  layer.children=Array.from({length:name==='cards'?40:name==='checker'?64:name==='curtain'?2:name==='shatter'?16:3},target);
  const sub={};layer.querySelector=key=>sub[key]??=target();layer.querySelectorAll=key=>key==='.shard'?layer.children:(sub[key]??=Array.from({length:3},target));
 }
 const stage={...target(),inert:false},classes=new Set(),overlay={classList:{add:name=>classes.add(name),remove:name=>classes.delete(name)},addEventListener:vi.fn(),querySelector:selector=>layers[selector.match(/data-transition="([^"]+)"/)?.[1]],querySelectorAll:()=>Object.values(layers)};
 vi.stubGlobal('document',{querySelector:selector=>selector==='#screen'?stage:selector==='#measured-duration'?null:layers[selector.match(/data-transition="([^"]+)"/)?.[1]]});vi.stubGlobal('innerWidth',1366);vi.stubGlobal('innerHeight',900);
 return{layers,stage,overlay,classes};
}
afterEach(()=>{gsap.globalTimeline.clear();gsap.ticker.sleep();vi.useRealTimers();vi.unstubAllGlobals();});
function covered(name,layer){if(name==='cards')return layer.children.every(c=>Math.abs(c.rotationY)<.001);if(name==='checker')return layer.children.every(c=>Math.abs(c.rotationX)<.001);if(name==='curtain')return layer.children.every(c=>Math.abs(c.xPercent)<.001);if(name==='clock')return layer['--sweep']==='360deg';if(name==='ink')return layer.clipPath.startsWith('circle(150% at ');if(name==='stomp')return layer.clipPath==='inset(0% 0% 0% 0%)';return layer.clipPath==='circle(150% at 50% 50%)';}
for(const name of Object.keys(registry))it(`${name}: real GSAP timeline covers before swapping, reveals, and completes in <1.7 nominal seconds`,()=>{
 const {layers}=environment(),events=[];
 const duration=['clock','checker'].includes(name)?.6:['glass','curtain','shatter','grin','stomp'].includes(name)?1.45:.85;
 const timeline=registry[name]({duration,snapshot:()=>()=>{},onCover:()=>{expect(covered(name,layers[name])).toBe(true);events.push('cover');},onDone:()=>events.push('done')});
 expect(timeline.totalDuration()).toBeLessThan(1.7);timeline.timeScale(3);expect(timeline.timeScale()).toBe(3);timeline.progress(1);expect(events).toEqual(['cover','done']);timeline.kill();
});
it('manager recovers a stalled timeline under an opaque cover, swapping once and always releasing input',async()=>{
 vi.useFakeTimers();const {layers,stage,overlay,classes}=environment(),swaps=[];
 const manager=new TransitionManager({overlay,swap:()=>{expect(layers.reduced.display).toBe('grid');expect(layers.reduced.xPercent).toBe(0);swaps.push('swap');}});
 const completion=manager.go('START','NAME','cards');manager.timeline.pause();expect(stage.inert).toBe(true);expect(classes.has('blocking')).toBe(true);await vi.advanceTimersByTimeAsync(4000);await completion;
 expect(swaps).toEqual(['swap']);expect(manager.busy).toBe(false);expect(stage.inert).toBe(false);expect(classes.has('blocking')).toBe(false);expect(manager.history.map(e=>e.phase)).toEqual(['cover','done']);
});
it('low-effects mode keeps the same covered swap and input-cleanup protocol',async()=>{
 const {layers,stage,overlay}=environment(),events=[];const manager=new TransitionManager({overlay,lowEffects:()=>true,swap:()=>{expect(layers.reduced.xPercent).toBe(0);expect(layers.reduced.opacity).toBe(1);events.push('swap');}});
 const completion=manager.go('START','NAME','cards');manager.timeline.pause().progress(.25);expect(layers.reduced.xPercent).toBe(0);expect(layers.reduced.opacity).toBeGreaterThan(0);expect(layers.reduced.opacity).toBeLessThan(1);manager.timeline.progress(1);await completion;expect(events).toEqual(['swap']);expect(manager.busy).toBe(false);expect(stage.inert).toBe(false);
});
it('the clock is fully opaque at swap and its hand uses its local SVG hub',()=>{
 const {layers}=environment();const tl=registry.clock({duration:.6,onCover:()=>{expect(layers.clock.maskImage).toBe('none');expect(layers.clock.webkitMaskImage).toBe('none');expect(layers.clock.querySelector('.clock-hand-minute').getAttribute('transform')).toBe('rotate(360 80 80)');},onDone:()=>{}});tl.progress(1);
});
it('a safety-seek exception still settles the promise and releases every input lock',async()=>{
 vi.useFakeTimers();const {stage,overlay,classes}=environment(),error=new Error('Broken seek'),log=vi.spyOn(console,'error').mockImplementation(()=>{});const manager=new TransitionManager({overlay,swap:vi.fn()});const completion=manager.go('START','NAME','cards');manager.timeline.pause();manager.timeline.progress=()=>{throw error;};await vi.advanceTimersByTimeAsync(4000);await completion;expect(manager.lastError).toBe(error);expect(manager.busy).toBe(false);expect(stage.inert).toBe(false);expect(classes.has('blocking')).toBe(false);log.mockRestore();
});
it('sound and screen callback failures cannot strand a transition',async()=>{
 const {stage,overlay}=environment(),log=vi.spyOn(console,'error').mockImplementation(()=>{}),after=vi.fn(()=>{throw Error('After callback');}),manager=new TransitionManager({overlay,audio:{cue:()=>{throw Error('Audio unavailable');}},swap:()=>{throw Error('Swap failed');}});const done=manager.go('START','NAME','cards',{after});manager.timeline.progress(1);await done;expect(manager.busy).toBe(false);expect(stage.inert).toBe(false);expect(after).toHaveBeenCalledTimes(1);expect(manager.history.map(e=>e.phase)).toEqual(['cover','done']);log.mockRestore();
});
it('destroying a stalled transition releases input and prevents later work',async()=>{
 const {stage,overlay}=environment(),manager=new TransitionManager({overlay,swap:vi.fn()});const done=manager.go('START','NAME','cards');manager.timeline.pause();manager.destroy();await done;expect(stage.inert).toBe(false);expect(manager.busy).toBe(false);expect(await manager.go('NAME','INTRO','rabbit')).toBe(false);
});
