import { ARK_ERROR_TEXT_SKEW, staticScenarios, type BrowserScenario } from "./scenario.js";

/**
 * The composed field: a label, a control, helper text and an error, all reading
 * one state.
 *
 * Every case here is one the SSR gate already runs for the other three — the
 * duplication is what buys Angular a comparison at all, since it is compared in
 * the browser only.
 */
const scenarios: BrowserScenario[] = staticScenarios("Field", [
  { name: "default" },
  { name: "stacked", props: { layout: "stacked" } },
  { name: "inline", props: { layout: "inline" } },
  // Validity flows to every part through aria-describedby and [data-invalid],
  // which is the whole reason the parts go through a shared context rather than
  // being four unrelated tags.
  { name: "invalid", props: { invalid: true } },
  {
    name: "invalid with message",
    props: { invalid: true, errorMessage: "Required" },
    skip: ARK_ERROR_TEXT_SKEW,
  },
  { name: "error hidden when valid", props: { errorMessage: "Required" } },
  { name: "disabled", props: { disabled: true } },
  { name: "required", props: { required: true } },
  { name: "readOnly", props: { readOnly: true } },
]);

export default scenarios;
