import { HIDDEN_SELECT_TEXT, openViaTrigger, part, type BrowserScenario } from "./scenario.js";

/**
 * The same calendar as DateInput's, plus the footer only this field has.
 *
 * DateTimeInput and DateInput are two fourteen-line wrappers around the same
 * `DateFieldBase`, and the SSR gate already pins the one static difference
 * between them (`type`). What it cannot reach is the branch `isDateTime` opens
 * *inside the popup* — a time field and a Done button under the grid — nor the
 * behaviour that hangs off it: choosing a day here must leave the popup open, so
 * the time can still be set, where in DateInput it closes.
 *
 * See DateInput.ts for why the calendar went uncovered at all.
 */

/** Bounds keep the year list to three entries. See DateInput.ts. */
const YEARS = { min: "2023-01-01T00:00", max: "2025-12-31T23:59" };

/**
 * March 2024 opens on a Friday, so row 3 column 1 is the 10th. Positional
 * rather than by `aria-label`, which is locale-dependent — see DateInput.ts.
 */
const MAR_10 = ".calendar__week:nth-child(3) .calendar__day:nth-child(1)";

const scenarios: BrowserScenario[] = [
  {
    component: "DateTimeInput",
    name: "calendar and time footer open",
    props: { label: "Starts at", defaultValue: "2024-03-15T09:30", ...YEARS },
    steps: openViaTrigger("popover"),
    regions: [part("popover", "positioner"), "#mount"],
    // The year Select's hidden native control — see DateInput.ts.
    allowTextIn: [HIDDEN_SELECT_TEXT],
  },
  {
    component: "DateTimeInput",
    name: "choosing a day keeps the popup open",
    props: { label: "Starts at", defaultValue: "2024-03-15T09:30", ...YEARS },
    steps: [
      ...openViaTrigger("popover"),
      { do: "click", target: MAR_10 },
      { do: "wait", target: `${part("popover", "content")}[data-state="open"]` },
    ],
    /**
     * The popup, because the selection has to move to the 10th, and the field,
     * because the write-back goes through `setNativeInputValue` — a native
     * setter plus a dispatched event, since assigning `.value` on a React-,
     * Svelte- or Vue-controlled input is silently reverted. `data-empty` is the
     * attribute that says it landed.
     */
    regions: [part("popover", "positioner"), "#mount"],
    /**
     * `data-state` alone would not catch the failure this is here for. A popup
     * whose rule sets `display` stays painted with a perfectly correct closed
     * state on it, and the reverse — a port that closed on select, matching
     * DateInput instead of this — would leave `data-state="closed"` on an
     * element that is still attached. Only the browser can tell.
     */
    visibilityMatches: [part("popover", "content")],
    allowTextIn: [HIDDEN_SELECT_TEXT],
  },
  {
    component: "DateTimeInput",
    name: "Done closes the popup",
    props: { label: "Starts at", defaultValue: "2024-03-15T09:30", ...YEARS },
    // The only way out of this popup that is not a dismissal: the footer button
    // exists precisely because choosing a day no longer closes it.
    steps: [
      ...openViaTrigger("popover"),
      { do: "click", target: ".date-popover__done" },
      { do: "wait", target: `${part("popover", "trigger")}[data-state="closed"]` },
    ],
    regions: ["#mount"],
    hidden: [part("popover", "content")],
  },
];

export default scenarios;
