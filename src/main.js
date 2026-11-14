import './style.css';
import './modes.css';
import { CONFIG, MODES } from './config.js';
import dictionary from './data/i18n.json';
import dialogue from './data/dialogue.json';
import chapters from './data/chapters.json';
import {puzzlePool,chapterPuzzle} from './data/pools.js';
import {modeRules,isCountdown,parTime} from './core/modes.js';
import {createSession,selectMode,autoHint,loadPuzzle,makeMove,autoReply,useHint,usePower,advanceChapter,enterBonus,returnFromBonus} from './core/game.js';
import {advanceTimer,checkTimeout,formatTime} from './core/timer.js';
import {position} from './core/chess.js';
import {badges} from './core/scoring.js';
import {solutionArrow} from './core/puzzle.js';
import {validateName} from './core/names.js';
import {changeScreen} from './core/state.js';
import {createLeaderboard,readSetting,saveSetting} from './storage/leaderboard.js';
import {gsap,Flip} from './anim/easings.js';
import {TransitionManager} from './anim/transitions/manager.js';
import {captureShared,playShared} from './anim/shared.js';
import {Particles} from './anim/particles.js';
import {AudioEngine} from './anim/audio.js';
import {Clocks} from './anim/clocks.js';
import {CharacterRig} from './anim/characters/rig.js';
import {CutsceneEngine} from './anim/cutscenes/engine.js';
import {shake,punch} from './anim/camera.js';
import {PuzzleBoard} from './board/board.js';
import {sizeBoardFrame} from './board/layout.js';
import {background,character,clock,cup,piece,grin} from './assets/svg/art.js';
import {button,cups,esc,objective} from './screens/ui.js';
import start from './screens/start.js';
import nameScreen from './screens/name.js';
import modeScreen from './screens/mode.js';
import {hintCostLabel} from './screens/mode-ui.js';
import story from './screens/intro.js';
import map from './screens/map.js';
import puzzleScreen from './screens/puzzle.js';
import resultScreen from './screens/result.js';
import leaderboard from './screens/leaderboard.js';
import admin from './screens/admin.js';
import test from './screens/transitions-test.js';
const scenes=Object.fromEntries(Object.entries(import.meta.glob('./anim/cutscenes/*.json',{eager:true,import:'default'})).map(([key,value])=>[key.split('/').pop().replace('.json',''),value]));
const renderers={START:start,NAME:nameScreen,MODE:modeScreen,INTRO:story,TUTORIAL:puzzleScreen,MAP:map,SCENE:story,PUZZLE:puzzleScreen,REACTION:story,WIN:story,LOSE:story,RESULT:resultScreen,LEADERBOARD:leaderboard,ADMIN:admin,TEST:test};
const app=document.querySelector('#app');
app.innerHTML=`<div class="background">${background()}<div class="world-scrim"></div></div><main id="screen"></main><nav class="utility-bar" aria-label="Game settings"></nav><canvas id="particles" aria-hidden="true"></canvas><div class="danger-vignette" aria-hidden="true"></div><div id="announcer" class="sr-only" aria-live="polite"></div>`;
const screen=document.querySelector('#screen'),reduced=matchMedia('(prefers-reduced-motion: reduce)');
const c={screen:'START',lang:readSetting('language','en'),low:readSetting('low',false),muted:readSetting('muted',false),idleSeconds:readSetting('idle',CONFIG.idleSeconds),lastInput:performance.now(),name:'',pin:'',session:null,payload:{},resultId:null,rank:0,lastMode:'normal',boardMode:'normal',adminMode:'normal',hardcoreEnabled:readSetting('hardcoreEnabled',MODES.hardcore.enabled),modeChoosing:false,autoHintShown:false,adminUnlocked:false,previousChapter:1,moveBusy:false,loading:false,paused:false,board:createLeaderboard(),
 t(key){if(key==='club')return this.lang==='ar'?CONFIG.clubNameAr:CONFIG.clubName;return dictionary[this.lang]?.[key]??dictionary.en[key]??key;},number(value){return new Intl.NumberFormat(this.lang==='ar'?'ar':'en').format(Math.round(value));},
 get chapter(){return chapters[(this.session?.chapter||1)-1];},get rules(){return modeRules(this.session);},get chapterText(){const text=dialogue[this.lang].chapters[String(this.session?.chapter||1)],p=chapterPuzzle(this.session?.difficulty,this.session?.chapter||1);return (this.session?.difficulty??'normal')==='normal'&&![8,9].includes(this.session?.chapter)?text:{...text,intro:[text.intro[0],this.t('storyTactic')+' '+objectiveText(p)]};},get puzzle(){const pool=puzzlePool(this.session?.difficulty);return pool.find(p=>p.id===this.session?.puzzleId)||chapterPuzzle(this.session?.difficulty,this.session?.chapter)||pool[0];}
};
if(!dictionary[c.lang])c.lang='en';c.idleSeconds=Number.isFinite(c.idleSeconds)?Math.min(CONFIG.maxIdleSeconds,Math.max(CONFIG.minIdleSeconds,c.idleSeconds)):CONFIG.idleSeconds;c.t=c.t.bind(c);c.number=c.number.bind(c);
function objectiveText(p){return objective(p,c.t);}
const low=()=>Boolean(c.low||reduced.matches),audio=new AudioEngine(c.muted),particles=new Particles(document.querySelector('#particles'),low);
let context,board,scene,clocks,replyTask,toastTween,pausedScene,previousTime=0,lastPaint=0,catTimeline,modeChoiceMotion,lastWall=performance.now(),deadlineTask,deadlineFrame,lastHeartbeat=0;
const rigs=new Map();let parallax=[],eyeFollowers=[];
const manager=new TransitionManager({swap:render,audio,lowEffects:low});c.manager=manager;
function clearDeadline(){clearTimeout(deadlineTask);deadlineTask=null;if(deadlineFrame)cancelAnimationFrame(deadlineFrame);deadlineFrame=null;}
function settleHardClock(){
 const now=performance.now();
 if(c.session&&isCountdown(c.session)&&['PUZZLE','TUTORIAL'].includes(c.screen))c.session=advanceTimer(c.session,Math.max(0,(now-lastWall)/1000),{transition:manager.busy,cutscene:Boolean(scene)});
 lastWall=now;
}
function loseNow(){
 if(manager.busy)return;
 clearDeadline();c.moveBusy=true;updateHUD();audio.cue('crack');
 navigate('LOSE',c.rules.wrong.instantLose?c.rules.wrong.transition:'shatter',{timeout:c.session.lossReason==='timeout'});
}
function resolveTimeout(){
 if(manager.busy||!c.session||!['PUZZLE','TUTORIAL'].includes(c.screen))return;
 settleHardClock();const next=checkTimeout(c.session);
 if(next!==c.session){c.session=next;loseNow();}
 else if(isCountdown(c.session)&&c.session.phase==='PUZZLE'&&c.session.remaining>0)armDeadline();
}
function armDeadline(){
 clearDeadline();if(!c.session||!isCountdown(c.session)||c.session.phase!=='PUZZLE'||manager.busy)return;
 deadlineTask=setTimeout(()=>{
  deadlineTask=null;
  if(document.hidden)resolveTimeout();
  else if(!deadlineFrame)deadlineFrame=requestAnimationFrame(()=>{deadlineFrame=null;resolveTimeout();});
 },Math.max(0,c.session.remaining*1000));
}
function flipMode(id,force){
 const card=screen.querySelector(`[data-mode-card="${id}"]`);if(!card||c.modeChoosing)return;
 const flipped=force??card.dataset.flipped!=='true';card.dataset.flipped=String(flipped);card.classList.toggle('is-flipped',flipped);
 const front=card.querySelector('.mode-front'),back=card.querySelector('.mode-back');front.inert=flipped;back.inert=!flipped;
 pageMotion(()=>{const inner=card.querySelector('.mode-card-inner');if(low()){gsap.set(inner,{rotationY:flipped?180:0});return gsap.fromTo(card,{opacity:.6},{opacity:1,duration:.15,ease:'power1.out',overwrite:'auto'});}return gsap.to(inner,{rotationY:flipped?180:0,duration:.45,ease:'wonder-snap',overwrite:true});});audio.cue('card');
}
function setupModeCards(){
 screen.querySelectorAll('[data-mode-card]').forEach(card=>{
  card.querySelector('.mode-back').inert=true;
  card.addEventListener('pointerenter',event=>{if(event.pointerType==='mouse')flipMode(card.dataset.modeCard,true);});
 });
}
function chooseMode(id){
 if(!Object.hasOwn(MODES,id)||!MODES[id].enabled||(id==='hardcore'&&!c.hardcoreEnabled)||c.session?.modeLocked||c.modeChoosing)return;
 c.session=selectMode(c.session,id);c.lastMode=id;c.modeChoosing=true;audio.cue(c.rules.presentation.selectionCue);
 const cards=[...screen.querySelectorAll('[data-mode-card]')],chosen=cards.find(card=>card.dataset.modeCard===id);
 let finished=false,timer;const done=()=>{if(finished||c.screen!=='MODE')return;finished=true;clearTimeout(timer);c.modeChoosing=false;navigate('INTRO',c.rules.presentation.selectionTransition);};
 modeChoiceMotion=pageMotion(()=>gsap.timeline({onComplete:done})
 .to(cards.filter(card=>card!==chosen),{y:low()?0:180,rotation:low()?0:18,scale:low()?1:.75,opacity:0,clipPath:low()?'none':'inset(100% 0% 0% 0%)',duration:low()?.15:.45,ease:low()?'power1.out':'back.in(1.4)'},0)
 .to(chosen,{scale:low()?1.02:1.09,y:low()?-2:-12,duration:low()?.15:.45,ease:'wonder-overshoot'},0));
 timer=setTimeout(()=>{modeChoiceMotion?.progress(1);done();},(modeChoiceMotion.duration()+CONFIG.safetySeconds)*1000);context.add(()=>()=>{clearTimeout(timer);modeChoiceMotion=null;c.modeChoosing=false;});
}

function pageMotion(make){let animation;context.add(()=>{animation=make();});return animation;}
function pageTween(method,selector,vars){const nodes=screen.querySelectorAll(selector);return nodes.length?gsap[method](nodes,vars):null;}
function clearOverlay(selector){const el=document.querySelector(selector);if(!el)return;gsap.killTweensOf(el);gsap.killTweensOf(el.querySelectorAll('*'));el.remove();}
function utilities(){document.querySelector('.utility-bar').setAttribute('aria-label',c.t('settings'));document.querySelector('.utility-bar').innerHTML=`<button class="utility lang" data-action="language" aria-label="${c.t('language')}">${c.t('language')}</button><button class="utility" data-action="sound" aria-label="${c.t(c.muted?'soundOff':'soundOn')}" title="${c.t(c.muted?'soundOff':'soundOn')}">${c.muted?'♪':'♫'}</button><button class="utility effects ${low()?'active':''}" data-action="effects" aria-pressed="${low()}" aria-label="${c.t('low')}" title="${c.t('low')}">✦</button><button class="utility" data-action="fullscreen" aria-label="${c.t('full')}" title="${c.t('full')}">⛶</button>`;}
function render(next,payload={}){
 clearDeadline();replyTask?.kill();scene?.destroy();scene=null;pausedScene=null;clocks?.destroy();board?.destroy();board=null;catTimeline?.kill();context?.revert();gsap.killTweensOf(screen.querySelectorAll('*'));rigs.forEach(r=>r.destroy());rigs.clear();clocks=null;c.moveBusy=false;c.loading=false;c.modeChoosing=false;c.autoHintShown=false;c.screen=next;c.payload=payload;
 if(c.session){if(next==='TUTORIAL'||next==='PUZZLE')c.session={...c.session,phase:'PUZZLE'};else if(['INTRO','MAP','SCENE','REACTION','WIN','LOSE','RESULT'].includes(next))c.session={...c.session,phase:next};}
 document.body.dataset.difficulty=next==='MODE'?'normal':c.session?.difficulty??'normal';document.body.dataset.palette=next==='MODE'?'classic':c.rules.presentation.palette;document.body.classList.remove('time-critical');gsap.killTweensOf('.danger-vignette');gsap.set('.danger-vignette',{opacity:0});document.documentElement.lang=c.lang;document.documentElement.dir=c.lang==='ar'?'rtl':'ltr';document.title=CONFIG.title;
 const theme=['START','NAME','MODE','LEADERBOARD','ADMIN','TEST','RESULT'].includes(next)?'garden':c.chapter.theme;
 document.querySelector('.background').innerHTML=background(theme)+'<div class="world-scrim"></div>';
 screen.innerHTML=renderers[next](c);utilities();
 context=gsap.context(()=>{
  parallax=[];eyeFollowers=[];
  if(!low()){
   parallax=[...document.querySelectorAll('.background .parallax')].map((node,i)=>({factor:i+1,x:gsap.quickTo(node,'x',{duration:.8,ease:'power2.out'}),y:gsap.quickTo(node,'y',{duration:.8,ease:'power2.out'})}));
   eyeFollowers=[...screen.querySelectorAll('.start-cat .art>path')].map(node=>({x:gsap.quickTo(node,'x',{duration:.3,ease:'power2.out'}),y:gsap.quickTo(node,'y',{duration:.3,ease:'power2.out'})}));
   pageTween('to','.floating-card',{y:-10,rotation:'+=6',duration:2.8,repeat:-1,yoyo:true,ease:'sine.inOut',stagger:.3});
   pageTween('to','.hero-clock',{rotation:'+=5',duration:2.6,repeat:-1,yoyo:true,ease:'sine.inOut',transformOrigin:'50% 50%'});
   pageTween('to','.hero-alice,.hero-red',{y:-4,duration:2.2,repeat:-1,yoyo:true,ease:'sine.inOut',stagger:.3});
   pageTween('to','.float-card',{y:()=>innerHeight+150,rotation:'+=80',duration:12,stagger:1.4,repeat:-1,ease:'sine.inOut'});
   pageTween('to','.steam',{y:-6,opacity:.25,duration:1.8,repeat:-1,yoyo:true,ease:'sine.inOut'});
   pageTween('to','.start-cat .eyes',{x:3,duration:2,repeat:-1,yoyo:true,ease:'sine.inOut'});
   pageTween('to','.test-stage>span',{y:-3,duration:1.7,repeat:-1,yoyo:true,ease:'sine.inOut'});pageTween('to','.board-row:nth-child(-n+3)>strong:first-child',{rotation:3,transformOrigin:'50% 60%',duration:2.4,repeat:-1,yoyo:true,stagger:.2,ease:'sine.inOut'});
   if(c.rules.presentation.heartbeat&&['PUZZLE','SCENE','REACTION'].includes(next))gsap.fromTo(document.querySelector('.world-scrim'),{opacity:.42},{opacity:.78,duration:c.rules.presentation.heartbeatSeconds,repeat:-1,yoyo:true,ease:'sine.inOut'});
   if(c.rules.presentation.cat==='friendly')pageTween('to','.control-cat',{y:-4,rotation:3,duration:1.8,repeat:-1,yoyo:true,ease:'sine.inOut'});
   if(next==='START')gsap.from('.title-letter',{y:-30,rotation:-9,scale:.8,duration:.7,stagger:.07,ease:'back.out(1.9)'});
  }

 },screen);
 clocks=new Clocks(screen,{low});
 screen.querySelectorAll('.actor[data-character]').forEach(el=>rigs.set(el.dataset.character,new CharacterRig(el,low)));
 if(['INTRO','SCENE','REACTION','WIN','LOSE'].includes(next))prepareScene();
 if(next==='MODE')setupModeCards();
 if(next==='PUZZLE'||next==='TUTORIAL'){
  // Size from the untransformed layout while covered. Chessground itself is
  // mounted after reveal, when its viewport measurements are reliable.
  sizeBoardFrame(screen.querySelector('.board-slot'));
  c.moveBusy=true;c.loading=Boolean(payload.load);updateHUD();
 }
 if(next==='LOSE')screen.querySelector('.game-hud [data-flip-id="cup-shard"]')?.removeAttribute('data-flip-id');
 if(next==='TEST'&&payload.preview)document.querySelector('.test-stage>span').textContent=payload.preview;
 if(['LEADERBOARD','ADMIN'].includes(next)&&!low())pageMotion(()=>pageTween('from','.board-row',{rotationX:-70,y:-12,transformPerspective:600,transformOrigin:'50% 0%',duration:.45,stagger:.035,ease:'wonder-overshoot'}));
}
async function navigate(next,name='cards',payload={}){
 if(manager.busy)return false;settleHardClock();clearDeadline();changeScreen(c.screen,next);
 const shared=captureShared(),from=c.screen;clearOverlay('.modal-backdrop');clearOverlay('.pause-shield');c.paused=false;gsap.killTweensOf(screen);gsap.set(screen,{clearProps:'transform,clipPath'});
 if(next==='START'){c.session=null;c.paused=false;screen.inert=false;clearOverlay('.modal-backdrop');clearOverlay('.pause-shield');}
 return manager.go(from,next,name,{...payload,after:()=>{pageMotion(()=>playShared(shared,low()));revealed(next,payload);payload.after?.();}});
}
function revealed(next,payload={}){
 lastWall=performance.now();c.lastInput=lastWall;
 if(next==='NAME'){const input=document.querySelector('#name-value');input?.focus({preventScroll:true});input?.setSelectionRange(input.value.length,input.value.length);}
 if(['INTRO','SCENE','REACTION','WIN','LOSE'].includes(next)){if(scene){if(document.hidden){pausedScene=scene;scene.pause();}else scene.start();}else finishScene();}
 if(next==='PUZZLE'||next==='TUTORIAL'){
  const initial=payload.load?{...c.session.attempt,fen:c.puzzle.fen,status:'setup',lastMove:null}:c.session.attempt;
  board=new PuzzleBoard(document.querySelector('#chessboard'),{attempt:initial,onMove:handleMove,onSelect:()=>audio.cue('tick'),low,audio,particles,showDests:c.rules.legalDots});
  board.sync(initial,!payload.load);board.deal();
  if(payload.load){replyTask=gsap.delayedCall(low()?.12:CONFIG.replySeconds,()=>{
   if(!board||!['PUZZLE','TUTORIAL'].includes(c.screen))return;
   board.sync(c.session.attempt);const setup=c.puzzle.moves[0];const moved=position(c.puzzle.fen).get(setup.slice(0,2));board.moveEffect(setup.slice(2,4),{piece:moved?.type});c.moveBusy=false;c.loading=false;audio.cue('move');if(next==='PUZZLE'&&c.rules.presentation.cat==='friendly')showHint({text:gsap.utils.random(dialogue[c.lang].easy.encouragement)});if(next==='TUTORIAL')board.shapes([solutionArrow(c.session.attempt)]);
  });}else{c.moveBusy=false;if(payload.recovery)board?.recover();if(c.session.attempt.status==='reply')queueReply();else if(next==='TUTORIAL')board?.shapes([solutionArrow(c.session.attempt)]);}
 }
 if(next==='PUZZLE'||next==='TUTORIAL')armDeadline();
 if(next==='MAP')animateMap();
 if(next==='RESULT'){
  const value={n:0};pageMotion(()=>gsap.to(value,{n:c.session.score,duration:low()?.15:1.1,ease:'power3.out',onUpdate:()=>{const score=document.querySelector('#result-score');if(score)score.textContent=c.number(value.n);}}));
 }
 if(next==='LEADERBOARD'){
  const row=document.querySelector('.board-row.current');if(row&&!low()){const rows=[...row.parentNode.children];if(rows.indexOf(row)<rows.length-1)pageMotion(()=>gsap.from(rows.slice(rows.indexOf(row)+1),{y:-62,duration:.65,ease:'wonder-overshoot',stagger:.02}));pageMotion(()=>gsap.fromTo(row,{scale:1.025},{scale:1,duration:.7,ease:'back.out(2)'}));}
 }
}
function sceneText(key){
 if(key.startsWith('chapters.')){const parts=key.split('.');if(parts[2]==='intro')return c.chapterText.intro[Number(parts[3])]??'';}
 if(key==='hardcoreFlourish')return c.t('hardcoreFlourish');
 if(key.startsWith('hardcore.'))return key.split('.').reduce((v,k)=>v?.[k],dialogue[c.lang])||'';
 if(key==='success')return c.session.mode==='tutorial'?c.t('tutorialSuccess'):c.session.mode==='bonus'?c.t('secretFound'):c.chapterText.success;
 const errorIndex=Math.max(0,Math.min(2,c.payload.errorIndex??c.session.mistakes-1));
 if(key==='mistakeCat')return dialogue[c.lang].mistakes[errorIndex][0];
 if(key==='mistakeQueen')return c.session.mode==='chapter'?dialogue[c.lang].mistakes[errorIndex][1]:c.session.mode==='bonus'?c.t('secretCopy'):c.t('tutorialLabel');
 return key.split('.').reduce((value,k)=>value?.[k],dialogue[c.lang])||'';
}
function prepareScene(){
 const selected=c.rules.presentation.crown==='black-gold'?(c.screen==='WIN'?'win-hardcore':c.screen==='REACTION'&&!c.payload.wrong?'reaction-hardcore':c.activeScene):c.activeScene;const sceneData=scenes[selected];if(!sceneData)return;
 scene=new CutsceneEngine({root:document.querySelector('#scene-stage'),rigs,text:sceneText,audio,particles,low,presentation:c.rules.presentation,onDone:finishScene}).play(sceneData,{paused:true});
}
function finishScene(){
 if(manager.busy)return;
 if(c.screen==='INTRO'){c.session=loadPuzzle(c.session,chapterPuzzle(c.session.difficulty,0),'tutorial');navigate('TUTORIAL','glass',{load:true});}
 else if(c.screen==='SCENE'){c.session=loadPuzzle(c.session,chapterPuzzle(c.session.difficulty,c.session.chapter));navigate('PUZZLE',c.session.chapter===1?'glass':c.session.chapter>=9?'stomp':c.session.chapter===6?'clock':'cards',{load:true});}
 else if(c.screen==='REACTION'){
  if(c.payload.wrong){c.session={...c.session,phase:'PUZZLE'};navigate(c.session.mode==='tutorial'?'TUTORIAL':'PUZZLE','checker',{recovery:true});}
  else{const previous=c.session.chapter;c.session=advanceChapter(c.session);c.previousChapter=previous;
   if(c.session.phase==='WIN')navigate('WIN','grin');
   else if(c.session.phase==='PUZZLE')navigate('PUZZLE','checker',{resume:true});
   else navigate('MAP','checker');
  }
 }else if(c.screen==='WIN'||c.screen==='LOSE'){saveResult();navigate('RESULT','curtain');}
}
function animateMap(){
 const token=screen.querySelector('.alice-token'),target=screen.querySelector(`[data-chapter-square="${c.session.chapter}"]`);if(!token||!target)return;
 const art=token.querySelector('.art');const idle=()=>{if(art&&!low())pageMotion(()=>gsap.to(art,{y:-3,duration:1.7,repeat:-1,yoyo:true,ease:'sine.inOut'}));};
 const previous=low()?null:Flip.getState(token);if(token.parentNode!==target){target.append(token);if(!low())context.add(()=>{Flip.from(previous,{duration:.8,ease:'back.out(1.6)',absolute:true,scale:true});gsap.fromTo(token.querySelector('.art'),{y:-28},{y:0,duration:.8,ease:'bounce.out',onComplete:idle});});}else idle();
 const defeated=screen.querySelector(`[data-chapter-square="${c.previousChapter}"]>.art`);if(defeated&&c.previousChapter<c.session.chapter)pageMotion(()=>gsap.to(defeated,low()?{opacity:0,duration:.15}:{y:-70,x:40,rotation:180,scale:0,duration:.65,ease:'power2.in'}));
 c.previousChapter=c.session.chapter;
}
function setText(id,value){const el=document.querySelector(id),text=String(value);if(el&&el.textContent!==text)el.textContent=text;}
function updateHUD(){
 if(!c.session)return;const rules=c.rules,countdown=isCountdown(c.session);setText('#score',c.number(c.session.score));const watchSeconds=countdown?Math.ceil(c.session.remaining):Math.floor(c.session.elapsed);setText('#timer',formatTime(watchSeconds));clocks?.sync(watchSeconds);
 const fuse=document.querySelector('#timer-fuse-fill');if(fuse)gsap.set(fuse,{scaleX:Math.max(0,(c.session.remaining??0)/parTime(c.session)),transformOrigin:'0% 50%'});
 const critical=countdown&&c.session.remaining<=rules.timer.warningSeconds&&c.session.phase==='PUZZLE'&&!manager.busy;
 if(document.body.classList.contains('time-critical')!==critical){document.body.classList.toggle('time-critical',critical);gsap.killTweensOf('.danger-vignette');if(critical&&!low())pageMotion(()=>gsap.fromTo('.danger-vignette',{opacity:.2},{opacity:.8,duration:rules.presentation.urgentHeartbeatSeconds,repeat:-1,yoyo:true,ease:'sine.inOut'}));else gsap.set('.danger-vignette',{opacity:0});}
 const watch=document.querySelector('.watch');watch?.classList.toggle('frozen',c.session.freezeRemaining>0);
 const lives=screen.querySelector('.lives');
 if(lives&&lives.dataset.count!==String(c.session.lives)){
  const old=lives.dataset.count;const holder=document.createElement('div');holder.innerHTML=cups(c.session.lives,c.t,c.session.difficulty);lives.innerHTML=holder.firstElementChild.innerHTML;lives.dataset.count=String(c.session.lives);
  if(old!==undefined&&Number(old)>c.session.lives){const cracked=lives.children[Math.floor(c.session.lives)];audio.cue('crack');if(cracked){pageMotion(()=>gsap.fromTo(cracked,{rotation:low()?0:-15,scale:low()?1.02:1.15},{rotation:low()?0:8,scale:1,duration:low()?.12:.11,repeat:low()?0:3,yoyo:!low(),clearProps:'transform',ease:'power2.inOut'}));const r=cracked.getBoundingClientRect();particles.burst(r.x+r.width/2,r.y+20,'tea',15);}}
 }
 setText('#turn-label',c.t(c.loading||c.session.attempt?.status==='reply'?'redThinking':'whiteMove'));
 const hint=document.querySelector('[data-action="hint"]');if(hint)hint.disabled=c.moveBusy||(rules.hints.behavior!=='taunt'&&(c.session.hintsRemaining<=0||c.session.hintStage>=rules.hints.maxStage));
 setText('#hint-counter',rules.hints.behavior==='taunt'?c.t('noCatHelp'):c.number(c.session.hintsRemaining)+' '+c.t('hints')+' · '+hintCostLabel(c.session,c.t,c.number));
 for(const power of ['drink','eat']){const el=document.querySelector(`[data-action="${power}"]`);if(el){el.disabled=!c.session.powers[power]||c.moveBusy;const small=el.querySelector('small');if(small)small.textContent=c.session.powers[power]?c.t(power+'Hint')+' · '+c.number(c.session.powers[power]):c.t('used');}}
}
function handleMove(from,to,promotion){
 if(manager.busy||c.moveBusy||c.paused||!board||!['PUZZLE','TUTORIAL'].includes(c.screen))return;
 settleHardClock();const previous=c.session,captured=position(previous.attempt.fen).get(to),outcome=makeMove(previous,from,to,promotion);
 if(outcome.event==='illegal'||outcome.event==='blocked'){board.sync(previous.attempt);return;}
 if(outcome.event==='promotion'){board.sync(previous.attempt);openPromotion(from,to,outcome.choices);return;}
 c.session=checkTimeout(outcome.state);updateHUD();
 if(c.session.phase==='LOSE'){if(!c.rules.wrong.instantLose){board.sync(previous.attempt,false);board.recover(c.rules.wrong.explain);audio.cue('error');pageMotion(()=>shake(screen,low()));}loseNow();return;}
 if(outcome.event==='wrong'){
  c.moveBusy=true;board.sync(c.rules.wrong.reset?previous.attempt:c.session.attempt,false);board.recover(c.rules.wrong.explain);
  if(c.rules.wrong.explain){showHint({text:c.puzzle.whyWrong?.[c.lang]??c.t('whyWrongFallback')});audio.cue('hint');replyTask=gsap.delayedCall(low()?.15:c.rules.presentation.wrongDelay,()=>{if(board){board.sync(c.session.attempt);c.moveBusy=false;updateHUD();}});return;}rigs.get('alice')?.emote('scared');audio.cue('error');pageMotion(()=>shake(screen,low()));
  const errorIndex=(c.session.mode==='chapter'?c.session.mistakes:c.session.puzzleMistakes)-1;
  if(c.session.lives===0)navigate('LOSE','shatter',{errorIndex});else navigate('REACTION',c.rules.wrong.transition,{wrong:true,errorIndex});return;
 }
 if(captured)board.captureEffect(to,{p:'pawn',r:'rook',n:'knight',b:'bishop',q:'queen',k:'king'}[captured.type],captured.color==='w'?'white':'black');
 board.sync(c.session.attempt,false);board.moveEffect(to,outcome.move);audio.cue(captured?'capture':'move');board.shapes([]);rigs.get('alice')?.emote('happy');
 if(outcome.event==='solved'){
  c.moveBusy=true;if(position(c.session.attempt.fen).in_checkmate())board.mate();scorePopup(outcome.points||'✦');audio.cue('win');particles.burst(innerWidth/2,innerHeight*.45,'cards',30,c.rules.presentation.confetti);pageMotion(()=>punch(screen,low()));
  clearDeadline();replyTask=gsap.delayedCall(low()?Math.min(.15,c.rules.presentation.solvedDelay):Math.max(CONFIG.moveSeconds,c.rules.presentation.solvedDelay),()=>{board?.shuffle();navigate('REACTION',c.rules.presentation.solvedTransition,{correct:true});});
 }else queueReply();
}
function queueReply(){
 if(!board||c.session?.attempt?.status!=='reply')return;
 c.moveBusy=true;replyTask?.kill();replyTask=gsap.delayedCall(low()?.15:CONFIG.replySeconds,()=>{
  if(!board||!['PUZZLE','TUTORIAL'].includes(c.screen)||c.session.phase!=='PUZZLE'||c.session.attempt.status!=='reply')return;
  const move=c.session.attempt.moves[c.session.attempt.index],before=position(c.session.attempt.fen),moving=before.get(move.slice(0,2)),taken=before.get(move.slice(2,4));
  if(taken)board.captureEffect(move.slice(2,4),{p:'pawn',r:'rook',n:'knight',b:'bishop',q:'queen',k:'king'}[taken.type],taken.color==='w'?'white':'black');
  c.session=autoReply(c.session);board.sync(c.session.attempt);board.moveEffect(move.slice(2,4),{piece:moving?.type});c.moveBusy=false;audio.cue('move');updateHUD();if(c.session.mode==='tutorial')board.shapes([solutionArrow(c.session.attempt)]);
 });
}
function scorePopup(points){
 const el=document.createElement('div');el.className='score-popup';el.textContent=typeof points==='number'?'+'+c.number(points):points;el.style.left=(innerWidth/2-40)+'px';el.style.top=(innerHeight*.42)+'px';document.body.append(el);pageMotion(()=>{context.add(()=>()=>el.remove());return gsap.fromTo(el,{scale:low()?1:.3,y:low()?0:15,opacity:low()?0:1},{scale:low()?1:1.25,y:low()?0:-75,opacity:1,duration:low()?.25:.9,ease:low()?'power1.out':'back.out(2)',onComplete:()=>el.remove()});});
}
function openPromotion(from,to,choices){
 const names={q:'queen',r:'rook',b:'bishop',n:'knight'};
 openModal(`<h2>${c.t('promotion')}</h2><p>${c.t('promotionCopy')}</p><div class="promotion-choices">${['q','r','b','n'].filter(role=>choices.includes(role)).map(role=>button(`${piece(names[role])}<span>${c.t(names[role])}</span>`,'promote','promotion-choice',`data-from="${from}" data-to="${to}" data-role="${role}"`)).join('')}</div>`,'promotion');
}
function openModal(content,kind='help'){
 clearOverlay('.modal-backdrop');const el=document.createElement('div');el.className='modal-backdrop';el.dataset.kind=kind;el.setAttribute('role','dialog');el.setAttribute('aria-modal','true');el.innerHTML=`<div class="modal-card">${content}${kind==='promotion'?'':button(c.t('close'),'close-modal','outline')}</div>`;document.body.append(el);screen.inert=true;gsap.from(el.querySelector('.modal-card'),low()?{opacity:0,duration:.15,ease:'power1.out'}:{scale:.94,y:18,opacity:0,duration:.3,ease:'power3.out'});
}
function closeModal(done){const el=document.querySelector('.modal-backdrop');if(!el){done?.();return;}gsap.to(el.querySelector('.modal-card'),{scale:low()?1:.97,y:low()?0:8,opacity:0,duration:low()?.12:.18,ease:'power2.in',overwrite:'auto',onComplete:()=>{el.remove();screen.inert=manager.busy||c.paused;done?.();}});}
function showHint(outcome){
 const visit=document.querySelector('#cat-visit');if(!visit)return;catTimeline?.kill();
 rigs.get('catHint')?.destroy();visit.querySelector('svg')?.remove();visit.insertAdjacentHTML('afterbegin',character('cat'));const cat=new CharacterRig(visit,low);rigs.set('catHint',cat);const text=outcome.text??(outcome.stage===2?(c.session.attempt.index>1?c.t('hintPiece')+' '+outcome.arrow.orig:c.puzzle.hint2[c.lang]):c.puzzle.hint1[c.lang]);document.querySelector('#hint-text').textContent=text;
 catTimeline=pageMotion(()=>gsap.timeline().set(visit,{visibility:'visible'}).fromTo(visit,{x:low()?0:40,y:low()?0:15,scale:low()?1:.94,opacity:0},{x:0,y:0,scale:1,opacity:1,duration:low()?.15:.4,ease:'power3.out'}).call(()=>{cat.emote('talk');cat.talk(3.3);}).to(visit.querySelector('.cat-tail'),{rotation:low()?0:-18,transformOrigin:'80% 70%',duration:low()?.12:.5,ease:'power2.out',overwrite:'auto'}).add(cat.vanish(),'+=2.8').set(visit,{visibility:'hidden'}));
 if(outcome.stage===2)board.shapes([{orig:outcome.arrow.orig,brush:'gold'}]);audio.cue('hint');
}
function toast(key){clearOverlay('.toast');toastTween?.kill();const el=document.createElement('div');el.className='toast';el.setAttribute('role','status');el.textContent=c.t(key);document.body.append(el);gsap.from(el,{opacity:0,y:low()?0:10,duration:.2,ease:'power2.out'});toastTween=gsap.to(el,{opacity:0,y:low()?0:-6,delay:2,duration:.2,ease:'power2.in',onComplete:()=>el.remove()});}
function saveResult(){if(c.resultId===c.session.id)return;c.resultId=c.session.id;c.rank=c.board.add({id:c.session.id,name:c.session.name,score:c.session.score,time:c.session.elapsed,mistakes:c.session.mistakes,solved:c.session.solved.length,badges:badges(c.session),mode:c.session.difficulty,created:Date.now()});}
function newAdventure(){c.name='';c.session=null;c.resultId=null;c.previousChapter=1;c.paused=false;clearOverlay('.pause-shield');navigate('NAME','cards');}
async function handleAction(el,event){
 const type=el.dataset.action;if(manager.busy)return;if(c.modeChoosing){modeChoiceMotion?.timeScale(3);return;}if(c.moveBusy&&!['sound','fullscreen','back'].includes(type))return;
 settleHardClock();if(type!=='promote'&&['PUZZLE','TUTORIAL'].includes(c.screen)&&isCountdown(c.session??{})&&c.session?.remaining<=0){resolveTimeout();if(c.session.phase==='LOSE')return;}
 const point={x:event.clientX,y:event.clientY};
 switch(type){
 case 'play':case 'again':return newAdventure();
 case 'back':return navigate('START',c.screen==='LEADERBOARD'?'ink':'grin',{point});
 case 'leaderboard':c.boardMode=c.session?.difficulty??c.lastMode;return navigate('LEADERBOARD','ink',{point});
 case 'key':{if(c.screen!=='ADMIN')return;const key=el.dataset.key;if(key==='BACKSPACE')c.pin=[...c.pin].slice(0,-1).join('');else if([...c.pin].length<CONFIG.maxPinDigits)c.pin+=key;setText('#pin-value','•'.repeat(c.pin.length));setText('#name-error','');audio.cue('tick');return;}
 case 'name-next':{const valid=validateName(c.name);if(!valid.valid){setText('#name-error',c.t(valid.reason));const input=document.querySelector('#name-value');input?.setAttribute('aria-invalid','true');input?.focus({preventScroll:true});return;}c.name=valid.name;const id=crypto.randomUUID?.()??Date.now().toString(36)+'-'+crypto.getRandomValues(new Uint32Array(1))[0].toString(36);c.session=createSession(c.name,id,c.lastMode==='hardcore'&&!c.hardcoreEnabled?'normal':c.lastMode);return navigate('MODE','cards');}
 case 'flip-mode':return flipMode(el.dataset.mode);
 case 'choose-mode':return chooseMode(el.dataset.mode);
 case 'board-mode':c.boardMode=el.dataset.mode;return navigate('LEADERBOARD','cards');
 case 'admin-mode':c.adminMode=el.dataset.mode;return navigate('ADMIN','cards');
 case 'toggle-hardcore':c.hardcoreEnabled=!c.hardcoreEnabled;saveSetting('hardcoreEnabled',c.hardcoreEnabled);return navigate('ADMIN','cards');
 case 'skip':scene?.skip();return;
 case 'enter-chapter':return navigate('SCENE',c.session.chapter>=9?'stomp':'curtain');
 case 'hint':{const outcome=useHint(c.session);if(outcome.event==='blocked')return;c.session=outcome.state;updateHUD();return showHint(outcome.event==='taunt'?{text:gsap.utils.random(dialogue[c.lang].hardcore.taunts)}:outcome);}
 case 'drink':case 'eat':{const outcome=usePower(c.session,type);if(outcome.event==='blocked')return;c.session=outcome.state;updateHUD();audio.cue('hint');if(type==='drink'){board.shapes([outcome.arrow]);const alice=screen.querySelector('.actor.alice>.art');pageMotion(()=>gsap.fromTo(alice,{scale:.88},{scale:1,duration:low()?.15:.6,ease:'back.out(1.7)',transformOrigin:'50% 100%'}));}else{const r=el.getBoundingClientRect();particles.burst(r.x+r.width/2,r.y,'confetti',20);pageMotion(()=>gsap.fromTo(el.querySelector('svg'),{scale:1.2,rotation:-8},{scale:1,rotation:0,duration:.5,ease:'back.out(2)'}));toast('frozen');}return;}
 case 'promote':if(isCountdown(c.session)){closeModal();return handleMove(el.dataset.from,el.dataset.to,el.dataset.role);}return closeModal(()=>handleMove(el.dataset.from,el.dataset.to,el.dataset.role));
 case 'secret':{const next=enterBonus(c.session,chapterPuzzle(c.session.difficulty,'bonus'));if(next===c.session)return;c.session=next;toast('secretFound');return navigate('PUZZLE','checker',{load:true});}
 case 'return-bonus':c.session=returnFromBonus(c.session);return navigate('PUZZLE','checker',{resume:true});
 case 'legend':{const descriptions=c.lang==='ar'?['يتحرك للأمام ويأخذ قطرياً.','تسير القلعة بخطوط مستقيمة.','يقفز الحصان على شكل حرف L.','يتحرك الفيل على الأقطار.','يجمع الوزير حركة القلعة والفيل.','خطوة واحدة. احمه من الكش.']:['Forward to move; diagonal to capture.','Straight along a rank or file.','An L-shaped leap, over other cards.','Diagonally, as far as the path is clear.','Straight or diagonal: a royal traveller.','One square. Keep him safe from check.'];return openModal(`<h2>${c.t('legend')}</h2><div class="legend-grid">${['pawn','rook','knight','bishop','queen','king'].map((role,i)=>`<div>${piece(role)}<strong>${c.t(role)}</strong><p>${descriptions[i]}</p></div>`).join('')}</div>`);}
 case 'close-modal':return closeModal();
 case 'language':c.lang=c.lang==='en'?'ar':'en';saveSetting('language',c.lang);return navigate(c.screen,'ink',{point,resume:true});
 case 'sound':c.muted=!c.muted;audio.setMuted(c.muted);saveSetting('muted',c.muted);utilities();return;
 case 'effects':c.low=!low();saveSetting('low',c.low);return navigate(c.screen,'cards',{resume:true});
 case 'fullscreen':try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{toast('full');}return;
 case 'unlock':if(c.pin===CONFIG.adminPin){c.adminUnlocked=true;c.pin='';return navigate('ADMIN','cards');}c.pin='';setText('#pin-value','');setText('#name-error',c.t('invalidPin'));return;
 case 'reset-board':if(confirm(c.t('confirmReset'))){c.board.reset(c.adminMode);return navigate('ADMIN','shatter');}return;
 case 'delete-entry':c.board.delete(el.dataset.id,c.adminMode);return navigate('ADMIN','cards');
 case 'export':{const url=URL.createObjectURL(new Blob([c.board.exportCSV(c.adminMode)],{type:'text/csv;charset=utf-8'})),a=document.createElement('a');a.href=url;a.download='looking-glass-'+c.adminMode+'-leaderboard.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);return;}
 case 'save-admin':c.idleSeconds=Math.min(CONFIG.maxIdleSeconds,Math.max(CONFIG.minIdleSeconds,Number(document.querySelector('#idle-setting').value)||CONFIG.idleSeconds));saveSetting('idle',c.idleSeconds);return toast('saved');
 case 'test':return navigate('TEST','cards');
 case 'preview-transition':return navigate('TEST',el.dataset.transitionName,{preview:el.textContent.trim()});
 case 'resume':{const shield=document.querySelector('.pause-shield');gsap.to(shield,{opacity:0,duration:low()?.12:.2,ease:'power2.in',overwrite:'auto',onComplete:()=>{shield?.remove();c.paused=false;screen.inert=false;audio.unlock();}});return;}
 }
}
function pauseGame(){if(c.rules.timer.pausePolicy==='story-only'&&isCountdown(c.session)){toast('hardcoreNoPause');return;}if(c.paused||manager.busy)return;c.paused=true;screen.inert=true;const el=document.createElement('div');el.className='pause-shield';el.setAttribute('role','dialog');el.innerHTML=`<div class="pause-card">${clock()}<h2>${c.t('pause')}</h2>${button(c.t('resume'),'resume','primary')}</div>`;document.body.append(el);gsap.from(el,{opacity:0,duration:low()?.15:.25,ease:'power2.out'});}
document.addEventListener('click',event=>{const el=event.target.closest('[data-action]');if(el){event.preventDefault();handleAction(el,event);}});
document.addEventListener('pointerdown',()=>{c.lastInput=performance.now();c.autoHintShown=false;audio.unlock();},{passive:true});
document.addEventListener('pointermove',event=>{c.lastInput=performance.now();if(low())return;const x=event.clientX/innerWidth-.5,y=event.clientY/innerHeight-.5;eyeFollowers.forEach(p=>{p.x(x*5);p.y(y*3);});parallax.forEach(p=>{p.x(x*p.factor*3);p.y(y*p.factor*2);});},{passive:true});
screen.addEventListener('pointerdown',event=>{if(!manager.busy&&event.target.closest('.scene-stage')&&!event.target.closest('[data-action]'))scene?.hurry();});
document.addEventListener('input',event=>{c.lastInput=performance.now();if(c.screen==='NAME'&&event.target.id==='name-value'&&!event.isComposing){c.name=[...event.target.value].slice(0,CONFIG.maxName).join('');if(event.target.value!==c.name)event.target.value=c.name;setText('#name-count',[...c.name].length+'/'+CONFIG.maxName);setText('#name-error','');event.target.removeAttribute('aria-invalid');}if(event.target.id==='transition-speed'){manager.speed=Number(event.target.value);setText('#speed-value',manager.speed.toFixed(2)+'×');}});
document.addEventListener('keydown',event=>{c.lastInput=performance.now();if(c.screen==='NAME'&&event.target.id==='name-value'){audio.unlock();if(event.key==='Enter'&&!event.isComposing&&!manager.busy){event.preventDefault();document.querySelector('[data-action="name-next"]')?.click();return;}}if((event.ctrlKey||event.metaKey)&&['+','=','-','0'].includes(event.key))event.preventDefault();if(event.ctrlKey&&event.shiftKey&&event.code==='KeyA'){event.preventDefault();if(manager.busy)return;c.adminUnlocked=false;c.pin='';if(c.screen==='START')navigate('ADMIN','cards');else navigate('START','grin',{after:()=>navigate('ADMIN','cards')});}if(event.code==='Escape'&&['PUZZLE','TUTORIAL'].includes(c.screen))pauseGame();});
document.addEventListener('contextmenu',e=>e.preventDefault());document.addEventListener('gesturestart',e=>e.preventDefault());document.addEventListener('wheel',e=>{if(e.ctrlKey)e.preventDefault();},{passive:false});
document.addEventListener('visibilitychange',()=>{previousTime=0;if(c.rules.timer.pausePolicy==='story-only')settleHardClock();else lastWall=performance.now();if(document.hidden){audio.ctx?.suspend().catch(()=>{});if(scene){pausedScene=scene;pausedScene.pause();}else if(['PUZZLE','TUTORIAL'].includes(c.screen)&&c.rules.timer.pausePolicy!=='story-only')pauseGame();}else if(pausedScene){pausedScene.resume();pausedScene=null;}});
reduced.addEventListener('change',()=>{utilities();particles.clear();if(manager.busy)manager.recover?.();navigate(c.screen,'cards',{resume:true});});
gsap.ticker.add(time=>{
 const dt=previousTime?Math.min(.25,time-previousTime):0;previousTime=time;
 if(c.session&&['PUZZLE','TUTORIAL'].includes(c.screen)){
  if(c.rules.timer.pausePolicy==='story-only')settleHardClock();else{c.session=advanceTimer(c.session,dt,manager.busy||c.moveBusy||c.paused||document.hidden);lastWall=performance.now();}
  if(isCountdown(c.session)&&c.session.remaining<=0&&!manager.busy&&!deadlineFrame)deadlineFrame=requestAnimationFrame(()=>{deadlineFrame=null;resolveTimeout();});
  if(!manager.busy&&!c.moveBusy&&!c.autoHintShown){const shape=autoHint(c.session,(performance.now()-c.lastInput)/1000);if(shape){c.autoHintShown=true;board?.shapes([shape]);if(!low())context.add(()=>gsap.fromTo(screen.querySelector('.cg-shapes'),{opacity:.45},{opacity:1,duration:.65,yoyo:true,repeat:5,ease:'sine.inOut'}));showHint({text:c.t('autoHintCopy')});}}
  if(c.rules.presentation.heartbeat&&isCountdown(c.session)&&!manager.busy&&c.session.phase==='PUZZLE'&&!document.hidden){const urgent=c.session.remaining<=c.rules.timer.warningSeconds,period=urgent?c.rules.presentation.urgentHeartbeatSeconds:c.rules.presentation.heartbeatSeconds;if(time-lastHeartbeat>period){audio.cue('heartbeat');lastHeartbeat=time;if(urgent&&!low()){const frame=screen.querySelector('.board-frame');pageMotion(()=>gsap.fromTo(frame,{x:-1.5},{x:0,duration:.22,ease:'elastic.out(1,.4)',onUpdate:()=>board?.ground.state.dom.bounds.clear()}));}}}
 }
 if(time-lastPaint>.08){if(c.session)updateHUD();lastPaint=time;}
 if(c.screen!=='START'&&!manager.busy&&performance.now()-c.lastInput>c.idleSeconds*1000){clearOverlay('.pause-shield');clearOverlay('.modal-backdrop');c.paused=false;c.adminUnlocked=false;c.lastInput=performance.now();navigate('START','grin');}
});
window.lookingGlass={get state(){return c.session;},get screen(){return c.screen;},controller:c,manager,navigate,move:handleMove,low,get board(){return board;},get scene(){return scene;}};
render(location.pathname.replace(/\/$/,'').endsWith('/transitions-test')?'TEST':'START');
if('serviceWorker'in navigator&&import.meta.env.PROD)navigator.serviceWorker.register(new URL('./sw.js',document.baseURI)).catch(()=>{});
