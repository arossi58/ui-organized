import { staticScenarios, type BrowserScenario } from "./scenario.js";

const scenarios: BrowserScenario[] = staticScenarios("TagGroup", [
  { name: "default", props: { tag: "New" } },
  { name: "variant/success", props: { tag: "New", variant: "success" } },
  { name: "neutral/lg", props: { tag: "New", variant: "neutral", size: "lg" } },
  { name: "trailing", props: { tag: "New", tagPosition: "trailing" } },
  // As a link the whole pill is the anchor, with a trailing chevron.
  { name: "href", props: { tag: "New", href: "/changelog" } },
  { name: "custom class", props: { tag: "New", className: "mine" } },
]);

export default scenarios;
