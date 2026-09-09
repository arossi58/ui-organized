import { SIZES } from "../../src/cases/spec.js";
import { part, staticScenarios, type BrowserScenario } from "./scenario.js";

/**
 * Two strokes, so the segment set is a set rather than a single element.
 *
 * `defaultPaths` is the only way to reach the drawn state without a pointer: the
 * machine seeds `paths` from it, so it is populated on the first render.
 *
 * ── What is deliberately not compared ───────────────────────────────────────
 *
 * The `d` attribute. Three of the four libraries take their stroke geometry from
 * `perfect-freehand` inside `@zag-js/signature-pad`; the Angular package may
 * take no dependency beyond the CDK and writes its own outline, so the ink is a
 * different shape drawn by a different algorithm. That is a rendering
 * difference, not a contract one, and it is invisible here for a reason rather
 * than by luck: `contract.ts` compares `id`, `role`, `type`, `disabled`,
 * `hidden`, `aria-*` and `data-*`, and `d` is none of them.
 *
 * What these cases *do* hold all four libraries to is everything around it — one
 * `segment-path` per stroke with its own `data-part`, the `<title>` that names
 * the drawing, the clear trigger appearing only once there is something to
 * clear, and the `aria-disabled="false"` the machine writes whether or not
 * anything is disabled.
 */
const PATHS = ["M 10 40 q 20 -30 40 0", "M 60 20 l 20 20"];

const scenarios: BrowserScenario[] = [
  ...staticScenarios("SignaturePad", [
    { name: "default" },
    { name: "with label", props: { label: "Signature" } },
    { name: "required", props: { label: "Signature", required: true } },
    { name: "helper text", props: { label: "Signature", helperText: "Sign above the line" } },
    { name: "error message", props: { label: "Signature", error: "Required" } },
    { name: "invalid without message", props: { label: "Signature", error: true } },
    { name: "helper hidden by error", props: { label: "A", helperText: "H", error: "Bad" } },
    ...SIZES.map((size) => ({ name: `size/${size}`, props: { size, label: "Signature" } })),
    ...(["default", "bordered"] as const).map((variant) => ({
      name: `variant/${variant}`,
      props: { variant },
    })),
    { name: "no guide", props: { showGuide: false } },
    { name: "no clear", props: { showClear: false } },
    { name: "clear label", props: { clearLabel: "Start over" } },
    { name: "disabled", props: { label: "Signature", disabled: true } },
    { name: "read only", props: { label: "Signature", readOnly: true } },
    { name: "named", props: { name: "signature", label: "Signature" } },
    // The drawn state. Both branches matter: the clear trigger is `hidden` while
    // there is nothing to clear and visible once there is, and each stroke gets
    // its own path element.
    { name: "default paths", props: { defaultPaths: PATHS } },
    { name: "default paths with label", props: { defaultPaths: PATHS, label: "Signature" } },
    { name: "controlled paths", props: { paths: PATHS } },
    { name: "controlled empty", props: { paths: [] } },
    { name: "extra class", props: { className: "custom" } },
  ]),
  {
    component: "SignaturePad",
    // The only interaction the component has that is not drawing: clearing takes
    // the strokes away, hides its own trigger, and empties the input a form
    // submits. A click, not a drag, so the geometry never enters into it.
    name: "cleared",
    props: { defaultPaths: PATHS, label: "Signature" },
    steps: [
      { do: "click", target: part("signature-pad", "clear-trigger") },
      { do: "wait", target: `${part("signature-pad", "clear-trigger")}[hidden]` },
    ],
    regions: ["#mount"],
  },
];

export default scenarios;
