// Local compatibility patch for the upstream autoPieces renderer.
// Chessground, Lichess contributors, GPL-3.0-or-later.
import type { DrawShape } from './draw.js';
export type Hash = string;
export interface SyncableShape { shape: DrawShape; hash: Hash; current: boolean }
export function syncShapes(shapes: SyncableShape[], root: HTMLElement, render: (shape: SyncableShape) => HTMLElement): void {
  const wanted = new Set(shapes.map(s => s.hash));
  const present = new Set<string>();
  for (const node of Array.from(root.children)) {
    const hash = node.getAttribute('cgHash') || '';
    if (wanted.has(hash)) present.add(hash);
    else node.remove();
  }
  for (const shape of shapes) if (!present.has(shape.hash)) root.appendChild(render(shape));
}
