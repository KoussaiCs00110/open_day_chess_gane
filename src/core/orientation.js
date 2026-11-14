// Chess is symmetric under color exchange + rank reflection. Keep source data
// alongside the adapted record so Lichess puzzles for Black can be played White.
const exchange=text=>[...text].map(c=>/[a-z]/.test(c)?c.toUpperCase():/[A-Z]/.test(c)?c.toLowerCase():c).join('');
const square=s=>s[0]+(9-Number(s[1]));
export function orientPuzzleForWhite(record){
 const [board,turn,castling,ep,halfmove,fullmove]=record.fen.split(' ');
 if(turn==='b')return record;
 const rights=exchange(castling);
 return {...record,fen:[board.split('/').reverse().map(exchange).join('/'),'b',rights==='-'?'-':[...'KQkq'].filter(c=>rights.includes(c)).join(''),ep==='-'?'-':square(ep),halfmove,fullmove].join(' '),moves:record.moves.map(m=>square(m.slice(0,2))+square(m.slice(2,4))+m.slice(4)),orientation:'color-exchange-rank-reflection',sourceFen:record.fen,sourceMoves:[...record.moves]};
}
