import { part, type BrowserScenario } from "./scenario.js";

const scenarios: BrowserScenario[] = [
  {
    component: "Tooltip",
    name: "shown on hover",
    props: { content: "Copy" },
    steps: [
      { do: "hover", target: part("tooltip", "trigger") },
      { do: "wait", target: `${part("tooltip", "content")}[data-state="open"]` },
    ],
    regions: [part("tooltip", "positioner"), "#mount"],
  },
];

export default scenarios;
