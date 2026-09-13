import { describe, it, expect } from "vitest";
import { render } from "@testing-library/svelte";
import Timer from "./Timer.svelte";

/**
 * The half of Timer nothing else can see.
 *
 * The parity gate renders once, statically, with the clock stopped — so it can
 * pin the first frame (which digits, which `hidden` action trigger) and nothing
 * after it. Everything that only exists once the machine has ticked has exactly
 * one guard, and this is it.
 *
 * The failure this is really for: `autoStart` decides the machine's
 * `initialState`, so a framework that drops the prop still renders `00:00:00` —
 * exactly what a stopped timer renders — and the gate agrees with it. The only
 * way to tell "started" from "not started" apart is to let time pass.
 *
 * Timing is real rather than faked: zag drives the tick from
 * `requestAnimationFrame` and `performance.now()`, so a fake clock would freeze
 * the frames instead of advancing them. `interval` is dropped to 20ms and every
 * assertion polls rather than sleeping a fixed amount, which keeps the tests
 * both fast and free of a hard-coded number of frames.
 */

const MS_PART = '[data-part="item"][data-type="milliseconds"]';
const readMs = (container: HTMLElement) =>
  Number(container.querySelector(MS_PART)!.textContent!.trim());

/**
 * Resolves as soon as `predicate` holds, or gives up after `timeoutMs`.
 *
 * The budget is generous on purpose. jsdom's `requestAnimationFrame` is nothing
 * like a browser's 16ms cadence — the first frame here has been seen anywhere
 * from half a second to two and a half seconds in, depending on load — so a
 * timeout tuned to the interval would be a flake generator. Polling means the
 * tests still finish as soon as the tick actually arrives, and the `it`s below
 * raise vitest's own 5s limit to match rather than being killed under it.
 */
async function until(predicate: () => boolean, timeoutMs = 10_000): Promise<boolean> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (predicate()) return true;
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
  return predicate();
}

describe("Timer", () => {
  it("does not move until it is started", { timeout: 30_000 }, async () => {
    // Calibrated against a running timer rather than a fixed sleep. How long
    // jsdom takes to deliver the first frame varies by more than an order of
    // magnitude with load, so any hard-coded wait is either slow or — much
    // worse — short enough that a timer which *is* secretly running has not
    // ticked yet and the test passes for the wrong reason.
    const stopped = render(Timer, { props: { parts: ["milliseconds"], interval: 20 } });
    const running = render(Timer, {
      props: { parts: ["milliseconds"], interval: 20, autoStart: true },
    });
    expect(readMs(stopped.container)).toBe(0);

    expect(await until(() => readMs(running.container) > 0)).toBe(true);
    expect(readMs(stopped.container)).toBe(0);
  });

  it("counts up while running", { timeout: 30_000 }, async () => {
    const { container } = render(Timer, {
      props: { parts: ["milliseconds"], interval: 20, autoStart: true },
    });
    expect(await until(() => readMs(container) > 0)).toBe(true);
  });

  it("counts down from startMs and reports completion", { timeout: 30_000 }, async () => {
    let completed = 0;
    const { container } = render(Timer, {
      props: {
        parts: ["milliseconds"],
        interval: 20,
        countdown: true,
        startMs: 100,
        autoStart: true,
        onComplete: () => {
          completed += 1;
        },
      },
    });
    expect(readMs(container)).toBe(100);
    // Down, not up — the sign of the step is the whole of what `countdown` does.
    expect(await until(() => readMs(container) < 100)).toBe(true);
    expect(await until(() => completed > 0)).toBe(true);
  });
});
