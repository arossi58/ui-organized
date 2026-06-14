import { describe, expect, it } from "vitest";
import {
  BAR_H,
  DOT,
  FRAME_PAD,
  type Rect,
  clampToBounds,
  latticeBounds,
  quantizeHomes,
  rectsOverlap,
  snapToLattice,
  wrapDot,
} from "./lattice";

/** A roomy frame at S=1 so px and frame-unit coordinates coincide in tests. */
const FRAME: Rect = { x: 0, y: 0, w: 760, h: 470 };
const S = 1;

const onLattice = (v: number) => Math.abs(v - Math.round(v / DOT) * DOT) < 1e-9;

describe("wrapDot", () => {
  it("wraps into [0, DOT) for negative and positive values", () => {
    expect(wrapDot(0)).toBe(0);
    expect(wrapDot(DOT)).toBe(0);
    expect(wrapDot(DOT + 3)).toBe(3);
    expect(wrapDot(-3)).toBe(DOT - 3);
    expect(wrapDot(-DOT)).toBe(0);
  });
});

describe("latticeBounds", () => {
  it("insets by frame padding, the bar, and half the piece", () => {
    const b = latticeBounds(40, 20, FRAME, S);
    expect(b.minX).toBe(FRAME_PAD + 40 / 2);
    expect(b.maxX).toBe(760 - FRAME_PAD - 40 / 2);
    expect(b.minY).toBe(BAR_H + FRAME_PAD + 20 / 2);
    expect(b.maxY).toBe(470 - FRAME_PAD - 20 / 2);
  });

  it("scales the insets by S", () => {
    const b = latticeBounds(40, 20, { x: 0, y: 0, w: 380, h: 235 }, 0.5);
    expect(b.minX).toBe(FRAME_PAD * 0.5 + 20);
    expect(b.minY).toBe((BAR_H + FRAME_PAD) * 0.5 + 10);
  });
});

describe("clampToBounds", () => {
  const b = { minX: 10, maxX: 100, minY: 20, maxY: 200 };
  it("clamps a point inside the box", () => {
    expect(clampToBounds({ x: 5, y: 5 }, b)).toEqual({ x: 10, y: 20 });
    expect(clampToBounds({ x: 999, y: 999 }, b)).toEqual({ x: 100, y: 200 });
    expect(clampToBounds({ x: 50, y: 50 }, b)).toEqual({ x: 50, y: 50 });
  });
});

describe("rectsOverlap", () => {
  it("detects overlap and respects the 2px slack on flush neighbours", () => {
    const a = { x: 100, y: 100, w: 40, h: 40 };
    expect(rectsOverlap(a, { x: 110, y: 100, w: 40, h: 40 })).toBe(true);
    // Centers exactly 40 apart = flush edges; slack keeps it non-overlapping.
    expect(rectsOverlap(a, { x: 140, y: 100, w: 40, h: 40 })).toBe(false);
    expect(rectsOverlap(a, { x: 200, y: 100, w: 40, h: 40 })).toBe(false);
  });
});

describe("snapToLattice", () => {
  it("snaps a center to a multiple of DOT", () => {
    const p = snapToLattice(40, 40, { x: 90, y: 130 }, FRAME, S);
    expect(onLattice(p.x)).toBe(true);
    expect(onLattice(p.y)).toBe(true);
    // 90 → 96 (6·16), 130 → 128 (8·16).
    expect(p).toEqual({ x: 96, y: 128 });
  });

  it("keeps the snapped center inside the frame keep-out box", () => {
    const b = latticeBounds(40, 40, FRAME, S);
    const p = snapToLattice(40, 40, { x: -500, y: -500 }, FRAME, S);
    expect(p.x).toBeGreaterThanOrEqual(b.minX);
    expect(p.y).toBeGreaterThanOrEqual(b.minY);
    const q = snapToLattice(40, 40, { x: 9999, y: 9999 }, FRAME, S);
    expect(q.x).toBeLessThanOrEqual(b.maxX);
    expect(q.y).toBeLessThanOrEqual(b.maxY);
  });

  it("ring-searches to the nearest free dot when the base is occupied", () => {
    const occupied = { x: 96, y: 128 };
    const p = snapToLattice(40, 40, { x: 90, y: 130 }, FRAME, S, (pos) => {
      return !(pos.x === occupied.x && pos.y === occupied.y);
    });
    expect(p).not.toEqual(occupied);
    expect(onLattice(p.x)).toBe(true);
    expect(onLattice(p.y)).toBe(true);
    // Nearest free neighbour of the base (96,128) for target (90,130) is
    // (80,128) — one dot left — at distance² = 10² + 2² = 104, beating the
    // other neighbours (e.g. (96,144) at 36 + 196 = 232).
    expect(p).toEqual({ x: 80, y: 128 });
  });

  it("falls back to the clamped base when nothing nearby is free", () => {
    const p = snapToLattice(40, 40, { x: 90, y: 130 }, FRAME, S, () => false);
    expect(p).toEqual({ x: 96, y: 128 });
  });
});

describe("quantizeHomes", () => {
  const items = [
    { w: 122, h: 46, cx: 132, cy: 252 },
    { w: 114, h: 46, cx: 262, cy: 252 },
    { w: 158, h: 38, cx: 150, cy: 318 },
  ];

  it("returns one home per item, every center on the lattice", () => {
    const homes = quantizeHomes(items, FRAME, S);
    expect(homes).toHaveLength(items.length);
    for (const h of homes) {
      expect(onLattice(h.cx)).toBe(true);
      expect(onLattice(h.cy)).toBe(true);
    }
  });

  it("produces no overlapping homes for reasonably spaced input", () => {
    const homes = quantizeHomes(items, FRAME, S);
    for (let i = 0; i < homes.length; i++) {
      for (let j = i + 1; j < homes.length; j++) {
        const a = { x: homes[i]!.cx, y: homes[i]!.cy, w: items[i]!.w, h: items[i]!.h };
        const b = { x: homes[j]!.cx, y: homes[j]!.cy, w: items[j]!.w, h: items[j]!.h };
        expect(rectsOverlap(a, b)).toBe(false);
      }
    }
  });

  it("is stable — re-quantizing already-quantized homes is a fixed point", () => {
    const once = quantizeHomes(items, FRAME, S);
    const twice = quantizeHomes(
      once.map((h, i) => ({ w: items[i]!.w, h: items[i]!.h, cx: h.cx, cy: h.cy })),
      FRAME,
      S,
    );
    expect(twice).toEqual(once);
  });
});
