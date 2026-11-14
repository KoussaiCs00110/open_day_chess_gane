/** Run after npm run build. Supports BASE_URL and CHROMIUM_PATH overrides. */
import {chromium} from '@playwright/test';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {mkdirSync,existsSync,readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
import {position,uci} from '../src/core/chess.js';
import {transitionLabels} from '../src/data/transitions.js';
const base=process.env.BASE_URL||'http://127.0.0.1:4173';
const server=process.env.BASE_URL?null:spawn(process.execPath,[fileURLToPath(new URL('../node_modules/vite/bin/vite.js',import.meta.url)),'preview','--host','127.0.0.1','--port','4173'],{stdio:'pipe'});
let logs='',browser,serverClosed=false,serverCode=null;
server?.once('close',code=>{serverClosed=true;serverCode=code;});server?.once('error',error=>{logs+=error.message;serverClosed=true;serverCode=-1;});
server?.stdout.on('data',data=>logs+=data);server?.stderr.on('data',data=>logs+=data);
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
try{
 for(let i=0;i<80;i++){try{if((await fetch(base)).ok)break;}catch{}if(serverClosed)throw Error('Preview failed (exit '+serverCode+'): '+logs);if(i===79)throw Error('Preview did not start: '+logs);await sleep(150);}
 browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:existsSync('/usr/lib/chromium/chromium')?{executablePath:'/usr/lib/chromium/chromium'}:{}),args:['--no-sandbox','--disable-dev-shm-usage']});
 const context=await browser.newContext({viewport:{width:1366,height:900},reducedMotion:'no-preference'}),page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'||m.type()==='warning'&&/GSAP|Invalid property|not found/i.test(m.text()))errors.push(m.text());});
 const wait=async name=>{await page.waitForFunction(name=>window.lookingGlass?.screen===name&&!window.lookingGlass.manager.busy,name);};
 async function assertBoardGeometry(){
  const report=await page.evaluate(()=>{
   const root=document.querySelector('#chessboard'),board=root.querySelector('cg-board'),bounds=board.getBoundingClientRect(),wrap=root.getBoundingClientRect();
   const errors=[],tolerance=1,cell=bounds.width/8;
   if(bounds.width<80||Math.abs(bounds.width-bounds.height)>tolerance)errors.push('The board is not a usable square');
   if(Math.abs(bounds.width-wrap.width)>tolerance||Math.abs(bounds.height-wrap.height)>tolerance)errors.push('Chessground cached transition-scaled dimensions');
   const cached=window.lookingGlass.board.ground.state.dom.bounds();
   if(Math.abs(cached.width-bounds.width)>tolerance||Math.abs(cached.left-bounds.left)>tolerance||Math.abs(cached.top-bounds.top)>tolerance)errors.push('Cached pointer bounds do not match the visible board');
   for(const node of board.querySelectorAll('piece:not(.ghost)')){
    const key=node.cgKey,r=node.getBoundingClientRect(),file=key.charCodeAt(0)-97,rank=8-Number(key[1]);
    if(Math.abs(r.left-(bounds.left+file*cell))>tolerance||Math.abs(r.top-(bounds.top+rank*cell))>tolerance||Math.abs(r.width-cell)>tolerance||Math.abs(r.height-cell)>tolerance)errors.push('Misaligned piece at '+key);
    const art=node.querySelector('.piece-art');if(art&&parseFloat(getComputedStyle(art).height)>cell+tolerance)errors.push('Artwork overflows its square at '+key);
   }
   if(root.querySelectorAll('coords.files coord').length!==8||root.querySelectorAll('coords.ranks coord').length!==8)errors.push('Missing ranks or files');
   return{errors,width:bounds.width,height:bounds.height};
  });
  assert.deepEqual(report.errors,[],JSON.stringify(report));
 }
 async function assertClocks(){
  await page.waitForFunction(()=>{
   const app=window.lookingGlass,state=app.state,wrappers=[...document.querySelectorAll('#screen .clock-hands')];
   for(const wrapper of wrappers){
    const center=new DOMPoint(80,80).matrixTransform(wrapper.getScreenCTM());
    for(const hand of wrapper.querySelectorAll('.clock-hand-hour,.clock-hand-minute,.clock-hand-second')){
     const point=new DOMPoint(80,80).matrixTransform(hand.getScreenCTM());if(Math.hypot(center.x-point.x,center.y-point.y)>.5)return false;
    }
   }
   if(!state)return true;
   const remaining=state.difficulty==='hardcore'&&state.mode!=='tutorial',seconds=remaining?Math.ceil(state.remaining):Math.floor(state.elapsed);
   for(const [role,period] of [['second',60],['minute',3600],['hour',43200]]){
    const hand=document.querySelector('.watch .clock-hand-'+role);if(!hand)continue;
    const angle=Number(hand.getAttribute('transform')?.match(/^rotate\(([-\d.]+)/)?.[1]);if(!Number.isFinite(angle)||Math.abs(angle-seconds%period/period*360)>.01)return false;
   }return true;
  },null,{timeout:2000});
 }
 const ready=async()=>{await page.waitForFunction(()=>!window.lookingGlass.manager.busy&&!window.lookingGlass.controller.moveBusy&&window.lookingGlass.state?.attempt?.status==='ready');await assertBoardGeometry();await assertClocks();};
 const state=()=>page.evaluate(()=>window.lookingGlass.state);
 const skip=async()=>{await page.locator('[data-action="skip"]').click();};
 mkdirSync('test-results',{recursive:true});await page.goto(base);await wait('START');await assertClocks();await page.screenshot({path:'test-results/start.png'});
 const touchSizes=await page.locator('.utility,[data-action="play"],[data-action="leaderboard"]').evaluateAll(nodes=>nodes.map(node=>({w:node.getBoundingClientRect().width,h:node.getBoundingClientRect().height})));assert.ok(touchSizes.every(s=>s.w>=56&&s.h>=56));
 await page.goto(base+'/transitions-test');await wait('TEST');assert.equal(await page.locator('[data-action="preview-transition"]').count(),10);
 for(const name of Object.keys(transitionLabels)){
  const measured=await page.evaluate(async name=>{const app=window.lookingGlass,offset=app.manager.history.length;await app.navigate('TEST',name,{preview:name});return{ms:app.manager.lastDuration,events:app.manager.history.slice(offset),busy:app.manager.busy,error:app.manager.lastError?.message??null,inert:document.querySelector('#screen').inert};},name);
  assert.ok(measured.ms<1700,`${name} took ${measured.ms}ms`);assert.equal(measured.events.filter(e=>e.phase==='cover').length,1);assert.equal(measured.events.at(-1).phase,'done');assert.equal(measured.busy,false);assert.equal(measured.error,null);assert.equal(measured.inert,false);
  await page.evaluate(name=>{window.lookingGlass.navigate('TEST',name);},name);await page.waitForTimeout(80);await page.locator('#transition-overlay').click({position:{x:8,y:8}});await wait('TEST');
 }
 await page.evaluate(()=>{window.lookingGlass.navigate('TEST','cards');window.lookingGlass.manager.timeline.pause();});await wait('TEST');
 console.log('PASS: all ten real GSAP timelines, normal duration, fast-forward, one covered swap, and stalled-timeline recovery.');
 async function nameEntry(name,mode='normal'){await page.locator('[data-action="play"]').click();await wait('NAME');assert.equal(await page.locator('#name-value').evaluate(el=>document.activeElement===el),true);assert.equal(await page.locator('.name-page .keyboard').count(),0);await page.keyboard.type(name);await page.keyboard.press('Enter');await wait('MODE');await page.locator(`[data-mode-card="${mode}"]`).hover();await page.locator(`[data-action="choose-mode"][data-mode="${mode}"]`).click();await wait('INTRO');await skip();await wait('TUTORIAL');await ready();}
 let verifiedPieceTravel=false;
 async function boardMove(move,drag=false){
  const rect=await page.locator('#chessboard cg-board').boundingBox(),point=s=>({x:rect.x+(s.charCodeAt(0)-97+.5)*rect.width/8,y:rect.y+(8-Number(s[1])+.5)*rect.height/8});const from=point(move.slice(0,2)),to=point(move.slice(2,4));
  if(drag){await page.mouse.move(from.x,from.y);await page.mouse.down();await page.mouse.move(to.x,to.y,{steps:14});await page.mouse.up();}else{await page.mouse.click(from.x,from.y);await page.mouse.click(to.x,to.y);}
  if(move[4]){await page.waitForSelector('.promotion-choices');await page.locator(`[data-action="promote"][data-role="${move[4]}"]`).click();}
  if(!verifiedPieceTravel&&!drag&&!move[4]&&!await page.evaluate(()=>window.lookingGlass.low())){
   await page.waitForFunction(to=>{const b=window.lookingGlass.board,n=b?.find(to);return n&&b.motion.active.has(n);},move.slice(2,4));
   const report=await page.evaluate(move=>{
    const board=window.lookingGlass.board,node=board.find(move.slice(2,4)),t=board.motion.active.get(node),art=node.querySelector('.piece-art'),nativeTransform=node.style.transform;
    t.pause().progress(.5);const outer=node.getBoundingClientRect(),mid=art.getBoundingClientRect();
    const delta={x:(mid.left-outer.left)/outer.width,y:(mid.top-outer.top)/outer.height};
    t.progress(1);const landed=art.getBoundingClientRect();
    return{delta,expected:{x:(move.charCodeAt(0)-move.charCodeAt(2))*.5,y:(Number(move[3])-Number(move[1]))*.5},nativeStable:nativeTransform===node.style.transform,landed:Math.abs(landed.left-outer.left)<1&&Math.abs(landed.top-outer.top)<1,raised:node.classList.contains('piece-moving')};
   },move);
   assert.ok(Math.abs(report.delta.x-report.expected.x)<.02,JSON.stringify(report));assert.ok(Math.abs(report.delta.y-report.expected.y)<.02,JSON.stringify(report));assert.equal(report.nativeStable,true);assert.equal(report.landed,true);assert.equal(report.raised,false);verifiedPieceTravel=true;
  }
 }
 async function solvePuzzle(){for(let ply=0;ply<12;ply++){await ready();const s=await state(),move=s.attempt.moves[s.attempt.index];await boardMove(move,ply%2===1);await page.waitForFunction(index=>window.lookingGlass.state?.attempt?.index!==index,s.attempt.index);await page.waitForFunction(()=>window.lookingGlass.state?.attempt?.status==='solved'||(!window.lookingGlass.controller.moveBusy&&window.lookingGlass.state?.attempt?.status==='ready'));if((await state()).attempt.status==='solved'){await wait('REACTION');return;}}throw Error('Puzzle did not finish');}
 function wrongMove(s){return position(s.attempt.fen).moves({verbose:true}).find(move=>{if(uci(move)===s.attempt.moves[s.attempt.index])return false;const board=position(s.attempt.fen);board.move(move);return!board.in_checkmate();});}
 await page.locator('[data-action="back"]').click();await wait('START');await nameEntry('ALICE');assert.equal((await state()).elapsed,0);await solvePuzzle();await skip();await wait('MAP');assert.equal((await state()).score,0);
 for(let chapter=1;chapter<=10;chapter++){
  await page.locator('[data-action="enter-chapter"]').click();await wait('SCENE');const paused=(await state()).elapsed;await page.waitForTimeout(150);assert.equal((await state()).elapsed,paused);if(chapter===2){await page.waitForFunction(()=>window.lookingGlass.scene.effects.length>0);const pose=await page.evaluate(()=>{const scene=window.lookingGlass.scene;scene.pause();return scene.timeline.time();});await page.waitForTimeout(120);assert.equal(await page.evaluate(()=>window.lookingGlass.scene.timeline.time()),pose);assert.equal(await page.evaluate(()=>window.lookingGlass.scene.effects.every(t=>t.paused())),true);await page.evaluate(()=>{window.lookingGlass.scene.resume();window.lookingGlass.scene.hurry();});}await skip();await wait('PUZZLE');await ready();assert.equal((await state()).chapter,chapter);
  if(chapter===1){
   for(const viewport of [{width:1024,height:768},{width:844,height:390},{width:390,height:844},{width:1366,height:900}]){
    await page.setViewportSize(viewport);await page.waitForTimeout(200);await ready();
    await page.screenshot({path:`test-results/board-${viewport.width}x${viewport.height}.png`});
   }
   await page.locator('[data-action="language"]').click();await wait('PUZZLE');await ready();
   await page.locator('[data-action="language"]').click();await wait('PUZZLE');await ready();
   const before=(await state()).elapsed;await page.locator('[data-action="hint"]').click();assert.equal(await page.locator('#cat-visit .grin').getAttribute('transform'),'translate(62 126) scale(1.12)');assert.equal((await state()).hintsRemaining,2);assert.ok((await state()).elapsed>=before+20);await page.locator('[data-action="hint"]').click();assert.equal(await page.locator('#cat-visit .grin').getAttribute('transform'),'translate(62 126) scale(1.12)');assert.equal((await state()).hintsRemaining,1);await page.locator('[data-action="drink"]').click();assert.equal((await state()).powers.drink,0);await page.locator('[data-action="eat"]').click();const frozen=(await state()).elapsed;await page.waitForTimeout(350);assert.equal((await state()).elapsed,frozen);await assertClocks();
   const wrong=wrongMove(await state());await boardMove(uci(wrong));await wait('REACTION');assert.equal((await state()).lives,2);await skip();await wait('PUZZLE');await ready();await page.screenshot({path:'test-results/puzzle.png'});
  }
  if(chapter===2){await page.locator('[data-action="hint"]').click();assert.equal((await state()).hintsRemaining,0);}
  if(chapter===3){
   const pending=(await state()).attempt.moves[(await state()).attempt.index];await boardMove(pending);await page.emulateMedia({reducedMotion:'reduce'});await wait('PUZZLE');await ready();assert.ok((await state()).attempt.index>=3);await page.emulateMedia({reducedMotion:'no-preference'});await wait('PUZZLE');await ready();
  }
  if(chapter===6){const original=(await state()).attempt.fen,life=(await state()).lives;await page.locator('[data-action="secret"]').click();await wait('PUZZLE');await ready();assert.equal((await state()).mode,'bonus');const wrong=wrongMove(await state());await boardMove(uci(wrong));await wait('REACTION');assert.equal((await state()).lives,life);await skip();await wait('PUZZLE');await ready();await solvePuzzle();await skip();await wait('PUZZLE');await ready();assert.equal((await state()).attempt.fen,original);assert.equal((await state()).secretSolved,true);}
  await solvePuzzle();await skip();if(chapter<10)await wait('MAP');else{await wait('WIN');assert.equal(await page.locator('.actor.alice .alice-crown').evaluate(el=>getComputedStyle(el).opacity),'0');}
 }
 await skip();await wait('RESULT');await page.waitForTimeout(1200);assert.equal((await state()).solved.length,10);assert.ok((await state()).score>5000);await page.screenshot({path:'test-results/victory.png'});await page.locator('[data-action="leaderboard"]').click();await wait('LEADERBOARD');assert.equal(await page.locator('.board-row.current').count(),1);
 console.log('PASS: keyboard, tutorial, ten chapters, actual tap/drag moves, hints, powers, promotion secret, victory, and ranked persistence.');
 await page.locator('[data-action="language"]').click();await wait('LEADERBOARD');assert.equal(await page.locator('html').getAttribute('dir'),'rtl');await page.screenshot({path:'test-results/arabic.png'});await page.locator('[data-action="language"]').click();await wait('LEADERBOARD');
 await page.keyboard.press('Control+Shift+A');await wait('ADMIN');for(const key of '1865')await page.locator(`[data-key="${key}"]`).click();await page.locator('[data-action="unlock"]').click();await wait('ADMIN');assert.ok(await page.locator('[data-action="export"]').isVisible());await page.locator('[data-action="test"]').click();await wait('TEST');await page.locator('[data-action="effects"]').click();await wait('TEST');assert.equal(await page.evaluate(()=>window.lookingGlass.low()),true);
 await page.locator('[data-action="back"]').click();await wait('START');await nameEntry('RED');await solvePuzzle();await skip();await wait('MAP');await page.locator('[data-action="enter-chapter"]').click();await wait('SCENE');await skip();await wait('PUZZLE');await ready();
 for(let i=0;i<3;i++){const wrong=wrongMove(await state());await boardMove(uci(wrong));if(i<2){await wait('REACTION');await skip();await wait('PUZZLE');await ready();}else await wait('LOSE');}assert.equal((await state()).lives,0);await skip();await wait('RESULT');await page.screenshot({path:'test-results/lose.png'});

 // Mode integration: use real controls, then diagnostic clock positioning only
 // to exercise the inactivity/expiry boundaries without a minute-long wait.
 async function firstChapter(name,mode){await nameEntry(name,mode);await solvePuzzle();await skip();await wait('MAP');await page.locator('[data-action="enter-chapter"]').click();await wait('SCENE');await skip();await wait('PUZZLE');await ready();}
 await page.evaluate(()=>window.lookingGlass.navigate('START','grin'));await wait('START');
 await firstChapter('EASY','easy');assert.equal((await state()).lives,5);assert.deepEqual((await state()).powers,{drink:3,eat:2});
 await page.locator('[data-action="hint"]').click();assert.equal((await state()).score,0);assert.equal((await state()).hintsRemaining,4);
 {const wrong=wrongMove(await state());await boardMove(uci(wrong));await ready();assert.equal((await state()).lives,4.5);assert.equal(await page.locator('#hint-text').textContent(),await page.evaluate(()=>window.lookingGlass.controller.puzzle.whyWrong.en));}
 await page.evaluate(()=>{window.lookingGlass.controller.lastInput=performance.now()-21000;});await page.waitForFunction(()=>window.lookingGlass.controller.autoHintShown);assert.equal((await state()).hintsUsed,1);
 await page.evaluate(()=>window.lookingGlass.navigate('START','grin'));await wait('START');assert.equal(await state(),null);
 await firstChapter('HARD','hardcore');assert.equal((await state()).lives,1);assert.equal(await page.locator('[data-action="drink"],[data-action="eat"]').count(),0);assert.ok(await page.locator('.countdown-watch').isVisible());
 {const before=await state();await page.locator('[data-action="hint"]').click();assert.equal((await state()).hintsRemaining,0);assert.equal((await state()).score,before.score);}
 {const wrong=wrongMove(await state());await boardMove(uci(wrong));await wait('LOSE');assert.equal((await state()).lives,0);const history=await page.evaluate(()=>window.lookingGlass.manager.history);assert.equal(history.at(-1).name,'shatter');assert.equal(history.at(-1).to,'LOSE');}
 await skip();await wait('RESULT');await page.locator('[data-action="leaderboard"]').click();await wait('LEADERBOARD');assert.equal(await page.locator('.board-hardcore .board-row.current').count(),1);
 for(const mode of ['easy','normal','all','hardcore']){await page.locator(`[data-action="board-mode"][data-mode="${mode}"]`).click();await wait('LEADERBOARD');assert.ok(await page.locator('.board-'+mode).isVisible());}
 await page.evaluate(()=>window.lookingGlass.navigate('START','grin'));await wait('START');await firstChapter('WATCH','hardcore');
 await page.locator('[data-action="legend"]').click();await page.evaluate(()=>window.lookingGlass.controller.session.remaining=.1);await wait('LOSE');assert.equal((await state()).lossReason,'timeout');assert.equal(await page.locator('.modal-backdrop').count(),0);assert.equal(await page.locator('.captured-card').count(),0);assert.equal(await page.locator('body').evaluate(el=>el.classList.contains('time-critical')),false);assert.equal(await page.locator('.danger-vignette').evaluate(el=>getComputedStyle(el).opacity),'0');await skip();await wait('RESULT');
 await page.keyboard.press('Control+Shift+A');await wait('ADMIN');for(const key of '1865')await page.locator(`[data-key="${key}"]`).click();await page.locator('[data-action="unlock"]').click();await wait('ADMIN');
 await page.locator('[data-action="toggle-hardcore"]').click();await wait('ADMIN');assert.equal(await page.evaluate(()=>window.lookingGlass.controller.hardcoreEnabled),false);
 await page.locator('[data-action="back"]').click();await wait('START');await page.locator('[data-action="play"]').click();await wait('NAME');await page.keyboard.type('A');await page.keyboard.press('Enter');await wait('MODE');
 await page.locator('[data-mode-card="hardcore"]').hover();assert.equal(await page.locator('[data-action="choose-mode"][data-mode="hardcore"]').isDisabled(),true);
 await page.locator('[data-action="language"]').click();await wait('MODE');assert.equal(await page.locator('html').getAttribute('dir'),'rtl');
 await page.locator('[data-action="language"]').click();await wait('MODE');await page.locator('[data-action="back"]').click();await wait('START');
 console.log('PASS: three mode cards, Easy half cups/free hints/inactivity guidance, Hardcore instant loss/timeout through a dialog, board tabs, session discard, admin disable, mode RTL.');
 await page.evaluate(()=>window.lookingGlass.controller.lastInput=performance.now()-65000);await wait('START');
 const touch=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,reducedMotion:'reduce'}),phone=await touch.newPage();await phone.goto(base);await phone.locator('[data-action="play"]').tap();await phone.waitForFunction(()=>window.lookingGlass.screen==='NAME'&&!window.lookingGlass.manager.busy);await phone.keyboard.type('CAT');assert.equal(await phone.locator('#name-value').inputValue(),'CAT');await phone.screenshot({path:'test-results/phone.png'});assert.equal(await phone.locator('.name-page .keyboard').count(),0);assert.equal(await phone.locator('#name-value').getAttribute('inputmode'),'none');await touch.close();
 await page.goto(base);await page.evaluate(async()=>{await navigator.serviceWorker.ready;if(!navigator.serviceWorker.controller)await new Promise(resolve=>navigator.serviceWorker.addEventListener('controllerchange',resolve,{once:true}));});await context.setOffline(true);await page.reload();await wait('START');assert.ok(await page.locator('[data-action="play"]').isVisible());assert.deepEqual(errors,[]);
 console.log('PASS: loss recovery, Arabic RTL, low effects, admin PIN, idle reset, physical name entry, offline reload, no console errors.');
}finally{await browser?.close();server?.kill('SIGTERM');}
