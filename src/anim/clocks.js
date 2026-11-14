import {gsap} from './easings.js';

const turn=(seconds,period)=>seconds%period/period*360;
export function clockAngles(seconds){
 const value=Math.floor(Number.isFinite(seconds)?Math.max(0,seconds):0);
 return {second:turn(value,60),minute:turn(value,3600),hour:turn(value,43200)};
}
// An explicit SVG rotation uses the clock's LOCAL hub. A pixel CSS origin
// is offset by the hands' bounding box, so 80px 80px is not the (80,80) hub.
export const clockRotation=angle=>`rotate(${Number(angle.toFixed(5))} 80 80)`;
export function clockHand(node){
 let value=Number(node.getAttribute('transform')?.match(/^rotate\(([-\d.]+)/)?.[1])||0;
 return {get angle(){return value;},set angle(next){value=next;node.setAttribute('transform',clockRotation(next));}};
}
export function clockParts(wrapper){
 const parts=Object.fromEntries(['hour','minute','second'].map(role=>[role,wrapper.querySelector(`.clock-hand-${role}`)]).filter(([,node])=>node));
 return Object.keys(parts).length?parts:{second:wrapper}; // legacy SVG overrides
}
export class Clocks {
 constructor(root,{low=()=>false}={}){
  this.hud=[];this.loops=[];this.seconds=null;this.destroyed=false;
  this.context=gsap.context(()=>{
   for(const wrapper of root.querySelectorAll('.clock-hands')){
    const parts=Object.fromEntries(Object.entries(clockParts(wrapper)).map(([role,node])=>{const original=node.getAttribute('transform');this.contextCleanup??=[];this.contextCleanup.push(()=>original===null?node.removeAttribute('transform'):node.setAttribute('transform',original));return [role,clockHand(node)];}));
    if(wrapper.closest('.watch')){this.hud.push(parts);continue;}
    const initial=clockAngles(10*3600+10*60);
    for(const [role,node] of Object.entries(parts)){
     gsap.set(node,{angle:initial[role]});
     if(!low())this.loops.push(gsap.to(node,{angle:initial[role]+360,duration:{second:60,minute:3600,hour:43200}[role],repeat:-1,ease:role==='second'?'steps(60)':'none'}));
    }
   }
  });
 }
 sync(seconds){
  const value=Math.floor(Number.isFinite(seconds)?Math.max(0,seconds):0);
  if(this.destroyed||value===this.seconds)return;
  this.seconds=value;const angles=clockAngles(value);
  // These are exact clock poses, not tweens. Attribute cleanup is already
  // owned above; recording three more GSAP sets every second grows forever.
  for(const parts of this.hud)for(const [role,node] of Object.entries(parts))node.angle=angles[role];
 }
 destroy(){this.destroyed=true;this.context.revert();this.contextCleanup?.forEach(cleanup=>cleanup());this.hud=[];this.loops=[];}
}
