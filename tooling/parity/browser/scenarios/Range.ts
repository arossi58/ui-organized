import { part, staticScenarios, type BrowserScenario } from "./scenario.js";

/**
 * A slider with one thumb, its caption, its readout and its bounds.
 *
 * The SSR gate covers the resting states for the other three; Angular is
 * compared in the browser only, so they are repeated here — and the keyboard
 * cases at the end reach the half a static render cannot: the value actually
 * moving, and `data-focus` landing on all five slider parts at once.
 *
 * Two of the SSR gate's cases have no counterpart here, and neither is an
 * oversight:
 *
 *  - **`formatValue`** is a function, and a scenario's props reach the page as
 *    JSON in a query string. Nothing portable can carry it.
 *  - **`id`** reaches the slider root in React and has no input to reach in the
 *    Angular component. It would compare green either way — the contract
 *    numbers ids positionally, so a supplied id and a generated one produce the
 *    same placeholder — so a case for it would assert nothing.
 *
 * A **drag** is the other thing missing, and deliberately: the value a pointer
 * gesture lands on is a function of where the track happens to be, so a case
 * for it would be asserting the layout rather than the slider. What a drag adds
 * over the keyboard is `data-dragging`, which is therefore uncovered in every
 * library.
 */
const SIZES = ["sm", "md", "lg"] as const;
const thumb = part("slider", "thumb");

/** The whole gesture: tab to the only tabbable element, then press. */
const typed = (name: string, props: Record<string, unknown>, key: string, valueNow: number): BrowserScenario => ({
  component: "Range",
  name,
  props,
  steps: [
    { do: "press", key: "Tab" },
    { do: "press", key },
    { do: "wait", target: `${thumb}[aria-valuenow="${valueNow}"]` },
  ],
  regions: ["#mount"],
});

const scenarios: BrowserScenario[] = [
  ...staticScenarios("Range", [
    // No Label part is rendered — the caption is a Field.Label — so Ark's
    // aria-labelledby on the thumb would name an element that does not exist.
    // That is the case OMIT_ARIA is here for, and the one a port is most likely
    // to turn back into a dangling reference.
    { name: "default" },
    { name: "aria-label", props: { "aria-label": "Volume" } },
    { name: "with label", props: { label: "Volume" } },
    { name: "hide value", props: { label: "Volume", hideValue: true } },
    { name: "label and aria-label", props: { label: "Volume", "aria-label": "Ignored" } },
    ...SIZES.map((size) => ({ name: `size/${size}`, props: { size, label: "Volume" } })),
    { name: "error message", props: { label: "Volume", error: "Too loud" } },
    { name: "invalid without message", props: { label: "Volume", error: true } },
    // Disabled reaches the field root, the caption and every slider part, and
    // swaps the thumb's tab stop for aria-disabled.
    { name: "disabled", props: { label: "Volume", disabled: true } },
    { name: "default value", props: { defaultValue: 40 } },
    { name: "controlled value", props: { value: 60 } },
    { name: "min max", props: { min: 10, max: 20, defaultValue: 15 } },
    { name: "step", props: { min: 0, max: 100, step: 25, defaultValue: 50 } },
    // Below `min` and above `max` are both clamped before the machine sees
    // them, so the thumb cannot start off the track.
    { name: "default below min", props: { min: 10, max: 20, defaultValue: 0 } },
    { name: "default above max", props: { min: 10, max: 20, defaultValue: 99 } },
    // Snap values take over min/max/step and drive the slider by index, so the
    // machine's bounds become 0..n-1 while the readout stays in real units.
    { name: "snap values", props: { snapValues: [1, 2, 4, 8], defaultValue: 4 } },
    { name: "snap values unsorted", props: { snapValues: [8, 1, 4, 2], defaultValue: 2 } },
    { name: "snap value between points", props: { snapValues: [0, 10, 100], defaultValue: 40 } },
    { name: "range labels", props: { rangeLabels: true } },
    { name: "range labels with bounds", props: { rangeLabels: true, min: 5, max: 25 } },
    { name: "custom range labels", props: { rangeLabels: true, startLabel: "Low", endLabel: "High" } },
    { name: "named", props: { name: "volume", label: "Volume" } },
  ]),
  /**
   * `data-focus` is written onto the root, the control, the track, the range
   * and the thumb together — five elements from one event — and the shared
   * stylesheet selects on it. A port that listened on the thumb alone would
   * render a focus ring on the thumb and nothing around it.
   */
  {
    component: "Range",
    name: "focused",
    props: { label: "Volume" },
    steps: [
      { do: "press", key: "Tab" },
      { do: "wait", target: `${thumb}[data-focus]` },
    ],
    regions: ["#mount"],
  },
  typed("arrowed up", { label: "Volume" }, "ArrowRight", 1),
  typed("arrowed down from a value", { defaultValue: 40 }, "ArrowLeft", 39),
  // Home and End are the bounds rather than the step, and with snap values the
  // bounds are indices.
  typed("end", { label: "Volume" }, "End", 100),
  typed("home from a value", { defaultValue: 40 }, "Home", 0),
  typed("stepped", { min: 0, max: 100, step: 25, defaultValue: 50 }, "ArrowRight", 75),
  // One press moves to the *adjacent allowed value*, not a fraction of the gap
  // between two of them — the whole reason snapping is driven by index.
  typed("arrowed across snap values", { snapValues: [1, 2, 4, 8], defaultValue: 4 }, "ArrowRight", 3),
  // A disabled slider has no tab stop, so the Tab lands nowhere and the press
  // is swallowed. What is compared is that nothing moved.
  {
    component: "Range",
    name: "disabled ignores a keypress",
    props: { label: "Volume", disabled: true, defaultValue: 40 },
    steps: [
      { do: "press", key: "Tab" },
      { do: "press", key: "ArrowRight" },
      { do: "wait", target: `${thumb}[aria-valuenow="40"]` },
    ],
    regions: ["#mount"],
  },
];

export default scenarios;
