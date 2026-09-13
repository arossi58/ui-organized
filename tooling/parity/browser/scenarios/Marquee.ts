import { part, type BrowserScenario, type Step } from "./scenario.js";

/**
 * Item content is a plain string throughout — see the note in Splitter.ts.
 *
 * ── What only a browser can say about a Marquee ─────────────────────────────
 *
 * How many copies of the content are rendered is **measured**: `autoFill`
 * promises there is never a gap, and how many copies that takes depends on how
 * wide the items turned out to be. Every library divides the root's laid-out
 * extent by the first copy's and rounds up. On a static render there is no
 * layout, so all four agree on two copies and say nothing; here the horizontal
 * cases settle on nine and the vertical ones on four, and each copy is a
 * `content` part carrying `data-index`, `data-clone`, `role="presentation"` and
 * `aria-hidden`.
 *
 * The vertical count is the interesting one, and the reason these cases exist.
 * A vertical marquee has no height of its own — it is as tall as the copies
 * inside it — so a library that re-measured every time it re-rendered would ask
 * for more copies, grow, and ask for more again. zag avoids that by keeping the
 * measurement in a *ref*, which does not re-render: the count comes from the one
 * measurement taken while the first two copies were on screen. A port that used
 * ordinary reactive state instead renders hundreds of copies here and passes
 * every horizontal case.
 *
 * Everything the animation reads — duration, delay, loop count, translate — is a
 * custom property in `style`, which is not part of the contract, so `speed`,
 * `delay` and `loopCount` are left to the SSR gate.
 */
const items = [
  { id: "a", content: "One" },
  { id: "b", content: "Two" },
  { id: "c", content: "Three" },
];

/**
 * Wait until the track has been measured.
 *
 * A third copy is the proof: before the measurement every library renders
 * exactly two — the original and one clone — so `data-index="2"` cannot exist
 * until the count came from a real width.
 */
const filled: Step[] = [
  { do: "wait", target: `${part("marquee", "content")}[data-index="2"]` },
];

const measured = (name: string, props: Record<string, unknown>): BrowserScenario => ({
  component: "Marquee",
  name,
  props,
  steps: filled,
  regions: ["#mount"],
});

const scenarios: BrowserScenario[] = [
  measured("default", { items }),
  measured("single item", { items: [{ id: "only", content: "Just this" }] }),
  measured("orientation/vertical", { items, orientation: "vertical" }),
  // `reverse` reaches the DOM as `data-reverse` on every copy and changes
  // nothing else: the direction of travel comes from `side`, which is chosen
  // from `orientation` alone.
  measured("reverse", { items, reverse: true }),
  measured("vertical reversed", { items, orientation: "vertical", reverse: true }),
  // The gap is part of what a copy measures, so a wider one needs fewer copies.
  measured("custom spacing", { items, spacing: "2rem" }),
  measured("pause on interaction", { items, pauseOnInteraction: true }),
  measured("starts paused", { items, defaultPaused: true }),
  measured("no edges", { items, showEdges: false }),
  measured("vertical without edges", { items, orientation: "vertical", showEdges: false }),
  measured("custom class", { items, className: "mine" }),
  {
    component: "Marquee",
    // Without `autoFill` the count is fixed at two whatever the measurement
    // says, so this is the one case that needs no settling step — and the one
    // that proves the measured cases above are measuring something.
    name: "no auto fill",
    props: { items, autoFill: false },
    steps: [],
    regions: ["#mount"],
  },
  {
    component: "Marquee",
    // `pauseOnInteraction` is the whole of the component's interactive surface,
    // and it moves two attributes at once: `data-paused` and `data-state`.
    name: "paused by hovering",
    props: { items, pauseOnInteraction: true },
    steps: [
      ...filled,
      // The root, not an item: the items are mid-animation and Playwright will
      // not act on an element whose box keeps moving. The root's box is fixed,
      // and entering it is what every library listens for anyway.
      { do: "hover", target: part("marquee", "root") },
      { do: "wait", target: `${part("marquee", "root")}[data-paused]` },
    ],
    regions: ["#mount"],
  },
];

export default scenarios;
