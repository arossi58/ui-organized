import { staticScenarios, type BrowserScenario } from "./scenario.js";

const scenarios: BrowserScenario[] = staticScenarios("EmptyState", [
  { name: "default", props: { title: "No results" } },
  { name: "icon + description", props: { title: "No results", icon: "check", description: "Try a different filter." } },
  { name: "size/sm", props: { title: "No results", icon: "check", size: "sm" } },
  { name: "size/lg", props: { title: "No results", icon: "check", size: "lg" } },
  // A heading only when asked for: the default is a paragraph.
  { name: "heading level", props: { title: "No results", headingLevel: 2 } },
  { name: "actions", props: { title: "No results", withActions: true } },
  { name: "custom class", props: { title: "No results", className: "mine" } },
]);

export default scenarios;
