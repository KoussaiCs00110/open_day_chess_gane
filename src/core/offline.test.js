import {it,expect} from 'vitest';
import {mkdtemp,mkdir,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {runInNewContext} from 'node:vm';
import {generateOffline} from '../../scripts/offline.mjs';
async function fixture(){const dir=await mkdtemp(join(tmpdir(),'looking-glass-cache-'));await mkdir(dir+'/assets');await writeFile(dir+'/index.html','<h1>Alice</h1>');await writeFile(dir+'/assets/game.js','export const local=true;');await writeFile(dir+'/assets/local.ttf','font');return dir;}
it('offline cache includes every local build file and excludes itself',async()=>{const dir=await fixture();try{const first=await generateOffline(dir),second=await generateOffline(dir);expect(first.paths.sort()).toEqual(['./assets/game.js','./assets/local.ttf','./index.html']);expect(first.version).toBe(second.version);expect(first.script).not.toContain('https://');await writeFile(dir+'/assets/game.js','changed');expect((await generateOffline(dir)).version).not.toBe(first.version);}finally{await rm(dir,{recursive:true});}});
it('the built service worker installs, cleans old caches, and serves offline navigation',async()=>{
 const dir=await fixture();try{
  const {version,script}=await generateOffline(dir),listeners={},entries=new Map(),deleted=[];let claimed=false,skipped=false;
  const scope='http://localhost:8000/game/';
  const key=request=>new URL(typeof request==='string'?request:request.url??request.href,scope).href;
  const cache={addAll:async paths=>paths.forEach(path=>entries.set(key(path),{cached:path})),match:async request=>entries.get(key(request))};
  const caches={open:async()=>cache,keys:async()=>[version,'looking-glass-old','another-app'],delete:async name=>deleted.push(name),match:async()=>{throw Error('Do not read another version’s cache');}};
  const self={location:{origin:'http://localhost:8000'},registration:{scope},clients:{claim:()=>claimed=true},skipWaiting:()=>skipped=true,addEventListener:(name,listener)=>listeners[name]=listener};
  runInNewContext(script,{self,caches,URL,Response,fetch:async()=>{throw Error('Internet disconnected');}});
  let pending;listeners.install({waitUntil:p=>pending=p});await pending;expect(skipped).toBe(true);expect(entries.size).toBe(3);
  listeners.activate({waitUntil:p=>pending=p});await pending;expect(claimed).toBe(true);expect(deleted).toEqual(['looking-glass-old']);
  listeners.fetch({request:{url:scope+'chapters',method:'GET',mode:'navigate'},respondWith:p=>pending=p});expect(await pending).toEqual({cached:'./index.html'});
  listeners.fetch({request:{url:scope+'assets/game.js',method:'GET',mode:'cors'},respondWith:p=>pending=p});expect(await pending).toEqual({cached:'./assets/game.js'});
  let intercepted=false;listeners.fetch({request:{url:'https://example.org/club',method:'GET',mode:'navigate'},respondWith:()=>intercepted=true});expect(intercepted).toBe(false);
 }finally{await rm(dir,{recursive:true});}
});
