import { Chess } from 'chess.js';
export function position(fen) {
 const chess=new Chess();
 if(fen&&!chess.load(fen))throw new Error('Invalid FEN: '+fen);
 return chess;
}
export const uci = move => move.from+move.to+(move.promotion||'');
export function play(chess,move) {return chess.move(typeof move==='string'?{from:move.slice(0,2),to:move.slice(2,4),...(move.length>4?{promotion:move[4]}:{})}:move);}
export function destinations(fen){const map=new Map();for(const m of position(fen).moves({verbose:true})){const list=map.get(m.from)||[];if(!list.includes(m.to))list.push(m.to);map.set(m.from,list);}return map;}
export const checkmate = fen => position(fen).in_checkmate();
