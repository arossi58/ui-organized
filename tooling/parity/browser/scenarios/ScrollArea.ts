import { part, type BrowserScenario } from "./scenario.js";

/**
 * `data-overflow-x` / `data-overflow-y` are the point of these scenarios.
 *
 * Zag writes them onto the root and every scrollbar after *measuring* the
 * viewport, so they cannot exist in static markup at all — and they are what
 * ScrollArea.css reads to decide whether a scrollbar is drawn. A port that
 * mounted the machine but never let it measure would render a scroll area with
 * no scrollbar and pass the SSR gate unchanged.
 *
 * Every case is therefore bounded and waits for the measurement, including the
 * ones whose real subject is which scrollbars an orientation asks for: an
 * unbounded case would be a race between the harness's ready signal and the
 * first resize observation, and it would be a race in one library at a time.
 */
const OVERFLOWING = { style: { height: "80px", width: "120px" } };
const measured: BrowserScenario["steps"] = [
  { do: "wait", target: `${part("scroll-area", "root")}[data-overflow-y]` },
];

const scenarios: BrowserScenario[] = [
  {
    component: "ScrollArea",
    name: "measured",
    props: OVERFLOWING,
    steps: measured,
    regions: ["#mount"],
  },
  {
    component: "ScrollArea",
    name: "measured horizontal",
    props: { ...OVERFLOWING, orientation: "horizontal" },
    steps: measured,
    regions: ["#mount"],
  },
  {
    component: "ScrollArea",
    name: "measured on both axes",
    props: { ...OVERFLOWING, orientation: "both" },
    steps: measured,
    regions: ["#mount"],
  },
];

export default scenarios;
