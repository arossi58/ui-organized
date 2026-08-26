import { staticScenarios, type BrowserScenario } from "./scenario.js";

const scenarios: BrowserScenario[] = staticScenarios("Tag", [
  { name: "default" },
  { name: "variant/error", props: { variant: "error" } },
  { name: "variant/info-secondary", props: { variant: "info-secondary" } },
  { name: "size/sm", props: { size: "sm" } },
  { name: "subdued", props: { emphasized: false } },
  { name: "icon left", props: { icon: "check" } },
  { name: "icon right", props: { icon: "check", iconPosition: "right" } },
]);

export default scenarios;
