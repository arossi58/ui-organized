import { openViaTrigger, part, type BrowserScenario } from "./scenario.js";

const scenarios: BrowserScenario[] = [
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
];

export default scenarios;
