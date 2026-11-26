import { useRef, useState } from "react";
import { clsx } from "clsx";
import { calendarPanelStyles, parseISODate, toISODate, type YMD } from "@ui-organized/core";
import { CalendarGrid } from "./CalendarGrid.js";
import { CalendarPresets } from "./CalendarPresets.js";
import type { CalendarProps } from "./Calendar.types.js";
import type { DateRangeValue } from "../DateRangeInput/DateRangeInput.types.js";
import "@ui-organized/core/components/Calendar/Calendar.css";

const EMPTY_RANGE: DateRangeValue = { start: "", end: "" };
const iso = (d: YMD | null) => (d ? toISODate(d) : "");

/**
 * A month grid on its own: in a page, a card or a panel of your own. Values are
 * ISO `YYYY-MM-DD` strings, as on DateInput and DateRangeInput.
 */
export function Calendar(props: CalendarProps) {
  const { min, max, numMonths = 1, weekStartsOn = 0, presets, presetsLabel, variant, footer, className } = props;
  const range = props.mode === "range";
  const [inner, setInner] = useState<string | DateRangeValue>(
    () => props.defaultValue ?? (range ? EMPTY_RANGE : ""),
  );
  const value = props.value !== undefined ? props.value : inner;
  // A preset moves the view to its month; the grid keeps its view as state, so
  // it is handed a new key rather than told.
  const [viewKey, setViewKey] = useState(0);
  const latest = useRef<DateRangeValue>(EMPTY_RANGE);

  const commit = (next: string | DateRangeValue) => {
    if (props.value === undefined) setInner(next);
    (props.onValueChange as ((v: string | DateRangeValue) => void) | undefined)?.(next);
  };

  const rangeValue = range ? (value as DateRangeValue) : EMPTY_RANGE;
  const single = range ? "" : (value as string);
  const selected = range
    ? { start: parseISODate(rangeValue.start), end: parseISODate(rangeValue.end) }
    : { start: parseISODate(single), end: parseISODate(single) };

  const grid = range ? (
    <CalendarGrid
      key={viewKey}
      mode="range"
      rangeValue={{ start: selected.start, end: selected.end }}
      min={parseISODate(min)}
      max={parseISODate(max)}
      numMonths={numMonths}
      weekStartsOn={weekStartsOn}
      onRangeChange={(r) => {
        latest.current = { start: iso(r.start), end: iso(r.end) };
        commit(latest.current);
      }}
      onRangeComplete={() => props.mode === "range" && props.onRangeComplete?.(latest.current)}
    />
  ) : (
    <CalendarGrid
      key={viewKey}
      mode="single"
      value={selected.start}
      min={parseISODate(min)}
      max={parseISODate(max)}
      numMonths={numMonths}
      weekStartsOn={weekStartsOn}
      onSelect={(d) => commit(toISODate(d))}
    />
  );

  return (
    <div className={clsx(calendarPanelStyles({ variant }), className)}>
      {presets && presets.length > 0 && (
        <CalendarPresets
          presets={presets}
          selected={selected}
          min={min}
          max={max}
          weekStartsOn={weekStartsOn}
          label={presetsLabel}
          onPick={(r) => {
            if (range) {
              const next = { start: toISODate(r.start), end: toISODate(r.end) };
              commit(next);
              if (props.mode === "range") props.onRangeComplete?.(next);
            } else {
              commit(toISODate(r.start));
            }
            setViewKey((k) => k + 1);
          }}
        />
      )}
      <div className="calendar-panel__body">
        {grid}
        {footer != null && <div className="calendar-panel__footer">{footer}</div>}
      </div>
    </div>
  );
}
