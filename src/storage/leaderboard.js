import { CONFIG, MODES } from '../config.js';
import { modeRules, normalizedScore } from '../core/modes.js';
export const sortEntries=(entries,mode='normal')=>[...entries].sort((a,b)=>(mode==='all'?normalizedScore(b)-normalizedScore(a):b.score-a.score)||a.time-b.time||a.created-b.created);
const valid=e=>e&&typeof e.id==='string'&&typeof e.name==='string'&&Number.isFinite(e.score)&&Number.isFinite(e.time)&&Number.isFinite(e.created);
export class LocalLeaderboard {
 constructor(storage){try{this.storage=storage??globalThis.localStorage;}catch{this.storage=null;}this.memory=new Map();this.available=true;}
 all(mode='normal'){
  if(mode==='all')return sortEntries(Object.keys(MODES).flatMap(id=>this.all(id)),'all');
  const rules=modeRules(mode);
  try{
   let text=this.storage.getItem(rules.leaderboardKey);
   if(text===null&&mode==='normal'){
    const legacy=JSON.parse(this.storage.getItem(CONFIG.storageKey)||'[]');
    if(Array.isArray(legacy)&&legacy.some(valid)){this.write(legacy.filter(valid).map(e=>({...e,mode:'normal'})),mode);text=this.storage.getItem(rules.leaderboardKey);}
   }
   const raw=JSON.parse(text||'[]');
   return sortEntries(Array.isArray(raw)?raw.filter(e=>valid(e)&&(!e.mode||e.mode===mode)).map(e=>({...e,mode})):[],mode);
  }catch{this.available=false;return sortEntries(this.memory.get(mode)||[],mode);}
 }
 write(entries,mode='normal'){const key=modeRules(mode).leaderboardKey;this.memory.set(mode,entries);try{this.storage.setItem(key,JSON.stringify(entries));}catch{this.available=false;}}
 add(entry,mode=entry.mode??'normal'){const entries=this.all(mode);if(!entries.some(e=>e.id===entry.id))entries.push({...entry,mode});this.write(sortEntries(entries,mode).slice(0,CONFIG.maxStoredScores),mode);return this.rank(entry.id,mode);}
 rank(id,mode='normal'){return this.all(mode).findIndex(e=>e.id===id)+1;}
 top(mode='normal'){return this.all(mode).slice(0,CONFIG.leaderboardLimit);}
 delete(id,mode='normal'){this.write(this.all(mode).filter(e=>e.id!==id),mode);}
 reset(mode='normal'){this.write([],mode);}
 exportCSV(mode='normal'){const escape=value=>'"'+String(value).replace(/^[=+@-]/,"'$&").replaceAll('"','""')+'"';return '\uFEFFrank,mode,name,score,normalized_score,time_seconds,mistakes,date\r\n'+this.all(mode).map((e,i)=>[i+1,e.mode,e.name,e.score,normalizedScore(e),Math.round(e.time),e.mistakes,new Date(e.created).toISOString()].map(escape).join(',')).join('\r\n');}
}
export const createLeaderboard=storage=>new LocalLeaderboard(storage);
export const readSetting=(key,fallback)=>{try{return JSON.parse(localStorage.getItem('alice:'+key))??fallback;}catch{return fallback;}};
export const saveSetting=(key,value)=>{try{localStorage.setItem('alice:'+key,JSON.stringify(value));}catch{}};
