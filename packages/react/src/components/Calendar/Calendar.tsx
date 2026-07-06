import { useEffect, useRef, useState } from "react";
import type * as React from "react";
import { Button } from "../Button/index.js";
import { Select } from "../Select/index.js";
import {
  addDays,
  addMonths,
  clampYMD,
  compareYMD,
  isSameMonth,
  isSameYMD,
  isWithin,
  monthGrid,
  monthLabel,
  monthName,
  startOfMonth,
  todayYMD,
  toISODate,
  weekdayLabels,
  ymdToDate,
  type YMD,
} from "./dateUtils.js";
import "./Calendar.css";

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
  /** Called with the chosen day in single mode. */
  onSelect?: (day: YMD) => void;
  /** Called with the updated range in range mode. */
  onRangeChange?: (range: CalendarRange) => void;
  /** Called once both ends of a range have been chosen (caller may close). */
  onRangeComplete?: () => void;
  /** Populated with the active (roving-focus) day button — for popup autofocus. */
  activeDayRef?: React.MutableRefObject<HTMLButtonElement | null>;
}

function orderedPair(a: YMD, b: YMD): [YMD, YMD] {
  return compareYMD(a, b) <= 0 ? [a, b] : [b, a];
}

export function Calendar({
  mode,
  value,
  rangeValue,
  min = null,
  max = null,
  numMonths = 1,
  weekStartsOn = 0,
  onSelect,
  onRangeChange,
  onRangeComplete,
  activeDayRef,
}: CalendarProps) {
  const today = todayYMD();
  const start = rangeValue?.start ?? null;
  const end = rangeValue?.end ?? null;

  const initialAnchor =
    (mode === "single" ? value : start) ?? clampYMD(today, min, max);
  const [viewMonth, setViewMonth] = useState<YMD>(() => startOfMonth(initialAnchor));
  const [focused, setFocused] = useState<YMD>(() => initialAnchor);
  const [hover, setHover] = useState<YMD | null>(null);
  // Portal the year Select's popup into the calendar's own subtree so option
  // clicks aren't seen as an outside-interaction that dismisses the enclosing
  // date popover (and so the popup inherits any theme scoped to that subtree).
  const [rootEl, setRootEl] = useState<HTMLDivElement | null>(null);

  // Roving focus: only move DOM focus when navigation came from the keyboard,
  // never on hover/render, so opening the popup doesn't yank focus around.
  const dayRefs = useRef(new Map<string, HTMLButtonElement>());
  const focusPending = useRef(false);
  useEffect(() => {
    if (!focusPending.current) return;
    focusPending.current = false;
    dayRefs.current.get(toISODate(focused))?.focus();
  }, [focused]);

  const ensureVisible = (d: YMD) => {
    const lastVisible = addMonths(viewMonth, numMonths - 1);
    if (compareYMD(d, viewMonth) < 0) {
      setViewMonth(startOfMonth(d));
    } else if (compareYMD(d, { ...lastVisible, day: 31 }) > 0) {
      setViewMonth(startOfMonth(addMonths(d, -(numMonths - 1))));
    }
  };

  const moveFocus = (next: YMD) => {
    focusPending.current = true;
    setFocused(next);
    ensureVisible(next);
  };

  const selectDay = (day: YMD) => {
    if (!isWithin(day, min, max)) return;
    if (mode === "single") {
      onSelect?.(day);
      return;
    }
    if (!start || (start && end) || compareYMD(day, start) < 0) {
      onRangeChange?.({ start: day, end: null });
    } else {
      onRangeChange?.({ start, end: day });
      onRangeComplete?.();
    }
  };

  const onGridKeyDown = (event: React.KeyboardEvent) => {
    const weekday = (ymdToDate(focused).getDay() - weekStartsOn + 7) % 7;
    let next: YMD | null = null;
    switch (event.key) {
      case "ArrowLeft": next = addDays(focused, -1); break;
      case "ArrowRight": next = addDays(focused, 1); break;
      case "ArrowUp": next = addDays(focused, -7); break;
      case "ArrowDown": next = addDays(focused, 7); break;
      case "Home": next = addDays(focused, -weekday); break;
      case "End": next = addDays(focused, 6 - weekday); break;
      case "PageUp": next = addMonths(focused, -1); break;
      case "PageDown": next = addMonths(focused, 1); break;
      case "Enter":
      case " ":
        event.preventDefault();
        selectDay(focused);
        return;
      default:
        return;
    }
    if (next) {
      event.preventDefault();
      moveFocus(clampYMD(next, min, max));
    }
  };

  // Resolve the active range endpoints (committed range, or start↔hover preview)
  // into ordered lo/hi so the in-range band renders the same either way.
  let lo: YMD | null = null;
  let hi: YMD | null = null;
  if (mode === "range" && start) {
    const other = end ?? hover;
    if (other) [lo, hi] = orderedPair(start, other);
  }

  const weekdays = weekdayLabels(weekStartsOn);
  const months = Array.from({ length: numMonths }, (_, i) => addMonths(viewMonth, i));

  // Can't page earlier than the month containing `min`, nor later than `max`.
  const lastVisible = addMonths(viewMonth, numMonths - 1);
  const prevDisabled = min ? compareYMD(viewMonth, startOfMonth(min)) <= 0 : false;
  const nextDisabled = max
    ? compareYMD(startOfMonth(lastVisible), startOfMonth(max)) >= 0
    : false;

  // Year dropdown options: bounded by min/max when set, else a wide default
  // window, always widened to include every visible year.
  const baseYear = today.year;
  const loYear = Math.min(min ? min.year : baseYear - 100, viewMonth.year);
  const hiYear = Math.max(max ? max.year : baseYear + 10, lastVisible.year);
  const years: number[] = [];
  for (let y = loYear; y <= hiYear; y++) years.push(y);

  const handleYearChange = (monthIndex: number, newYear: number) => {
    const targetMonth = addMonths(viewMonth, monthIndex).month;
    const newView = addMonths({ year: newYear, month: targetMonth, day: 1 }, -monthIndex);
    setViewMonth(newView);
    setFocused(clampYMD(startOfMonth(newView), min, max));
  };

  function renderMonth(monthAnchor: YMD) {
    const cells = monthGrid(monthAnchor.year, monthAnchor.month, weekStartsOn);
    return (
      <div className="calendar__month" key={`${monthAnchor.year}-${monthAnchor.month}`}>
        <div className="calendar__weekdays" aria-hidden="true">
          {weekdays.map((w, i) => (
            <span key={i} className="calendar__weekday text-default-body-small">
              {w}
            </span>
          ))}
        </div>
        <div
          className="calendar__grid"
          role="grid"
          aria-label={monthLabel(monthAnchor.year, monthAnchor.month)}
          onKeyDown={onGridKeyDown}
        >
          {cells.map((d) => {
            const iso = toISODate(d);
            const outside = !isSameMonth(d, monthAnchor);
            const disabled = !isWithin(d, min, max);

            const isSingleSel = mode === "single" && isSameYMD(d, value ?? null);
            const isLo = !!lo && isSameYMD(d, lo);
            const isHi = !!hi && isSameYMD(d, hi);
            const isEndpoint =
              mode === "range" && (isSameYMD(d, start) || isSameYMD(d, end) || isLo || isHi);
            const selected = isSingleSel || isEndpoint;
            const inRange =
              !!lo && !!hi && compareYMD(d, lo) > 0 && compareYMD(d, hi) < 0;

            return (
              <button
                key={iso}
                type="button"
                ref={(el) => {
                  if (el) dayRefs.current.set(iso, el);
                  else dayRefs.current.delete(iso);
                  if (isSameYMD(d, focused) && activeDayRef) activeDayRef.current = el;
                }}
                className="calendar__day"
                role="gridcell"
                tabIndex={isSameYMD(d, focused) ? 0 : -1}
                disabled={disabled}
                aria-label={ymdToDate(d).toLocaleDateString(undefined, {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
                aria-selected={selected || undefined}
                aria-current={isSameYMD(d, today) ? "date" : undefined}
                data-outside={outside || undefined}
                data-today={isSameYMD(d, today) || undefined}
                data-selected={selected || undefined}
                data-range-lo={(isLo && hi && !isSameYMD(lo, hi)) || undefined}
                data-range-hi={(isHi && lo && !isSameYMD(lo, hi)) || undefined}
                data-in-range={inRange || undefined}
                onClick={() => {
                  setFocused(d);
                  selectDay(d);
                }}
                onMouseEnter={() => {
                  if (mode === "range" && start && !end) setHover(d);
                }}
                onFocus={() => setFocused(d)}
              >
                <span className="calendar__day-label text-default-body-large">{d.day}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="calendar" ref={setRootEl} onMouseLeave={() => setHover(null)}>
      <div className="calendar__header">
        <Button
          intent="ghost"
          size="sm"
          icon="chevron-left"
          className="calendar__nav"
          onClick={() => setViewMonth(addMonths(viewMonth, -1))}
          disabled={prevDisabled}
          aria-label="Previous month"
        />
        <div className="calendar__labels">
          {months.map((m, i) => (
            <div key={`${m.year}-${m.month}`} className="calendar__label">
              <span className="calendar__month-name text-emphasis-body-large">{monthName(m.year, m.month)}</span>
              <Select
                variant="ghost"
                size="sm"
                label={`Year, ${monthName(m.year, m.month)}`}
                options={years.map((y) => ({ value: String(y), label: String(y) }))}
                value={String(m.year)}
                onValueChange={(v) => handleYearChange(i, Number(v))}
                portalContainer={rootEl}
              />
            </div>
          ))}
        </div>
        <Button
          intent="ghost"
          size="sm"
          icon="chevron-right"
          className="calendar__nav"
          onClick={() => setViewMonth(addMonths(viewMonth, 1))}
          disabled={nextDisabled}
          aria-label="Next month"
        />
      </div>
      <div className="calendar__months">
        {months.map((m) => renderMonth(m))}
      </div>
    </div>
  );
}
