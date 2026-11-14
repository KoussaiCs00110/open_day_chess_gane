import '../../vendor/chessground/assets/chessground.base.css';
import './board.css';
import { sizeBoardFrame } from './layout.js';
import { Chessground } from '@lichess-org/chessground';
import { gsap } from '../anim/easings.js';
import { PieceMotion } from '../anim/pieces.js';
import { destinations,position } from '../core/chess.js';
import { piece } from '../assets/svg/art.js';
import { CONFIG } from '../config.js';
export class PuzzleBoard {
 constructor(root,{attempt,onMove,onSelect,low,audio,particles,showDests=true}){
  Object.assign(this,{root,low,audio,particles,showDests});this.attempt=attempt;this.flights=new Set();this.context=gsap.context(()=>{},root);this.pieceTweens=new Map();this.destroyed=false;this.slot=root.closest('.board-slot');this.geometry=sizeBoardFrame(this.slot);
  for(const name of ['decorate','deal','salute','sync','moveEffect','captureEffect','mate','shuffle','recover']){const original=this[name].bind(this);this[name]=(...args)=>{if(this.destroyed)return;let result;this.context.add(()=>{result=original(...args);});return result;};}
  this.motion=new PieceMotion({low,duration:CONFIG.moveSeconds});
  this.ground=Chessground(root,{fen:attempt.fen,orientation:'white',turnColor:position(attempt.fen).turn()==='w'?'white':'black',coordinates:true,ranksPosition:'left',disableContextMenu:true,blockTouchScroll:true,animation:{enabled:false},movable:{free:false,color:'white',dests:destinations(attempt.fen),showDests,events:{after:(from,to)=>{this.pendingInput={from,to,dragged:this.ground.state.stats.dragged};onMove(from,to);}}},premovable:{enabled:false},draggable:{enabled:true,showGhost:true},selectable:{enabled:true},drawable:{enabled:false,visible:true,brushes:{gold:{key:'gold',color:'#c99d43',opacity:1,lineWidth:12},green:{key:'green',color:'#42775f',opacity:.8,lineWidth:10}}},events:{select:key=>{this.salute(key);onSelect?.(key);}}});
  this.observer=new MutationObserver(()=>this.decorate());this.observer.observe(root,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});this.decorate();
  this.onResize=()=>this.resize();
  if(this.slot&&typeof ResizeObserver!=='undefined'){this.layoutObserver=new ResizeObserver(this.onResize);this.layoutObserver.observe(this.slot);}
  window.addEventListener('resize',this.onResize,{passive:true});
 }
 decorate(){
  if(this.destroyed)return;
  for(const [node,tweens] of this.pieceTweens){if(!this.root.contains(node)){tweens.forEach(t=>t.kill());this.pieceTweens.delete(node);}}
  for(const node of this.motion.active.keys())if(!this.root.contains(node))this.motion.stop(node);
  for(const node of this.root.querySelectorAll('piece')){
   const role=['pawn','rook','knight','bishop','queen','king'].find(r=>node.classList.contains(r));if(!role)continue;
   const color=node.classList.contains('black')?'black':'white',key=color+'-'+role;
   if(node.dataset.art===key)continue;this.pieceTweens.get(node)?.forEach(t=>t.kill());this.pieceTweens.delete(node);node.dataset.art=key;node.innerHTML=piece(role,color);
   if(!this.low()){const body=node.querySelector('.soldier-body'),eyes=node.querySelector('.piece-eyes');const tweens=[];tweens.push(gsap.to(body,{y:-1.2,duration:gsap.utils.random(1.4,2.5),repeat:-1,yoyo:true,ease:'sine.inOut'}));tweens.push(gsap.timeline({delay:gsap.utils.random(1,4),repeat:-1,repeatDelay:gsap.utils.random(2.5,5)}).to(eyes,{scaleY:.1,transformOrigin:'center',duration:.08}).to(eyes,{scaleY:1,duration:.12}));this.pieceTweens.set(node,tweens);}
  }
 }
 deal(){this.decorate();this.motion.clear();const cards=this.root.querySelectorAll('piece:not(.ghost)>.piece-art');return gsap.fromTo(cards,{y:this.low()?0:-60,rotationY:this.low()?0:75,scale:this.low()?1:.9,opacity:this.low()?.65:1},{y:0,rotationY:0,scale:1,opacity:1,duration:this.low()?.15:.48,ease:this.low()?'power1.out':'power3.out',stagger:this.low()?0:{amount:.14},overwrite:'auto'});}
 salute(key){const node=this.find(key);if(!node||this.motion.active.has(node))return;this.motion.stop(node);const art=node.querySelector('.piece-art');if(!this.low()){gsap.to(art,{scale:1.07,y:-3,duration:.16,yoyo:true,repeat:1,ease:'power2.out',overwrite:'auto'});gsap.fromTo(node.querySelector('.soldier-arm'),{rotation:0},{rotation:-22,duration:.16,yoyo:true,repeat:1,transformOrigin:'50% 30%',overwrite:'auto'});}}
 find(key){return [...this.root.querySelectorAll('piece')].find(n=>n.cgKey===key&&!n.classList.contains('ghost'));}
 sync(attempt,interactive=true){
  this.moveInput=this.pendingInput;this.pendingInput=null;this.attempt=attempt;const chess=position(attempt.fen);this.ground.set({fen:attempt.fen,turnColor:chess.turn()==='w'?'white':'black',lastMove:attempt.lastMove,check:chess.in_check(),movable:{color:interactive&&attempt.status==='ready'?'white':undefined,dests:interactive&&attempt.status==='ready'?destinations(attempt.fen):new Map()}});this.ground.state.dom.redrawNow();this.decorate();
  if(chess.in_check()){const king=[...this.ground.state.pieces].find(([,p])=>p.role==='king'&&p.color===(chess.turn()==='w'?'white':'black'));const node=king&&this.find(king[0]);if(node&&!this.low()){const head=node.querySelector('.soldier-head');gsap.killTweensOf(head,'x');gsap.timeline().to(head,{x:-2,duration:.05}).to(head,{x:2,duration:.06,repeat:3,yoyo:true,ease:'power2.inOut'}).to(head,{x:0,duration:.06,ease:'power2.out'});}}
 }
 moveEffect(to,move){
  const node=this.find(to);if(!node)return;
  const from=move?.from??this.attempt.lastMove?.[0],dragged=this.moveInput?.from===from&&this.moveInput?.to===to&&this.moveInput.dragged;
  const promoted=move?.promotion??(move?.piece==='p'?position(this.attempt.fen).get(to)?.type:undefined),promotion=promoted==='p'?undefined:promoted;
  this.motion.move(node,{...move,promotion,from,to,dragged});this.moveInput=null;
  if(move?.piece==='k'&&from&&Math.abs(from.charCodeAt(0)-to.charCodeAt(0))===2){const right=to[0]>from[0],rank=to[1];this.motion.move(this.find((right?'f':'d')+rank),{from:(right?'h':'a')+rank,to:(right?'f':'d')+rank,piece:'r'});}
  if(promotion){const r=node.getBoundingClientRect();this.particles.burst(r.x+r.width/2,r.y,'sparkles',25);}
 }
 captureEffect(square,role,color){
  const r=this.root.getBoundingClientRect(),file=square.charCodeAt(0)-97,rank=8-Number(square[1]),el=document.createElement('div'),low=this.low();
  el.className='captured-card';el.innerHTML=piece(role,color);Object.assign(el.style,{left:r.left+file*r.width/8+'px',top:r.top+rank*r.height/8+'px',width:r.width/8+'px',height:r.height/8+'px'});document.body.append(el);this.flights.add(el);
  const impact=low?0:CONFIG.moveSeconds*.65;
  const t=gsap.timeline({onComplete:()=>{el.remove();this.flights.delete(el);}});
  t.call(()=>this.particles.burst(r.left+(file+.5)*r.width/8,r.top+(rank+.5)*r.height/8,'cards',12),[],impact);
  t.to(el,low?{opacity:0,duration:.15,ease:'power1.out'}:{motionPath:{path:[{x:0,y:0},{x:35,y:-85},{x:90,y:-35}],curviness:1.5},rotation:160,rotationY:75,scale:.1,opacity:0,duration:.6,ease:'power2.in'},impact);
 }
 shapes(shapes){this.ground.setAutoShapes(shapes);}
 mate(){const king=[...this.ground.state.pieces].find(([,p])=>p.role==='king'&&p.color==='black');const node=king&&this.find(king[0]);if(!node)return;const crown=node.querySelector('.piece-crown');if(crown)gsap.to(crown,{x:this.low()?2:25,y:this.low()?5:45,rotation:this.low()?5:160,duration:.5,ease:'power2.in'});gsap.to(node.querySelector('.piece-art'),{rotationY:this.low()?0:90,scale:this.low()?.95:.85,duration:.4,delay:.3,ease:'power2.in'});}
 shuffle(){this.motion.clear();return gsap.to(this.root.querySelectorAll('piece:not(.ghost)>.piece-art'),{rotationY:this.low()?0:90,y:this.low()?0:-10,opacity:this.low()?0:1,duration:this.low()?.1:.22,stagger:this.low()?0:.006,ease:'power2.in',overwrite:'auto'});}
 recover(gentle=false){if(!gentle){this.deal();return;}this.motion.clear();gsap.fromTo(this.root.querySelectorAll('piece:not(.ghost)>.piece-art'),{y:this.low()?0:-7,scaleY:this.low()?1:.97,opacity:this.low()?.65:1},{y:0,scaleY:1,opacity:1,duration:this.low()?.15:.42,ease:this.low()?'power1.out':'back.out(1.4)',overwrite:'auto'});}
 resize(){
  if(this.destroyed)return;
  const next=sizeBoardFrame(this.slot);
  this.ground.state.dom.bounds.clear();
  if(next&&next.board>0&&next.board!==this.geometry?.board){this.geometry=next;this.ground.redrawAll();this.decorate();}
 }
 destroy(){this.destroyed=true;this.observer.disconnect();this.layoutObserver?.disconnect();window.removeEventListener('resize',this.onResize);this.motion.clear();this.context.revert();this.flights.forEach(el=>el.remove());this.flights.clear();this.pieceTweens.forEach(tweens=>tweens.forEach(t=>t.kill()));this.pieceTweens.clear();this.ground.destroy();}
}
