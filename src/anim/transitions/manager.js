import { gsap } from '../easings.js';
import { CONFIG } from '../../config.js';
import { registry,cues } from './registry.js';
import { clock, cup, grin, character } from '../../assets/svg/art.js';
export function buildOverlay(){
 const overlay=document.createElement('div');overlay.id='transition-overlay';overlay.setAttribute('aria-hidden','true');
 overlay.innerHTML=`<div class="transition-layer cards-grid" data-transition="cards">${Array.from({length:40},()=>'<div class="wipe-card"><span>♠</span><i>✦</i></div>').join('')}</div>
 <div class="transition-layer rabbit-hole" data-transition="rabbit"><div class="spiral">${Array.from({length:12},(_,i)=>`<div style="--i:${i}">${i%3===0?clock():i%3===1?cup():'♠'}</div>`).join('')}</div></div>

 <div class="transition-layer curtains" data-transition="curtain"><div class="curtain left"><b>❧</b></div><div class="curtain right"><b>❧</b></div></div>
 <div class="transition-layer clock-wipe" data-transition="clock">${clock()}</div>
 <div class="transition-layer mirror" data-transition="shatter">${Array.from({length:16},(_,i)=>`<div class="shard" style="--n:${i};grid-area:${Math.floor(i/4)+1}/${i%4+1}"><span>${i%2?'♠':'◇'}</span></div>`).join('')}</div>
 <div class="transition-layer ink-wipe" data-transition="ink"><span>❧</span><i>◌</i></div>
 <div class="transition-layer grin-wipe" data-transition="grin"><div class="giant-grin">${grin()}</div></div>
 <div class="transition-layer looking-glass" data-transition="glass"><div class="mirror-frame"><svg viewBox="0 0 300 400"><g fill="none" stroke="#eadfb8" stroke-width="3"><ellipse class="ripple-ring" cx="150" cy="200" rx="75" ry="130"/><ellipse class="ripple-ring" cx="150" cy="200" rx="100" ry="160"/><ellipse class="ripple-ring" cx="150" cy="200" rx="125" ry="180"/></g></svg><div class="mirror-alice">${character('alice')}</div></div></div>
 <div class="transition-layer checker-grid" data-transition="checker">${Array.from({length:64},(_,i)=>`<div class="checker-cell ${(i+Math.floor(i/8))%2?'dark':'light'}"><span>${i%3?'♠':'♥'}</span></div>`).join('')}</div>
 <div class="transition-layer stomp-wipe" data-transition="stomp"><svg class="crack-lines" viewBox="0 0 1000 700" preserveAspectRatio="none"><path d="m500 350-90-180 40-140m50 320 230-160 200 20M500 350 210 480l-100-40m390-90 100 200-25 150m-75-350-70 70 40 90m30-160 200 80 150-30" fill="none" stroke="#edc8a3" stroke-width="5"/></svg><div class="queen-shadow">${character('redQueen')}</div></div>
 <div class="transition-layer reduced-wipe" data-transition="reduced">✦</div>`;
 document.body.append(overlay);gsap.set(overlay.querySelectorAll('.transition-layer'),{display:'none'});return overlay;
}
export class TransitionManager {
 constructor({swap,audio,lowEffects=()=>false,overlay}){
  Object.assign(this,{swap,audio,lowEffects});this.overlay=overlay||buildOverlay();this.busy=false;this.destroyed=false;this.speed=1;this.history=[];this.lastError=null;
  this.onPointer=e=>{e.preventDefault();this.fastForward();};this.overlay.addEventListener('pointerdown',this.onPointer);
 }
 async go(from,to,name='cards',payload={}){
  if(this.busy||this.destroyed)return false;
  if(!registry[name])throw new Error(`Unknown transition: ${name}`);
  this.busy=true;this.timeline=null;this.lastError=null;this.overlay.classList.add('blocking');document.querySelector('#screen').inert=true;
  const duration=payload.duration??(['clock','checker'].includes(name)?CONFIG.quickSeconds:['glass','curtain','grin','shatter','stomp'].includes(name)?CONFIG.dramaticSeconds:CONFIG.transitionSeconds);
  return new Promise(resolve=>{
   let covered=false,finished=false,timer;const started=performance.now();
   const report=error=>{this.lastError=error;console.error(error);};
   try{this.audio?.cue(cues[name]);}catch(error){report(error);}
   const forceCover=()=>{const layer=this.overlay.querySelector('[data-transition="reduced"]');gsap.set(layer,{display:'grid',xPercent:0,opacity:1,clearProps:'transform,clipPath,maskImage,webkitMaskImage'});};
   const onCover=()=>{if(covered)return;covered=true;this.history.push({from,to,name,phase:'cover',at:performance.now()});try{this.swap(to,payload);}catch(error){report(error);}};
   const onDone=()=>{
    if(finished)return;finished=true;clearTimeout(timer);
    try{
     if(!covered)forceCover();onCover();
     this.timeline?.kill();
     gsap.set(this.overlay.querySelectorAll('.transition-layer'),{display:'none'});
     this.overlay.querySelectorAll('.mirror-definitions').forEach(node=>node.remove?.());
     const stage=document.querySelector('#screen');gsap.set(stage,{clearProps:'transform,clipPath'});
    }catch(error){report(error);}
    finally{
     this.overlay.querySelectorAll('.transition-layer').forEach(layer=>{if(layer.style)layer.style.display='none';});
     this.overlay.classList.remove('blocking');document.querySelector('#screen').inert=false;this.busy=false;this.lastDuration=performance.now()-started;this.recover=null;
     const measured=document.querySelector('#measured-duration');if(measured)measured.textContent=Math.round(this.lastDuration)+' ms';
     this.history.push({from,to,name,phase:'done',at:performance.now()});this.history=this.history.slice(-200);
     try{payload.after?.();}catch(error){report(error);}finally{resolve(true);}
    }
   };
   // Even an exception while seeking a broken timeline cannot strand input.
   this.recover=()=>{if(finished)return;try{forceCover();onCover();this.timeline?.progress(1);}catch(error){report(error);}finally{onDone();}};
   timer=setTimeout(()=>this.recover?.(),(duration/Math.max(.1,this.speed)+CONFIG.safetySeconds)*1000);
   try{
    if(this.lowEffects()){
     const el=this.overlay.querySelector('[data-transition="reduced"]');gsap.set(el,{display:'grid',xPercent:0,opacity:0,clearProps:'transform,clipPath,maskImage,webkitMaskImage'});
     this.timeline=gsap.timeline({paused:true,onComplete:onDone}).to(el,{opacity:1,duration:.14,ease:'sine.inOut'}).call(onCover).to(el,{opacity:0,duration:.14,ease:'sine.inOut'});
    }else this.timeline=registry[name]({duration,onCover,onDone,point:payload.point});
    this.timeline.timeScale(this.speed).play();
   }catch(error){report(error);this.recover?.();}
  });
 }
 fastForward(){this.timeline?.timeScale(3);}
 destroy(){if(this.destroyed)return;this.destroyed=true;this.recover?.();this.timeline?.kill();this.overlay.removeEventListener?.('pointerdown',this.onPointer);this.overlay.remove?.();}
}
