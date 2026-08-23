import { FRUIT, staticScenarios, type BrowserScenario } from "./scenario.js";

/**
 * Named for the component the library exports; the spec it drives is the SSR
 * gate's `RadioGroup`, which is what the four fixtures are keyed by.
 */
const scenarios: BrowserScenario[] = staticScenarios("RadioGroup", [
  { name: "default", props: { options: FRUIT } },
  // The group's heading is a sibling of the radiogroup, not a part of it, so
  // its id is wired to aria-labelledby by hand; without a heading the reference
  // is dropped rather than left dangling.
  { name: "with label", props: { options: FRUIT, label: "Fruit" } },
  { name: "no label, aria-label", props: { options: FRUIT, "aria-label": "Fruit" } },
  { name: "selected", props: { options: FRUIT, defaultValue: "b" } },
  { name: "horizontal", props: { options: FRUIT, orientation: "horizontal" } },
  { name: "group disabled", props: { options: FRUIT, disabled: true, label: "Fruit" } },
  { name: "named", props: { options: FRUIT, name: "fruit", label: "Fruit" } },
  {
    name: "option error",
    props: {
      options: [{ value: "a", label: "Apple", error: "Out of stock" }],
      label: "Fruit",
    },
  },
]);

export default scenarios;
