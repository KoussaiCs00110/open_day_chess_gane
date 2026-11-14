import { gsap } from '../easings.js';
import { timeline,getLayer,resetLayer } from './helpers.js';
export default function({duration,onCover,onDone,snapshot=mountSnapshot}) {
 const el=getLayer('shatter');resetLayer(el);
 const dispose=snapshot(el);
 const cleanup=()=>{dispose();onDone();};gsap.set(el,{clipPath:'circle(0% at 50% 50%)'});gsap.set(el.querySelectorAll('.shard'),{y:0,x:0,rotation:0,rotationX:0,rotationY:0,opacity:1,transformPerspective:700});
 return timeline(cleanup).to(el,{clipPath:'circle(150% at 50% 50%)',duration:duration*.26,ease:'power4.in'}).call(onCover).to(el.querySelectorAll('.shard'),{y:()=>innerHeight*1.5,x:()=>gsap.utils.random(-180,180),rotation:()=>gsap.utils.random(-80,80),rotationX:()=>gsap.utils.random(-100,100),rotationY:()=>gsap.utils.random(-100,100),duration:duration*.6,stagger:{amount:duration*.12,from:'center'},ease:'power3.in'});
}

function mountSnapshot(el){
 // One frozen DOM snapshot, referenced by all sixteen SVG shards.
 const old=document.querySelector('#screen').cloneNode(true);old.removeAttribute('id');old.style.cssText='position:relative;width:100%;height:100%';old.querySelector('#chessboard')?.classList.add('mirror-board');old.querySelectorAll('[id],[data-flip-id]').forEach(n=>{n.removeAttribute('id');n.removeAttribute('data-flip-id');});
 const holder=document.createElementNS('http://www.w3.org/2000/svg','svg');holder.classList.add('mirror-definitions');holder.innerHTML='<defs><g id="mirror-snapshot"><foreignObject width="'+innerWidth+'" height="'+innerHeight+'"></foreignObject></g></defs>';
 const snapshot=document.createElement('div');snapshot.setAttribute('xmlns','http://www.w3.org/1999/xhtml');snapshot.style.cssText='position:relative;isolation:isolate;width:'+innerWidth+'px;height:'+innerHeight+'px;background:#1c473a';snapshot.append(document.querySelector('.background').cloneNode(true),old);holder.querySelector('foreignObject').append(snapshot);el.append(holder);
 el.querySelectorAll('.shard').forEach((shard,i)=>{shard.innerHTML='<svg viewBox="'+(i%4*innerWidth/4)+' '+(Math.floor(i/4)*innerHeight/4)+' '+innerWidth/4+' '+innerHeight/4+'" preserveAspectRatio="none"><use href="#mirror-snapshot"/></svg>';});

 return ()=>{holder.remove();el.querySelectorAll('.shard').forEach(shard=>shard.replaceChildren());};
}
