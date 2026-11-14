import {it,expect,afterEach} from 'vitest';
import {gsap} from '../anim/easings.js';
import {PieceMotion} from '../anim/pieces.js';
import {PuzzleBoard} from '../board/board.js';
import {CONFIG} from '../config.js';

function piece(){
 const art={x:0,y:0,xPercent:0,yPercent:0,scale:1,scaleX:1,scaleY:1,rotationY:0,opacity:1};
 const rig={y:0,scaleX:1,scaleY:1},classes=new Set();
 const node={x:360,y:180,querySelector:s=>s==='.piece-art'?art:s==='.piece-rig'?rig:null,classList:{add:c=>classes.add(c),remove:c=>classes.delete(c)}};
 return {node,art,rig,classes};
}
const motion=low=>new PieceMotion({low:()=>Boolean(low),duration:.42});
afterEach(()=>{gsap.globalTimeline.clear();gsap.ticker.sleep();});

it('a tapped piece travels from its source square and lands without moving its Chessground node',()=>{
 const p=piece(),m=motion(),t=m.move(p.node,{from:'a2',to:'e6',piece:'b'});
 t.pause().progress(0);expect(p.art.xPercent).toBe(-400);expect(p.art.yPercent).toBe(400);
 t.progress(.5);expect(p.art.xPercent).toBeCloseTo(-200);expect(p.art.yPercent).toBeCloseTo(200);expect(p.rig.y).toBeLessThan(0);expect(p.classes.has('piece-moving')).toBe(true);
 t.progress(1);expect(p.art.xPercent).toBe(0);expect(p.art.yPercent).toBe(0);expect(p.rig.y).toBe(0);expect(p.rig.scaleY).toBe(1);expect(p.node.x).toBe(360);expect(p.node.y).toBe(180);expect(gsap.getTweensOf(p.node)).toHaveLength(0);expect(m.active.size).toBe(0);expect(p.classes.has('piece-moving')).toBe(false);
});
it('knights have a higher arc while a dropped piece settles at the drop square',()=>{
 const knight=piece(),bishop=piece(),drop=piece(),m=motion();
 m.move(knight.node,{from:'b1',to:'c3',piece:'n'}).pause().progress(.45);
 m.move(bishop.node,{from:'b1',to:'c3',piece:'b'}).pause().progress(.45);
 expect(knight.rig.y).toBeLessThan(bishop.rig.y);
 const t=m.move(drop.node,{from:'a1',to:'h8',piece:'r',dragged:true});t.pause().progress(.5);expect(drop.art.xPercent).toBe(0);expect(drop.art.yPercent).toBe(0);expect(t.duration()).toBeLessThan(.2);t.progress(1);expect(drop.rig.y).toBe(0);
});
it('promotion turns and travel compose on one timeline and share a clean landing',()=>{
 const p=piece(),m=motion(),t=m.move(p.node,{from:'e7',to:'e8',piece:'p',promotion:'q'});
 t.pause().progress(0);expect(p.art.yPercent).toBe(100);expect(p.art.rotationY).toBe(75);
 t.progress(.5);expect(p.art.yPercent).toBeGreaterThan(0);expect(p.art.rotationY).toBeGreaterThan(0);
 t.progress(1);expect(p.art.yPercent).toBe(0);expect(p.art.rotationY).toBe(0);
});
it('replacement moves and teardown cancel the previous motion and remove raised stacking',()=>{
 const p=piece(),m=motion(),first=m.move(p.node,{from:'a1',to:'a8',piece:'r'});first.pause().progress(.3);
 const second=m.move(p.node,{from:'a8',to:'h8',piece:'r'});second.pause().progress(.2);expect(m.active.size).toBe(1);expect(first.parent).toBeNull();
 m.clear();expect(m.active.size).toBe(0);expect(p.classes.size).toBe(0);expect(p.art.xPercent).toBe(0);expect(p.art.yPercent).toBe(0);expect(p.rig.y).toBe(0);expect(gsap.getTweensOf(p.art)).toHaveLength(0);expect(gsap.getTweensOf(p.rig)).toHaveLength(0);
});
it('reduced motion uses a short fade with no travel, hop, scale or promotion spin',()=>{
 const p=piece(),m=motion(true),t=m.move(p.node,{from:'a2',to:'h8',piece:'n',promotion:'q'});t.pause().progress(.5);
 expect(t.duration()).toBeLessThan(.15);expect(p.art.xPercent).toBe(0);expect(p.art.yPercent).toBe(0);expect(p.art.rotationY).toBe(0);expect(p.rig.y).toBe(0);expect(p.art.opacity).toBeGreaterThan(.65);t.progress(1);expect(p.art.opacity).toBe(1);
});
it.each([['e1','g1','h1','f1'],['e8','c8','a8','d8']])('castling %s–%s moves both the king and rook together', (from,to,rookFrom,rookTo)=>{
 const king=piece(),rook=piece(),m=motion();
 const board={find:s=>s===to?king.node:s===rookTo?rook.node:null,attempt:{lastMove:[from,to]},motion:m};
 PuzzleBoard.prototype.moveEffect.call(board,to,{piece:'k',from,to});expect(m.active.size).toBe(2);
 const kingMotion=m.active.get(king.node),rookMotion=m.active.get(rook.node);kingMotion.pause().progress(0);rookMotion.pause().progress(0);
 expect(rook.art.xPercent).toBe((rookFrom.charCodeAt(0)-rookTo.charCodeAt(0))*100);expect(kingMotion.duration()).toBe(rookMotion.duration());kingMotion.progress(1);rookMotion.progress(1);expect(rook.art.xPercent).toBe(0);expect(king.art.xPercent).toBe(0);
});
it('even a full board finishes dealing before its first automatic move',()=>{
 const cards=Array.from({length:32},()=>piece().art),m=motion();
 const board={decorate:()=>{},motion:m,root:{querySelectorAll:()=>cards},low:()=>false};
 const t=PuzzleBoard.prototype.deal.call(board);t.pause();expect(t.totalDuration()).toBeLessThan(CONFIG.replySeconds);t.progress(1);for(const art of cards){expect(art.y).toBe(0);expect(art.rotationY).toBe(0);expect(art.scale).toBe(1);}
});
