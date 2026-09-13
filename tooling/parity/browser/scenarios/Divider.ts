import { staticScenarios, type BrowserScenario } from "./scenario.js";

const scenarios: BrowserScenario[] = staticScenarios("Divider", [
  { name: "default" },
  { name: "vertical", props: { orientation: "vertical" } },
  { name: "spacing/lg", props: { spacing: "lg" } },
]);

export default scenarios;
