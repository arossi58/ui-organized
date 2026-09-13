import { staticScenarios, type BrowserScenario } from "./scenario.js";

/**
 * Chip is compared in the SSR gate too (`src/cases/Chip.tsx`), which covers
 * React, Svelte and Vue. These exist for the fourth library: Angular is compared
 * in the browser only, so without a scenario `UioChip` ships uncompared — and it
 * is the newest component in the set.
 *
 * The cases are the SSR ones that carry a structural decision rather than a
 * class name: which element the body is, whether the remove control is a
 * sibling, and that a drawn operator replaces a spelled one.
 */
const scenarios: BrowserScenario[] = staticScenarios("Chip", [
  { name: "default", props: { label: "Role" } },
  { name: "sentence", props: { label: "Role", detail: "is any of" } },
  { name: "variant/subtle", props: { variant: "subtle", label: "Role" } },
  { name: "size/sm", props: { size: "sm", label: "Role" } },
  // The state that decides which element the body is. A static token must not be
  // a button, or every chip in a list becomes an empty stop in the tab order.
  { name: "dropdown", props: { label: "Role", dropdown: true } },
  { name: "selected", props: { label: "Role", selected: true, dropdown: true } },
  { name: "incomplete", props: { label: "Role", incomplete: true, dropdown: true } },
  { name: "disabled", props: { label: "Role", disabled: true } },
  { name: "icon", props: { label: "Owner", icon: "user" } },
  // The dismiss control is a *sibling* of the body, never nested: a button
  // inside a button is invalid HTML and an axe `nested-interactive` violation.
  // Which is a claim about tree shape, so it is worth four libraries agreeing.
  {
    name: "removable",
    props: { label: "Role", removable: true, removeLabel: "Remove role filter" },
  },
  {
    name: "removable/dropdown",
    props: {
      label: "Role",
      dropdown: true,
      removable: true,
      removeLabel: "Remove role filter",
    },
  },
  // The glyphs are markup injected by four different mechanisms —
  // `dangerouslySetInnerHTML`, `{@html}`, `v-html`, and Angular parsing the
  // string into a node because its sanitizer strips SVG out of innerHTML.
  { name: "operator/equals", props: { label: "Name", operator: "equals", operatorLabel: "is" } },
  {
    name: "operator/contains",
    props: { label: "Name", operator: "contains", operatorLabel: "contains" },
  },
  // `detail` loses to `operator`: drawn or spelled, never both.
  {
    name: "operator/wins over detail",
    props: { label: "Name", operator: "contains", detail: "contains" },
  },
]);

export default scenarios;
