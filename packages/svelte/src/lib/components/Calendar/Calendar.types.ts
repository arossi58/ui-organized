import type { Snippet } from "svelte";
import type { DatePresetValue, YMD } from "@ui-organized/core";
import type { DateRangeValue } from "../DateRangeInput/DateRangeInput.types.js";

/** The two ends of a range selection; either may be `null` while it is drawn. */
export interface CalendarRange {
  start: YMD | null;
  end: YMD | null;
}

/**
 * Props for the internal day grid, CalendarGrid: YMD values in and out.
 * DateInput, DateTimeInput and DateRangeInput drive it directly; the public,
 * ISO-string `Calendar` wraps it.
 *
 * Written out in full rather than extending a private base: `svelte-package`
 * emits no `.d.ts` for a component whose props reference an interface it cannot
 * see, and the failure is silent — the component ships without types.
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
 * Props for the public Calendar. Written out in full, for the reason above.
 * `value` is an ISO `YYYY-MM-DD` string in single mode and a `DateRangeValue`
 * in range mode.
 */
export interface CalendarProps {
  /** `single` (the default) picks one day; `range` a start and an end. */
  mode?: "single" | "range";
  /** The selection. Bindable: `bind:value`. */
  value?: string | DateRangeValue;
  /** Uncontrolled initial value. */
  defaultValue?: string | DateRangeValue;
  /** Called with the new selection: a string, or a range in range mode. */
  onValueChange?: (value: string | DateRangeValue) => void;
  /** Range mode: called once both ends are chosen, by picking or by a preset. */
  onRangeComplete?: (value: DateRangeValue) => void;
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
  /** A row under the grid, for actions such as Cancel and Apply. */
  footer?: Snippet;
  class?: string;
}
