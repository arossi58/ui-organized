import { describe, expect, it } from "vitest";
import { resolveDatePreset, presetWithin, toISODate, type YMDRange } from "./dateUtils.js";

/** Wednesday 2026-11-25, so every relative preset has a fixed answer. */
const TODAY = { year: 2026, month: 10, day: 25 };
const iso = (r: YMDRange | null) => (r ? `${toISODate(r.start)}..${toISODate(r.end)}` : null);

describe("resolveDatePreset", () => {
  it.each([
    ["today", "2026-11-25..2026-11-25"],
    ["yesterday", "2026-11-24..2026-11-24"],
    ["last7Days", "2026-11-19..2026-11-25"],
    ["last30Days", "2026-10-27..2026-11-25"],
    ["thisWeek", "2026-11-22..2026-11-28"],
    ["lastWeek", "2026-11-15..2026-11-21"],
    ["thisMonth", "2026-11-01..2026-11-30"],
    ["lastMonth", "2026-10-01..2026-10-31"],
    ["thisQuarter", "2026-10-01..2026-12-31"],
    ["lastQuarter", "2026-07-01..2026-09-30"],
    ["thisYear", "2026-01-01..2026-12-31"],
    ["lastYear", "2025-01-01..2025-12-31"],
  ] as const)("resolves %s", (name, expected) => {
    expect(iso(resolveDatePreset(name, TODAY))).toBe(expected);
  });

  it("starts the week on the day it is told to", () => {
    expect(iso(resolveDatePreset("thisWeek", TODAY, 1))).toBe("2026-11-23..2026-11-29");
  });

  it("crosses a year boundary for last month and last quarter in January", () => {
    const jan = { year: 2027, month: 0, day: 10 };
    expect(iso(resolveDatePreset("lastMonth", jan))).toBe("2026-12-01..2026-12-31");
    expect(iso(resolveDatePreset("lastQuarter", jan))).toBe("2026-10-01..2026-12-31");
  });

  it("reads an ISO date as a one-day range and orders an ISO range", () => {
    expect(iso(resolveDatePreset("2026-02-14", TODAY))).toBe("2026-02-14..2026-02-14");
    expect(iso(resolveDatePreset({ start: "2026-03-09", end: "2026-03-01" }, TODAY))).toBe("2026-03-01..2026-03-09");
  });

  it("returns null for a value it cannot read", () => {
    expect(resolveDatePreset("next tuesday" as never, TODAY)).toBeNull();
    expect(resolveDatePreset({ start: "", end: "2026-01-01" }, TODAY)).toBeNull();
  });
});

describe("presetWithin", () => {
  it("is false when either end falls outside the window", () => {
    const r = resolveDatePreset("thisMonth", TODAY)!;
    expect(presetWithin(r, { year: 2026, month: 10, day: 1 }, null)).toBe(true);
    expect(presetWithin(r, { year: 2026, month: 10, day: 2 }, null)).toBe(false);
    expect(presetWithin(r, null, { year: 2026, month: 10, day: 29 })).toBe(false);
  });
});
