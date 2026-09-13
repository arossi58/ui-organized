import { Component, provideZonelessChangeDetection } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { describe, it, expect, beforeEach, afterEach, vi, beforeAll, afterAll } from "vitest";
import { UioRange, nearestSnapIndex, snapToStep } from "./range.js";

// The error pill is the library Icon, and no icon set is registered in a unit
// test — so `Icon` says so, once, loudly, and irrelevantly to anything here.
beforeAll(() => vi.spyOn(console, "warn").mockImplementation(() => {}));
afterAll(() => vi.restoreAllMocks());

/**
 * A slider is arithmetic with a thumb on it, and this file is the arithmetic.
 *
 * Everything a bound input reaches — a value moving, a snap set changing the
 * bounds, `data-focus` landing on five elements at once — belongs to the parity
 * harness instead, and for one reason rather than as a preference: **JIT does
 * not register initializer-based inputs**, so a host template's `[value]` never
 * arrives and the component renders its declared defaults whatever the spec
 * sets. See `part.spec.ts`. The harness runs the ahead-of-time build the way a
 * consumer does, where the inputs are real; `browser/scenarios/Range.ts` is
 * where the keyboard, the bounds and the snap sets are actually driven.
 *
 * What is left here is what no fixture would think to render, and what a
 * rewrite of the snapping would quietly get wrong.
 */
describe("snapToStep", () => {
  it("keeps the last stop inside the range when the step does not divide it", () => {
    // 0..10 by 3 stops at 9, and a value past the end has to land there rather
    // than on a 12 that is off the track or a 10 that is not a stop.
    expect(snapToStep(11, 0, 10, 3)).toBe(9);
    expect(snapToStep(10, 0, 10, 3)).toBe(9);
    // A step wider than the whole range leaves no stop at all, and `max` is the
    // only answer that is still on the track.
    expect(snapToStep(7, 0, 5, 10)).toBe(5);
  });

  it("measures the remainder from `min`, not from zero", () => {
    // The naive `round(v / step) * step` snaps to multiples of the step, which
    // are only the allowed values when the range happens to start at zero. From
    // 10 by 4 the stops are 10, 14, 18 — never 12.
    expect(snapToStep(13, 10, 20, 4)).toBe(14);
    expect(snapToStep(11, 10, 20, 4)).toBe(10);
  });

  it("rounds away the float that no step lands on", () => {
    // `0.1 + 0.2` is 0.30000000000000004, and the naive version returns it
    // unchanged — a readout of "0.30000000000000004" and a thumb that is one
    // ulp from every stop.
    expect(snapToStep(0.1 + 0.2, 0, 1, 0.1)).toBe(0.3);
    expect(snapToStep(0.7, 0, 1, 0.3)).toBe(0.6);
  });

  it("clamps to the bounds", () => {
    expect(snapToStep(-5, 10, 20, 1)).toBe(10);
    expect(snapToStep(99, 10, 20, 1)).toBe(20);
  });

  it("rounds to the nearer stop, and up at the halfway point", () => {
    expect(snapToStep(7, 0, 100, 5)).toBe(5);
    expect(snapToStep(8, 0, 100, 5)).toBe(10);
    expect(snapToStep(7.5, 0, 100, 5)).toBe(10);
  });
});

describe("nearestSnapIndex", () => {
  it("answers with the index, which is what drives the slider", () => {
    // A fixed set is unevenly spaced, so the machine is driven by index and the
    // readout by the value — which is what makes one arrow press move to the
    // adjacent allowed value rather than a seventh of the way across a gap.
    expect(nearestSnapIndex([1, 2, 4, 8], 4)).toBe(2);
    expect(nearestSnapIndex([0, 10, 100], 40)).toBe(1);
    expect(nearestSnapIndex([0, 10, 100], 60)).toBe(2);
  });

  it("keeps the first of two equally near values", () => {
    // A tie has to resolve the same way every time or a value sitting exactly
    // between two stops flickers between them.
    expect(nearestSnapIndex([0, 10], 5)).toBe(0);
  });

  it("does not walk off either end", () => {
    expect(nearestSnapIndex([1, 2, 4, 8], -100)).toBe(0);
    expect(nearestSnapIndex([1, 2, 4, 8], 100)).toBe(3);
  });
});

@Component({
  standalone: true,
  imports: [UioRange],
  template: `<div uioRange></div>`,
})
class Host {}

describe("UioRange", () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
  });
  afterEach(() => TestBed.resetTestingModule());

  /**
   * The default render, which is the only render a spec in this package can
   * ask for — see the note at the top. Narrow, and still worth having: it is
   * the one assertion that the thumb is a slider at all, and that an
   * uncontrolled Range starts at its minimum rather than at `undefined`.
   */
  it("renders a thumb that starts at the minimum and names no label it did not render", () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const thumb = fixture.nativeElement.querySelector('[role="slider"]') as HTMLElement;

    expect(thumb.getAttribute("aria-valuemin")).toBe("0");
    expect(thumb.getAttribute("aria-valuemax")).toBe("100");
    expect(thumb.getAttribute("aria-valuenow")).toBe("0");
    // No caption was rendered, so an `aria-labelledby` here would point at an
    // element that does not exist — the failure `OMIT_ARIA` exists to prevent
    // on the React side, and the one this component drops the attribute for.
    expect(thumb.hasAttribute("aria-labelledby")).toBe(false);
    expect(thumb.hasAttribute("aria-label")).toBe(false);
  });

  it("publishes the custom properties the stylesheet positions from", () => {
    // Without `--slider-range-end` the filled part of the track is the whole
    // track at every value, which renders as a slider that is always full.
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const slider = fixture.nativeElement.querySelector('[data-part="root"][data-scope="slider"]');
    const style = slider.getAttribute("style") ?? "";
    expect(style).toContain("--slider-range-start: 0%");
    expect(style).toContain("--slider-range-end: 100%");
  });
});
