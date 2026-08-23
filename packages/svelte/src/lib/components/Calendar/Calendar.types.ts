import type { YMD } from "@ui-organized/core";

/** The two ends of a range selection; either may be `null` while it is drawn. */
export interface CalendarRange {
  start: YMD | null;
  end: YMD | null;
}

/**
 * Props for the internal Calendar.
 *
 * Written out in full rather than extending a private base: `svelte-package`
 * emits no `.d.ts` for a component whose props reference an interface it cannot
 * see, and the failure is silent — the component ships without types.
 */
export interface CalendarProps {
  /** "single" selects one day; "range" selects a start→end pair. */
  mode: "single" | "range";
  /** Selected day in single mode. */
  value?: YMD | null;
  /** Selected range in range mode. */
  rangeValue?: CalendarRange;
  /** Earliest selectable day (inclusive). */
  min?: YMD | null;
  /** Latest selectable day (inclusive). */
  max?: YMD | null;
  /** Number of months shown side by side. Defaults to 1. */
  numMonths?: number;
  /** First day of the week: 0 = Sunday (default), 1 = Monday. */
  weekStartsOn?: number;
  /** Called with the chosen day in single mode. */
  onSelect?: (day: YMD) => void;
  /** Called with the updated range in range mode. */
  onRangeChange?: (range: CalendarRange) => void;
  /** Called once both ends of a range have been chosen (caller may close). */
  onRangeComplete?: () => void;
  /**
   * Reports the active (roving-focus) day button, for popup autofocus.
   *
   * React passes a ref object and the calendar writes `.current`. Svelte has no
   * equivalent object to hand down, so the same information travels as a
   * callback — which is also what keeps the caller free to store it in `$state`
   * and read it from `initialFocusEl`.
   */
  onActiveDay?: (el: HTMLButtonElement | null) => void;
}
