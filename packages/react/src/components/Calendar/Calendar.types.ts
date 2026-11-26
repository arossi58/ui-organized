import type * as React from "react";
import type { DatePresetValue } from "@ui-organized/core";
import type { DateRangeValue } from "../DateRangeInput/DateRangeInput.types.js";

/** A shortcut beside the grid: "Today", "Last 7 days", a fixed date or range. */
export interface DatePreset {
  label: string;
  /**
   * An ISO date, an ISO range, or a name resolved against today: `today`,
   * `yesterday`, `last7Days`, `last30Days`, `thisWeek`, `lastWeek`,
   * `thisMonth`, `lastMonth`, `thisQuarter`, `lastQuarter`, `thisYear`,
   * `lastYear` and the other `last…Days`. A preset outside `min`/`max` is
   * disabled.
   */
  value: DatePresetValue;
  disabled?: boolean;
}

interface CalendarBaseProps {
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
  footer?: React.ReactNode;
  className?: string;
}

export interface CalendarSingleProps extends CalendarBaseProps {
  /** Pick one day. The default. */
  mode?: "single";
  /** Controlled value (ISO `YYYY-MM-DD`; `""` when empty). */
  value?: string;
  /** Uncontrolled initial value. */
  defaultValue?: string;
  /** Called with the chosen day. */
  onValueChange?: (value: string) => void;
  onRangeComplete?: never;
}

export interface CalendarRangeProps extends CalendarBaseProps {
  /** Pick a start and an end. */
  mode: "range";
  /** Controlled value. */
  value?: DateRangeValue;
  /** Uncontrolled initial value. */
  defaultValue?: DateRangeValue;
  /** Called whenever either end changes. */
  onValueChange?: (value: DateRangeValue) => void;
  /** Called once both ends are chosen, by picking or by a preset. */
  onRangeComplete?: (value: DateRangeValue) => void;
}

export type CalendarProps = CalendarSingleProps | CalendarRangeProps;
