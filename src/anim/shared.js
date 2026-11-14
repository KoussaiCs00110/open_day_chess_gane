import { gsap, Flip } from './easings.js';
export function captureShared(){return Flip.getState(document.querySelectorAll('[data-flip-id]'));}
export function playShared(state,low=false){if(!state||low)return;return Flip.from(state,{targets:document.querySelectorAll('[data-flip-id]'),duration:.7,ease:'wonder-overshoot',absolute:true,nested:true,prune:true,scale:true});}
export function flyBetween(element,target,{low=false,done}={}){
 if(!element||!target||low){done?.();return;}
 const copy=element.cloneNode(true);copy.removeAttribute('id');copy.querySelectorAll('[id]').forEach(n=>n.removeAttribute('id'));copy.classList.add('flying-item');const r=element.getBoundingClientRect();Object.assign(copy.style,{position:'fixed',left:r.left+'px',top:r.top+'px',width:r.width+'px',height:r.height+'px',margin:0,zIndex:70,pointerEvents:'none'});document.body.append(copy);
 const state=Flip.getState(copy);const t=target.getBoundingClientRect();gsap.set(copy,{left:t.left,top:t.top,width:t.width,height:t.height});return Flip.from(state,{duration:.7,ease:'wonder-overshoot',scale:true,onComplete:()=>{copy.remove();done?.();},onInterrupt:()=>copy.remove()});
}
