import { staticScenarios, type BrowserScenario } from "./scenario.js";

const scenarios: BrowserScenario[] = staticScenarios("Card", [
  { name: "default" },
  { name: "elevated", props: { variant: "elevated" } },
  { name: "padding/none", props: { padding: "none" } },
  { name: "padding/lg", props: { padding: "lg" } },
]);

export default scenarios;
