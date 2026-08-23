import { FRUIT, part, type BrowserScenario } from "./scenario.js";

/**
 * Nothing here is portalled, so the SSR gate already compares the whole
 * component. What it cannot see is selection and highlight — `aria-selected`,
 * `data-state="checked"` and `data-highlighted` exist only after something has
 * been clicked or typed, and they are what the stylesheet actually reads.
 */
const scenarios: BrowserScenario[] = [
  {
    component: "Listbox",
    name: "option selected",
    props: { options: FRUIT, label: "Fruit" },
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
