import type { DatePresetValue, YMD } from "@ui-organized/core";
import type { DateRangeValue } from "../DateRangeInput/DateRangeInput.types.js";

/** The two ends of a range selection; either may be `null` while it is drawn. */
export interface CalendarRange {
  start: YMD | null;
  end: YMD | null;
}

/**
 * Props for the internal day grid, CalendarGrid: YMD values in and out. The
 * public, ISO-string `Calendar` wraps it.
 */
export interface CalendarGridProps {
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

/** A shortcut beside the grid: "Today", "Last 7 days", a fixed date or range. */
export interface DatePreset {
  label: string;
  /**
   * An ISO date, an ISO range, or a name resolved against today (`today`,
   * `yesterday`, `last7Days`, `thisMonth`, `lastQuarter`, …). A preset outside
   * `min`/`max` is disabled.
   */
  value: DatePresetValue;
  disabled?: boolean;
}

/**
 * Props for the public Calendar. `modelValue` is an ISO `YYYY-MM-DD` string in
 * single mode and a `DateRangeValue` in range mode; use `v-model`.
 */
export interface CalendarProps {
  /** `single` (the default) picks one day; `range` a start and an end. */
  mode?: "single" | "range";
  /** The selection. Use `v-model`. */
  modelValue?: string | DateRangeValue;
  /** Uncontrolled initial value. */
  defaultValue?: string | DateRangeValue;
  /** Earliest selectable date (ISO `YYYY-MM-DD`). */
  min?: string;
  /** Latest selectable date (ISO `YYYY-MM-DD`). */
  max?: string;
  /** Months shown side by side. Defaults to 1. */
  numMonths?: number;
  /** First day of the week: 0 = Sunday (the default), 1 = Monday. */
  weekStartsOn?: number;
  /** Shortcuts in a column before the grid. */
  presets?: DatePreset[];
  /** The presets column's accessible name. Defaults to "Presets". */
  presetsLabel?: string;
  /** `card` puts the calendar on a bordered surface. Defaults to `plain`. */
  variant?: "plain" | "card";
}
