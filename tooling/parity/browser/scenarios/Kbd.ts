import { staticScenarios, type BrowserScenario } from "./scenario.js";

/**
 * Angular is compared here only; the SSR gate covers the other three. The
 * platform is pinned in every case: `auto` follows the machine the gate runs
 * on, so a Mac and a Linux runner would each be right and disagree.
 */
const scenarios: BrowserScenario[] = staticScenarios("Kbd", [
  { name: "shortcut, mac", props: { keys: ["mod", "k"], platform: "mac" } },
  { name: "shortcut, other", props: { keys: ["mod", "k"], platform: "other" } },
  { name: "symbols", props: { keys: ["shift", "enter"], platform: "mac" } },
  { name: "sm", props: { keys: ["esc"], size: "sm", platform: "other" } },
  { name: "written key", props: { text: "F5" } },
]);

export default scenarios;
