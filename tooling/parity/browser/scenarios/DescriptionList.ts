import { staticScenarios, type BrowserScenario } from "./scenario.js";

const ITEMS = [
  { term: "Plan", details: "Pro" },
  { term: "Renews", details: "1 March 2027" },
];

/** Angular is compared here only; the SSR gate covers the other three. */
const scenarios: BrowserScenario[] = staticScenarios("DescriptionList", [
  { name: "items then composed", props: { items: ITEMS, composed: true } },
  {
    name: "sm, stacked, divided",
    props: { items: ITEMS, size: "sm", layout: "stacked", divided: true },
  },
]);

export default scenarios;
