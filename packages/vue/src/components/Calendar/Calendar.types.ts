import type { YMD } from "@ui-organized/core";

/** The two ends of a range selection; either may be `null` while it is drawn. */
export interface CalendarRange {
  start: YMD | null;
  end: YMD | null;
}

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
  /**
   * The callbacks are declared props rather than emits.
   *
   * `onActiveDay` fires from a template ref during patch, which is not a place
   * to be emitting, and the other three are called by the caller's own parent
   * component — there is no template in between for `@select` to be nicer than
   * a prop. Declaring them also keeps them out of `$attrs`, where Vue would
   * otherwise attach them to the root element as DOM listeners.
   */
  onSelect?: (day: YMD) => void;
  /** Called with the updated range in range mode. */
  onRangeChange?: (range: CalendarRange) => void;
  /** Called once both ends of a range have been chosen (caller may close). */
  onRangeComplete?: () => void;
  /** Reports the active (roving-focus) day button, for popup autofocus. */
  onActiveDay?: (el: HTMLButtonElement | null) => void;
}
