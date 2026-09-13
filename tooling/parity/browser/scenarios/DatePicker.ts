import { part, type BrowserScenario } from "./scenario.js";

/**
 * The other date component — Ark's own, not the hand-written calendar.
 *
 * DatePicker delegates its whole grid to `@ark-ui/*`'s DatePicker machine, so
 * unlike DateInput's popup there is no port to catch out here. What there *is*
 * is a surface the SSR gate excludes as portalled and never sees at all: six
 * table rows of `table-cell-trigger`s carrying `data-selected`,
 * `data-outside-range`, `data-today`, `data-in-range`, `data-weekend` and
 * `data-disabled` — the attributes DatePicker.css paints with, and the ones a
 * mis-assembled `Table` / `TableBody` / `TableCell` tree would silently drop.
 */

const p = (name: string) => part("date-picker", name);

/**
 * Everything inside the popup except its two upstream-divergent elements.
 *
 * Ark React 5.37 and Ark Svelte 5.24 / Ark Vue 5.39 disagree about two
 * attributes here, and neither disagreement is a port's doing. Both were checked
 * against the installed packages rather than guessed:
 *
 *  - **`data-view` on the `view` part.** Wrapper-level. Both zag versions emit
 *    it from `getViewProps`, but `@ark-ui/react`'s `DatePickerView` does not
 *    call `getViewProps` at all — it spreads the anatomy attrs and computes
 *    `hidden` by hand — where the Svelte and Vue wrappers do. So React alone
 *    renders `<div data-scope="date-picker" data-part="view">` with no
 *    `data-view`.
 *  - **`aria-label` on the `view-trigger`.** Machine-level. zag 1.41.2 asks for
 *    `translations.viewTrigger(view)` and gets "Switch to year view"; 1.43.3
 *    asks `translations.viewTrigger(view, getNextView(...))` and gets "Switch to
 *    month view", which is also the view it now actually switches to.
 *
 * The version numbers invite the wrong conclusion, so the check matters:
 * `@ark-ui/svelte` 5.24 looks thirteen minors behind `@ark-ui/react` 5.37, but
 * the machine underneath it is 1.43.3 against React's 1.41.2. Svelte and Vue
 * agreeing against React is a newer machine, not a bad port — see
 * `ARK_ERROR_TEXT_SKEW` for the same trap in the Field family. Both differences
 * resolve themselves when Ark React bumps zag; neither needs anything done to a
 * port, and `data-view` is invisible either way (nothing in DatePicker.css
 * selects on it).
 *
 * Rather than allow an attribute across the whole scenario — `allow` is
 * per-attribute, not per-element, so allowing `aria-label` would stop comparing
 * the prev and next triggers' labels too — the regions name what *is* compared.
 * Between them they cover every element in the popup but those two: the table
 * whole, the month label, and both nav buttons. The only thing outside them is
 * the `view` wrapper's own attribute list and the view trigger's, which is
 * exactly the drift.
 */
const POPUP = [p("table"), p("range-text"), p("prev-trigger"), p("next-trigger")];

const scenarios: BrowserScenario[] = [
  {
    component: "DatePicker",
    name: "open",
    props: { label: "Date", defaultValue: ["2024-03-15"] },
    steps: [
      { do: "click", target: p("trigger") },
      { do: "wait", target: `${p("content")}[data-state="open"]` },
    ],
    // `#mount` as well: the control and its trigger take `data-state="open"`,
    // and the input the machine writes the formatted value into lives there.
    regions: [...POPUP, "#mount"],
  },
  {
    component: "DatePicker",
    name: "range open",
    /**
     * Range mode is the only state that produces `data-in-range` on the cells
     * *and* a second input in the control — the two halves of `selectionMode`,
     * one of them portalled and so never yet compared.
     */
    props: {
      label: "Stay",
      selectionMode: "range",
      defaultValue: ["2024-03-05", "2024-03-12"],
    },
    steps: [
      { do: "click", target: p("trigger") },
      { do: "wait", target: `${p("content")}[data-state="open"]` },
    ],
    regions: [...POPUP, "#mount"],
    /**
     * The one attribute that moved upstream between the two zag versions, and
     * the only state that shows it.
     *
     * `translations.dayCell` gained a branch in 1.43.3:
     *
     *     if (state.inRange) return `In range. ${state.valueText}`
     *
     * so the six days between the two ends read "In range. Friday, March 8,
     * 2024" under Svelte and Vue (zag 1.43.3) and "Choose Friday, March 8, 2024"
     * under React (1.41.2). Machine-level, not wrapper-level — the same trap
     * `ARK_ERROR_TEXT_SKEW` documents, where Svelte and Vue agreeing against
     * React means a newer machine rather than two bad ports. React catches up
     * when Ark React bumps zag, and the newer text is the better one.
     *
     * Allowed rather than skipped, because skipping would drop the whole range
     * grid — every `data-in-range`, `data-range-start` and `data-range-end` on
     * it, which is the entire reason this case exists — to hide one label. The
     * allowance is scoped to this scenario: `open`, `month paged` and `bounded`
     * all compare `aria-label` at full strength, including the weekday headers',
     * which are ours rather than the machine's.
     */
    allow: [
      {
        attribute: "aria-label",
        reason:
          "zag 1.43.3's translations.dayCell prefixes in-range days with " +
          '"In range."; zag 1.41.2, which Ark React still bundles, does not. ' +
          "Upstream drift in the machine — no port did this, and it only shows " +
          "on the days strictly between a range's two ends.",
      },
    ],
    stylesheets: ["DatePicker/DatePicker.css"],
  },
  {
    component: "DatePicker",
    name: "month paged",
    props: { label: "Date", defaultValue: ["2024-03-15"] },
    steps: [
      { do: "click", target: p("trigger") },
      { do: "wait", target: `${p("content")}[data-state="open"]` },
      { do: "click", target: p("next-trigger") },
      // The month label is the machine's own answer to "which month is this",
      // so waiting on it is waiting on the paging rather than on a frame.
      { do: "wait", target: `${p("range-text")}:text-is("April 2024")` },
    ],
    // The selected day is now off-screen, so the grid has to be right about a
    // month it holds no value for.
    regions: POPUP,
  },
  {
    component: "DatePicker",
    name: "bounded",
    /**
     * `min`/`max` inside the visible month, which is what turns cells
     * `data-unavailable` without making them outside-range — two different
     * attributes with two different rules in DatePicker.css, and the pair a
     * port that conflated "not in this month" with "not selectable" would
     * collapse into one.
     */
    props: { label: "Date", defaultValue: ["2024-03-15"], min: "2024-03-10", max: "2024-03-20" },
    steps: [
      { do: "click", target: p("trigger") },
      { do: "wait", target: `${p("content")}[data-state="open"]` },
    ],
    regions: POPUP,
  },
];

export default scenarios;
