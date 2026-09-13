import { Component, provideZonelessChangeDetection } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { describe, it, expect, beforeEach, afterEach, vi, beforeAll, afterAll } from "vitest";
import {
  ANGLE_MAX,
  ANGLE_MIN,
  UioAngleSlider,
  angleAtPoint,
  clampAngle,
  constrainAngle,
  snapAngleToStep,
} from "./angle-slider.js";

// The error pill is the library Icon, and no icon set is registered in a unit
// test. See `range.spec.ts`.
beforeAll(() => vi.spyOn(console, "warn").mockImplementation(() => {}));
afterAll(() => vi.restoreAllMocks());

/**
 * The geometry, which is the half of a dial that has no fixture.
 *
 * Everything a bound input reaches is the parity harness's — **JIT does not
 * register initializer-based inputs**, so a host template's `[value]` never
 * arrives and the component renders its declared defaults whatever a spec sets
 * (see `part.spec.ts`). `browser/scenarios/AngleSlider.ts` drives the keyboard,
 * the markers and the read-only refusal against the ahead-of-time build.
 *
 * A *drag* is the one thing neither covers: the angle a pointer lands on is a
 * function of where the dial happens to be on screen. `angleAtPoint` is that
 * calculation with the screen taken out of it, which is why it is here.
 */
const DIAL = { left: 0, top: 0, width: 100, height: 100 };

describe("angleAtPoint", () => {
  it("measures clockwise from twelve o'clock", () => {
    // `atan2(x, y)` rather than the usual `atan2(y, x)`: swapping the arguments
    // puts zero at the top instead of to the right, and the `360 - deg` turns
    // the result clockwise because screen coordinates run down the page while
    // angles run up it. Get either wrong and the dial is mirrored or a quarter
    // turn out — both of which look plausible until two of them are compared.
    expect(angleAtPoint(DIAL, { x: 50, y: 0 })).toBeCloseTo(0, 6);
    expect(angleAtPoint(DIAL, { x: 100, y: 50 })).toBeCloseTo(90, 6);
    expect(angleAtPoint(DIAL, { x: 50, y: 100 })).toBeCloseTo(180, 6);
    expect(angleAtPoint(DIAL, { x: 0, y: 50 })).toBeCloseTo(270, 6);
  });

  it("is measured from the centre, wherever the dial sits", () => {
    // The offset is the whole reason the rect is passed rather than the size: a
    // dial scrolled down the page would otherwise read every angle as if the
    // pointer were far below it.
    const moved = { left: 200, top: 300, width: 100, height: 100 };
    expect(angleAtPoint(moved, { x: 250, y: 300 })).toBeCloseTo(0, 6);
    expect(angleAtPoint(moved, { x: 350, y: 350 })).toBeCloseTo(90, 6);
  });
});

describe("clampAngle", () => {
  it("stops at 359, because 360 degrees is 0", () => {
    expect(clampAngle(-10)).toBe(ANGLE_MIN);
    expect(clampAngle(400)).toBe(ANGLE_MAX);
    expect(ANGLE_MAX).toBe(359);
  });
});

describe("constrainAngle", () => {
  it("wraps the top of the circle to zero rather than stopping short of it", () => {
    // zag's asymmetry, and worth keeping: a value that rounds *up* onto 359
    // becomes 0, so a dial with step 1 passes through twelve o'clock instead of
    // sticking one degree short of it forever.
    expect(constrainAngle(359, 1)).toBe(0);
    expect(constrainAngle(358.5, 1)).toBe(0);
    expect(constrainAngle(358, 1)).toBe(358);
  });

  it("clamps before it snaps", () => {
    expect(constrainAngle(400, 1)).toBe(0);
    expect(constrainAngle(-10, 1)).toBe(0);
  });

  it("can round past the maximum, which is why every caller clamps the result", () => {
    // 350 with a 15 degree step rounds up to 360 — a legal multiple of the step
    // and not a legal angle. The dial never shows it because `set()` runs the
    // result through `clampAngle`; this is the assertion that says so, so that
    // a future caller reaching for `constrainAngle` alone finds out here rather
    // than from a thumb rotated to an angle the readout calls 360.
    expect(constrainAngle(350, 15)).toBe(360);
    expect(clampAngle(constrainAngle(350, 15))).toBe(ANGLE_MAX);
  });
});

describe("snapAngleToStep", () => {
  it("rounds to the nearest step, up at the halfway point", () => {
    expect(snapAngleToStep(7, 15)).toBe(0);
    expect(snapAngleToStep(8, 15)).toBe(15);
  });

  it("keeps the last step inside the dial", () => {
    // 359 is not a multiple of 15, so the last legal stop is 345 — and a value
    // above it has to land there rather than on the 360 that is off the dial.
    expect(snapAngleToStep(358, 15)).toBe(345);
    expect(snapAngleToStep(365, 15)).toBe(345);
    expect(snapAngleToStep(-5, 15)).toBe(ANGLE_MIN);
  });
});

@Component({
  standalone: true,
  imports: [UioAngleSlider],
  template: `<div uioAngleSlider></div>`,
})
class Host {}

describe("UioAngleSlider", () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
  });
  afterEach(() => TestBed.resetTestingModule());

  it("renders a dial whose thumb reports the full circle", () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const thumb = fixture.nativeElement.querySelector('[role="slider"]') as HTMLElement;

    // 360 rather than 359: the *reported* range is the whole circle even though
    // the last reachable value is one degree short of it. zag's, reproduced.
    expect(thumb.getAttribute("aria-valuemin")).toBe("0");
    expect(thumb.getAttribute("aria-valuemax")).toBe("360");
    expect(thumb.getAttribute("aria-valuenow")).toBe("0");
  });

  it("names a label whether or not one was rendered", () => {
    // Also zag's, also reproduced rather than corrected. Because the id is
    // built from the root id, the dangling reference normalises to the same
    // placeholder in all four libraries — which is why the *shape* of an id is
    // part of the contract even when the literal is not. Correcting it here
    // would be a difference the parity gate reports against Angular alone.
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const root = fixture.nativeElement.querySelector('[data-part="root"]') as HTMLElement;
    const thumb = fixture.nativeElement.querySelector('[role="slider"]') as HTMLElement;

    expect(thumb.getAttribute("aria-labelledby")).toBe(`${root.id}:label`);
    expect(fixture.nativeElement.querySelector('[data-part="label"]')).toBeNull();
  });

  it("keeps no marker group when there are no markers", () => {
    // An empty group would still be a flex row with a gap in it.
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[data-part="marker-group"]')).toBeNull();
  });
});
