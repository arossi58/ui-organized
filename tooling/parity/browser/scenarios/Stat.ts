import { staticScenarios, type BrowserScenario } from "./scenario.js";

const DELTA = { label: "Revenue", value: "$48,260", delta: "+12.4%", description: "vs last month" };

/** Angular is compared here only; the SSR gate covers the other three. */
const scenarios: BrowserScenario[] = staticScenarios("Stat", [
  { name: "up, with chart", props: { ...DELTA, trend: "up", chart: true } },
  { name: "down, sm", props: { ...DELTA, delta: "-3.1%", trend: "down", size: "sm" } },
  {
    name: "plain lg, up but negative",
    props: {
      ...DELTA,
      trend: "up",
      sentiment: "negative",
      trendLabel: "Up",
      variant: "plain",
      size: "lg",
    },
  },
  { name: "delta without trend", props: { label: "Seats", value: "12", delta: "+4" } },
]);

export default scenarios;
