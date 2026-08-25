import { HIDDEN_SELECT_TEXT, openViaTrigger, part, type BrowserScenario } from "./scenario.js";

/**
 * The two-month range calendar, and the band nothing else in this suite draws.
 *
 * `Calendar` in range mode is where the hand-written grid earns its keep and
 * where a port has the most to get wrong. `lo`/`hi` are resolved from *either*
 * the committed range or the start-to-hover preview, so the same four attributes
 * — `data-selected`, `data-range-lo`, `data-range-hi`, `data-in-range` — are
 * written from two different sources, one of which exists only while a pointer
 * is moving. Static rendering cannot see either.
 *
 * See DateInput.ts for why the calendar went uncovered at all.
 */

// Angular has no date field components yet — see DateInput.ts.
const NO_ANGULAR = [
  { framework: "angular", reason: "Angular has no date field components yet." },
];

/**
 * Bounds within 2024, which do three things at once: pin the year list to one
 * entry, pin the view to March (the anchor is the start date), and leave both
 * nav buttons enabled so the paging case has somewhere to go.
 */
const IN_2024 = { min: "2024-01-01", max: "2024-12-31" };

/**
 * A day in the *first* visible month. The spec drives `locator(...).first()`,
 * and a two-month calendar renders the same row and column twice — so these
 * always name March, never April.
 *
 * Positional rather than by `aria-label`, which is locale-dependent. March 2024
 * opens on a Friday:
 *
 *   1 | Feb 25 26 27 28 29 | Mar  1  2
 *   2 | Mar  3  4  5  6  7  8  9
 *   3 | Mar 10 11 12 13 14 15 16
 *   4 | Mar 17 18 19 20 21 22 23
 *   5 | Mar 24 25 26 27 28 29 30
 *   6 | Mar 31 | Apr 1 2 3 4 5 6
 */
const day = (week: number, weekday: number) =>
  `.calendar__week:nth-child(${week}) .calendar__day:nth-child(${weekday})`;

const MAR_20 = day(4, 4);

const scenarios: BrowserScenario[] = [
  {
    component: "DateRangeInput",
    name: "calendar open with a committed range",
    props: {
      label: "Stay",
      defaultValue: { start: "2024-03-05", end: "2024-03-12" },
      ...IN_2024,
    },
    steps: openViaTrigger("popover"),
    /**
     * Two months side by side, two year Selects in the header, and the band:
     * the 5th `data-range-lo`, the 12th `data-range-hi`, the six days between
     * them `data-in-range`, and both ends also `data-selected`. The half-band
     * gradients on lo/hi are what make the band meet the endpoint circles, so a
     * port that dropped them would leave a visible seam and nothing else would
     * say so.
     */
    regions: [part("popover", "positioner"), "#mount"],
    // Both year Selects' hidden native controls — see DateInput.ts.
    allowTextIn: [HIDDEN_SELECT_TEXT],
    skip: NO_ANGULAR,
  },
  {
    component: "DateRangeInput",
    name: "hovering a later day previews the range",
    /**
     * Half filled: a start and no end is exactly the state in which the preview
     * exists at all. `Calendar` reads `end ?? hover`, so with an end committed
     * the pointer changes nothing — which is also why the case above and this
     * one cannot be collapsed into each other.
     */
    props: {
      label: "Stay",
      defaultValue: { start: "2024-03-05", end: "" },
      ...IN_2024,
    },
    steps: [
      ...openViaTrigger("popover"),
      { do: "hover", target: MAR_20 },
      // The preview is a render away from the pointer event; waiting on the
      // attribute rather than on nothing keeps this from racing the effect
      // queue in whichever library commits last.
      { do: "wait", target: ".calendar__day[data-in-range]" },
    ],
    /**
     * The whole popup, so the band is compared cell by cell: the 5th stays
     * `data-range-lo`, the hovered 20th becomes `data-range-hi` *and*
     * `data-selected` — because a hover endpoint is an endpoint — and the
     * fourteen days between them carry `data-in-range`.
     *
     * `#mount` is deliberately not compared here. A preview is a preview: the
     * field must not have changed, and the case below is where a *committed*
     * end is asserted to reach it.
     */
    regions: [part("popover", "positioner")],
    allowTextIn: [HIDDEN_SELECT_TEXT],
    skip: NO_ANGULAR,
  },
  {
    component: "DateRangeInput",
    name: "choosing the far end fills both inputs and closes the popup",
    props: {
      label: "Stay",
      defaultValue: { start: "2024-03-05", end: "" },
      ...IN_2024,
    },
    /**
     * Clicking a day after the start completes the range, which is the one path
     * that fires `onRangeComplete` — and the only reason the popup ever closes
     * on its own. A port that treated every click as a new start would keep it
     * open forever and leave the end input `data-empty`.
     */
    steps: [
      ...openViaTrigger("popover"),
      { do: "click", target: MAR_20 },
      { do: "wait", target: `${part("popover", "trigger")}[data-state="closed"]` },
    ],
    regions: ["#mount"],
    // `data-state="closed"` is not the same claim as gone — see `hidden`.
    hidden: [part("popover", "content")],
    skip: NO_ANGULAR,
  },
  {
    component: "DateRangeInput",
    name: "both months page together",
    props: {
      label: "Stay",
      defaultValue: { start: "2024-03-05", end: "2024-03-12" },
      ...IN_2024,
    },
    /**
     * One nav click moves the pair, not just the first pane: `numMonths` months
     * are derived from a single view month, so March/April becomes April/May.
     * The committed range then falls entirely outside the view, which is the
     * part a port that recomputed the band from screen position would get wrong.
     */
    steps: [
      ...openViaTrigger("popover"),
      { do: "click", target: '.calendar [aria-label="Next month"]' },
      { do: "wait", target: '.calendar__grid[aria-label="May 2024"]' },
    ],
    regions: [part("popover", "positioner")],
    allowTextIn: [HIDDEN_SELECT_TEXT],
    skip: NO_ANGULAR,
  },
  {
    component: "DateRangeInput",
    name: "the end field's button opens the same popup",
    props: { label: "Stay", defaultValue: { start: "2024-03-05", end: "" }, ...IN_2024 },
    /**
     * Only the *start* field's calendar button is an Ark popover trigger; the
     * end field's is a plain button that sets the open state by hand, because
     * one popover may have one trigger and the range shares a single calendar.
     * So this is the one control in the family whose behaviour is written three
     * times over rather than delegated, and the only thing that would report a
     * port having wired it to a second popover — or to nothing — is opening it.
     */
    steps: [
      { do: "click", target: '[aria-label="End date — choose date"]' },
      { do: "wait", target: `${part("popover", "content")}[data-state="open"]` },
    ],
    regions: [part("popover", "positioner"), "#mount"],
    allowTextIn: [HIDDEN_SELECT_TEXT],
    skip: NO_ANGULAR,
  },
];

export default scenarios;
