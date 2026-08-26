import { openViaTrigger, part, staticScenarios, type BrowserScenario } from "./scenario.js";

/**
 * Two real menus in the bar, because the part worth pinning is what the bar does
 * *to* them: a `role="menubar"` may only contain menuitems, so each trigger has
 * to stop being a button and start being one, and carry the marker the bar finds
 * it by. No library can pass that down — the menus are independent machines — so
 * each has its own way of announcing the bar, and these cases are what prove it
 * arrived.
 *
 * The roving tabindex is deliberately not asserted here. `tabindex` is not part
 * of the DOM contract this gate compares (see `isContractAttribute`), and it is
 * written imperatively in all four libraries; Angular's is covered by
 * `menubar.spec.ts`, which can watch focus actually move.
 */
const scenarios: BrowserScenario[] = [
  ...staticScenarios("Menubar", [
    { name: "default" },
    // `data-orientation` is what the stylesheet turns the flex direction on, and
    // it is also what swaps which arrow keys move between the triggers.
    { name: "vertical", props: { orientation: "vertical" } },
  ]),
  {
    component: "Menubar",
    name: "first menu open",
    /**
     * The state the bar exists for: one trigger reporting `data-state="open"`
     * while it is still a menuitem, and its own popup — not the other menu's —
     * unhidden. Nothing static can see either.
     */
    steps: openViaTrigger("menu"),
    regions: [part("menu", "positioner"), "#mount"],
  },
];

export default scenarios;
