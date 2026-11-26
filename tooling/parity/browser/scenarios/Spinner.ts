import { staticScenarios, type BrowserScenario } from "./scenario.js";

const scenarios: BrowserScenario[] = staticScenarios("Spinner", [
  { name: "default" },
  { name: "size/sm", props: { size: "sm" } },
  { name: "size/xl", props: { size: "xl" } },
  { name: "label", props: { label: "Loading results" } },
  { name: "decorative", props: { decorative: true } },
  { name: "custom class", props: { className: "mine" } },
]);

export default scenarios;
