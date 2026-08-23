import { part, type BrowserScenario } from "./scenario.js";

/**
 * `data-overflow-x` / `data-overflow-y` are the point of these scenarios.
 *
 * Zag writes them onto the root and every scrollbar after *measuring* the
 * viewport, so they cannot exist in static markup at all — and they are what
 * ScrollArea.css reads to decide whether a scrollbar is drawn. A port that
 * mounted the machine but never let it measure would render a scroll area with
 * no scrollbar and pass the SSR gate unchanged.
 */
const OVERFLOWING = { style: { height: "80px", width: "120px" } };

const scenarios: BrowserScenario[] = [
  {
    component: "ScrollArea",
    name: "measured",
    props: OVERFLOWING,
    steps: [{ do: "wait", target: `${part("scroll-area", "root")}[data-overflow-y]` }],
    regions: ["#mount"],
  },
  {
    component: "ScrollArea",
    name: "measured on both axes",
    props: { ...OVERFLOWING, orientation: "both" },
    steps: [{ do: "wait", target: `${part("scroll-area", "root")}[data-overflow-y]` }],
    regions: ["#mount"],
  },
];

export default scenarios;
