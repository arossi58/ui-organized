import { staticScenarios, type BrowserScenario } from "./scenario.js";

/**
 * Chip is compared in the SSR gate too (`src/cases/Chip.tsx`), which covers
 * React, Svelte and Vue. These exist for the fourth library: Angular is compared
 * in the browser only, so without a scenario `UioChip` ships uncompared.
 *
 * The cases are the SSR ones that carry a structural decision rather than a
 * class name: which element each segment is, and that segments and the remove
 * control are siblings. `segmented` and `removable` are translated by every
 * fixture into handlers, which a props object cannot carry.
 */
const scenarios: BrowserScenario[] = staticScenarios("Chip", [
  { name: "default", props: { label: "Role" } },
  { name: "sentence", props: { label: "Name", operator: "is greater than", value: "30" } },
  // A static token must not be a button, or every chip in a list puts empty
  // stops in the tab order; a segment with something to do must be one.
  { name: "segmented", props: { segmented: true } },
  { name: "selected", props: { segmented: true, selected: true } },
  {
    name: "incomplete",
    props: { label: "Name", operator: "contains", value: "…", incomplete: true },
  },
  { name: "disabled", props: { label: "Role", value: "Admin", disabled: true } },
  // The dismiss control is a *sibling* of the segments, never nested: a button
  // inside a button is invalid HTML and an axe `nested-interactive` violation.
  {
    name: "removable",
    props: { label: "Role", value: "Admin", removable: true, removeLabel: "Remove role filter" },
  },
  {
    name: "removable/segmented",
    props: { segmented: true, removable: true, removeLabel: "Remove filter" },
  },
]);

export default scenarios;
