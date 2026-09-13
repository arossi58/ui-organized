import { openViaTrigger, part, type BrowserScenario } from "./scenario.js";

/**
 * The option parts of a menu — a named group, checkbox items, a radio group.
 *
 * Only reachable open, so there is no static case: everything worth comparing is
 * inside a surface that does not exist until the trigger is pressed.
 *
 * These are what a view-options or sort menu is built from, which is why the
 * data table's toolbar could not be ported to Angular before they existed.
 */
const scenarios: BrowserScenario[] = [
  {
    component: "MenuOptions",
    name: "open",
    steps: openViaTrigger("menu"),
    regions: [part("menu", "positioner")],
  },
  {
    component: "MenuOptions",
    name: "a checkbox item toggled",
    // The check is driven by the *item's* `data-state`, not by the control
    // inside it, in all four libraries — so this is the assertion that the
    // shared stylesheet's `[data-state="checked"] .checkbox__indicator` rule
    // has something to match.
    steps: [
      ...openViaTrigger("menu"),
      { do: "click", target: `${part("menu", "item")}[data-value="email"]` },
      { do: "wait", target: `${part("menu", "item")}[data-value="email"][data-state="checked"]` },
    ],
    // `#mount`, not the positioner. The `wait` above is the assertion — it runs
    // per framework, so a library that failed to mark the item checked times out
    // there rather than passing quietly. Comparing the surface afterwards would
    // instead compare a *closed* menu, and the three Ark packages disagree about
    // whether a closed content carries `hidden` (react 5.37 emits it, svelte
    // 5.24 and vue 5.39 do not). That is an upstream difference, and holding
    // this case hostage to it would say nothing about checkbox items.
    regions: ["#mount"],
  },
  {
    component: "MenuOptions",
    name: "a radio item chosen",
    steps: [
      ...openViaTrigger("menu"),
      { do: "click", target: `${part("menu", "item")}[data-value="desc"]` },
      { do: "wait", target: `${part("menu", "item")}[data-value="desc"][data-state="checked"]` },
    ],
    // Same reasoning as the checkbox case above.
    regions: ["#mount"],
  },
];

export default scenarios;
