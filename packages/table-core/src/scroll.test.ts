import { describe, expect, it } from "vitest";
import {
  NO_HORIZONTAL_SCROLL,
  horizontalScrollState,
  horizontalScrollTarget,
  type HorizontalScrollPosition,
} from "./scroll.js";

const at = (
  scrollLeft: number,
  scrollWidth = 1600,
  clientWidth = 800,
): HorizontalScrollPosition => ({
  scrollLeft,
  scrollWidth,
  clientWidth,
});

describe("horizontalScrollState", () => {
  it("reports no overflow when the content fits", () => {
    expect(horizontalScrollState(at(0, 800, 800))).toEqual(NO_HORIZONTAL_SCROLL);
  });

  it("ignores a sub-pixel overflow — fractional column widths, not hidden columns", () => {
    expect(horizontalScrollState(at(0, 800.4, 800))).toEqual(NO_HORIZONTAL_SCROLL);
  });

  it("can only scroll right at the start", () => {
    expect(horizontalScrollState(at(0))).toEqual({
      overflowing: true,
      canScrollLeft: false,
      canScrollRight: true,
    });
  });

  it("can scroll both ways in the middle", () => {
    expect(horizontalScrollState(at(400))).toEqual({
      overflowing: true,
      canScrollLeft: true,
      canScrollRight: true,
    });
  });

  it("can only scroll left at the end", () => {
    expect(horizontalScrollState(at(800))).toEqual({
      overflowing: true,
      canScrollLeft: true,
      canScrollRight: false,
    });
  });

  it("counts a fraction short of the end as the end", () => {
    expect(horizontalScrollState(at(799.6)).canScrollRight).toBe(false);
  });

  it("survives a scrollLeft past either end — bounce scrolling reports those", () => {
    expect(horizontalScrollState(at(-30)).canScrollLeft).toBe(false);
    expect(horizontalScrollState(at(1200)).canScrollRight).toBe(false);
  });
});

describe("horizontalScrollTarget", () => {
  it("moves most of a viewport, keeping the trailing columns in view", () => {
    expect(horizontalScrollTarget(at(0), 1)).toBe(640);
  });

  it("goes back by the same step", () => {
    expect(horizontalScrollTarget(at(640), -1)).toBe(0);
  });

  it("stops at the end rather than scrolling into the clamp", () => {
    expect(horizontalScrollTarget(at(640), 1)).toBe(800);
    expect(horizontalScrollTarget(at(800), 1)).toBe(800);
  });

  it("stops at the start", () => {
    expect(horizontalScrollTarget(at(100), -1)).toBe(0);
    expect(horizontalScrollTarget(at(0), -1)).toBe(0);
  });

  it("moves at least a column's width in a squeezed viewport", () => {
    expect(horizontalScrollTarget(at(0, 400, 40), 1)).toBe(64);
  });
});
