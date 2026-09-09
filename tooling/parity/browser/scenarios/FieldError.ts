import { staticScenarios, type BrowserScenario } from "./scenario.js";

const scenarios: BrowserScenario[] = staticScenarios("FieldError", [
  { name: "with message", props: { message: "Required" } },
  // Renders nothing at all — not an empty pill, which carries layout and a
  // background colour.
  { name: "empty renders nothing", props: { message: "" } },
]);

export default scenarios;
