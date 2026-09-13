import { part, staticScenarios, type BrowserScenario } from "./scenario.js";

/**
 * A countdown or a stopwatch, and the four triggers that move it between
 * states.
 *
 * The SSR gate covers the first frame for the other three; Angular is compared
 * in the browser only, so those are repeated here, and the cases at the end
 * reach the half a static render cannot — the machine actually changing state,
 * which is visible as *which of the four triggers carries `hidden`*. All four
 * are always rendered: a trigger that was removed and re-added would drop focus
 * on every transition, so zag hides three instead, and that is the behaviour a
 * port is most likely to simplify away.
 *
 * ── Why every interactive case sets a ten-minute interval ───────────────────
 *
 * A running timer is the one thing here that changes *without* anyone doing
 * something, and the gate captures each library in its own page load. At the
 * default one-second interval a capture that landed a moment late would read
 * `00:00:01` against another library's `00:00:00` and report a difference that
 * is a stopwatch working correctly. The interval is initial state — it changes
 * no attribute and no digit — so setting it out of reach makes "which trigger
 * is hidden" the only thing that moved. The ticking arithmetic itself is
 * `timer.spec.ts`'s, where the clock can be driven rather than waited on.
 */
const SIZES = ["sm", "md", "lg"] as const;
const PARTS = ["days", "hours", "minutes", "seconds", "milliseconds"] as const;

/** Start, Pause, Resume, Reset — in the order zag renders them. */
const trigger = (index: number) => `${part("timer", "control")} > *:nth-child(${index})`;
const shown = (index: number) => `${trigger(index)}:not([hidden])`;
const [START, PAUSE, RESUME, RESET] = [1, 2, 3, 4];

const driven = (name: string, props: Record<string, unknown>, steps: BrowserScenario["steps"]): BrowserScenario => ({
  component: "Timer",
  name,
  // See the note above: out of reach rather than merely long.
  props: { showControls: true, interval: 600_000, ...props },
  steps,
  regions: ["#mount"],
});

const scenarios: BrowserScenario[] = [
  ...staticScenarios("Timer", [
    { name: "default" },
    { name: "minutes and seconds", props: { parts: ["minutes", "seconds"] } },
    { name: "every part", props: { parts: PARTS } },
    // One part means no separator at all, which is the branch the `index > 0`
    // test guards.
    { name: "single part", props: { parts: ["seconds"] } },
    // The digits and the area's aria-label both come off `startMs`.
    { name: "start time", props: { startMs: 3_600_000 } },
    { name: "start time with days", props: { parts: PARTS, startMs: 93_784_005 } },
    { name: "countdown", props: { countdown: true, startMs: 60_000 } },
    { name: "countdown to a target", props: { countdown: true, startMs: 90_000, targetMs: 30_000 } },
    { name: "stopwatch to a target", props: { targetMs: 60_000 } },
    // zag hides whichever action does not apply, so the initial state decides
    // which of the four triggers carries `hidden` — idle shows Start alone.
    { name: "controls", props: { showControls: true } },
    // Running from the first frame: Start is hidden and Reset is not, which is
    // the pair that separates "running" from "idle" in the DOM.
    { name: "auto start with controls", props: { autoStart: true, showControls: true, interval: 600_000 } },
    { name: "auto start without controls", props: { autoStart: true, interval: 600_000 } },
    { name: "labels", props: { showLabels: true } },
    { name: "labels with every part", props: { parts: PARTS, showLabels: true } },
    // The size reaches two places at once: the root recipe and the intent of
    // the control buttons, which are the library Button projected through Ark's
    // asChild.
    ...SIZES.map((size) => ({ name: `size/${size}`, props: { size, showControls: true } })),
    ...(["default", "boxed"] as const).map((variant) => ({
      name: `variant/${variant}`,
      props: { variant },
    })),
    { name: "custom class", props: { className: "mine" } },
  ]),
  // Idle -> running: Start and Resume hide, Pause and Reset appear.
  driven("started", {}, [
    { do: "click", target: trigger(START) },
    { do: "wait", target: shown(PAUSE) },
  ]),
  // Running -> paused, where Resume rather than Start is the trigger that
  // applies. A port that swapped one button for another would have nothing to
  // press here.
  driven("paused", {}, [
    { do: "click", target: trigger(START) },
    { do: "wait", target: shown(PAUSE) },
    { do: "click", target: trigger(PAUSE) },
    { do: "wait", target: shown(RESUME) },
  ]),
  driven("resumed", {}, [
    { do: "click", target: trigger(START) },
    { do: "wait", target: shown(PAUSE) },
    { do: "click", target: trigger(PAUSE) },
    { do: "wait", target: shown(RESUME) },
    { do: "click", target: trigger(RESUME) },
    { do: "wait", target: shown(PAUSE) },
  ]),
  // Reset from paused returns the digits to `startMs` *and* the machine to
  // idle, so Reset hides itself on the way out.
  driven("reset", { startMs: 3_600_000 }, [
    { do: "click", target: trigger(START) },
    { do: "wait", target: shown(PAUSE) },
    { do: "click", target: trigger(PAUSE) },
    { do: "wait", target: shown(RESUME) },
    { do: "click", target: trigger(RESET) },
    { do: "wait", target: shown(START) },
  ]),
  // Started from `autoStart`, then paused: the same paused state reached by a
  // different route, which is the one a port with a separate "has ever run"
  // flag gets wrong.
  driven("auto started then paused", { autoStart: true }, [
    { do: "click", target: trigger(PAUSE) },
    { do: "wait", target: shown(RESUME) },
  ]),
];

export default scenarios;
