import { staticScenarios, type BrowserScenario } from "./scenario.js";

const scenarios: BrowserScenario[] = staticScenarios("Toolbar", [
  { name: "default" },
  // `data-orientation` is what the stylesheet turns the flex direction on, so
  // this is the case that catches a vertical toolbar laid out horizontally with
  // perfectly correct ARIA.
  { name: "vertical", props: { orientation: "vertical" } },
]);

export default scenarios;
