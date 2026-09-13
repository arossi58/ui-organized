// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { createApp, h, type App } from "vue";
import Timer from "./Timer.vue";

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
 * exactly what a stopped timer renders — and the gate agrees with it. Vue is the
 * package where dropping it is easiest, because an absent Boolean prop is cast
 * to a literal `false` unless the declaration says otherwise (see ../../props.ts),
 * and the only way to tell "started" from "not started" apart is to let time
 * pass.
 *
 * This file mounts into a DOM, which the rest of this package's tests do not —
 * they render on the server, where a timer has no future. Hence the environment
 * docblock above rather than a change to the shared config.
 *
 * Timing is real rather than faked: zag drives the tick from
 * `requestAnimationFrame` and `performance.now()`, so a fake clock would freeze
 * the frames instead of advancing them.
 */

const MS_PART = '[data-part="item"][data-type="milliseconds"]';

/** The component's own props, emit handlers included. See Marquee.test.ts. */
type TimerMountProps = InstanceType<typeof Timer>["$props"];

function mount(props: TimerMountProps): { host: HTMLElement; app: App } {
  const host = document.createElement("div");
  document.body.appendChild(host);
  const app = createApp({ render: () => h(Timer, props) });
  app.mount(host);
  return { host, app };
}

const readMs = (host: HTMLElement) => Number(host.querySelector(MS_PART)!.textContent!.trim());

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
    const stopped = mount({ parts: ["milliseconds"], interval: 20 });
    const running = mount({ parts: ["milliseconds"], interval: 20, autoStart: true });
    expect(readMs(stopped.host)).toBe(0);

    expect(await until(() => readMs(running.host) > 0)).toBe(true);
    expect(readMs(stopped.host)).toBe(0);

    stopped.app.unmount();
    running.app.unmount();
  });

  it("counts up while running", { timeout: 30_000 }, async () => {
    const { host, app } = mount({ parts: ["milliseconds"], interval: 20, autoStart: true });
    expect(await until(() => readMs(host) > 0)).toBe(true);
    app.unmount();
  });

  it("counts down from startMs and reports completion", { timeout: 30_000 }, async () => {
    let completed = 0;
    const { host, app } = mount({
      parts: ["milliseconds"],
      interval: 20,
      countdown: true,
      startMs: 100,
      autoStart: true,
      onComplete: () => {
        completed += 1;
      },
    });
    expect(readMs(host)).toBe(100);
    // Down, not up — the sign of the step is the whole of what `countdown` does.
    expect(await until(() => readMs(host) < 100)).toBe(true);
    expect(await until(() => completed > 0)).toBe(true);
    app.unmount();
  });
});
