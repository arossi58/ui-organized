import {
  FRUIT,
  HIDDEN_SELECT_TEXT,
  openViaTrigger,
  part,
  type BrowserScenario,
} from "./scenario.js";

const scenarios: BrowserScenario[] = [
  {
    component: "SelectInDialog",
    name: "both open",
    props: { options: FRUIT },
    steps: [
      ...openViaTrigger("dialog"),
      { do: "click", target: part("select", "trigger") },
      { do: "wait", target: `${part("select", "content")}[data-state="open"]` },
    ],
    regions: [part("select", "positioner"), part("dialog", "positioner")],
    allowTextIn: [HIDDEN_SELECT_TEXT],
  },
];

export default scenarios;
