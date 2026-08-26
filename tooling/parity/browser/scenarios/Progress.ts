import { staticScenarios, type BrowserScenario } from "./scenario.js";

/**
 * The determinate/indeterminate fork, in the browser, because Angular is
 * compared nowhere else.
 *
 * `Progress.css` selects on `[data-state="indeterminate"]` and on nothing else,
 * so the first case here is the one that matters: a port that treated a null
 * value as zero would render a bar of the right width with no animation, and
 * every other case in this list would still pass.
 */
const scenarios: BrowserScenario[] = staticScenarios("Progress", [
  { name: "indeterminate (default)" },
  { name: "at 40", props: { value: 40 } },
  { name: "custom max", props: { value: 3, max: 5 } },
  { name: "complete", props: { value: 100 } },
  { name: "with label", props: { value: 40, label: "Uploading" } },
  { name: "show value", props: { value: 40, showValue: true } },
  { name: "label and value", props: { value: 40, label: "Uploading", showValue: true } },
  // A ring puts the value inside itself rather than in the header — and still
  // renders the empty header, which is the part a port tidies away.
  { name: "circular", props: { value: 40, shape: "circular" } },
  { name: "circular with value", props: { value: 40, shape: "circular", showValue: true } },
  ...(["default", "success", "warning", "error"] as const).map((variant) => ({
    name: `variant/${variant}`,
    props: { value: 40, variant },
  })),
  ...(["sm", "md", "lg"] as const).map((size) => ({
    name: `size/${size}`,
    props: { value: 40, size },
  })),
]);

export default scenarios;
