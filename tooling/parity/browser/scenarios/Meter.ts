import { staticScenarios, type BrowserScenario } from "./scenario.js";

/**
 * Every library is handed the *same* props object, so a default belongs here
 * rather than in one library's fixture. One applied on React's side only is
 * invisible to the others, and the symptom is not "a default is missing" — it is
 * three libraries rendering `aria-valuetext="NaN"` against React's 60.
 */
const withValue = (props: Record<string, unknown> = {}) => ({ value: 60, ...props });

const scenarios: BrowserScenario[] = staticScenarios("Meter", [
  { name: "default", props: withValue() },
  { name: "with label", props: withValue({ label: "Disk usage" }) },
  { name: "with value", props: withValue({ showValue: true }) },
  { name: "with label and value", props: withValue({ label: "Disk usage", showValue: true }) },
  // The accessible name when there is no visible caption.
  { name: "aria-label", props: withValue({ "aria-label": "Disk usage" }) },
  // A caption wins over the caller's name rather than both being emitted — and
  // the caption is named by id, so this is also the case a dangling
  // `aria-labelledby` would fail.
  {
    name: "label wins over aria-label",
    props: withValue({ label: "Disk", "aria-label": "Disk usage" }),
  },
  { name: "formatted", props: { showValue: true, format: { style: "percent" }, value: 0.42 } },
  { name: "custom range", props: { value: 7, min: 2, max: 12, showValue: true } },
  // Out of range in both directions: the fill clamps, the ARIA value does not.
  { name: "above max", props: { value: 140 } },
  { name: "below min", props: { value: -20 } },
  // A zero-width range would divide by zero.
  { name: "empty range", props: { value: 5, min: 5, max: 5 } },
  ...(["default", "success", "warning", "error"] as const).map((variant) => ({
    name: `variant/${variant}`,
    props: withValue({ variant }),
  })),
  ...(["sm", "md", "lg"] as const).map((size) => ({
    name: `size/${size}`,
    props: withValue({ size }),
  })),
]);

export default scenarios;
