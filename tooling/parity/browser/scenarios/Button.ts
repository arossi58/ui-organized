import { staticScenarios, type BrowserScenario } from "./scenario.js";

const scenarios: BrowserScenario[] = staticScenarios("Button", [
  { name: "default" },
  { name: "secondary/lg", props: { intent: "secondary", size: "lg" } },
  { name: "destructive/sm", props: { intent: "destructive", size: "sm" } },
  { name: "ghost", props: { intent: "ghost" } },
  { name: "disabled", props: { disabled: true } },
  { name: "submit", props: { type: "submit" } },
  { name: "custom class", props: { className: "mine" } },
  { name: "aria-label", props: { "aria-label": "Save" } },
  { name: "icon left", props: { icon: "check" } },
  { name: "icon right", props: { icon: "check", iconPosition: "right" } },
  // Icons scale with the control size, from the shared table.
  { name: "icon sized", props: { icon: "check", size: "sm" } },
  // `.btn--icon-only` squares the button so it lines up with a labelled one.
  // Every library decides it by asking whether it was given children at all.
  { name: "icon only", props: { icon: "check", iconOnly: true } },
]);

export default scenarios;
