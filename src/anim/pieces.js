import {gsap} from './easings.js';

// Chessground positions the outer node. Only the artwork travels, in square
// percentages, so resizing never changes a move's destination or pointer bounds.
export class PieceMotion {
 constructor({low,duration}){this.low=low;this.duration=duration;this.active=new Map();}
 stop(node){
  this.active.get(node)?.kill();this.active.delete(node);node.classList.remove('piece-moving');
  const art=node.querySelector('.piece-art'),rig=node.querySelector('.piece-rig');
  if(art){gsap.killTweensOf(art);gsap.set(art,{x:0,y:0,xPercent:0,yPercent:0,scale:1,rotationY:0,opacity:1});}
  if(rig){gsap.killTweensOf(rig);gsap.set(rig,{y:0,scaleX:1,scaleY:1});}
 }
 move(node,{from,to,piece,promotion,dragged=false}={}){
  if(!node)return null;
  this.stop(node);const art=node.querySelector('.piece-art'),rig=node.querySelector('.piece-rig');if(!art)return null;
  const low=this.low(),duration=low?.12:dragged?.18:this.duration;
  const finish=()=>{if(this.active.get(node)===tl){this.active.delete(node);node.classList.remove('piece-moving');}};
  const tl=gsap.timeline({paused:true,onComplete:finish,onInterrupt:finish,defaults:{ease:'power2.inOut'}});
  node.classList.add('piece-moving');this.active.set(node,tl);
  if(low)tl.fromTo(art,{opacity:.65},{opacity:1,duration,ease:'power1.out'});
  else{
   const x=from&&!dragged?(from.charCodeAt(0)-to.charCodeAt(0))*100:0;
   const y=from&&!dragged?(Number(to[1])-Number(from[1]))*100:0;
   tl.fromTo(art,{xPercent:x,yPercent:y},{xPercent:0,yPercent:0,duration},0);
   if(rig){
    const lift=dragged?2:piece==='n'?16:4;
    tl.to(rig,{y:-lift,scaleX:.98,scaleY:1.025,duration:duration*.45,ease:'sine.out'},0)
     .to(rig,{y:0,scaleX:1,scaleY:1,duration:duration*.55,ease:'power2.in'},duration*.45);
   }
   if(promotion)tl.fromTo(art,{rotationY:75},{rotationY:0,duration,ease:'power2.out'},0);
  }
  return tl.play();
 }
 clear(){for(const node of [...this.active.keys()])this.stop(node);}
}
