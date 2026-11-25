import { HIDDEN_SELECT_TEXT, staticScenarios, type BrowserScenario } from "./scenario.js";

/** See cases/Calendar.tsx: fixed bounds and absolute presets, so nothing reads the clock. */
const IN_2026 = { min: "2026-01-01", max: "2026-12-31" };
const PRESETS = [
  { label: "Spring break", value: { start: "2026-03-09", end: "2026-03-13" } },
  { label: "Launch day", value: "2026-03-20" },
  { label: "Next year", value: "2027-01-04" },
];

const scenarios: BrowserScenario[] = staticScenarios("Calendar", [
  { name: "single", props: { defaultValue: "2026-03-18", ...IN_2026 } },
  { name: "range", props: { mode: "range", defaultValue: { start: "2026-03-09", end: "2026-03-13" }, ...IN_2026 } },
  {
    name: "presets, card",
    props: { mode: "range", variant: "card", presets: PRESETS, defaultValue: { start: "2026-03-09", end: "2026-03-13" }, ...IN_2026 },
  },
  { name: "footer", props: { defaultValue: "2026-03-18", withFooter: true, ...IN_2026 } },
]).map((s) => ({ ...s, allowTextIn: [HIDDEN_SELECT_TEXT] }));

scenarios.push({
  // A preset sets the range, presses itself, and moves the view to its month.
  component: "Calendar",
  name: "picks a preset",
  props: { mode: "range", presets: PRESETS, defaultValue: { start: "", end: "" }, ...IN_2026 },
  steps: [
    { do: "click", target: ".calendar-panel__preset:nth-child(2)" },
    { do: "wait", target: '.calendar-panel__preset:nth-child(2)[aria-pressed="true"]' },
    { do: "wait", target: ".calendar__day[data-selected]" },
  ],
  regions: ["#mount"],
  allowTextIn: [HIDDEN_SELECT_TEXT],
});

export default scenarios;
