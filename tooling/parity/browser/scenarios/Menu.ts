import { openViaTrigger, part, staticScenarios, type BrowserScenario } from "./scenario.js";

const scenarios: BrowserScenario[] = [
  // The trigger before anything has happened to it: no `aria-controls` (the
  // content it names is not mounted in three of the four), no placement.
  ...staticScenarios("Menu", [{ name: "closed" }]),
  {
    component: "Menu",
    name: "open",
    steps: openViaTrigger("menu"),
    regions: [part("menu", "positioner"), "#mount"],
  },
  {
    component: "Menu",
    name: "keyboard highlight",
    // `[data-highlighted]` drives the item's entire hover treatment and is
    // unreachable without a keypress.
    //
    // Neither the focus wait nor the result wait is decoration. The first is the
    // precondition the keypress needs — see `awaitFocus`. The second closes the
    // case where every library is simply slower than the capture: without it all
    // three highlighted nothing and the case passed by comparing two absences.
    steps: [
      ...openViaTrigger("menu"),
      { do: "awaitFocus", target: part("menu", "content") },
      { do: "press", key: "ArrowDown" },
      { do: "wait", target: `${part("menu", "item")}[data-highlighted]` },
    ],
    regions: [part("menu", "positioner")],
  },
  {
    component: "Menu",
    name: "item chosen",
    /**
     * Choosing closes the menu and hands focus back to the trigger, and both are
     * visible in `#mount` alone: `aria-expanded`, `data-state`, and whatever the
     * machine puts on a trigger that has just been returned to.
     */
    steps: [
      ...openViaTrigger("menu"),
      { do: "click", target: `${part("menu", "item")}[data-value="a"]` },
      { do: "wait", target: `${part("menu", "trigger")}[data-state="closed"]` },
    ],
    regions: ["#mount"],
  },
];

export default scenarios;
