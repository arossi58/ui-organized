import { part, FRUIT, staticScenarios, type BrowserScenario } from "./scenario.js";

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

/**
 * A radio item that has actually been touched.
 *
 * The same gap the Checkbox and Switch had, with one difference that mattered
 * to the fix: a group has N items, so hover and focus are tracked *per item*
 * rather than by the shared `UioInteractionState` host directive, which reports
 * one. The attributes and the reason are the same — `Radio.css` draws its focus
 * ring from `[data-focus-visible]`, and the element that takes the focus is the
 * visually-hidden input beside the one that shows it.
 */
scenarios.push(
  {
    // "RadioGroup", not "Radio" — see the note at the top of this file.
    component: "RadioGroup",
    name: "chosen by clicking an item",
    props: { options: FRUIT, label: "Fruit" },
    steps: [
      { do: "click", target: part("radio-group", "item") },
      { do: "wait", target: `${part("radio-group", "item")}[data-state="checked"]` },
    ],
    regions: ["#mount"],
  },
  {
    component: "RadioGroup",
    // Focus from the keyboard, which is the case the ring exists for — and the
    // one where only the *focused* item may carry the attributes.
    name: "focused from the keyboard",
    props: { options: FRUIT, label: "Fruit" },
    steps: [
      { do: "press", key: "Tab" },
      { do: "awaitFocus", target: "input[type='radio']" },
      // See the Switch scenario: `awaitFocus` resolves before a zoneless
      // Angular app has rendered the state it implies.
      { do: "wait", target: `${part("radio-group", "item-control")}[data-focus-visible]` },
    ],
    regions: ["#mount"],
  },
);

export default scenarios;
