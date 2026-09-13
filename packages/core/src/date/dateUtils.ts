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
