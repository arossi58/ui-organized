import { ARK_ERROR_TEXT_SKEW, staticScenarios, type BrowserScenario } from "./scenario.js";

const scenarios: BrowserScenario[] = staticScenarios("TextArea", [
  { name: "default" },
  { name: "with label", props: { label: "Bio" } },
  { name: "required", props: { label: "Bio", required: true } },
  { name: "helper text", props: { label: "Bio", helperText: "Characters 0/500" } },
  {
    name: "error message",
    props: { label: "Bio", error: "Too long" },
    skip: ARK_ERROR_TEXT_SKEW,
  },
  // data-resize is what the stylesheet turns into a `resize` rule, so all four
  // have to spell it the same way.
  ...(["none", "vertical", "horizontal", "both"] as const).map((resize) => ({
    name: `resize/${resize}`,
    props: { resize },
  })),
  ...(["sm", "md", "lg"] as const).map((size) => ({ name: `size/${size}`, props: { size } })),
  { name: "rows", props: { rows: 6 } },
]);

export default scenarios;
