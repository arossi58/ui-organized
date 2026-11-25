import { staticScenarios, type BrowserScenario } from "./scenario.js";

const scenarios: BrowserScenario[] = staticScenarios("Tag", [
  { name: "default" },
  { name: "variant/error", props: { variant: "error" } },
  { name: "variant/info-secondary", props: { variant: "info-secondary" } },
  { name: "size/sm", props: { size: "sm" } },
  { name: "subdued", props: { emphasized: false } },
  { name: "icon left", props: { icon: "check" } },
  { name: "icon right", props: { icon: "check", iconPosition: "right" } },
  { name: "brand/subtle", props: { variant: "brand", appearance: "subtle" } },
  { name: "neutral/solid", props: { variant: "neutral" } },
  { name: "outline pill dot", props: { appearance: "outline", shape: "pill", dot: true } },
  // The remove button is a sibling of the label, named by `removeLabel`.
  { name: "removable", props: { removable: true, removeLabel: "Remove Label" } },
]);

export default scenarios;
