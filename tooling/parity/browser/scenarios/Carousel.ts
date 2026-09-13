import { part, type BrowserScenario, type Step } from "./scenario.js";

/**
 * Slide content is a plain string throughout, the same fixed point the SSR cases
 * use — see the note in Splitter.ts.
 *
 * ── Why none of these are `staticScenarios` ─────────────────────────────────
 *
 * A Carousel has nothing true to say about itself until it has been laid out.
 * `data-inview` is an `IntersectionObserver` result in every library, and the
 * page count — which decides both arrows' `disabled` and which dot is
 * `data-current` — is read back off the *measured* scroll-snap positions. Both
 * arrive after the mount, so every case here waits for a slide to report itself
 * in view before anything is compared. Without that the gate would sometimes
 * capture React mid-settle and sometimes not, and the failure would look like a
 * port bug in whichever library happened to be slower that run.
 *
 * The measurement is also why `slidesPerPage` is worth a case at all: four
 * slides at three per page measure *three* pages rather than the two arithmetic
 * predicts, because sub-pixel rounding decides whether an offset lands over the
 * clamp. A library that counted instead of measuring passes every other row
 * here and fails that one.
 */
const slides = [
  { id: "a", content: "First" },
  { id: "b", content: "Second" },
  { id: "c", content: "Third" },
];

/** Nothing is comparable until the observer has answered. */
const settled: Step[] = [{ do: "wait", target: `${part("carousel", "item")}[data-inview]` }];

const laidOut = (
  name: string,
  props: Record<string, unknown>,
): BrowserScenario => ({
  component: "Carousel",
  name,
  props,
  steps: settled,
  regions: ["#mount"],
});

const scenarios: BrowserScenario[] = [
  laidOut("default", { slides }),
  laidOut("single slide", { slides: [{ id: "only", content: "Just this" }] }),
  laidOut("accessible label", { slides, label: "Featured work" }),
  // Either end of a non-looping carousel disables one arrow, and `disabled` is
  // what a caller sees change.
  laidOut("second page", { slides, defaultPage: 1 }),
  laidOut("last page", { slides, defaultPage: 2 }),
  // Two slides visible at once: two items report `data-inview`, and the page
  // count stops matching the slide count while the indicator row does not.
  laidOut("slides per page", { slides, slidesPerPage: 2 }),
  // Four slides at three per page: the row where a counted page total and a
  // measured one disagree.
  laidOut("slides per page over a fraction", {
    slides: [...slides, { id: "d", content: "Fourth" }],
    slidesPerPage: 3,
  }),
  laidOut("loop", { slides, loop: true }),
  /**
   * `loop` is not independent of `autoplay`: the machine defaults it to
   * `!!autoplay`, so an autoplaying carousel wraps unless told otherwise. A
   * library that turns an absent `loop` into a literal `false` replaces that
   * derivation with a decision the caller never made, and the symptom is the
   * previous arrow rendering `disabled` on the first slide. Autoplay also flips
   * the item group's `aria-live` to "off", so this row pins both halves.
   */
  laidOut("autoplay", { slides, autoplay: true }),
  // The caller overriding the derivation is a different thing from a library
  // losing it.
  laidOut("autoplay without loop", { slides, autoplay: true, loop: false }),
  laidOut("orientation/vertical", { slides, orientation: "vertical" }),
  // The size reaches two places at once: the root recipe and the arrows, which
  // are the library Button projected through Ark's asChild.
  laidOut("size/sm", { slides, size: "sm" }),
  laidOut("size/lg", { slides, size: "lg" }),
  // `minimal` drops both arrows and leaves the indicator row alone.
  laidOut("variant/minimal", { slides, variant: "minimal" }),
  laidOut("no indicators", { slides, showIndicators: false }),
  laidOut("custom class", { slides, className: "mine" }),
  {
    component: "Carousel",
    // The whole point of the component, and unreachable without a click: the
    // page moves, which moves `data-current`, `data-inview`, `aria-hidden` and
    // both arrows' `disabled` at once.
    name: "advanced with the next arrow",
    props: { slides },
    steps: [
      ...settled,
      { do: "click", target: part("carousel", "next-trigger") },
      { do: "wait", target: `${part("carousel", "indicator")}[data-index="1"][data-current]` },
      { do: "wait", target: `${part("carousel", "item")}[data-index="1"][data-inview]` },
    ],
    regions: ["#mount"],
  },
  {
    component: "Carousel",
    name: "jumped with an indicator",
    props: { slides },
    steps: [
      ...settled,
      { do: "click", target: `${part("carousel", "indicator")}[data-index="2"]` },
      { do: "wait", target: `${part("carousel", "item")}[data-index="2"][data-inview]` },
    ],
    regions: ["#mount"],
  },
  {
    component: "Carousel",
    // Wrapping backwards off the first page is the only place `loop` shows up
    // as movement rather than as an arrow that is merely not disabled.
    name: "wrapped backwards past the first page",
    props: { slides, loop: true },
    steps: [
      ...settled,
      { do: "click", target: part("carousel", "prev-trigger") },
      { do: "wait", target: `${part("carousel", "item")}[data-index="2"][data-inview]` },
    ],
    regions: ["#mount"],
  },
];

export default scenarios;
