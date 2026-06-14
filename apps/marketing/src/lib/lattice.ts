/**
 * Pure lattice-snapping math for arrange mode (SITE.md §4/§5). No React, no DOM,
 * no matter-js — just the global 44px dot grid the organized pieces live on. The
 * engine, the arrange drags, and the reduced-motion layout all snap through here,
 * and `quantizeHomes` pulls the assembled layout onto the same lattice so the
 * visible dots, the arrange grid, and the home slots always agree.
 *
 * Coordinates: a `Rect` frame is in *screen px* (its `w`/`h` already scaled by
 * S); piece sizes passed to `snapToLattice` are *screen px* too. Home slots in
 * `quantizeHomes` are in *frame units* (px at S=1) — the same space as the piece
 * manifest's `cx`/`cy` — so they survive resizes.
 */

/** Arrange snap lattice spacing (px) — the 16px grid pieces snap to when dragged.
 * (The hero's decorative background dot grid is sized separately by the CSS
 * `--dot-grid-size`.) */
export const DOT = 16;
/** Keep-out inset inside the frame, in frame units. */
export const FRAME_PAD = 12;
/** Frame title-bar height, in frame units. */
export const BAR_H = 44;

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Point {
  x: number;
  y: number;
}

export interface Bounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

/** Wrap a value into [0, DOT) — used to align a surface's lattice to page space. */
export function wrapDot(v: number): number {
  return ((v % DOT) + DOT) % DOT;
}

/**
 * The inner box (screen px) a piece *center* must stay within: the frame minus
 * its title bar and padding, inset by half the piece on each side. Derived
 * purely from the frame rect and scale, so any caller agrees on the keep-out.
 */
export function latticeBounds(wpx: number, hpx: number, frame: Rect, S: number): Bounds {
  return {
    minX: frame.x + FRAME_PAD * S + wpx / 2,
    maxX: frame.x + frame.w - FRAME_PAD * S - wpx / 2,
    minY: frame.y + (BAR_H + FRAME_PAD) * S + hpx / 2,
    maxY: frame.y + frame.h - FRAME_PAD * S - hpx / 2,
  };
}

/** Clamp a point into bounds. Tolerates inverted bounds (tiny frames) by
 * preferring the min edge, matching `Math.max(min, Math.min(max, v))`. */
export function clampToBounds(p: Point, b: Bounds): Point {
  return {
    x: Math.max(b.minX, Math.min(b.maxX, p.x)),
    y: Math.max(b.minY, Math.min(b.maxY, p.y)),
  };
}

/**
 * Snap a piece center (screen px) to the nearest free dot on the global lattice,
 * clamped inside the frame. Rounds to the lattice, then ring-searches a 9×9 block
 * of candidate dots for the closest one `isFree` accepts. If none is free, returns
 * the clamped base dot — better an overlap than a lost piece (prototype parity).
 */
export function snapToLattice(
  wpx: number,
  hpx: number,
  c: Point,
  frame: Rect,
  S: number,
  isFree: (p: Point) => boolean = () => true,
): Point {
  const b = latticeBounds(wpx, hpx, frame, S);
  const clamp = (x: number, y: number) => clampToBounds({ x, y }, b);
  const base = clamp(Math.round(c.x / DOT) * DOT, Math.round(c.y / DOT) * DOT);

  const cand: Array<Point & { d: number }> = [];
  for (let ox = -4; ox <= 4; ox++) {
    for (let oy = -4; oy <= 4; oy++) {
      const pt = clamp(base.x + ox * DOT, base.y + oy * DOT);
      const dx = pt.x - c.x;
      const dy = pt.y - c.y;
      cand.push({ x: pt.x, y: pt.y, d: dx * dx + dy * dy });
    }
  }
  cand.sort((a, z) => a.d - z.d);
  for (const pt of cand) {
    if (isFree({ x: pt.x, y: pt.y })) return { x: pt.x, y: pt.y };
  }
  return base;
}

/** A piece footprint (screen px) by center + size, for overlap tests. */
export interface PieceRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * Do two piece rects overlap? `slack` shrinks the test (default 2px, prototype
 * parity) so pieces sitting flush on adjacent dots don't read as overlapping.
 */
export function rectsOverlap(a: PieceRect, b: PieceRect, slack = 2): boolean {
  return (
    Math.abs(a.x - b.x) < (a.w + b.w) / 2 - slack &&
    Math.abs(a.y - b.y) < (a.h + b.h) / 2 - slack
  );
}

/** A piece's home slot in frame units (size + organized center). */
export interface HomeItem {
  /** Frame-unit width/height (px at S=1). */
  w: number;
  h: number;
  /** Organized slot center, in frame units. */
  cx: number;
  cy: number;
}

/**
 * Pull every piece's home slot onto the lattice so the layout the pieces
 * assemble into is the exact grid the user arranges on (SITE.md §5). Pure: takes
 * frame-unit homes, returns new frame-unit homes. Pieces are processed in order;
 * each snaps clear of the homes already placed (updated) and the originals of
 * those not yet processed — prototype parity, and stable across calls.
 */
export function quantizeHomes(
  items: HomeItem[],
  frame: Rect,
  S: number,
): Array<{ cx: number; cy: number }> {
  const out = items.map((it) => ({ cx: it.cx, cy: it.cy }));
  const centerPx = (i: number): Point => ({
    x: frame.x + out[i]!.cx * S,
    y: frame.y + out[i]!.cy * S,
  });

  items.forEach((it, i) => {
    const wpx = it.w * S;
    const hpx = it.h * S;
    const slot = snapToLattice(wpx, hpx, centerPx(i), frame, S, (pos) => {
      for (let j = 0; j < items.length; j++) {
        if (j === i) continue;
        const q = items[j]!;
        const qc = centerPx(j);
        if (
          rectsOverlap(
            { x: pos.x, y: pos.y, w: wpx, h: hpx },
            { x: qc.x, y: qc.y, w: q.w * S, h: q.h * S },
          )
        ) {
          return false;
        }
      }
      return true;
    });
    out[i] = { cx: (slot.x - frame.x) / S, cy: (slot.y - frame.y) / S };
  });

  return out;
}
