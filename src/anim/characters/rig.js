import {gsap} from '../easings.js';
export class CharacterRig {
 constructor(element,low){
  this.el=element;this.low=low;this.state='idle';this.destroyed=false;this.lip=null;
  this.context=gsap.context(()=>{
   if(low())return;
   this.to('.character-rig',{y:-5,rotation:1.2,duration:2.2,ease:'sine.inOut',repeat:-1,yoyo:true,transformOrigin:'50% 90%'});
   const eyes=this.targets('.eyes');
   if(eyes.length)gsap.timeline({delay:gsap.utils.random(1.2,3.8),repeat:-1,repeatDelay:gsap.utils.random(2.4,4.5)}).to(eyes,{scaleY:.08,transformOrigin:'center',duration:.09,ease:'power2.in'}).to(eyes,{scaleY:1,duration:.13,ease:'power2.out'});
   this.to('.shawl,.horse,.wings',{rotation:3,scaleX:1.025,transformOrigin:'50% 60%',duration:1.8,repeat:-1,yoyo:true,ease:'sine.inOut'});
   this.to('.flower',{rotation:3,transformOrigin:'50% 100%',duration:1.7,repeat:-1,yoyo:true,stagger:.2,ease:'sine.inOut'});
   this.to('.cat-tail,.dragon-tail,.smoke',{rotation:5,y:-5,transformOrigin:'60% 70%',duration:2,repeat:-1,yoyo:true,ease:'sine.inOut'});
  },element);
 }
 targets(selector){return [...this.el.querySelectorAll(selector)];}
 to(selector,vars){const nodes=this.targets(selector);return nodes.length?gsap.to(nodes,vars):null;}
 mouthScale(){return this.state==='angry'?-1:this.state==='scared'?1.5:1;}
 emote(state){
  if(this.destroyed)return;
  this.state=state;this.el.dataset.emotion=state;
  this.context.add(()=>{
   this.stopTalking();const duration=this.low()?.12:.25;
   this.to('.mouth',{scaleY:this.mouthScale(),transformOrigin:'center',duration,overwrite:'auto'});
   this.to('.brows',{rotation:state==='angry'?6:state==='scared'?-4:0,transformOrigin:'center',duration,overwrite:'auto'});
   this.to('.head',{scale:state==='angry'&&this.el.dataset.character==='redQueen'?1.07:1,rotation:state==='happy'?-4:state==='scared'?3:0,transformOrigin:'50% 80%',duration,overwrite:'auto'});
   this.to('.fire',{opacity:state==='angry'?1:0,duration,overwrite:'auto'});
   const reaction=this.el.querySelector('.character-reaction')||this.el.querySelector('.character-rig');
   if(state==='happy'&&!this.low()&&reaction)gsap.fromTo(reaction,{y:-10},{y:0,duration:.4,ease:'back.out(2)',overwrite:'auto'});
  });
 }
 stopTalking(){
  this.lip?.kill();this.lip=null;
  const mouths=this.targets('.mouth');
  if(mouths.length&&!this.destroyed)gsap.set(mouths,{scaleY:this.mouthScale()});
 }
 talk(duration){
  if(this.destroyed||this.low()||duration<=0)return null;
  const mouths=this.targets('.mouth');if(!mouths.length)return null;
  this.context.add(()=>{
   this.stopTalking();const cycles=Math.max(1,Math.ceil(duration/.2)),base=this.mouthScale();
   this.lip=gsap.fromTo(mouths,{scaleY:base*.7},{scaleY:base*1.2,duration:duration/(cycles*2),repeat:cycles*2-1,yoyo:true,ease:'sine.inOut',transformOrigin:'center',overwrite:'auto',onComplete:()=>{if(!this.destroyed)gsap.set(mouths,{scaleY:this.mouthScale()});}});
  });
  return this.lip;
 }
 vanish(){
  if(this.destroyed)return gsap.timeline();
  let result;this.context.add(()=>{
   const grin=this.el.querySelector('.grin'),parts=this.targets('.body,.cat-tail,.eyes,.head>path,.brows');
   result=gsap.timeline().call(()=>this.stopTalking());
   if(parts.length)result.to(parts,{scale:this.low()?.98:.2,opacity:0,duration:this.low()?.12:.6,ease:'power2.in'});
   if(grin)result.to(grin,{scale:this.low()?'+=0':'+=0.1',transformOrigin:'50% 50%',duration:this.low()?.08:.3}).to(grin,{scale:this.low()?.98:0,opacity:0,duration:this.low()?.12:.35,delay:this.low()?.1:.6,ease:'back.in(2)'});
  });return result;
 }
 destroy(){if(this.destroyed)return;this.destroyed=true;this.lip?.kill();this.context.revert();}
}
