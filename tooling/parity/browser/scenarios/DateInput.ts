import { HIDDEN_SELECT_TEXT, openViaTrigger, part, type BrowserScenario } from "./scenario.js";

/**
 * The calendar, which nothing has ever compared.
 *
 * `Calendar` is the one substantial component in the library that is written by
 * hand in all three frameworks rather than delegated to Ark — 318 lines of React
 * against 333 of Svelte and 341 of Vue, all of it a grid, a range band, month
 * paging and a year `Select`. It has no parity case of its own because it has no
 * public DOM contract of its own: it reaches a user only through DateInput,
 * DateTimeInput and DateRangeInput.
 *
 * That is exactly how it went uncovered. The SSR gate excludes the positioner
 * from all three date fields — a portal says nothing true on the server — and it
 * has no way to *open* a popover anyway, so it compares the field and stops at
 * the popup's edge. And the browser gate, which can open one, had no date
 * scenarios at all. Two halves, two different blind spots, neither of them
 * looking wrong.
 *
 * So everything below opens the popup first. What is asserted afterwards is the
 * calendar: six week rows of seven cells, the weekday header, the adjacent
 * months' days, and the `data-selected` / `data-today` / `data-in-range` state
 * the shared stylesheet actually paints with.
 */

/**
 * Angular has no DateInput, DateTimeInput, DateRangeInput or DatePicker yet, so
 * there is nothing to compare rather than something failing.
 *
 * `comparedIn()` already leaves Angular out — the component is not in
 * `ANGULAR_COMPONENTS` — so this entry changes no behaviour. It is here to say
 * which of the two reasons applies: the port does not exist, as opposed to the
 * port existing and being excused.
 */
const NO_ANGULAR = [
  { framework: "angular", reason: "Angular has no date field components yet." },
];

/**
 * A year window wide enough to page through and narrow enough to read.
 *
 * The year `Select` in the calendar header defaults to a 111-year list when no
 * bounds are given (`today - 100` to `today + 10`). Every one of those is an
 * `<option>` in the hidden native control *and* an item in the popup, so an
 * unbounded case would compare some 700 elements per capture and print all of
 * them on the first mismatch. Bounding the field bounds the list to three.
 */
const YEARS = { min: "2023-01-01", max: "2025-12-31" };

/**
 * The current calendar year, so that "today" is on screen.
 *
 * `data-today` and `aria-current="date"` only appear on a day the view actually
 * contains, and the view opens on the selected day — so the only way to see them
 * is a field with no value, whose view therefore opens on today. Bounding to
 * this year keeps the year list at one entry without moving the view off it.
 */
const THIS_YEAR = (() => {
  const year = new Date().getFullYear();
  return { min: `${year}-01-01`, max: `${year}-12-31` };
})();

/**
 * A day cell by its place in the first visible month's grid.
 *
 * Positional rather than by `aria-label`, which is
 * `toLocaleDateString(undefined, …)` and so reads "Friday, March 15, 2024" only
 * on a machine whose ICU default is en-US. The grid is always six whole weeks
 * from `monthGrid`, so a row and a column name the same day on every machine —
 * provided the *month* is pinned, which is what every `min`/`max` below is for.
 */
const day = (week: number, weekday: number) =>
  `.calendar__week:nth-child(${week}) .calendar__day:nth-child(${weekday})`;

const scenarios: BrowserScenario[] = [
  {
    component: "DateInput",
    name: "calendar open",
    // No value, so the view opens on today and one cell carries `data-today`.
    props: { label: "Start date", ...THIS_YEAR },
    steps: openViaTrigger("popover"),
    /**
     * The popup and the field both, because opening changes both: the trigger
     * gains `aria-expanded` and the `aria-controls` that `popupControls` drops
     * while the content is unmounted.
     *
     * Not `exclude`-ing anything, unlike the Combobox chrome cases. The reason
     * that exclusion exists — a closed popup that one library renders and
     * another does not, renumbering every id after it — does not arise once the
     * popup is open, and the year `Select`'s own popup is mounted in all three
     * even while closed. Everything present in one capture is present in all.
     */
    regions: [part("popover", "positioner"), "#mount"],
    // The year Select's hidden native control, whose option text Ark Vue
    // stringifies as "2026 > ". Same allowance the Select scenarios carry.
    allowTextIn: [HIDDEN_SELECT_TEXT],
    skip: NO_ANGULAR,
  },
  {
    component: "DateInput",
    name: "calendar with a selected day",
    props: { label: "Start date", defaultValue: "2024-03-15", ...YEARS },
    steps: openViaTrigger("popover"),
    // `data-selected` and `aria-selected` on one cell, and — because March 2024
    // is not this month — `data-today` on none, which is the half of the claim
    // that would still pass if the attribute were written unconditionally.
    regions: [part("popover", "positioner"), "#mount"],
    allowTextIn: [HIDDEN_SELECT_TEXT],
    skip: NO_ANGULAR,
  },
  {
    component: "DateInput",
    name: "calendar bounded inside the month",
    /**
     * Bounds that fall *within* the visible month, which is the only way to see
     * three things at once: `disabled` on the days outside them, and both
     * `calendar__nav` buttons disabled because the month containing `min` and
     * the month containing `max` are the month on screen.
     */
    props: { label: "Start date", defaultValue: "2024-03-15", min: "2024-03-10", max: "2024-03-20" },
    steps: openViaTrigger("popover"),
    regions: [part("popover", "positioner")],
    allowTextIn: [HIDDEN_SELECT_TEXT],
    skip: NO_ANGULAR,
  },
  {
    component: "DateInput",
    name: "month paged forward and back",
    props: { label: "Start date", defaultValue: "2024-03-15", ...YEARS },
    /**
     * Two forward and one back rather than one of each: paging is `addMonths`
     * on a stored view month, and a port that recomputed the view from the
     * *selected* day each time would still land on the right month after a
     * single step. March → May → April cannot be reached that way.
     */
    steps: [
      ...openViaTrigger("popover"),
      { do: "click", target: '.calendar [aria-label="Next month"]' },
      { do: "click", target: '.calendar [aria-label="Next month"]' },
      { do: "click", target: '.calendar [aria-label="Previous month"]' },
      { do: "wait", target: '.calendar__grid[aria-label="April 2024"]' },
    ],
    regions: [part("popover", "positioner")],
    allowTextIn: [HIDDEN_SELECT_TEXT],
    skip: NO_ANGULAR,
  },
  {
    component: "DateInput",
    name: "year select opens inside the calendar",
    props: { label: "Start date", defaultValue: "2024-03-15", ...YEARS },
    steps: [
      ...openViaTrigger("popover"),
      { do: "click", target: `.calendar ${part("select", "trigger")}` },
      { do: "wait", target: `${part("select", "content")}[data-state="open"]` },
    ],
    /**
     * The first region is the assertion, not a convenience.
     *
     * The year `Select` is given `portalContainer={rootEl}` so its popup lands
     * in the calendar's own subtree rather than in `document.body`. That is not
     * cosmetic: a popup in the body is *outside* the enclosing date popover, so
     * clicking an option reads as an outside interaction and dismisses the whole
     * calendar under the user's cursor. It is also how the popup inherits a
     * theme scoped to that subtree.
     *
     * A region that matches nothing fails with "matched nothing in the React
     * output", so this selector catches the reference library escaping to the
     * body; comparing it catches either of the other two doing so. A region of
     * `.calendar` alone would not — if all three portalled to the body they
     * would agree about a popup none of them had, and the gate would stay green
     * on a calendar that dismissed itself.
     */
    regions: [`.calendar ${part("select", "positioner")}`, part("popover", "positioner")],
    allowTextIn: [HIDDEN_SELECT_TEXT],
    skip: NO_ANGULAR,
  },
  {
    component: "DateInput",
    name: "year chosen",
    props: { label: "Start date", defaultValue: "2024-03-15", ...YEARS },
    /**
     * Choosing a year moves the view without moving the selection: the grid
     * becomes March 2025 and the selected day, March 15 2024, is nowhere in it.
     * A port that paged by rebuilding from the value would show March 2024.
     */
    steps: [
      ...openViaTrigger("popover"),
      { do: "click", target: `.calendar ${part("select", "trigger")}` },
      { do: "wait", target: `${part("select", "content")}[data-state="open"]` },
      { do: "click", target: `${part("select", "item")}[data-value="2025"]` },
      { do: "wait", target: '.calendar__grid[aria-label="March 2025"]' },
    ],
    regions: [part("popover", "positioner")],
    allowTextIn: [HIDDEN_SELECT_TEXT],
    skip: NO_ANGULAR,
  },
  {
    component: "DateInput",
    name: "choosing a day fills the field and closes the popup",
    /**
     * No value, so the field starts `data-empty` and the click has something
     * visible to change — the native `value` is not part of the compared
     * contract, and `data-empty` is the attribute the placeholder colour hangs
     * off. `min`/`max` in 2024 pin the view to December 2024 (the anchor is
     * today clamped into the window), which is what makes the row and column
     * below name a fixed day.
     */
    props: { label: "Start date", min: "2024-01-01", max: "2024-12-31" },
    steps: [
      ...openViaTrigger("popover"),
      // December 2024 opens on a Sunday, so row 3 column 1 is the 15th.
      { do: "click", target: day(3, 1) },
      { do: "wait", target: `${part("popover", "trigger")}[data-state="closed"]` },
    ],
    regions: ["#mount"],
    // `data-state="closed"` is not the same claim as gone — see `hidden`.
    hidden: [part("popover", "content")],
    skip: NO_ANGULAR,
  },
];

export default scenarios;
