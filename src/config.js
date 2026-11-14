// Every difficulty rule lives here. CONFIG's legacy Normal aliases are retained
// so integrations and the original regression suite keep their public API.
export const MODES = Object.freeze({
 easy: Object.freeze({
  id:'easy', poolFile:'puzzles.easy.json', chapterThemes:['mate','hangingPiece','fork','mate','pin','mate','fork','discoveredAttack','mate','mate'], nameKey:'modeEasy', titleKey:'curiousAlice', icon:'rabbit', enabled:true,
  rating:{min:400,max:1000}, mate:{min:1,max:2}, lives:5, lifeCost:.5, roundLives:'ceil',
  hints:{count:5,maxStage:2,timePenalty:0,pointPenalty:0,behavior:'help',autoAfterSeconds:20},
  powers:{drink:3,eat:2,freezeSeconds:15},
  timer:{type:'countup',parFactor:1,parSeconds:[60,60,75,75,90,90,90,105,105,120],bonusPar:90,timeoutLoses:false,pausePolicy:'standard',warningSeconds:5},
  scoring:{chapterPoints:100,timeBonus:0,timeBonusPerSecond:2,perfectBonus:150,secretBonus:600,multiplier:.5},
  wrong:{instantLose:false,reset:false,recovery:'undo',explain:true,transition:null},
  secret:{enabled:true,lifeCost:0,timed:false}, legalDots:true,
  badges:{excluded:['speedrunner'],exclusive:[]},
  presentation:{palette:'pastel',cat:'friendly',queenAlwaysVisible:false,sceneFactor:1,reactionSeconds:4.5,solvedTransition:'clock',solvedDelay:.5,wrongDelay:1.8,selectionTransition:'rabbit',selectionCue:'card',heartbeat:false,heartbeatSeconds:1.4,urgentHeartbeatSeconds:.5,confetti:['#e6b9c7','#c7dbd0','#dfd2eb','#f1dbaa'],crown:'standard'},
  leaderboardKey:'leaderboard:easy',
 }),
 normal: Object.freeze({
  id:'normal', poolFile:'puzzles.normal.json', chapterThemes:['mate','hangingPiece','fork','mate','pin','mate','fork','discoveredAttack','mate','mate'], nameKey:'modeNormal', titleKey:'lookingGlassClassic', icon:'cat', enabled:true,
  rating:{min:600,max:1600}, mate:{min:1,max:3}, lives:3, lifeCost:1, roundLives:'ceil',
  hints:{count:3,maxStage:2,timePenalty:20,pointPenalty:50,behavior:'help',autoAfterSeconds:0},
  powers:{drink:1,eat:1,freezeSeconds:15},
  timer:{type:'countup',parFactor:1,parSeconds:[60,60,75,75,90,90,90,105,105,120],bonusPar:90,timeoutLoses:false,pausePolicy:'standard',warningSeconds:5},
  scoring:{chapterPoints:100,timeBonus:300,timeBonusPerSecond:2,perfectBonus:150,secretBonus:600,multiplier:1},
  wrong:{instantLose:false,reset:true,recovery:'restart',explain:false,transition:'stomp'},
  secret:{enabled:true,lifeCost:0,timed:false}, legalDots:true,
  badges:{excluded:[],exclusive:[]},
  presentation:{palette:'classic',cat:'normal',queenAlwaysVisible:false,sceneFactor:1,reactionSeconds:4.5,solvedTransition:'clock',solvedDelay:.5,wrongDelay:0,selectionTransition:'rabbit',selectionCue:'card',heartbeat:false,heartbeatSeconds:1.4,urgentHeartbeatSeconds:.5,confetti:['#c3a45e','#efe2be','#c9797c','#85a491'],crown:'standard'},
  leaderboardKey:'leaderboard:normal',
 }),
 hardcore: Object.freeze({
  id:'hardcore', poolFile:'puzzles.hardcore.json', chapterThemes:['mate','hangingPiece','fork','mate','pin','mate','fork','discoveredAttack','mate','mate'], nameKey:'modeHardcore', titleKey:'offWithHerHead', icon:'crown', enabled:true,
  rating:{min:1300,max:2200}, mate:{min:2,max:4}, lives:1, lifeCost:1, roundLives:'ceil',
  hints:{count:0,maxStage:0,timePenalty:0,pointPenalty:0,behavior:'taunt',autoAfterSeconds:0},
  powers:{drink:0,eat:0,freezeSeconds:0},
  timer:{type:'countdown',parFactor:1,parSeconds:[50,60,65,65,75,75,90,90,90,120],bonusPar:90,timeoutLoses:true,pausePolicy:'story-only',warningSeconds:5},
  scoring:{chapterPoints:100,timeBonus:300,timeBonusPerSecond:2,perfectBonus:150,secretBonus:600,multiplier:2.5},
  wrong:{instantLose:true,reset:false,recovery:'none',explain:false,transition:'shatter'},
  secret:{enabled:true,lifeCost:1,timed:true}, legalDots:true,
  badges:{excluded:[],exclusive:['offWithWhoseHead','flawlessQueen']},
  presentation:{palette:'crimson',cat:'taunting',queenAlwaysVisible:true,sceneFactor:.6,reactionSeconds:1.2,solvedTransition:'checker',solvedDelay:0,wrongDelay:0,selectionTransition:'stomp',selectionCue:'roar',heartbeat:true,heartbeatSeconds:1.4,urgentHeartbeatSeconds:.5,confetti:['#161816','#b88d32','#e5c66b','#50421e'],crown:'black-gold'},
  leaderboardKey:'leaderboard:hardcore',
 }),
});

export const CONFIG = Object.freeze({
 title:'Alice and the Looking-Glass Chess', clubName:'THE LOOKING-GLASS CHESS CLUB', clubNameAr:'نادي شطرنج المرآة',
 lives:MODES.normal.lives, hints:MODES.normal.hints.count, hintSeconds:MODES.normal.hints.timePenalty, hintPenalty:MODES.normal.hints.pointPenalty, chapterCount:10,
 chapterPoints:MODES.normal.scoring.chapterPoints, timeBonus:MODES.normal.scoring.timeBonus, timeBonusPerSecond:MODES.normal.scoring.timeBonusPerSecond, perfectBonus:MODES.normal.scoring.perfectBonus,
 secretBonus:MODES.normal.scoring.secretBonus, secretChapter:6, freezeSeconds:MODES.normal.powers.freezeSeconds, drinkUses:MODES.normal.powers.drink, eatUses:MODES.normal.powers.eat, speedrunnerSeconds:360,
 idleSeconds:60, minIdleSeconds:10, maxIdleSeconds:600, maxPinDigits:8, maxStoredScores:500, maxName:15, leaderboardLimit:20, adminPin:'1865',
 signupUrl:'https://example.org/chess-club', storageKey:'alice-looking-glass-scores-v1',
 transitionSeconds:.85, dramaticSeconds:1.45, quickSeconds:.6, safetySeconds:2,
 particleCap:140, replySeconds:.65, moveSeconds:.42, cutsceneSeconds:7,
 finaleSeconds:15, reactionSeconds:4.5, loseSceneSeconds:7, reducedSceneSeconds:1.2, typewriterSpeed:24,
});

