import { FRUIT, part, type BrowserScenario } from "./scenario.js";

const scenarios: BrowserScenario[] = [
  {
    component: "Combobox",
    name: "open",
    props: { options: FRUIT, label: "Fruit" },
    steps: [
      { do: "click", target: part("combobox", "trigger") },
      { do: "wait", target: `${part("combobox", "content")}[data-state="open"]` },
    ],
    regions: [part("combobox", "positioner"), "#mount"],
  },
];

export default scenarios;
