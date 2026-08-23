import { part, type BrowserScenario } from "./scenario.js";

/**
 * Opened through `defaultOpen` rather than by right-clicking the trigger.
 *
 * A `Step` is a click, a hover, a keypress or a wait — there is no right-click,
 * and adding one would mean editing the shared step vocabulary for a single
 * component. `defaultOpen` reaches the same machine state through the same
 * public prop in both libraries, which is what this gate is comparing; the
 * cursor anchoring it skips is a zag behaviour neither port implements.
 */
const scenarios: BrowserScenario[] = [
  {
    component: "ContextMenu",
    name: "open",
    props: { defaultOpen: true },
    steps: [{ do: "wait", target: `${part("menu", "content")}[data-state="open"]` }],
    regions: [part("menu", "positioner"), "#mount"],
  },
  {
    component: "ContextMenu",
    name: "keyboard highlight",
    props: { defaultOpen: true },
    // `[data-highlighted]` drives the item's entire hover treatment and is
    // unreachable without a keypress. Focus is waited on first because the
    // frameworks move it into the content on different ticks — see `awaitFocus`.
    steps: [
      { do: "wait", target: `${part("menu", "content")}[data-state="open"]` },
      { do: "awaitFocus", target: part("menu", "content") },
      { do: "press", key: "ArrowDown" },
      { do: "wait", target: `${part("menu", "item")}[data-highlighted]` },
    ],
    regions: [part("menu", "positioner")],
  },
];

export default scenarios;
