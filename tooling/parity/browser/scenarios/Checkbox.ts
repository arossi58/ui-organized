import { staticScenarios, type BrowserScenario } from "./scenario.js";

const scenarios: BrowserScenario[] = staticScenarios("Checkbox", [
  { name: "default" },
  { name: "with label", props: { label: "Accept" } },
  // Same dangling-aria-labelledby case OMIT_ARIA guards on Switch.
  { name: "no label, aria-label", props: { "aria-label": "Accept" } },
  { name: "checked", props: { defaultChecked: true, label: "Accept" } },
  // Ark folds indeterminate into the checked value; the facade keeps it a
  // separate boolean, and the indicator swaps to a dash.
  { name: "indeterminate", props: { indeterminate: true, label: "Accept" } },
  { name: "disabled", props: { disabled: true, label: "Accept" } },
  { name: "required", props: { required: true, label: "Accept" } },
  { name: "named", props: { name: "accept", label: "Accept" } },
]);

export default scenarios;
