import { SIZES, type ParityAllowance } from "../../src/cases/spec.js";
import { part, type BrowserScenario, type Step } from "./scenario.js";

/**
 * The picker surface, and the arithmetic behind it.
 *
 * The SSR gate compares the trigger and nothing else — the area, the channel
 * sliders, the eyedropper and the swatch group are all portalled, and the three
 * renderers disagree about what a portal does on the server. So `swatches` and
 * `showEyeDropper` are pinned here or nowhere, and so is every number the
 * machine derives from the colour.
 *
 * ── What these cases are really testing ─────────────────────────────────────
 *
 * A ColorPicker puts the same colour into the accessibility tree in three
 * spaces at once, and the parity gate compares all of them:
 *
 *     aria-label="select color. current color is rgba(37, 99, 235, 1)"   trigger
 *     data-value="#2563EB"                                          value swatch
 *     aria-valuetext="hue 221.21"                                      hue thumb
 *     aria-valuetext="saturation 84.26, brightness 92.16"              area thumb
 *
 * Three of those are conversions, rounded to two decimal places. Angular has no
 * `@zag-js/color-utils` and computes them itself, so the cases below are what
 * hold that arithmetic to the hundredth — a hue that came out `221.2` rather
 * than `221.21` reads differently to a screen reader and fails here.
 *
 * The colours are chosen for the corners rather than for looks: black and white
 * (chroma zero, where the hue is undefined and every library has to agree it is
 * `0`), a three-digit hex, an eight-digit one whose alpha is `0.50196…` and is
 * printed in full by the trigger and rounded to `0.5` by the alpha slider, an
 * HSL value that never passes through RGB at all, and a named colour.
 */
const swatches = ["#ef4444", "#22c55e"];

const surface = part("color-picker", "positioner");
const content = part("color-picker", "content");

/** Open by clicking the trigger, and wait until the popup says it is open. */
const openViaTrigger: Step[] = [
  { do: "click", target: part("color-picker", "trigger") },
  { do: "wait", target: `${content}[data-state="open"]` },
];

/**
 * The one attribute the four libraries cannot agree on, and it is not a port's
 * doing — the same allowance the SSR gate carries, for the same reason.
 *
 * The three Ark wrappers hand `getSwatchProps` different things for the *value*
 * swatch: React and Svelte pass the colour's printed form, Vue passes the parsed
 * `Color`. zag re-parses a string before comparing, so whenever the printed form
 * rounds — `#2563eb` as hsla is `hsla(221.21, 83.19%, 53.33%, 1)` — the round
 * trip loses precision and React and Svelte report `unchecked` on the swatch
 * that is by definition the value, while Vue reports `checked`.
 *
 * Angular reproduces the round trip rather than short-circuiting it, so it lands
 * on React's answer for every case here; the allowance exists for Vue. What it
 * costs is `data-state` on the control, the trigger and the popup, which come
 * out of the same `getControlProps` / `getTriggerProps` calls as `aria-expanded`
 * and `hidden` — still compared, and no port can emit one without the other, so
 * the open-state cases still bite.
 */
const SWATCH_STATE_SKEW: ParityAllowance = {
  attribute: "data-state",
  reason:
    "@ark-ui/react and @ark-ui/svelte pass the value swatch a colour string; " +
    "@ark-ui/vue passes the parsed Color. zag re-parses the string before " +
    "comparing, so a colour whose printed form rounds no longer equals the " +
    "value it came from and the two sides disagree about whether the value's " +
    "own swatch is checked. Same allowance as the SSR gate's, and the same " +
    "reasoning: ColorPicker.css never selects on data-state, aria-expanded and " +
    "hidden still carry the open state, and the assertion in this gate fails " +
    "the moment the stylesheet starts reading it.",
};

/**
 * The swatch group's `role`, which Ark Vue drops.
 *
 * `ColorPicker.SwatchGroup` spreads `getSwatchGroupProps()` in Ark React and Ark
 * Svelte and, in Ark Vue 5.39.0, spreads only the anatomy's `data-scope` and
 * `data-part` — so the group loses `role="group"` and stops being a group to a
 * screen reader. That is upstream and nothing in this repository can reach it;
 * it is also a real accessibility difference rather than an invisible one, which
 * is why it is skipped rather than allowed. An allowance would have to claim the
 * difference cannot reach a user, and this one can.
 *
 * Remove the moment Ark Vue's SwatchGroup calls the props getter — at which
 * point these cases compare all four.
 */
const VUE_SWATCH_GROUP_ROLE = [
  {
    framework: "vue",
    reason:
      "Ark Vue 5.39.0's ColorPicker.SwatchGroup renders `ark.div` with the " +
      "anatomy attributes alone and never calls getSwatchGroupProps(), so the " +
      "group has no role=\"group\" where React's and Svelte's do. Upstream, " +
      "and a real difference to assistive technology rather than an invisible " +
      "one — so it is skipped rather than allowed, because an allowance would " +
      "be claiming nothing can read it. The other ColorPicker cases still " +
      "compare Vue; only the ones rendering a swatch group are skipped.",
  },
];

const picker = (name: string, props: Record<string, unknown>): BrowserScenario => ({
  component: "ColorPicker",
  name,
  props,
  steps: [],
  regions: ["#mount", surface],
  stylesheets: ["ColorPicker/ColorPicker.css"],
  allow: [SWATCH_STATE_SKEW],
});

const scenarios: BrowserScenario[] = [
  // No props at all: each library fills in its own defaults for `defaultValue`,
  // `showEyeDropper` and `size`, so this is the case that pins them to the same
  // three answers rather than to whatever each port happened to write down.
  picker("default", {}),
  picker("with label", { label: "Brand" }),
  picker("required", { label: "Brand", required: true }),
  picker("helper text", { label: "Brand", helperText: "Any CSS colour" }),
  picker("error message", { label: "Brand", error: "Pick a colour" }),
  picker("helper hidden by error", { label: "B", helperText: "H", error: "Bad" }),
  picker("disabled", { label: "Brand", disabled: true }),
  picker("read only", { label: "Brand", readOnly: true }),
  picker("named", { name: "brand", label: "Brand" }),
  ...SIZES.map((size) => picker(`size/${size}`, { size, label: "Brand" })),
  // `swatch-only` is the one variant that changes the element list rather than a
  // class: it drops the value text entirely.
  ...(["default", "swatch-only"] as const).map((variant) =>
    picker(`variant/${variant}`, { variant, label: "Brand" }),
  ),
  // ── The colour arithmetic ────────────────────────────────────────────────
  picker("open at a colour", { defaultValue: "#2563eb", defaultOpen: true }),
  // Chroma zero, where the hue is undefined and all four have to answer `0`.
  picker("open at black", { defaultValue: "#000000", defaultOpen: true }),
  picker("open at white", { defaultValue: "#ffffff", defaultOpen: true }),
  // Three-digit hex: each digit doubles, so `#abc` is `#AABBCC`.
  picker("short hex", { defaultValue: "#abc", defaultOpen: true }),
  // Eight-digit hex: alpha is a byte out of 255, so `80` is 0.50196…, which the
  // trigger prints in full and the alpha slider reports as `0.5`.
  picker("hex with alpha", { defaultValue: "#2563eb80", defaultOpen: true }),
  picker("rgb notation", { value: "rgb(37, 99, 235)", defaultOpen: true }),
  picker("rgba with alpha", { value: "rgba(37, 99, 235, 0.5)", defaultOpen: true }),
  // An HSL value never passes through RGB: the machine keeps it in its own space,
  // and the area's second axis is *lightness* rather than brightness.
  picker("hsl notation", { defaultValue: "hsl(221, 83%, 53%)", defaultOpen: true }),
  picker("hsla with alpha", { defaultValue: "hsla(120, 50%, 25%, 0.4)", defaultOpen: true }),
  // A named colour, which every library resolves from the CSS table before
  // parsing anything.
  picker("named colour", { defaultValue: "rebeccapurple", defaultOpen: true }),
  // `format` reaches the outside of the popup as well as the inside: the value
  // text and the trigger's label print in that notation, and the area changes
  // which pair of channels it is.
  ...(["rgba", "hsla", "hsba"] as const).map((format) =>
    picker(`format/${format}`, { format, defaultValue: "#2563eb", defaultOpen: true }),
  ),
  // ── The rest of the popup ────────────────────────────────────────────────
  { ...picker("swatches", { swatches, defaultValue: "#2563eb", defaultOpen: true }), skip: VUE_SWATCH_GROUP_ROLE },
  // A swatch that *is* the value: the only case where a swatch reports checked.
  {
    ...picker("swatch matching the value", { swatches, defaultValue: "#ef4444", defaultOpen: true }),
    skip: VUE_SWATCH_GROUP_ROLE,
  },
  picker("no eyedropper", { showEyeDropper: false, defaultOpen: true }),
  picker("closed", { label: "Brand" }),
  picker("controlled open", { open: true, label: "Brand" }),
  // Worth its own case in Vue's company: an absent Boolean prop casts to `false`
  // there, so "controlled and closed" and "uncontrolled" are one keystroke apart.
  picker("controlled closed", { open: false, label: "Brand" }),
  picker("custom class", { className: "mine" }),
  {
    component: "ColorPicker",
    name: "opened by clicking the trigger",
    props: { label: "Brand", swatches, defaultValue: "#2563eb" },
    steps: openViaTrigger,
    regions: ["#mount", surface],
    stylesheets: ["ColorPicker/ColorPicker.css"],
    allow: [SWATCH_STATE_SKEW],
    skip: VUE_SWATCH_GROUP_ROLE,
  },
  {
    component: "ColorPicker",
    name: "dismissed with Escape",
    props: { label: "Brand", defaultValue: "#2563eb" },
    steps: [
      ...openViaTrigger,
      { do: "awaitFocus", target: content },
      { do: "press", key: "Escape" },
      // `[hidden]`, not `[data-state="closed"]`. Ark React flips the state
      // synchronously and lets its Presence wrapper put `hidden` back a tick
      // later, so waiting on the state alone captured React between the two.
      { do: "wait", target: `${content}[hidden]` },
    ],
    regions: ["#mount", surface],
    stylesheets: ["ColorPicker/ColorPicker.css"],
    allow: [SWATCH_STATE_SKEW],
    /**
     * `visibilityMatches`, not `hidden`.
     *
     * `.color-picker__popup` declares `display: flex`, which beats the `hidden`
     * attribute the machine puts on it — so a closed picker stays laid out, and
     * in the accessibility tree, in **every** library. That is a finding about
     * the shared stylesheet rather than about any port, and this gate is not the
     * place to assert it; what the four still have to agree on is that they are
     * all painted the same way, which an Angular popup that stayed up where
     * React's came down would fail.
     */
    visibilityMatches: [content],
  },
  {
    component: "ColorPicker",
    /**
     * Choosing a swatch, which is the whole component in one click: the value
     * changes, and with it the trigger's `aria-label`, the value text, the value
     * swatch's `data-value`, and every thumb's `aria-valuenow` and
     * `aria-valuetext` — four conversions at once, from a colour nobody typed.
     */
    name: "a swatch chosen",
    props: { label: "Brand", swatches, defaultValue: "#2563eb", defaultOpen: true },
    steps: [
      { do: "click", target: `${part("color-picker", "swatch-trigger")}[data-value="#22C55E"]` },
      {
        do: "wait",
        target: `${part("color-picker", "swatch")}[data-value="#22C55E"][data-state="checked"]`,
      },
    ],
    regions: ["#mount", surface],
    stylesheets: ["ColorPicker/ColorPicker.css"],
    allow: [SWATCH_STATE_SKEW],
    skip: VUE_SWATCH_GROUP_ROLE,
  },
];

export default scenarios;
