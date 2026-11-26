import { part, CLICKED, staticScenarios, type BrowserScenario } from "./scenario.js";

const PLANS = [
  { value: "starter", label: "Starter", description: "For one person getting started." },
  { value: "team", label: "Team", description: "Shared workspaces and roles.", icon: "check" },
  { value: "custom", label: "Custom", disabled: true },
];

const scenarios: BrowserScenario[] = staticScenarios("RadioCardGroup", [
  { name: "default", props: { options: PLANS, label: "Plan" } },
  { name: "selected", props: { options: PLANS, label: "Plan", defaultValue: "team" } },
  { name: "two columns, small", props: { options: PLANS, label: "Plan", columns: 2, size: "sm" } },
  { name: "indicator start", props: { options: PLANS, label: "Plan", indicator: "start" } },
  // The message describes the radiogroup; the cards take the error border.
  { name: "error", props: { options: PLANS, label: "Plan", error: "Choose a plan" } },
]);

scenarios.push(
  {
    // The whole card is the item's <label>, so a click anywhere on it selects.
    component: "RadioCardGroup",
    name: "chosen by clicking a card",
    props: { options: PLANS, label: "Plan" },
    steps: [
      { do: "click", target: part("radio-group", "item") },
      { do: "wait", target: `${part("radio-group", "item")}${CLICKED}` },
    ],
    regions: ["#mount"],
  },
  {
    component: "RadioCardGroup",
    name: "focused from the keyboard",
    props: { options: PLANS, label: "Plan" },
    steps: [
      { do: "press", key: "Tab" },
      { do: "awaitFocus", target: "input[type='radio']" },
      { do: "wait", target: `${part("radio-group", "item")}[data-focus-visible]` },
    ],
    regions: ["#mount"],
  },
);

export default scenarios;
