import type { ComponentType } from "react";
import { Marquee as RMarquee } from "@ui-organized/react";
import MarqueeFixture from "../fixtures/MarqueeFixture.svelte";
import VueMarqueeFixture from "../fixtures/vue/MarqueeFixture.vue";
import type { ParitySpec } from "./spec.js";

/**
 * Item content is plain strings throughout — see the note in Splitter.tsx.
 *
 * Marquee is time-driven, and a static render is a single frame of it with the
 * clock stopped. That is not a gap in the cases: every value the animation reads
 * — duration, delay, loop count, translate — is a custom property zag writes
 * into `style`, and `style` is not part of the contract this suite compares.
 * What *is* static is the whole structure: the two edges, the viewport, the
 * `contentCount` copies the machine asks for, and the `data-clone` /
 * `aria-hidden` pairing that keeps every copy but the first out of the
 * accessibility tree. Cases that would need the animation to have run are not
 * faked here; the browser harness is where a moving marquee belongs.
 */
const spec: ParitySpec = {
  component: "Marquee",
  react: (p) => <RMarquee {...(p as any)} />,
  svelte: MarqueeFixture as unknown as ComponentType<any>,
  vue: VueMarqueeFixture as unknown as ComponentType<any>,
  cases: (() => {
    const items = [
      { id: "a", content: "One" },
      { id: "b", content: "Two" },
      { id: "c", content: "Three" },
    ];
    return [
      { name: "default", props: { items } },
      { name: "single item", props: { items: [{ id: "only", content: "Just this" }] } },
      { name: "speed", props: { items, speed: 120 } },
      { name: "delay", props: { items, delay: 2 } },
      // `orientation` is ours, not the machine's: it picks the `side` the
      // machine actually takes, and the machine derives its own orientation
      // back out of that. A framework mapping it wrongly shows up as
      // `data-side` and `data-orientation` disagreeing.
      ...(["horizontal", "vertical"] as const).map((orientation) => ({
        name: `orientation/${orientation}`,
        props: { items, orientation },
      })),
      { name: "reverse", props: { items, reverse: true } },
      { name: "vertical reversed", props: { items, orientation: "vertical", reverse: true } },
      { name: "custom spacing", props: { items, spacing: "2rem" } },
      // Defaults to true, so this row is the one that catches a framework
      // dropping it — see props.ts for why an absent Vue Boolean is not
      // "absent".
      { name: "no auto fill", props: { items, autoFill: false } },
      { name: "pause on interaction", props: { items, pauseOnInteraction: true } },
      // The only piece of the running state a static render can honestly show:
      // `defaultPaused` is the machine's initial context, not a tick.
      { name: "starts paused", props: { items, defaultPaused: true } },
      { name: "loop count", props: { items, loopCount: 3 } },
      { name: "no edges", props: { items, showEdges: false } },
      { name: "vertical without edges", props: { items, orientation: "vertical", showEdges: false } },
      { name: "custom class", props: { items, className: "mine" } },
    ];
  })(),
};

export default spec;
