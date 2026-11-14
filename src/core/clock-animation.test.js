import {it,expect,afterEach} from 'vitest';
import {Clocks,clockAngles,clockRotation} from '../anim/clocks.js';
import {gsap} from '../anim/easings.js';
import {clock,hero,character} from '../assets/svg/art.js';
import {createSession,loadPuzzle,usePower} from './game.js';
import {advanceTimer} from './timer.js';
import {chapterPuzzle} from '../data/pools.js';
function hand(){const attrs={transform:'rotate(0 80 80)'};return {getAttribute:key=>attrs[key]??null,setAttribute:(key,value)=>attrs[key]=String(value),removeAttribute:key=>delete attrs[key]};}
function fixture(hud=true,legacy=false){const parts=Object.fromEntries(['hour','minute','second'].map(key=>[key,hand()]));const wrapper={...hand(),querySelector:key=>legacy?null:parts[key.replace('.clock-hand-','')],closest:()=>hud?{}:null};return {parts:legacy?{second:wrapper}:parts,root:{querySelectorAll:()=>[wrapper]}};}
afterEach(()=>{gsap.globalTimeline.clear();gsap.ticker.sleep();});
it('second, minute and hour hands agree at minute/hour boundaries',()=>{
 expect(clockAngles(0)).toEqual({second:0,minute:0,hour:0});expect(clockAngles(60)).toEqual({second:0,minute:6,hour:.5});expect(clockAngles(3600)).toEqual({second:0,minute:0,hour:30});expect(clockAngles(43200)).toEqual({second:0,minute:0,hour:0});expect(clockAngles(90.99)).toEqual({second:180,minute:9,hour:.75});expect(clockAngles(NaN)).toEqual(clockAngles(0));
});
it('every nested hero/Rabbit clock has independent hands around its local 80,80 hub',()=>{
 for(const svg of [clock(),hero(),character('rabbit')])for(const role of ['hour','minute','second'])expect(svg).toMatch(new RegExp('class="clock-hand-'+role+'"[^>]*transform="rotate\\([^\"]+ 80 80\\)"'));
 expect(clockRotation(180)).toBe('rotate(180 80 80)');
});
it('HUD angles are state-driven and never acquire an independent looping tween',()=>{
 const f=fixture(),rig=new Clocks(f.root);rig.sync(61);expect(f.parts.second.getAttribute('transform')).toBe('rotate(6 80 80)');expect(f.parts.minute.getAttribute('transform')).toBe('rotate(6.1 80 80)');for(const node of Object.values(f.parts))expect(gsap.getTweensOf(node).filter(t=>t.repeat()===-1)).toHaveLength(0);rig.destroy();
});
it('frozen and paused game time leaves the HUD hands unchanged, then resumes precisely',()=>{
 const f=fixture(),rig=new Clocks(f.root);let state=loadPuzzle(createSession('Alice','clock'),chapterPuzzle('normal',1));state=advanceTimer(state,61);rig.sync(state.elapsed);const before=f.parts.second.getAttribute('transform');state=usePower(state,'eat').state;state=advanceTimer(state,7);rig.sync(state.elapsed);expect(f.parts.second.getAttribute('transform')).toBe(before);state=advanceTimer(state,9);rig.sync(state.elapsed);expect(f.parts.second.getAttribute('transform')).toBe('rotate(12 80 80)');state=advanceTimer(state,50,{paused:true});rig.sync(state.elapsed);expect(f.parts.second.getAttribute('transform')).toBe('rotate(12 80 80)');rig.destroy();
});
it('countdown hands reverse with the displayed remaining seconds and survive rerender',()=>{
 const first=fixture(),rig=new Clocks(first.root);rig.sync(50);expect(first.parts.second.getAttribute('transform')).toBe('rotate(300 80 80)');rig.sync(49);expect(first.parts.second.getAttribute('transform')).toBe('rotate(294 80 80)');rig.destroy();const next=fixture(),replacement=new Clocks(next.root);replacement.sync(49);expect(next.parts.second.getAttribute('transform')).toBe('rotate(294 80 80)');replacement.destroy();
});
it('decorative clocks tick about a local pivot and stop completely on screen destruction',()=>{
 const f=fixture(false),rig=new Clocks(f.root);const tick=rig.loops.find(t=>t.vars.ease==='steps(60)');expect(tick).toBeTruthy();tick.progress(.5);expect(f.parts.second.getAttribute('transform')).toBe('rotate(180 80 80)');const models=rig.loops.map(t=>t.targets()[0]);rig.destroy();for(const model of models)expect(gsap.getTweensOf(model)).toHaveLength(0);rig.sync(100);expect(f.parts.second.getAttribute('transform')).toBe('rotate(0 80 80)');
});
it('low effects keep accurate HUD time while disabling decorative loops',()=>{
 const d=fixture(false),decor=new Clocks(d.root,{low:()=>true});for(const node of Object.values(d.parts))expect(gsap.getTweensOf(node).filter(t=>t.repeat()===-1)).toHaveLength(0);decor.destroy();const h=fixture(),hud=new Clocks(h.root,{low:()=>true});hud.sync(42);expect(h.parts.second.getAttribute('transform')).toBe('rotate(252 80 80)');hud.destroy();
});
it('legacy clock overrides still rotate using local coordinates',()=>{const f=fixture(true,true),rig=new Clocks(f.root);rig.sync(15);expect(f.parts.second.getAttribute('transform')).toBe('rotate(90 80 80)');rig.destroy();});
it('a long running HUD does not retain a growing history of clock poses',()=>{
 const f=fixture(),rig=new Clocks(f.root),initial=rig.context.getTweens().length;
 for(let seconds=0;seconds<3600;seconds++)rig.sync(seconds);
 expect(rig.context.getTweens()).toHaveLength(initial);expect(f.parts.second.getAttribute('transform')).toBe('rotate(354 80 80)');rig.destroy();expect(f.parts.second.getAttribute('transform')).toBe('rotate(0 80 80)');
});
