import {gsap} from '../easings.js';
import {CONFIG} from '../../config.js';
const graphemes=globalThis.Intl?.Segmenter?new Intl.Segmenter(undefined,{granularity:'grapheme'}):null;
export class CutsceneEngine {
 constructor({root,rigs,text,audio,particles,low,presentation={},onDone}){Object.assign(this,{root,rigs,text,audio,particles,low,presentation,onDone});this.finished=false;this.effects=[];this.paused=false;this.skipping=false;}
 play(scene,{paused=false}={}){
  this.timeline?.kill();this.effects.forEach(t=>t.kill());this.context?.revert();this.effects=[];this.finished=false;this.skipping=false;this.paused=paused;
  this.context=gsap.context(()=>{
   this.timeline=gsap.timeline({paused:true,onComplete:()=>this.finish()});
   const t=this.timeline,target=step=>{const actor=this.root.querySelector(`[data-character="${step.actor}"]`);return step.part?actor?.querySelector(step.part):actor;};
   // Prepare every entrance while covered, including props that enter much
   // later (Alice's crown). Future from-tweens must not render on construction.
   const entrances=new Set(scene.steps.filter(s=>s.type==='enter').map(target).filter(Boolean));
   for(const el of entrances)gsap.set(el,{opacity:0});
   for(const step of scene.steps){const el=step.actor?target(step):null,d=step.duration??.45;
    if(step.type==='enter'&&el)t.fromTo(el,{opacity:0,xPercent:this.low()?(step.from==='right'?5:-5):step.from==='right'?120:step.from==='above'?0:-120,yPercent:step.from==='above'?(this.low()?-4:-80):0,scale:this.low()?.97:.8},{opacity:1,xPercent:0,yPercent:0,scale:1,duration:d,immediateRender:false,ease:'wonder-overshoot'});
    if(step.type==='move'&&el){const props={};for(const key of ['x','y','scale','rotation'])if(step[key]!==undefined)props[key]=step[key];if(this.low()){for(const k of ['x','y','rotation'])if(props[k]!==undefined)props[k]=Math.max(-4,Math.min(4,props[k]));if(props.scale!==undefined)props.scale=Math.max(.97,Math.min(1.03,props.scale));}t.to(el,{...props,duration:d,ease:'wonder-overshoot'});}
    if(step.type==='exit'&&el)t.to(el,{xPercent:step.to==='left'?(this.low()?-4:-160):(this.low()?4:160),rotation:this.low()?0:step.to==='left'?-10:10,opacity:0,duration:d,ease:'back.in(1.5)'});
    if(step.type==='emote')t.call(()=>{if(!this.skipping)this.rigs.get(step.actor)?.emote(step.emotion);});
    if(step.type==='say'){
     const line=this.text(step.key),chars=graphemes?Array.from(graphemes.segment(line),s=>s.segment):[...line],progress={n:0},duration=step.duration??Math.max(1.3,Math.min(2.1,chars.length/CONFIG.typewriterSpeed));
     const bubble=this.root.querySelector(`[data-bubble="${step.actor}"]`),content=bubble?.querySelector('.speech-text'),at=t.duration();
     t.call(()=>{
      this.root.querySelectorAll('.speech-bubble').forEach(n=>n.classList.remove('speaking'));bubble?.classList.add('speaking');if(content)content.textContent='';
      if(this.skipping)return;
      this.rigs.forEach(rig=>rig.stopTalking?.());
      const lip=this.rigs.get(step.actor)?.talk(duration);
      if(lip){lip.timeScale(this.timeline.timeScale());if(this.paused)lip.pause();this.effects.push(lip);}
     });
     if(bubble)t.fromTo(bubble,{opacity:0,y:this.low()?0:6,scale:this.low()?1:.97},{opacity:1,y:0,scale:1,duration:Math.min(.18,duration),ease:'power2.out',immediateRender:false},at);
     t.to(progress,{n:chars.length,duration,ease:'none',onUpdate:()=>{if(content)content.textContent=chars.slice(0,Math.ceil(progress.n)).join('');}},at);
    }
    if(step.type==='shake'&&!this.low())t.to(this.root,{x:-5,duration:.045,ease:'power2.out'}).to(this.root,{x:5,duration:.055,repeat:3,yoyo:true,ease:'power2.inOut'}).to(this.root,{x:0,duration:.06,ease:'power2.out'});
    if(step.type==='camera')t.to(this.root.querySelector('.scene-camera')||this.root,{scale:this.low()?Math.max(.99,Math.min(1.01,step.scale??1)):step.scale??1,x:this.low()?Math.max(-4,Math.min(4,step.x??0)):step.x??0,duration:d,ease:'power2.inOut'});
    if(step.type==='sfx')t.call(()=>{if(this.skipping)return;this.audio.cue(step.name);if(step.name==='win')this.particles.burst(innerWidth/2,innerHeight*.35,'confetti',100,this.presentation.confetti);if(step.name==='pour')this.particles.burst(innerWidth*.76,innerHeight*.7,'tea',24);if(step.name==='roar')this.particles.burst(innerWidth*.7,innerHeight*.5,'tea',35);});
    if(step.type==='wait')t.to({},{duration:step.duration??.2});
   }
   const targetSeconds=this.low()?CONFIG.reducedSceneSeconds:scene.duration==='win'?CONFIG.finaleSeconds:scene.duration==='reaction'?(this.presentation.reactionSeconds??CONFIG.reactionSeconds):scene.duration==='lose'?CONFIG.loseSceneSeconds:CONFIG.cutsceneSeconds*(scene.duration==='chapter'?(this.presentation.sceneFactor??1):1);
   this.baseSpeed=Math.max(.1,t.duration()/targetSeconds);t.timeScale(this.baseSpeed);
  },this.root);
  if(!paused)this.start();return this;
 }
 start(){if(!this.finished){this.paused=false;this.timeline?.play();}return this;}
 hurry(){if(this.finished)return;this.timeline?.timeScale(this.baseSpeed*3);this.effects.forEach(t=>t.timeScale(this.baseSpeed*3));}
 pause(){if(this.finished)return;this.paused=true;this.timeline?.pause();this.effects.forEach(t=>t.pause());}
 resume(){if(this.finished)return;this.paused=false;this.timeline?.resume();this.effects.forEach(t=>t.resume());}
 skip(){if(this.finished)return;this.skipping=true;this.timeline?.progress(1);this.finish();}
 stopEffects(){this.effects.forEach(t=>t.kill());this.rigs.forEach(rig=>rig.stopTalking?.());}
 finish(){if(this.finished)return;this.finished=true;this.stopEffects();this.onDone?.();}
 destroy(){this.finished=true;this.timeline?.kill();this.stopEffects();this.context?.revert();}
}
