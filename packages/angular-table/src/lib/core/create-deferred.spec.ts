import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { signal, type Signal } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { createDeferred } from "./create-deferred.js";

/**
 * The scheduler, not the table.
 *
 * jsdom has no `requestIdleCallback`, so these exercise the Safari branch —
 * `setTimeout(run, 0)` — which is the one with the least margin: if a burst
 * failed to coalesce anywhere, it would fail here first.
 *
 * The property under test is the one the React adapter learned the hard way and
 * recorded: the source has to stay urgent. A deferred value that also delayed
 * the source would make a controlled input drop characters, and the resulting
 * table would look entirely correct.
 */
describe("createDeferred", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    TestBed.configureTestingModule({});
  });
  afterEach(() => {
    TestBed.resetTestingModule();
    vi.useRealTimers();
  });

  function make<T>(initial: T): { source: ReturnType<typeof signal<T>>; deferred: Signal<T> } {
    const source = signal(initial);
    const deferred = TestBed.runInInjectionContext(() => createDeferred(() => source()));
    return { source, deferred };
  }

  /** Let the effect run and its scheduled pass land. */
  function settle(): void {
    TestBed.tick();
    vi.runAllTimers();
    TestBed.tick();
  }

  it("starts equal to its source, without waiting for a scheduler", () => {
    const { deferred } = make("ada");
    // No tick, no timers: a table seeded with `defaultFilters` has to render
    // filtered on its very first pass, including on the server where nothing is
    // ever scheduled. Until a pass has landed the deferred value falls through
    // to the source, so there is no frame where the table renders unfiltered.
    expect(deferred()).toBe("ada");
  });

  it("lags the source, then catches up", () => {
    const { source, deferred } = make("");
    settle();

    source.set("a");
    TestBed.tick();
    expect(deferred()).toBe("");
    expect(source()).toBe("a"); // the urgent half never waits

    vi.runAllTimers();
    TestBed.tick();
    expect(deferred()).toBe("a");
  });

  it("coalesces a burst into one update", () => {
    const { source, deferred } = make("");
    settle();

    for (const value of ["a", "ad", "ada"]) {
      source.set(value);
      TestBed.tick();
    }
    // Each keystroke cancelled the pass its predecessor scheduled, so the
    // filtering runs once against the last value rather than three times.
    expect(deferred()).toBe("");

    vi.runAllTimers();
    TestBed.tick();
    expect(deferred()).toBe("ada");
  });

  it("cancels a scheduled pass when its injector is destroyed", () => {
    const { source, deferred } = make("");
    settle();

    source.set("a");
    TestBed.tick();
    expect(vi.getTimerCount()).toBe(1);

    // `createDeferred` registers its cancel on `DestroyRef`. Without that the
    // pending pass would write to a signal owned by a destroyed component.
    TestBed.resetTestingModule();
    expect(vi.getTimerCount()).toBe(0);
    expect(deferred()).toBe("");
  });
});
