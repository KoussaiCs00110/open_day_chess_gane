import {it,expect,vi,afterEach} from 'vitest';
import {gsap} from '../anim/easings.js';
import {CharacterRig} from '../anim/characters/rig.js';
import {Particles} from '../anim/particles.js';
import {shake,punch} from '../anim/camera.js';
import {CONFIG} from '../config.js';
import {playShared,flyBetween} from '../anim/shared.js';
const target=()=>({x:0,y:0,rotation:0,scale:1,scaleX:1,scaleY:1,opacity:1,transformOrigin:'center'});
function actor(){
 const nodes=Object.fromEntries(['idle','reaction','eyes','tail','mouth','brows','head','grin','body','outline'].map(k=>[k,target()]));
 const selectors={'.character-rig':[nodes.idle],'.character-reaction':[nodes.reaction],'.eyes':[nodes.eyes],'.cat-tail,.dragon-tail,.smoke':[nodes.tail],'.mouth':[nodes.mouth],'.brows':[nodes.brows],'.head':[nodes.head],'.grin':[nodes.grin],'.body,.cat-tail,.eyes,.head>path,.brows':[nodes.body,nodes.tail,nodes.eyes,nodes.outline,nodes.brows]};
 const element={...target(),y:70,dataset:{character:'cat'},querySelectorAll:s=>selectors[s]??[],querySelector:s=>selectors[s]?.[0]??null};
 return {nodes,element};
}
afterEach(()=>{gsap.globalTimeline.clear();gsap.ticker.sleep();vi.unstubAllGlobals();vi.restoreAllMocks();});
it('happy reactions animate an inner SVG layer without moving the cutscene actor',()=>{
 const f=actor(),rig=new CharacterRig(f.element,()=>false);rig.emote('happy');expect(f.element.y).toBe(70);expect(gsap.getTweensOf(f.element)).toHaveLength(0);const hop=gsap.getTweensOf(f.nodes.reaction)[0];expect(hop).toBeTruthy();hop.totalProgress(1);expect(f.nodes.reaction.y).toBe(0);expect(f.element.y).toBe(70);rig.destroy();
});
it('lip motion lasts the complete dialogue and restores the current expression',()=>{
 const f=actor(),rig=new CharacterRig(f.element,()=>false);rig.emote('angry');const lip=rig.talk(2.3);expect(lip.totalDuration()).toBeCloseTo(2.3);lip.totalProgress(1);expect(f.nodes.mouth.scaleY).toBe(-1);rig.destroy();
});
it('destroying a rig cancels dynamic emotions, speech, vanishing and idle loops',()=>{
 const f=actor(),rig=new CharacterRig(f.element,()=>false);rig.emote('happy');rig.talk(5);rig.vanish();expect(rig.context.getTweens().length).toBeGreaterThan(4);rig.destroy();for(const node of Object.values(f.nodes))expect(gsap.getTweensOf(node)).toHaveLength(0);expect(rig.talk(2)).toBeNull();
});
it('the Cat leaves only the grin, including removal of its eyebrows',()=>{
 const f=actor(),rig=new CharacterRig(f.element,()=>false),vanish=rig.vanish();vanish.totalProgress(.5);expect(f.nodes.brows.opacity).toBe(0);expect(f.nodes.body.opacity).toBe(0);expect(f.nodes.grin.opacity).toBe(1);vanish.totalProgress(1);expect(f.nodes.grin.opacity).toBe(0);rig.destroy();
});
it('low effects suppress hops, blinking loops, lip bouncing and large vanishing scales',()=>{
 const f=actor(),rig=new CharacterRig(f.element,()=>true);rig.emote('happy');expect(gsap.getTweensOf(f.nodes.reaction)).toHaveLength(0);expect(rig.talk(3)).toBeNull();expect(rig.context.getTweens().some(t=>t.repeat()===-1)).toBe(false);const vanish=rig.vanish();expect(vanish.duration()).toBeLessThan(.6);vanish.totalProgress(.5);expect(f.nodes.body.scale).toBeGreaterThanOrEqual(.97);rig.destroy();
});
it('camera shakes settle at zero without deleting unrelated transforms',()=>{
 const node={...target(),rotation:7};shake(node,false).totalProgress(1);expect(node.x).toBe(0);expect(node.rotation).toBe(7);punch(node,false).totalProgress(1);expect(node.scale).toBe(1);expect(node.rotation).toBe(7);expect(shake(node,true)).toBeNull();
});
function canvasFixture(context=true){
 vi.stubGlobal('innerWidth',1366);vi.stubGlobal('innerHeight',900);vi.stubGlobal('devicePixelRatio',1);vi.stubGlobal('addEventListener',vi.fn());vi.stubGlobal('removeEventListener',vi.fn());
 const ctx=Object.fromEntries(['setTransform','clearRect','save','translate','rotate','fillRect','beginPath','arc','fill','restore'].map(name=>[name,vi.fn()]));return {ctx,canvas:{getContext:()=>context?ctx:null}};
}
it('particles stay capped and disappear immediately when low effects is enabled',()=>{
 const f=canvasFixture();let low=false;const particles=new Particles(f.canvas,()=>low);particles.burst(20,20,'cards',10000);particles.burst(20,20,'cards',10000);expect(particles.pool.filter(p=>p.active)).toHaveLength(CONFIG.particleCap);low=true;particles.draw();expect(particles.pool.some(p=>p.active)).toBe(false);for(const p of particles.pool)expect(gsap.getTweensOf(p)).toHaveLength(0);expect(f.ctx.clearRect).toHaveBeenCalled();particles.destroy();expect(removeEventListener).toHaveBeenCalledWith('resize',particles.resize);
});
it('a missing canvas context does not break gameplay or create invisible particle work',()=>{
 const f=canvasFixture(false),particles=new Particles(f.canvas,()=>false);expect(()=>particles.burst(0,0)).not.toThrow();expect(particles.pool.some(p=>p.active)).toBe(false);particles.destroy();expect(()=>particles.draw()).not.toThrow();
});
it('particle drawing sleeps between bursts and follows an arc before fading out',()=>{
 const f=canvasFixture(),add=vi.spyOn(gsap.ticker,'add'),remove=vi.spyOn(gsap.ticker,'remove'),particles=new Particles(f.canvas,()=>false);
 expect(add).not.toHaveBeenCalled();particles.burst(200,200,'confetti',1);expect(add).toHaveBeenCalledTimes(1);
 const p=particles.pool.find(p=>p.active),t=gsap.getTweensOf(p)[0];t.pause().progress(.4);particles.draw();expect(p.y).toBeLessThan(p.originY);expect(p.alpha).toBe(1);
 t.progress(.9);particles.draw();expect(p.alpha).toBeLessThan(.5);t.progress(1);particles.draw();expect(particles.running).toBe(false);expect(remove).toHaveBeenCalledWith(particles.tick);
 particles.burst(100,100,'tea',1);expect(particles.running).toBe(true);particles.destroy();expect(particles.pool.some(p=>p.active)).toBe(false);
});
it('absent optional rig parts cause no GSAP target warnings',()=>{
 const warnings=vi.spyOn(console,'warn').mockImplementation(()=>{}),f=actor(),rig=new CharacterRig(f.element,()=>false);rig.emote('angry');rig.talk(1);rig.destroy();expect(warnings).not.toHaveBeenCalled();
});
it('reduced motion skips shared-element flights without reading or changing layout',()=>{
 const done=vi.fn();expect(playShared({},true)).toBeUndefined();expect(()=>flyBetween({}, {},{low:true,done})).not.toThrow();expect(done).toHaveBeenCalledTimes(1);
});
