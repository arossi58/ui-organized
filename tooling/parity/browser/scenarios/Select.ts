import {
  FRUIT,
  HIDDEN_SELECT_TEXT,
  openViaTrigger,
  part,
  type BrowserScenario,
} from "./scenario.js";

const scenarios: BrowserScenario[] = [
  {
    component: "Select",
    name: "open",
    props: { options: FRUIT, label: "Fruit" },
    steps: openViaTrigger("select"),
    regions: [part("select", "positioner"), "#mount"],
    allowTextIn: [HIDDEN_SELECT_TEXT],
  },
  {
    component: "Select",
    name: "keyboard highlight",
    props: { options: FRUIT, label: "Fruit" },
    // See the Menu scenario for why focus and the result are both waited on.
    steps: [
      ...openViaTrigger("select"),
      { do: "awaitFocus", target: part("select", "content") },
      { do: "press", key: "ArrowDown" },
      { do: "wait", target: `${part("select", "item")}[data-highlighted]` },
    ],
    regions: [part("select", "positioner")],
  },
];

export default scenarios;
