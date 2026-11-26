import { staticScenarios, type BrowserScenario } from "./scenario.js";

const MEMBERS = [{ name: "Ada Lovelace" }, { name: "Grace Hopper" }, { name: "Alan Turing" }, { name: "Katherine Johnson" }, { name: "Edsger Dijkstra" }];

const scenarios: BrowserScenario[] = staticScenarios("AvatarGroup", [
  { name: "all", props: { items: MEMBERS } },
  // max counts the +N: four slots is three avatars and +2.
  { name: "max", props: { items: MEMBERS, max: 4, label: "Project members" } },
  { name: "size/xs", props: { items: MEMBERS, max: 3, size: "xs" } },
  { name: "size/xl rounded", props: { items: MEMBERS, max: 3, size: "xl", shape: "rounded" } },
]);

export default scenarios;
