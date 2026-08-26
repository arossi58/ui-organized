import { describe, it, expect } from "vitest";
import { toISODate } from "@ui-organized/core";
import { datePickerWeeks, shiftMonths } from "./date-picker-grid.js";

/**
 * The two rules that make this grid Ark's rather than ours.
 *
 * Both are invisible to a reader and load-bearing in the parity gate: the grid
 * is a `<table>`, so an extra week is seven `<td>`s the reference library does
 * not have, and paging that lost the day of the month would move focus to a
 * different cell than every other library.
 */

const iso = (weeks: ReturnType<typeof datePickerWeeks>, week: number, day: number) =>
  toISODate(weeks[week]![day]!);

describe("datePickerWeeks", () => {
  it("gives March 2024 six rows, padded into February and April", () => {
    // Starts on a Friday with 31 days: 5 + 31 = 36, so six rows.
    const weeks = datePickerWeeks({ year: 2024, month: 2, day: 1 });
    expect(weeks).toHaveLength(6);
    expect(iso(weeks, 0, 0)).toBe("2024-02-25");
    expect(iso(weeks, 5, 6)).toBe("2024-04-06");
  });

  it("gives April 2024 FIVE rows, not a fixed six", () => {
    // The rule the hand-written `Calendar` does not follow: `monthGrid` always
    // returns 42 cells, and a sixth row here would be a whole week of May that
    // Ark does not render.
    const weeks = datePickerWeeks({ year: 2024, month: 3, day: 1 });
    expect(weeks).toHaveLength(5);
    expect(iso(weeks, 0, 0)).toBe("2024-03-31");
    expect(iso(weeks, 4, 6)).toBe("2024-05-04");
  });

  it("gives a whole-week month exactly four rows", () => {
    // February 2009 began on a Sunday and had 28 days, so it needs no padding at
    // either end — the shortest grid the component can render.
    const weeks = datePickerWeeks({ year: 2009, month: 1, day: 1 });
    expect(weeks).toHaveLength(4);
    expect(iso(weeks, 0, 0)).toBe("2009-02-01");
    expect(iso(weeks, 3, 6)).toBe("2009-02-28");
  });

  it("follows weekStartsOn", () => {
    const weeks = datePickerWeeks({ year: 2024, month: 2, day: 1 }, 1);
    expect(iso(weeks, 0, 0)).toBe("2024-02-26");
  });

  it("always fills every row to seven cells", () => {
    for (const month of [0, 1, 2, 3, 8, 11]) {
      for (const week of datePickerWeeks({ year: 2024, month, day: 1 })) {
        expect(week).toHaveLength(7);
      }
    }
  });
});

describe("shiftMonths", () => {
  it("keeps the day of the month, unlike the Calendar's addMonths", () => {
    // Paging from the 15th shows the 15th. `addMonths` from @ui-organized/core
    // lands on the first, which is right for `Calendar` and wrong here.
    expect(shiftMonths({ year: 2024, month: 2, day: 15 }, 1)).toEqual({
      year: 2024,
      month: 3,
      day: 15,
    });
    expect(shiftMonths({ year: 2024, month: 2, day: 15 }, -1)).toEqual({
      year: 2024,
      month: 1,
      day: 15,
    });
  });

  it("clamps a day the target month does not have", () => {
    // March 31st forward is April 30th, not May 1st — which is what a naive
    // `new Date(y, m + 1, d)` would roll over to.
    expect(shiftMonths({ year: 2024, month: 2, day: 31 }, 1)).toEqual({
      year: 2024,
      month: 3,
      day: 30,
    });
    expect(shiftMonths({ year: 2023, month: 0, day: 31 }, 1)).toEqual({
      year: 2023,
      month: 1,
      day: 28,
    });
  });

  it("crosses a year boundary", () => {
    expect(shiftMonths({ year: 2024, month: 11, day: 15 }, 1)).toEqual({
      year: 2025,
      month: 0,
      day: 15,
    });
  });
});
