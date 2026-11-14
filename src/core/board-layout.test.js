import { describe, it, expect } from 'vitest';
import { fitBoard, sizeBoardFrame } from '../board/layout.js';
import puzzleScreen from '../screens/puzzle.js';
import dictionary from '../data/i18n.json';
import dialogue from '../data/dialogue.json';
import chapters from '../data/chapters.json';
import puzzles from '../data/puzzles.json';
import { createSession, loadPuzzle } from './game.js';

describe('Chessground square geometry', () => {
  for (const [name, width, height, ratio] of [
    ['desktop', 800, 600, 1],
    ['tablet', 700, 440, 2],
    ['phone', 342, 360, 3],
    ['short landscape', 420, 180, 1.25],
    ['fractional device scale', 500, 420, 2.625],
  ]) {
    it(`fits all eight ranks and files inside the ${name} slot`, () => {
      const fitted = fitBoard(width, height, ratio);
      expect(fitted.frame).toBeLessThanOrEqual(Math.min(width, height));
      expect(fitted.board).toBeGreaterThan(0);
      expect(fitted.frame - fitted.board).toBe(48);
      expect(fitted.square * 8).toBe(fitted.board);
      const physicalSquares = fitted.board * ratio / 8;
      expect(Math.abs(physicalSquares - Math.round(physicalSquares))).toBeLessThan(.01);
    });
  }

  it('uses layout dimensions instead of a transition-scaled viewport rectangle', () => {
    const frame = { style: {} };
    const slot = {
      clientWidth: 640,
      clientHeight: 500,
      querySelector: () => frame,
      getBoundingClientRect() { throw Error('The screen is still scaled by the transition'); },
    };
    const geometry = sizeBoardFrame(slot, 1);
    expect(geometry.board).toBe(448);
    expect(frame.style).toEqual({ width: '496px', height: '496px', padding: '24px' });
  });

  it('ignores invalid device scale and handles a missing layout slot', () => {
    expect(fitBoard(500, 500, 0)).toEqual(fitBoard(500, 500, 1));
    expect(sizeBoardFrame(null)).toBeNull();
  });
});

// Inspect actual template nesting, rather than only checking that it returned text.
function tree(html) {
  const root = { tag: 'root', children: [] }, stack = [root];
  const voidTags = new Set(['input', 'br', 'hr', 'img', 'meta', 'link']);
  for (const match of html.matchAll(/<\/?([a-z][\w:-]*)\b[^>]*>/gi)) {
    const tag = match[1].toLowerCase(), token = match[0];
    if (token.startsWith('</')) {
      expect(stack.at(-1).tag, `Unexpected closing ${tag}`).toBe(tag);
      stack.pop();
    } else {
      const node = { tag, className: token.match(/class="([^"]*)"/)?.[1] || '', id: token.match(/id="([^"]*)"/)?.[1], parent: stack.at(-1), children: [] };
      stack.at(-1).children.push(node);
      if (!token.endsWith('/>') && !voidTags.has(tag)) stack.push(node);
    }
  }
  expect(stack).toHaveLength(1);
  return root;
}
function find(node, className) {
  if (node.className?.split(/\s+/).includes(className)) return node;
  for (const child of node.children) { const found = find(child, className); if (found) return found; }
}

for (const lang of ['en', 'ar']) for (const mode of ['tutorial', 'chapter', 'bonus']) {
  it(`${lang} ${mode}: header, square slot, help and controls have independent layout tracks`, () => {
    const puzzle = puzzles.find(p => p.chapter === (mode === 'bonus' ? 'bonus' : mode === 'tutorial' ? 0 : 6));
    const session = loadPuzzle({ ...createSession('Alice', 'geometry'), chapter: 6 }, puzzle, mode);
    const context = {
      screen: mode === 'tutorial' ? 'TUTORIAL' : 'PUZZLE', lang, session,
      t: key => dictionary[lang][key] ?? key, number: String, puzzle,
      chapter: chapters[5], chapterText: dialogue[lang].chapters['6'],
    };
    const document = tree(puzzleScreen(context));
    const section = find(document, 'puzzle-screen');
    const stage = find(section, 'board-stage'), column = find(section, 'board-column');
    expect(find(section, 'puzzle-controls').parent).toBe(section);
    expect(find(section, 'game-hud').parent).toBe(section);
    expect(column.parent).toBe(stage);
    expect(find(column, 'board-header').parent).toBe(column);
    expect(find(column, 'board-slot').parent).toBe(column);
    expect(find(column, 'board-frame').parent).toBe(find(column, 'board-slot'));
    expect(find(column, 'board-help').parent).toBe(column);
    expect(find(section, 'cat-visit').parent).toBe(stage);
    expect(find(section, 'cg-wrap').parent).toBe(find(column, 'board-frame'));
  });
}
