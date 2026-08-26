import { staticScenarios, type BrowserScenario } from "./scenario.js";

const scenarios: BrowserScenario[] = staticScenarios("Switch", [
  { name: "default" },
  { name: "with label", props: { label: "Wifi" } },
  // The case OMIT_ARIA exists for in the other three: with no label part
  // there is nothing for aria-labelledby to name, and a dangling IDREF
  // outranks aria-label.
  { name: "no label, aria-label", props: { "aria-label": "Wifi" } },
  { name: "checked", props: { defaultChecked: true } },
  { name: "disabled", props: { disabled: true, label: "Wifi" } },
  { name: "required", props: { required: true, label: "Wifi" } },
  { name: "named", props: { name: "wifi", label: "Wifi" } },
]);

export default scenarios;
