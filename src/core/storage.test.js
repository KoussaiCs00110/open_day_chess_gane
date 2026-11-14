import {describe,it,expect} from 'vitest';
import {LocalLeaderboard,sortEntries} from '../storage/leaderboard.js';
const memory=()=>{const data=new Map();return{getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v)}};
const entry=(id,score,time,created=1)=>({id,name:id,score,time,mistakes:0,created});
describe('swappable leaderboard',()=>{
 it('sorts by score descending, time ascending, then stable date',()=>{expect(sortEntries([entry('slow',100,50),entry('fast',100,10),entry('best',300,90)]).map(e=>e.id)).toEqual(['best','fast','slow']);});
 it('persists unique IDs, ranks, deletes, resets, and limits top 20',()=>{const storage=memory(),b=new LocalLeaderboard(storage);for(let i=0;i<25;i++)b.add(entry(String(i),i*100,25));b.add(entry('24',100,100));expect(b.all()).toHaveLength(25);expect(b.top()).toHaveLength(20);expect(new LocalLeaderboard(storage).rank('24')).toBe(1);b.delete('24');expect(b.rank('24')).toBe(0);b.reset();expect(b.all()).toEqual([]);});
 it('falls back to session memory with blocked storage',()=>{const b=new LocalLeaderboard({getItem(){throw Error('blocked')},setItem(){throw Error('blocked')}});b.add(entry('Alice',100,30));expect(b.top()[0].name).toBe('Alice');expect(b.available).toBe(false);});
 it('recovers corrupt JSON and rejects malformed records',()=>{expect(new LocalLeaderboard({getItem:()=>'{broken'}).all()).toEqual([]);expect(new LocalLeaderboard({getItem:()=>JSON.stringify([{name:'bad',score:'no',time:1}])}).all()).toEqual([]);});
 it('exports time and mistakes and prevents CSV formula injection',()=>{const b=new LocalLeaderboard(memory());b.add({...entry('csv',100,22),name:'=CMD("x")',mistakes:2});expect(b.exportCSV()).toContain('time_seconds,mistakes');expect(b.exportCSV()).toContain("'=CMD");expect(b.exportCSV()).toContain('""x""');});
});
