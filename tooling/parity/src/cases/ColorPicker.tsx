import type { ComponentType } from "react";
import { ColorPicker as RColorPicker } from "@ui-organized/react";
import ColorPickerFixture from "../fixtures/ColorPickerFixture.svelte";
import VueColorPickerFixture from "../fixtures/vue/ColorPickerFixture.vue";
import { SIZES, type ParitySpec } from "./spec.js";

/**
 * Everything below the trigger is portalled, and the trigger is the half worth
 * comparing statically.
 *
 * The picker surface — area, channel sliders, eyedropper, swatch group — lives
 * inside `ColorPicker.Positioner`, and the three renderers disagree about what
 * a portal does under SSR: Ark React emits it inline, Ark Svelte emits nothing,
 * Vue's Teleport leaves a pair of comments. See `ParitySpec.select` in spec.ts.
 *
 * `exclude` rather than `select`, because the parts that *are* comparable are
 * not one subtree: the label, the control, the helper text, the error and the
 * hidden input are siblings of the positioner under the root. Excluding is also
 * the stricter of the two — a port that leaked an element outside the portal
 * would be compared rather than selected away.
 *
 * What that costs, and what the Playwright harness has to carry instead:
 * `swatches` and `showEyeDropper` only ever change portalled markup, so no case
 * here can tell a working swatch group from a missing one.
 */
const spec: ParitySpec = {
  component: "ColorPicker",
  react: (p) => <RColorPicker {...(p as any)} />,
  svelte: ColorPickerFixture as unknown as ComponentType<any>,
  vue: VueColorPickerFixture as unknown as ComponentType<any>,
  exclude: '[data-scope="color-picker"][data-part="positioner"]',
  cases: [
    // No props at all: the three libraries each fill in their own defaults for
    // `defaultValue`, `showEyeDropper` and `size`, so this is the case that
    // pins them to the same three answers rather than to whatever each port
    // happened to write down.
    { name: "default" },
    { name: "with label", props: { label: "Brand" } },
    { name: "required", props: { label: "Brand", required: true } },
    { name: "helper text", props: { label: "Brand", helperText: "Any CSS colour" } },
    { name: "error message", props: { label: "Brand", error: "Pick a colour" } },
    { name: "invalid without message", props: { label: "Brand", error: true } },
    { name: "helper hidden by error", props: { label: "B", helperText: "H", error: "Bad" } },
    // The trigger's aria-label, the value swatch's data-value and the value
    // text all restate the colour, so a boundary that parsed it wrong shows up
    // in three places at once.
    { name: "default value", props: { defaultValue: "#2563eb" } },
    { name: "controlled value", props: { value: "#16a34a" } },
    { name: "value in rgb notation", props: { value: "rgb(37, 99, 235)" } },
    // Format reaches the *outside* of the popup: `ValueText` prints the colour
    // in whichever notation the machine is in.
    ...(["rgba", "hsla", "hsba"] as const).map((format) => ({
      name: `format/${format}`,
      props: { format, defaultValue: "#2563eb" },
    })),
    // `swatch-only` is the one variant that changes the element list rather
    // than a class: it drops the ValueText part entirely.
    ...(["default", "swatch-only"] as const).map((variant) => ({
      name: `variant/${variant}`,
      props: { variant, label: "Brand" },
    })),
    ...SIZES.map((size) => ({ name: `size/${size}`, props: { size, label: "Brand" } })),
    { name: "disabled", props: { label: "Brand", disabled: true } },
    { name: "read only", props: { label: "Brand", readOnly: true } },
    { name: "named", props: { name: "brand", label: "Brand" } },
    // Open state reaches the trigger's aria-expanded, which is why these are
    // worth cases even though the surface they open is portalled away. Note
    // that it is aria-expanded and not data-state doing the work here — the
    // allowance below blinds the latter.
    { name: "default open", props: { defaultOpen: true, label: "Brand" } },
    { name: "controlled open", props: { open: true, label: "Brand" } },
    { name: "controlled closed", props: { open: false, label: "Brand" } },
    { name: "custom class", props: { className: "mine" } },
  ],
  stylesheets: ["ColorPicker/ColorPicker.css"],
  allow: [
    {
      attribute: "data-state",
      reason:
        "The three Ark wrappers hand `getSwatchProps` different things for the " +
        "value swatch: @ark-ui/react and @ark-ui/svelte pass " +
        "`colorPicker.valueAsString`, @ark-ui/vue passes `colorPicker.value`, " +
        "the parsed Color. zag re-parses a string before comparing with " +
        "`isEqual`, so whenever the colour's printed form in the current format " +
        "rounds — `#2563eb` as hsla is `hsla(221.21, 83.19%, 53.33%, 1)` — the " +
        "round trip loses precision, and React and Svelte report `unchecked` on " +
        "the swatch that is by definition the value while Vue reports " +
        "`checked`. Not version drift: the 1.41.2 and 1.43.3 " +
        "@zag-js/color-picker dists differ only by an isComposingEvent guard " +
        "and an ElementIds type, and Svelte sides with React while running the " +
        "newer one. Nothing in this package can fix it — Ark Vue's ValueSwatch " +
        "takes no value prop. What the allowance costs is data-state on the " +
        "control and the trigger, and those come out of the same zag " +
        "getControlProps / getTriggerProps calls as aria-expanded and " +
        "aria-haspopup, which are still compared — no port can emit one without " +
        "the other, so the open-state cases still bite. The assertion below " +
        "fails the moment ColorPicker.css starts selecting on data-state.",
    },
  ],
};

export default spec;
