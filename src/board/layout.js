/** Fit a square board to its grid slot, with complete device-pixel squares. */
export function fitBoard(width, height, pixelRatio = 1, gutter = 24) {
  const ratio = Number.isFinite(pixelRatio) && pixelRatio > 0 ? pixelRatio : 1;
  const available = Math.max(0, Math.min(width, height) - gutter * 2);
  // Round upward to the CSS subpixel grid so Chessground's own device-pixel
  // floor does not accidentally shave off another square increment.
  const physicalBoard = Math.floor(available * ratio / 8) * 8 / ratio;
  const board = Math.ceil(physicalBoard * 64) / 64;
  return { board, frame: board + gutter * 2, square: board / 8, gutter };
}

/** Layout sizes ignore transforms; viewport rectangles do not. */
export function sizeBoardFrame(slot, pixelRatio = globalThis.devicePixelRatio || 1) {
  const frame = slot?.querySelector('.board-frame');
  if (!frame) return null;
  const geometry = fitBoard(slot.clientWidth, slot.clientHeight, pixelRatio);
  frame.style.width = geometry.frame + 'px';
  frame.style.height = geometry.frame + 'px';
  frame.style.padding = geometry.gutter + 'px';
  return geometry;
}
