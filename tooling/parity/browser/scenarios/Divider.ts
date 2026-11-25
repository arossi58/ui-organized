import { staticScenarios, type BrowserScenario } from "./scenario.js";

const scenarios: BrowserScenario[] = staticScenarios("Divider", [
  { name: "default" },
  { name: "vertical", props: { orientation: "vertical" } },
  { name: "spacing/lg", props: { spacing: "lg" } },
  // `label` stands for the children; see cases/Divider.tsx.
  { name: "labelled", props: { label: "or" } },
  { name: "labelled/start", props: { label: "Today", labelPosition: "start" } },
]);

export default scenarios;
