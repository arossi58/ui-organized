import { dateToYMD, type YMD } from "@ui-organized/core";

/**
 * Add whole months, keeping the day of the month.
 *
 * Deliberately *not* `addMonths` from `@ui-organized/core`, whose contract is
 * "land on the first" — that is what the hand-written `Calendar` uses and why
 * its PageUp/PageDown lose the day. Ark's DatePicker is a different machine with
 * a different answer: `@internationalized/date` keeps the day and clamps it into
 * the target month, so paging forward from the 15th shows the 15th and paging
 * from the 31st of March shows the 30th of April.
 */
export function shiftMonths(day: YMD, delta: number): YMD {
  const target = new Date(day.year, day.month + delta, 1);
  const year = target.getFullYear();
  const month = target.getMonth();
  // Day 0 of the next month is the last day of this one.
  const lastDay = new Date(year, month + 1, 0).getDate();
  return { year, month, day: Math.min(day.day, lastDay) };
}

/**
 * The weeks a month's grid actually needs, padded to whole weeks at both ends.
 *
 * Between four and six rows, never a fixed six. That is the one structural place
 * this grid differs from the hand-written `Calendar`, whose `monthGrid` always
 * returns 42 cells: zag renders `ceil((lead + days) / 7)` rows, so April 2024 —
 * which starts on a Monday and has thirty days — is five rows ending on May 4th,
 * and a sixth row of May would be six cells the reference library does not have.
 */
export function datePickerWeeks(view: YMD, weekStartsOn = 0): YMD[][] {
  const first = new Date(view.year, view.month, 1);
  const lead = (first.getDay() - weekStartsOn + 7) % 7;
  const daysInMonth = new Date(view.year, view.month + 1, 0).getDate();
  const rows = Math.ceil((lead + daysInMonth) / 7);

  const weeks: YMD[][] = [];
  for (let row = 0; row < rows; row++) {
    const week: YMD[] = [];
    for (let column = 0; column < 7; column++) {
      week.push(dateToYMD(new Date(view.year, view.month, 1 - lead + row * 7 + column)));
    }
    weeks.push(week);
  }
  return weeks;
}
