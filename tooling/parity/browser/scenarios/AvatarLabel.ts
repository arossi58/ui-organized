import { staticScenarios, type BrowserScenario } from "./scenario.js";

const scenarios: BrowserScenario[] = staticScenarios("AvatarLabel", [
  { name: "name", props: { name: "Ada Lovelace" } },
  { name: "description", props: { name: "Ada Lovelace", description: "ada@example.com" } },
  { name: "size/xl", props: { name: "Ada Lovelace", description: "ada@example.com", size: "xl" } },
  { name: "status + verified", props: { name: "Ada Lovelace", status: "away", verified: true } },
]);

export default scenarios;
