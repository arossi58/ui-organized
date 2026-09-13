import { part, staticScenarios, type BrowserScenario } from "./scenario.js";

/**
 * A circular dial, its markers and the readout beside its caption.
 *
 * The SSR gate covers the resting states for the other three; Angular is
 * compared in the browser only, so they are repeated here, and the keyboard
 * cases at the end reach what a static render cannot — the angle moving, and
 * every marker re-deciding whether it now sits under, over or at the value.
 *
 * A **drag** is not here, and could not be: the angle a pointer gesture lands
 * on is a function of where the dial happens to be on screen, so a case for it
 * would be asserting the layout. Nothing in the DOM is reachable only by
 * dragging, though — the dial has no `data-dragging` — so what a drag would add
 * over `ArrowRight` is a different route to the same attributes.
 *
 * The two cases worth reading twice:
 *
 *  - **`aria-labelledby` always points at `…:label`**, whether or not a caption
 *    was rendered. That is zag's, reproduced rather than corrected, and it is
 *    why the id *shape* is part of the contract: the dangling reference has to
 *    normalise to the same placeholder in all four libraries, which it only
 *    does if all four build the id out of the root id the same way.
 *  - **`ValueText` renders a bare div.** Ark React's does not spread the part's
 *    id or attributes, so the readout carries neither, and rendering the part
 *    properly here would give Angular an id nobody else has.
 */
const SIZES = ["sm", "md", "lg"] as const;
const thumb = part("angle-slider", "thumb");

/** Tab to the dial's only tab stop, then press once. */
const typed = (name: string, props: Record<string, unknown>, key: string, valueNow: number): BrowserScenario => ({
  component: "AngleSlider",
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
  ...staticScenarios("AngleSlider", [
    { name: "default" },
    { name: "with label", props: { label: "Angle" } },
    { name: "helper text", props: { label: "Angle", helperText: "Degrees" } },
    { name: "error message", props: { label: "Angle", error: "Out of range" } },
    { name: "invalid without message", props: { label: "Angle", error: true } },
    { name: "helper hidden by error", props: { label: "A", helperText: "H", error: "Bad" } },
    ...SIZES.map((size) => ({ name: `size/${size}`, props: { size, label: "Angle" } })),
    // The header exists only when there is something to put in it, and the
    // readout is typeset as a degree rather than as Ark's CSS angle.
    { name: "show value", props: { showValue: true } },
    { name: "show value with label", props: { showValue: true, label: "Angle" } },
    { name: "show value at angle", props: { showValue: true, defaultValue: 135 } },
    { name: "default value", props: { defaultValue: 90 } },
    { name: "controlled value", props: { value: 45 } },
    { name: "step", props: { step: 15 } },
    // Markers are positioned from an inline custom property, so what is pinned
    // here is the element, its `data-value` and the state it derives from the
    // current angle.
    { name: "markers", props: { markers: [0, 90, 180, 270] } },
    { name: "markers around the value", props: { markers: [0, 90, 180, 270], defaultValue: 135 } },
    { name: "single marker", props: { markers: [180] } },
    { name: "empty markers", props: { markers: [] } },
    { name: "disabled", props: { label: "Angle", disabled: true } },
    { name: "disabled with markers", props: { markers: [0, 180], disabled: true } },
    // Read-only keeps the tab stop; disabled does not.
    { name: "read only", props: { label: "Angle", readOnly: true } },
    { name: "named", props: { name: "angle", label: "Angle" } },
  ]),
  typed("arrowed up", { label: "Angle", showValue: true }, "ArrowRight", 1),
  typed("arrowed down from a value", { defaultValue: 90 }, "ArrowLeft", 89),
  typed("stepped", { step: 15, defaultValue: 90 }, "ArrowRight", 105),
  // 359, not 360 — 360 degrees *is* 0, so the dial's top is the one angle it
  // has two names for and only one of them is legal.
  typed("end", { markers: [0, 90, 180, 270] }, "End", 359),
  typed("home from a value", { defaultValue: 135, showValue: true }, "Home", 0),
  // A disabled dial has no tab stop, so the press lands nowhere. What is
  // compared is that nothing moved.
  {
    component: "AngleSlider",
    name: "disabled ignores a keypress",
    props: { label: "Angle", disabled: true, defaultValue: 90 },
    steps: [
      { do: "press", key: "Tab" },
      { do: "press", key: "ArrowRight" },
      { do: "wait", target: `${thumb}[aria-valuenow="90"]` },
    ],
    regions: ["#mount"],
  },
  /**
   * Read-only is the odd one: it *keeps* its tab stop, so the thumb takes focus
   * and the keypress is refused by the machine rather than by the browser.
   */
  {
    component: "AngleSlider",
    name: "read only ignores a keypress",
    props: { label: "Angle", readOnly: true, defaultValue: 90 },
    steps: [
      { do: "press", key: "Tab" },
      { do: "press", key: "ArrowRight" },
      { do: "wait", target: `${thumb}[aria-valuenow="90"]` },
    ],
    regions: ["#mount"],
  },
];

export default scenarios;
