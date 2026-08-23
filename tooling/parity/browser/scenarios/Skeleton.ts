import { staticScenarios, type BrowserScenario } from "./scenario.js";

const scenarios: BrowserScenario[] = staticScenarios("Skeleton", [
  { name: "default" },
  { name: "variant/circle", props: { variant: "circle" } },
  { name: "variant/rounded", props: { variant: "rounded" } },
  { name: "not animated", props: { animated: false } },
  { name: "sized", props: { width: 120, height: 16 } },
  // The shape only Angular renders through a second directive; see its fixture.
  { name: "multi-line", props: { lines: 3 } },
]);

export default scenarios;
