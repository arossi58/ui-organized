// Pure, timezone-safe date helpers for the design-system calendar.
//
// Calendar values cross the wire as ISO `YYYY-MM-DD` strings, but all math runs
// on local-time integer parts (`YMD`) constructed via `new Date(y, m, d)` — we
// never feed an ISO string to `new Date()`, which would parse it as UTC and
// shift the day across time zones.

/** A calendar day in local time. `month` is 0-indexed (0 = January). */
export interface YMD {
  year: number;
  month: number;
  day: number;
}

export function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

/** Format a `YMD` as an ISO `YYYY-MM-DD` date string. */
export function toISODate(d: YMD): string {
  return `${d.year}-${pad2(d.month + 1)}-${pad2(d.day)}`;
}

/** Parse the date portion of an ISO string (`YYYY-MM-DD` or `…THH:mm`). */
export function parseISODate(value: string | undefined | null): YMD | null {
  if (!value) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (!m) return null;
  const year = Number(m[1]);
  const month = Number(m[2]) - 1;
  const day = Number(m[3]);
  if (month < 0 || month > 11 || day < 1 || day > 31) return null;
  return { year, month, day };
}

export function ymdToDate(d: YMD): Date {
  return new Date(d.year, d.month, d.day);
}

export function dateToYMD(d: Date): YMD {
  return { year: d.getFullYear(), month: d.getMonth(), day: d.getDate() };
}

export function todayYMD(): YMD {
  return dateToYMD(new Date());
}

/** Negative if a < b, 0 if equal day, positive if a > b. */
export function compareYMD(a: YMD, b: YMD): number {
  return ymdToDate(a).getTime() - ymdToDate(b).getTime();
}

export function isSameYMD(a: YMD | null, b: YMD | null): boolean {
  return !!a && !!b && a.year === b.year && a.month === b.month && a.day === b.day;
}

/** Add `delta` whole months, landing on the first of the resulting month. */
export function addMonths(d: YMD, delta: number): YMD {
  const date = new Date(d.year, d.month + delta, 1);
  return { year: date.getFullYear(), month: date.getMonth(), day: 1 };
}

export function addDays(d: YMD, delta: number): YMD {
  return dateToYMD(new Date(d.year, d.month, d.day + delta));
}

export function startOfMonth(d: YMD): YMD {
  return { year: d.year, month: d.month, day: 1 };
}

export function isSameMonth(a: YMD, b: YMD): boolean {
  return a.year === b.year && a.month === b.month;
}

/**
 * A 6×7 (42-cell) grid of days for `month`/`year`, including the leading and
 * trailing days of the adjacent months so every week row is full.
 */
export function monthGrid(year: number, month: number, weekStartsOn = 0): YMD[] {
  const first = new Date(year, month, 1);
  const lead = (first.getDay() - weekStartsOn + 7) % 7;
  const cells: YMD[] = [];
  for (let i = 0; i < 42; i++) {
    cells.push(dateToYMD(new Date(year, month, 1 - lead + i)));
  }
  return cells;
}

export function isWithin(d: YMD, min: YMD | null, max: YMD | null): boolean {
  if (min && compareYMD(d, min) < 0) return false;
  if (max && compareYMD(d, max) > 0) return false;
  return true;
}

/** Clamp `d` into the inclusive [min, max] window (either bound optional). */
export function clampYMD(d: YMD, min: YMD | null, max: YMD | null): YMD {
  if (min && compareYMD(d, min) < 0) return min;
  if (max && compareYMD(d, max) > 0) return max;
  return d;
}

export function monthLabel(year: number, month: number, locale?: string): string {
  return new Date(year, month, 1).toLocaleDateString(locale, {
    month: "long",
    year: "numeric",
  });
}

export function monthName(year: number, month: number, locale?: string): string {
  return new Date(year, month, 1).toLocaleDateString(locale, { month: "long" });
}

/** Localized 2-letter weekday headers, ordered from `weekStartsOn`. */
export function weekdayLabels(weekStartsOn = 0, locale?: string): string[] {
  // 2024-01-07 is a Sunday — a stable anchor for deriving localized names.
  const out: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(2024, 0, 7 + ((weekStartsOn + i) % 7));
    out.push(d.toLocaleDateString(locale, { weekday: "short" }).slice(0, 2));
  }
  return out;
}

// ─── Presets ─────────────────────────────────────────────────────────────────

/** The last day of `d`'s month. */
export function endOfMonth(d: YMD): YMD {
  return dateToYMD(new Date(d.year, d.month + 1, 0));
}

/** The first day of the week holding `d`. */
export function startOfWeek(d: YMD, weekStartsOn = 0): YMD {
  const weekday = (ymdToDate(d).getDay() - weekStartsOn + 7) % 7;
  return addDays(d, -weekday);
}

/**
 * Named presets, resolved against today. The range names follow zag's
 * date-picker presets; `today` and `yesterday` are one-day ranges.
 */
export type DatePresetName =
  | "today"
  | "yesterday"
  | "last3Days"
  | "last7Days"
  | "last14Days"
  | "last30Days"
  | "last90Days"
  | "thisWeek"
  | "lastWeek"
  | "thisMonth"
  | "lastMonth"
  | "thisQuarter"
  | "lastQuarter"
  | "thisYear"
  | "lastYear";

/** A preset's value: an ISO date, an ISO range, or a name resolved against today. */
export type DatePresetValue = string | { start: string; end: string } | DatePresetName;

/** An inclusive pair of days. */
export interface YMDRange {
  start: YMD;
  end: YMD;
}

const LAST_N: Partial<Record<DatePresetName, number>> = {
  last3Days: 3,
  last7Days: 7,
  last14Days: 14,
  last30Days: 30,
  last90Days: 90,
};

/**
 * The days a preset stands for, or `null` when its value cannot be read. A
 * single ISO date resolves to a one-day range, so callers handle one shape.
 */
export function resolveDatePreset(value: DatePresetValue, today: YMD, weekStartsOn = 0): YMDRange | null {
  if (typeof value === "object") {
    const start = parseISODate(value.start);
    const end = parseISODate(value.end);
    if (!start || !end) return null;
    return compareYMD(start, end) <= 0 ? { start, end } : { start: end, end: start };
  }
  const iso = parseISODate(value);
  if (iso) return { start: iso, end: iso };
  const name = value as DatePresetName;
  const n = LAST_N[name];
  if (n) return { start: addDays(today, -(n - 1)), end: today };
  switch (name) {
    case "today":
      return { start: today, end: today };
    case "yesterday": {
      const day = addDays(today, -1);
      return { start: day, end: day };
    }
    case "thisWeek": {
      const start = startOfWeek(today, weekStartsOn);
      return { start, end: addDays(start, 6) };
    }
    case "lastWeek": {
      const start = addDays(startOfWeek(today, weekStartsOn), -7);
      return { start, end: addDays(start, 6) };
    }
    case "thisMonth":
      return { start: startOfMonth(today), end: endOfMonth(today) };
    case "lastMonth": {
      const start = addMonths(today, -1);
      return { start, end: endOfMonth(start) };
    }
    case "thisQuarter":
    case "lastQuarter": {
      const first = today.month - (today.month % 3) - (name === "lastQuarter" ? 3 : 0);
      const start = addMonths({ year: today.year, month: 0, day: 1 }, first);
      return { start, end: endOfMonth(addMonths(start, 2)) };
    }
    case "thisYear":
      return { start: { year: today.year, month: 0, day: 1 }, end: { year: today.year, month: 11, day: 31 } };
    case "lastYear":
      return { start: { year: today.year - 1, month: 0, day: 1 }, end: { year: today.year - 1, month: 11, day: 31 } };
    default:
      return null;
  }
}

/** Whether a resolved preset lies wholly inside the inclusive [min, max] window. */
export function presetWithin(range: YMDRange, min: YMD | null, max: YMD | null): boolean {
  return isWithin(range.start, min, max) && isWithin(range.end, min, max);
}
