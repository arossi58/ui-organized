import { part, type BrowserScenario } from "./scenario.js";

/**
 * `openDelay: 0` in every scenario. Ark's default is 700ms of hover, which the
 * harness would spend waiting in all three pages for no assertion — and a delay
 * long enough to matter is a delay long enough to make the wait look like the
 * bug when something else breaks.
 */
const scenarios: BrowserScenario[] = [
  {
    component: "HoverCard",
    name: "shown on hover",
    props: { openDelay: 0 },
    steps: [
      { do: "hover", target: part("hover-card", "trigger") },
      { do: "wait", target: `${part("hover-card", "content")}[data-state="open"]` },
    ],
    regions: [part("hover-card", "positioner"), "#mount"],
  },
  {
    component: "HoverCard",
    name: "shown with side and offset",
    props: { openDelay: 0, contentProps: { side: "right", align: "start", sideOffset: 16 } },
    steps: [
      { do: "hover", target: part("hover-card", "trigger") },
      { do: "wait", target: `${part("hover-card", "content")}[data-state="open"]` },
    ],
    // The positioning bridge carries side/align from Content up to Root, and
    // each library implements it differently — React with a layout effect, Vue
    // with a watchEffect, Svelte with an accessor the Root reads lazily. Ark
    // reflects the resolved placement onto the content as `data-placement`, so
    // the three implementations are comparable rather than merely plausible.
    regions: [part("hover-card", "positioner")],
  },
];

export default scenarios;
