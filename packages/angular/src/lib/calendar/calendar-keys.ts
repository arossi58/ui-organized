import { addDays, addMonths, ymdToDate, type YMD } from "@ui-organized/core";

/**
 * Where a key press moves the calendar's roving focus, before any clamping.
 *
 * Split out of the component because the grid is the one part of `UioCalendar`
 * the parity gate is blind to: `tabindex` is not a contract attribute, so a port
 * whose arrows moved by the wrong amount would render an identical DOM and fail
 * nothing. `input()` is invisible to the JIT compiler the specs run under, so a
 * TestBed fixture cannot drive `min`/`max` either — a pure function can be
 * driven by anything.
 *
 * `null` means "not a navigation key", which the caller must pass through rather
 * than swallow; Enter and Space are handled separately because they select
 * rather than move.
 *
 * ── PageUp/PageDown land on the 1st, and that is not a bug here ─────────────
 *
 * Both reuse `addMonths`, whose documented contract is "add whole months,
 * landing on the first of the resulting month" — so paging from the 15th of
 * March reaches April 1st rather than April 15th. React, Svelte and Vue all do
 * exactly this, from the same helper. Reproduced deliberately: a port that
 * "fixed" it would be the only one of four that moved focus somewhere else, and
 * the gate cannot see focus. If it is ever changed it has to change in
 * `@ui-organized/core` for all four at once.
 */
export function calendarKeyTarget(
  key: string,
  focused: YMD,
  weekStartsOn: number,
): YMD | null {
  // The focused day's column, counted from whichever day the week starts on —
  // which is what makes Home/End land on the ends of *this* week rather than on
  // Sunday and Saturday.
  const weekday = (ymdToDate(focused).getDay() - weekStartsOn + 7) % 7;
  switch (key) {
    case "ArrowLeft":
      return addDays(focused, -1);
    case "ArrowRight":
      return addDays(focused, 1);
    case "ArrowUp":
      return addDays(focused, -7);
    case "ArrowDown":
      return addDays(focused, 7);
    case "Home":
      return addDays(focused, -weekday);
    case "End":
      return addDays(focused, 6 - weekday);
    case "PageUp":
      return addMonths(focused, -1);
    case "PageDown":
      return addMonths(focused, 1);
    default:
      return null;
  }
}
