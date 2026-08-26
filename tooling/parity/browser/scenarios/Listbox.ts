import { FRUIT, part, staticScenarios, type BrowserScenario } from "./scenario.js";

const GROUPED = [
  { value: "a", label: "Apple", group: "Fruit" },
  { value: "b", label: "Banana", group: "Fruit" },
  { value: "n", label: "Almond" },
  { value: "c", label: "Cashew", group: "Nut" },
];

/**
 * Nothing here is portalled, so the SSR gate already compares the whole
 * component for the other three — these repeat it in the browser because that
 * is the only place Angular is compared at all.
 *
 * What the static cases *cannot* see is selection and highlight: `aria-selected`,
 * `data-state="checked"` and `data-highlighted` exist only after something has
 * been clicked or typed, and they are what the stylesheet actually reads. Those
 * are the two scenarios at the bottom.
 */
const scenarios: BrowserScenario[] = [
  ...staticScenarios("Listbox", [
    { name: "default", props: { options: FRUIT } },
    { name: "with label", props: { options: FRUIT, label: "Fruit" } },
    { name: "selected", props: { options: FRUIT, defaultValue: ["b"] } },
    // Controlled, which is the one place the libraries spell the prop
    // differently — `value` in React and Svelte, `modelValue` in Vue.
    { name: "controlled", props: { options: FRUIT, value: ["a"] } },
    { name: "multiple", props: { options: FRUIT, selectionMode: "multiple" } },
    { name: "extended", props: { options: FRUIT, selectionMode: "extended" } },
    { name: "disabled", props: { options: FRUIT, disabled: true } },
    { name: "bordered", props: { options: FRUIT, variant: "bordered" } },
    // A partially grouped list: the ungrouped bucket must stay unwrapped, or a
    // screen reader is told about a group with no name.
    { name: "grouped", props: { options: GROUPED } },
    // Empty renders Ark's Empty part and nothing else.
    { name: "empty", props: { options: [] } },
    { name: "empty message", props: { options: [], emptyMessage: "Nothing here" } },
    ...(["sm", "md", "lg"] as const).map((size) => ({
      name: `size/${size}`,
      props: { options: FRUIT, size },
    })),
  ]),
  {
    component: "Listbox",
    name: "option selected",
    props: { options: FRUIT, label: "Fruit" },
    /**
     * A *clicked* option, which is deliberately not the same as a highlighted
     * one. Ark names it with `aria-activedescendant` and leaves
     * `[data-highlighted]` off, because the modality was pointer — so this case
     * pins the absence as much as the presence.
     */
    steps: [
      { do: "click", target: part("listbox", "item") },
      { do: "wait", target: `${part("listbox", "item")}[data-state="checked"]` },
    ],
    regions: ["#mount"],
  },
  {
    component: "Listbox",
    name: "keyboard highlight",
    props: { options: FRUIT, label: "Fruit" },
    // See the Menu scenario for why focus and the result are both waited on:
    // without the first the keypress lands on document.body, and without the
    // second the case can pass by comparing two absences.
    steps: [
      { do: "click", target: part("listbox", "item") },
      { do: "awaitFocus", target: part("listbox", "content") },
      { do: "press", key: "ArrowDown" },
      { do: "wait", target: `${part("listbox", "item")}[data-highlighted]` },
    ],
    regions: ["#mount"],
  },
];

export default scenarios;
