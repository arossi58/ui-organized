import { Component, provideZonelessChangeDetection } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  UioTimer,
  formatTimerTime,
  hasReachedTarget,
  msToTime,
  nextTimerValue,
} from "./timer.js";

/**
 * A timer is a clock reading and a decision about when to stop, and both are
 * pure functions here so that neither has to be waited for.
 *
 * The rest belongs to the parity harness — **JIT does not register
 * initializer-based inputs**, so a host template's `[startMs]` never arrives
 * and the component renders its declared defaults whatever a spec sets (see
 * `part.spec.ts`). `browser/scenarios/Timer.ts` drives the four triggers
 * against the ahead-of-time build, which is where "which action is hidden" is
 * actually compared against the other three libraries.
 *
 * What no gate sees at all is a timer that has been *running* for a while: the
 * browser gate captures each library in its own page load, so a scenario that
 * waited for a tick would be comparing two clocks read a moment apart. The
 * arithmetic below is that tick with the clock taken out of it.
 */
describe("msToTime", () => {
  it("breaks a duration into the five units", () => {
    expect(msToTime(93_784_005)).toEqual({
      days: 1,
      hours: 2,
      minutes: 3,
      seconds: 4,
      milliseconds: 5,
    });
  });

  it("carries into the next unit rather than overflowing one", () => {
    // The modulus is the whole of it: an hours field that counted every hour
    // since the start would read 25 on the second day.
    expect(msToTime(25 * 3_600_000)).toMatchObject({ days: 1, hours: 1 });
    expect(msToTime(90_000)).toMatchObject({ minutes: 1, seconds: 30 });
  });

  it("floors a negative duration at zero", () => {
    // A countdown that overshot its target by a few milliseconds would
    // otherwise render every field as `-1`.
    expect(msToTime(-500)).toEqual({
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      milliseconds: 0,
    });
  });
});

describe("formatTimerTime", () => {
  it("pads to two digits, and to three for milliseconds", () => {
    // A field whose width changes with its value makes the whole readout jump
    // sideways once a second.
    expect(formatTimerTime(msToTime(93_784_005))).toEqual({
      days: "01",
      hours: "02",
      minutes: "03",
      seconds: "04",
      milliseconds: "005",
    });
  });
});

describe("nextTimerValue", () => {
  it("consumes whole intervals only", () => {
    // The callback does not fire at exactly the interval, and adding the raw
    // delta would drift the displayed value off the interval within a minute —
    // a one-second stopwatch showing 00:00:07 after eight ticks.
    expect(
      nextTimerValue({ currentMs: 0, deltaMs: 1003, interval: 1000, countdown: false, targetMs: undefined }),
    ).toBe(1000);
    expect(
      nextTimerValue({ currentMs: 0, deltaMs: 999, interval: 1000, countdown: false, targetMs: undefined }),
    ).toBe(0);
    // A tab that was throttled for four seconds catches up in one tick rather
    // than losing the time it was away.
    expect(
      nextTimerValue({ currentMs: 1000, deltaMs: 4200, interval: 1000, countdown: false, targetMs: undefined }),
    ).toBe(5000);
  });

  it("cannot overshoot the value that ends the run", () => {
    // A floor counting down and a ceiling counting up, so the last tick lands
    // exactly on the target rather than past it — which is what makes the
    // completed readout `00:00:00` rather than a negative one.
    expect(
      nextTimerValue({ currentMs: 500, deltaMs: 1000, interval: 1000, countdown: true, targetMs: undefined }),
    ).toBe(0);
    expect(
      nextTimerValue({ currentMs: 59_000, deltaMs: 3000, interval: 1000, countdown: false, targetMs: 60_000 }),
    ).toBe(60_000);
  });

  it("counts a stopwatch with no target up forever", () => {
    expect(
      nextTimerValue({ currentMs: 10_000, deltaMs: 1000, interval: 1000, countdown: false, targetMs: undefined }),
    ).toBe(11_000);
  });
});

describe("hasReachedTarget", () => {
  it("gives a countdown a target of zero when it was given none", () => {
    expect(hasReachedTarget({ currentMs: 0, countdown: true, targetMs: undefined })).toBe(true);
    expect(hasReachedTarget({ currentMs: 1, countdown: true, targetMs: undefined })).toBe(false);
  });

  it("never ends a stopwatch that was given no target", () => {
    expect(hasReachedTarget({ currentMs: 10_000_000, countdown: false, targetMs: undefined })).toBe(false);
  });

  it("ends on the target rather than past it", () => {
    expect(hasReachedTarget({ currentMs: 60_000, countdown: false, targetMs: 60_000 })).toBe(true);
    expect(hasReachedTarget({ currentMs: 30_000, countdown: true, targetMs: 30_000 })).toBe(true);
    expect(hasReachedTarget({ currentMs: 30_001, countdown: true, targetMs: 30_000 })).toBe(false);
  });
});

@Component({
  standalone: true,
  imports: [UioTimer],
  template: `<div uioTimer></div>`,
})
class Host {}

describe("UioTimer", () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
  });
  afterEach(() => TestBed.resetTestingModule());

  it("renders hours, minutes and seconds with a separator between them", () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const items = [...fixture.nativeElement.querySelectorAll('[data-part="item"]')] as HTMLElement[];
    const separators = fixture.nativeElement.querySelectorAll('[data-part="separator"]');

    expect(items.map((item) => item.getAttribute("data-type"))).toEqual([
      "hours",
      "minutes",
      "seconds",
    ]);
    expect(items.map((item) => item.textContent?.trim())).toEqual(["00", "00", "00"]);
    // One fewer than the fields, which is the branch the `index > 0` test
    // guards — a leading colon is what a naive loop renders.
    expect(separators.length).toBe(2);
  });

  it("announces days and three fields whatever it is showing", () => {
    // zag's default `areaLabel` does not follow `parts`: a timer showing only
    // seconds still announces "0 days 00:00:00". Reproduced rather than tidied,
    // because the four libraries have to announce the same thing.
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const area = fixture.nativeElement.querySelector('[data-part="area"]') as HTMLElement;
    expect(area.getAttribute("aria-label")).toBe("0 days 00:00:00");
    expect(area.getAttribute("role")).toBe("timer");
  });

  it("renders no controls until it is asked for them", () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[data-part="control"]')).toBeNull();
  });
});
