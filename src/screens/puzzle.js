import {hintCostLabel} from './mode-ui.js';
import { modeRules } from '../core/modes.js';
import { CONFIG } from '../config.js';
import { hud, actor, button, eyebrow, objective } from './ui.js';
import { bottle, cake, character, hat } from '../assets/svg/art.js';

export default c => {
  const rules = modeRules(c.session);
  const tutorial = c.screen === 'TUTORIAL';
  const bonus = c.session.mode === 'bonus';
  const label = tutorial ? c.t('tutorialLabel') : bonus ? c.t('bonus')
    : `${c.t('chapter')} ${c.number(c.session.chapter)} / ${c.number(CONFIG.chapterCount)}`;
  const title = tutorial ? c.t('tutorial') : bonus ? c.t('secret') : c.chapterText.title;
  const secret = c.session.chapter === CONFIG.secretChapter && !tutorial && !bonus && !c.session.secretFound;

  return `<section class="puzzle-screen ${tutorial ? 'tutorial-puzzle' : ''}">
    ${hud(c)}
    <div class="board-stage">
      ${actor('alice', 'left')}
      ${actor(rules.presentation.queenAlwaysVisible ? 'redQueen' : tutorial ? 'whiteQueen' : c.chapter.character, 'right','',rules.presentation.queenAlwaysVisible?'hardcore':'')}
      <div class="board-column">
        <header class="board-header">
          <div class="puzzle-heading">${eyebrow(label)}<h1>${title}</h1></div>
          <div class="board-caption">
            <span class="turn-dot"></span>
            <strong id="turn-label">${c.t('whiteMove')}</strong>
            <span class="board-objective">${objective(c.puzzle, c.t)}</span>
          </div>
        </header>
        <div class="board-slot">
          <div class="board-frame">
            <div id="chessboard" class="cg-wrap" role="application" aria-label="${c.t('chess')}"></div>
            ${secret ? button(hat(), 'secret', 'secret-hat', `aria-label="${c.t('curiousHat')}" title="${c.t('curiousHat')}"`) : ''}
          </div>
        </div>
        <p class="board-help">${tutorial ? c.t('tutorialCopy') : bonus ? c.t('secretCopy') : c.t('boardHelp')}</p>
      </div>
      <aside class="cat-visit" id="cat-visit">${character('cat')}<div class="hint-bubble" id="hint-text"></div></aside>
    </div>
    <footer class="puzzle-controls">
      ${tutorial ? `<div class="practice-label">♠ ${c.t('tutorialLabel')}</div>` : `
        ${button(`<span class="control-cat">${character('cat')}</span><span>${c.t(rules.hints.behavior==='taunt'?'catWatching':'hint')}<small id="hint-counter">${c.number(c.session.hintsRemaining)} ${c.t('hints')} · ${hintCostLabel(c.session,c.t,c.number)}</small></span>`, 'hint', 'hint-button', rules.hints.behavior === 'taunt' ? '' : c.session.hintsRemaining <= 0 || c.session.hintStage >= rules.hints.maxStage ? 'disabled' : '')}
        ${rules.powers.drink ? button(`${bottle()}<span>${c.t('drink')}<small>${c.session.powers.drink ? c.t('drinkHint') : c.t('used')}</small></span>`, 'drink', 'power-button', c.session.powers.drink ? '' : 'disabled') : ''}
        ${rules.powers.eat ? button(`${cake()}<span>${c.t('eat')}<small>${c.session.powers.eat ? c.t('eatHint') : c.t('used')}</small></span>`, 'eat', 'power-button', c.session.powers.eat ? '' : 'disabled') : ''}
      `}
      ${button('↶','back','quit-button',`aria-label="${c.t('quit')}" title="${c.t('quit')}"`)}
      ${button('?', 'legend', 'legend-button', `aria-label="${c.t('legend')}"`)}
      ${bonus ? button(c.t('returnPuzzle'), 'return-bonus', 'outline') : ''}
    </footer>
  </section>`;
};
