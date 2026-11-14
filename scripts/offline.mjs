import {readdir,writeFile,readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const walk=async dir=>(await Promise.all((await readdir(dir,{withFileTypes:true})).map(entry=>entry.isDirectory()?walk(dir+'/'+entry.name):dir+'/'+entry.name))).flat();
export async function generateOffline(directory='dist'){
 const files=(await walk(directory)).filter(path=>!path.endsWith('/sw.js'));
 const paths=files.map(path=>'./'+path.slice(directory.length+1));
 const hash=createHash('sha256');for(const path of files)hash.update(await readFile(path));
 const version='looking-glass-'+hash.digest('hex').slice(0,12);
 const script=`const CACHE=${JSON.stringify(version)},FILES=${JSON.stringify(paths)};
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('looking-glass-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{if(e.request.method!=='GET'||new URL(e.request.url).origin!==self.location.origin)return;e.respondWith(caches.open(CACHE).then(cache=>cache.match(e.request).then(cached=>cached||fetch(e.request).catch(()=>e.request.mode==='navigate'?cache.match(new URL('./index.html',self.registration.scope)):Response.error()))));});`;
 await writeFile(directory+'/sw.js',script);return{version,paths,script};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const result=await generateOffline(process.argv[2]||'dist');console.log('Offline cache generated:',result.version,result.paths.length,'local files.');
}
