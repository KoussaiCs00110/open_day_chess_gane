import {gsap} from './easings.js';
import {CONFIG} from '../config.js';
export class Particles {
 constructor(canvas,low){
  this.canvas=canvas;this.low=low;this.destroyed=false;this.running=false;
  try{this.ctx=canvas.getContext('2d');}catch{this.ctx=null;}
  this.pool=Array.from({length:CONFIG.particleCap},()=>({active:false}));
  this.resize=()=>{const d=Math.min(globalThis.devicePixelRatio||1,2);canvas.width=innerWidth*d;canvas.height=innerHeight*d;this.ctx?.setTransform(d,0,0,d,0,0);};
  this.tick=()=>this.draw();this.resize();addEventListener('resize',this.resize);
 }
 burst(x,y,type='sparkles',count=22,palette){
  if(this.low()||this.destroyed||!this.ctx)return;
  const colors=palette??['#c3a45e','#efe2be','#c9797c','#85a491'];
  const available=this.pool.filter(p=>!p.active).slice(0,count);
  available.forEach(p=>{Object.assign(p,{active:true,x,y,originX:x,originY:y,dx:gsap.utils.random(-160,160),lift:gsap.utils.random(70,180),fall:type==='tea'?gsap.utils.random(100,180):gsap.utils.random(50,140),progress:0,rotation:0,alpha:1,size:gsap.utils.random(3,8),type,color:gsap.utils.random(colors)});gsap.to(p,{progress:1,rotation:gsap.utils.random(-360,360),duration:gsap.utils.random(.8,1.5),ease:'none',onComplete:()=>p.active=false});});
  if(available.length&&!this.running){this.running=true;gsap.ticker.add(this.tick);}
 }
 clear(){for(const p of this.pool){gsap.killTweensOf(p);p.active=false;}this.ctx?.clearRect(0,0,innerWidth,innerHeight);this.running=false;gsap.ticker.remove(this.tick);}
 draw(){
  if(this.destroyed||!this.ctx)return;
  const active=this.pool.some(p=>p.active);if(this.low()||!active){this.clear();return;}
  const c=this.ctx;c.clearRect(0,0,innerWidth,innerHeight);
  for(const p of this.pool){if(!p.active)continue;const t=p.progress;p.x=p.originX+p.dx*t;p.y=p.originY-4*p.lift*t*(1-t)+p.fall*t*t;p.alpha=Math.min(1,(1-t)*3);c.save();c.translate(p.x,p.y);c.rotate(p.rotation*Math.PI/180);c.globalAlpha=p.alpha;c.fillStyle=p.color;if(p.type==='cards'||p.type==='confetti'||p.type==='shards')c.fillRect(-p.size/2,-p.size/2,p.size,p.size*1.6);else{c.beginPath();c.arc(0,0,p.size/2,0,Math.PI*2);c.fill();}c.restore();}
 }
 destroy(){if(this.destroyed)return;this.destroyed=true;this.clear();removeEventListener('resize',this.resize);gsap.ticker.remove(this.tick);}
}
