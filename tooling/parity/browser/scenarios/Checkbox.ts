import { part, staticScenarios, type BrowserScenario } from "./scenario.js";

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

/**
 * A checkbox that has actually been clicked.
 *
 * Every case above is static, so until this one nothing in the gate had ever
 * compared a checkbox *after* a pointer had touched it — which is where the
 * libraries turn out to disagree. Found by the data table's selection scenario,
 * and moved here because it is the Checkbox's behaviour rather than the table's.
 */
scenarios.push({
  component: "Checkbox",
  name: "checked by clicking its label",
  props: { label: "Accept" },
  steps: [
    { do: "click", target: "label.checkbox" },
    { do: "wait", target: `${part("checkbox", "root")}[data-state="checked"]` },
  ],
  regions: ["#mount"],
});

export default scenarios;
