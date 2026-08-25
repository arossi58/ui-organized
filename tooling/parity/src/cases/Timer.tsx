import type { ComponentType } from "react";
import { Timer as RTimer } from "@ui-organized/react";
import TimerFixture from "../fixtures/TimerFixture.svelte";
import VueTimerFixture from "../fixtures/vue/TimerFixture.vue";
import { SIZES, type ParitySpec } from "./spec.js";

const PARTS = ["days", "hours", "minutes", "seconds", "milliseconds"] as const;

/**
 * Timer is time-driven, and a static render is its first frame.
 *
 * That frame is worth pinning precisely because it is not empty: `startMs` and
 * `countdown` decide the digits before a single tick, `formatTime` pads them,
 * and the area's `aria-label` is built from the same values — so a framework
 * that drops `startMs` renders `00:00:00` against `01:00:00` and says so in two
 * places at once. `autoStart` is initial state rather than elapsed time (the
 * machine's `initialState` reads it), which is why it appears here while a
 * *running* timer does not: nothing below waits for a tick, and faking one into
 * a fixture would make this look like it covers more than it does. The ticking
 * itself is the browser harness's.
 */
const spec: ParitySpec = {
  component: "Timer",
  react: (p) => <RTimer {...(p as any)} />,
  svelte: TimerFixture as unknown as ComponentType<any>,
  vue: VueTimerFixture as unknown as ComponentType<any>,
  cases: [
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
    { name: "interval", props: { interval: 100 } },
    // zag hides whichever action does not apply, so the initial state decides
    // which of the four triggers carries `hidden` — idle shows Start alone.
    { name: "controls", props: { showControls: true } },
    { name: "auto start with controls", props: { autoStart: true, showControls: true } },
    { name: "auto start without controls", props: { autoStart: true } },
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
  ],
};

export default spec;
