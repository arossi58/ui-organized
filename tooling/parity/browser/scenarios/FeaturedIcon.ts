import { staticScenarios, type BrowserScenario } from "./scenario.js";

const scenarios: BrowserScenario[] = staticScenarios("FeaturedIcon", [
  { name: "default", props: { icon: "check" } },
  { name: "neutral/solid", props: { icon: "check", variant: "neutral", appearance: "solid" } },
  { name: "brand/solid", props: { icon: "check", variant: "brand", appearance: "solid" } },
  { name: "error/outline/lg", props: { icon: "check", variant: "error", appearance: "outline", size: "lg" } },
  { name: "square/xl", props: { icon: "check", shape: "square", size: "xl" } },
  // role="img" with the label; the glyph inside stays hidden.
  { name: "labelled", props: { icon: "check", label: "Verified" } },
  { name: "custom class", props: { icon: "check", className: "mine" } },
]);

export default scenarios;
