import { describe, expect, it } from "vitest";
import { createOperatorCatalogue, isEmptyCell, toIsoDay, toNumber } from "./operators.js";
import {
  compileConditions,
  createColumnFilterFn,
  evaluateCondition,
  isConditionComplete,
  resolveRelativeDates,
} from "./predicate.js";
import type { TableFilterCondition, TableFilterOperator, TableFilterType } from "./types.js";

/** A condition, with only the parts a predicate test cares about spelled out. */
const cond = (
  operator: TableFilterOperator,
  values: TableFilterCondition["values"] = [],
  unit?: TableFilterCondition["unit"],
): TableFilterCondition => ({ id: "c1", columnId: "col", operator, values, unit });

const check = (
  operator: TableFilterOperator,
  values: TableFilterCondition["values"],
  cell: unknown,
  type: TableFilterType,
  now = 0,
  unit?: TableFilterCondition["unit"],
) => evaluateCondition(cond(operator, values, unit), cell, { type, now });

// ─── Empty cells ─────────────────────────────────────────────────────────────

describe("empty cells", () => {
  it("treats nullish, blank and NaN as empty — and nothing else", () => {
    for (const value of [null, undefined, "", Number.NaN]) {
      expect(isEmptyCell(value), String(value)).toBe(true);
    }
    for (const value of [0, false, " ", "0", []]) {
      expect(isEmptyCell(value), String(value)).toBe(false);
    }
  });

  it("excludes empty cells from every positive operator", () => {
    for (const operator of ["is", "contains", "starts-with", "gt", "lt", "between", "is-any-of"]) {
      expect(check(operator, ["x", "y"], null, "text"), operator).toBe(false);
    }
  });

  /**
   * The decision that most often surprises: "status is not active" includes
   * rows with no status at all. SQL would say otherwise; every table product
   * users have met says this.
   */
  it("includes empty cells in the negative operators", () => {
    expect(check("is-not", ["active"], null, "text")).toBe(true);
    expect(check("not-contains", ["act"], null, "text")).toBe(true);
    expect(check("is-none-of", ["a", "b"], undefined, "enum")).toBe(true);
    expect(check("not-between", [1, 5], null, "number")).toBe(true);
  });

  it("is-empty and is-not-empty are exact complements", () => {
    for (const value of [null, undefined, "", Number.NaN, "x", 0, false]) {
      const empty = check("is-empty", [], value, "text");
      const notEmpty = check("is-not-empty", [], value, "text");
      expect(empty, String(value)).toBe(!notEmpty);
    }
  });
});

// ─── Text ────────────────────────────────────────────────────────────────────

describe("text operators", () => {
  it("compares case-insensitively", () => {
    expect(check("contains", ["ADA"], "Ada Lovelace", "text")).toBe(true);
    expect(check("is", ["ada lovelace"], "Ada Lovelace", "text")).toBe(true);
    expect(check("starts-with", ["aDa"], "Ada Lovelace", "text")).toBe(true);
    expect(check("ends-with", ["LACE"], "Ada Lovelace", "text")).toBe(true);
  });

  it("does not match what it should not", () => {
    expect(check("contains", ["turing"], "Ada Lovelace", "text")).toBe(false);
    expect(check("is", ["ada"], "Ada Lovelace", "text")).toBe(false);
    expect(check("ends-with", ["ada"], "Ada Lovelace", "text")).toBe(false);
  });

  it("compares a text column as text, even when it holds digits", () => {
    // Correct given the declared type, and the reason inference matters.
    expect(check("gt", ["10"], "9", "number")).toBe(false);
    expect(check("is", ["9"], 9, "number")).toBe(true);
  });
});

// ─── Numbers ─────────────────────────────────────────────────────────────────

describe("number operators", () => {
  it("coerces numeric strings on both sides", () => {
    expect(check("gt", ["5"], "12", "number")).toBe(true);
    expect(check("lt", [5], 3, "number")).toBe(true);
  });

  it("does not read a blank string as zero", () => {
    // `Number("")` is 0, so the trim guard is the only thing between a blank
    // operand and a filter that silently means "greater than nothing".
    expect(toNumber("")).toBeNaN();
    expect(toNumber("   ")).toBeNaN();
    expect(toNumber("12px")).toBeNaN();
  });

  it("treats an unparseable cell as empty rather than as a match", () => {
    expect(check("gt", [5], "12px", "number")).toBe(false);
    expect(check("lt", [5], "12px", "number")).toBe(false);
  });

  it("is inclusive at both ends of between", () => {
    expect(check("between", [3, 7], 3, "number")).toBe(true);
    expect(check("between", [3, 7], 7, "number")).toBe(true);
    expect(check("between", [3, 7], 2, "number")).toBe(false);
    expect(check("between", [3, 7], 8, "number")).toBe(false);
  });

  it("tolerates a reversed range instead of matching nothing", () => {
    expect(check("between", [7, 3], 5, "number")).toBe(true);
  });

  it("distinguishes gt from gte", () => {
    expect(check("gt", [5], 5, "number")).toBe(false);
    expect(check("gte", [5], 5, "number")).toBe(true);
    expect(check("lt", [5], 5, "number")).toBe(false);
    expect(check("lte", [5], 5, "number")).toBe(true);
  });
});

// ─── Dates ───────────────────────────────────────────────────────────────────

describe("date operators", () => {
  it("compares ISO days as strings, with no Date construction", () => {
    expect(check("lt", ["2024-06-01"], "2024-01-15", "date")).toBe(true);
    expect(check("gt", ["2024-06-01"], "2024-07-15", "date")).toBe(true);
    expect(check("between", ["2024-01-01", "2024-12-31"], "2024-06-15", "date")).toBe(true);
  });

  it("ignores a time component on an ISO datetime", () => {
    expect(check("is", ["2024-06-15"], "2024-06-15T23:59:59Z", "date")).toBe(true);
  });

  /**
   * A Date is reduced by its LOCAL parts. Both cases below straddle midnight in
   * one direction each, so a `toISOString()` implementation fails one of them
   * in every timezone except UTC — no TZ manipulation needed to catch it.
   */
  it("reads a Date as the local calendar day it denotes", () => {
    expect(toIsoDay(new Date(2024, 0, 15, 23, 30))).toBe("2024-01-15");
    expect(toIsoDay(new Date(2024, 0, 15, 0, 30))).toBe("2024-01-15");
    expect(check("is", ["2024-01-15"], new Date(2024, 0, 15, 23, 30), "date")).toBe(true);
  });

  it("rejects a string that is not an ISO date rather than comparing garbage", () => {
    // The old filter sliced this to "March 3, " and compared it against ISO
    // bounds, returning wrong rows in silence.
    expect(toIsoDay("March 3, 2024")).toBeNull();
    expect(check("between", ["2024-01-01", "2024-12-31"], "March 3, 2024", "date")).toBe(false);
  });

  it("rejects an invalid Date", () => {
    expect(toIsoDay(new Date("nonsense"))).toBeNull();
  });
});

// ─── Relative dates ──────────────────────────────────────────────────────────

describe("relative dates", () => {
  // Fixed clock: 15 January 2024, local noon.
  const NOW = new Date(2024, 0, 15, 12, 0).getTime();

  it("spans today and the days before it, inclusive at both ends", () => {
    const inLast7 = (day: string) => check("in-last", [7], day, "date", NOW);
    expect(inLast7("2024-01-15"), "today").toBe(true);
    expect(inLast7("2024-01-09"), "the seventh day back").toBe(true);
    expect(inLast7("2024-01-08"), "the eighth day back").toBe(false);
    expect(inLast7("2024-01-16"), "tomorrow").toBe(false);
  });

  it("spans forwards for in-next", () => {
    const inNext3 = (day: string) => check("in-next", [3], day, "date", NOW);
    expect(inNext3("2024-01-15")).toBe(true);
    expect(inNext3("2024-01-17")).toBe(true);
    expect(inNext3("2024-01-18")).toBe(false);
  });

  it("understands units", () => {
    expect(check("in-last", [1], "2024-01-09", "date", NOW)).toBe(false);
    expect(check("in-last", [1], "2024-01-09", "date", NOW, "week")).toBe(true);
  });

  it("matches only today for is-today", () => {
    expect(check("is-today", [], "2024-01-15", "date", NOW)).toBe(true);
    expect(check("is-today", [], "2024-01-14", "date", NOW)).toBe(false);
  });

  it("reads the clock exactly once per filter pass, not once per row", () => {
    let reads = 0;
    const filterFn = createColumnFilterFn(createOperatorCatalogue(), "date", () => {
      reads += 1;
      return NOW;
    });
    filterFn.resolveFilterValue?.([
      cond("in-last", [7]),
      cond("in-next", [3]),
      cond("is-today", []),
    ]);
    expect(reads).toBe(1);
  });
});

// ─── Sets, booleans, completeness ────────────────────────────────────────────

describe("set operators", () => {
  it("matches any member, and none of them for the negative", () => {
    expect(check("is-any-of", ["admin", "owner"], "Owner", "enum")).toBe(true);
    expect(check("is-any-of", ["admin", "owner"], "Engineer", "enum")).toBe(false);
    expect(check("is-none-of", ["admin", "owner"], "Engineer", "enum")).toBe(true);
    expect(check("is-none-of", ["admin", "owner"], "Owner", "enum")).toBe(false);
  });
});

describe("booleans", () => {
  it("matches either state, and does not confuse false with absent", () => {
    expect(check("is", [true], true, "boolean")).toBe(true);
    expect(check("is", [false], false, "boolean")).toBe(true);
    expect(check("is", [true], false, "boolean")).toBe(false);
    // `false` is a value, not an empty cell.
    expect(check("is-empty", [], false, "boolean")).toBe(false);
  });
});

describe("completeness", () => {
  const catalogue = createOperatorCatalogue();

  it("requires an operand before a condition may filter", () => {
    expect(isConditionComplete(cond("contains", []), catalogue)).toBe(false);
    expect(isConditionComplete(cond("contains", [""]), catalogue)).toBe(false);
    expect(isConditionComplete(cond("contains", ["ada"]), catalogue)).toBe(true);
  });

  it("requires both ends of a two-operand operator", () => {
    expect(isConditionComplete(cond("between", [3]), catalogue)).toBe(false);
    expect(isConditionComplete(cond("between", [3, null]), catalogue)).toBe(false);
    expect(isConditionComplete(cond("between", [3, 7]), catalogue)).toBe(true);
  });

  it("needs nothing for a zero-operand operator", () => {
    expect(isConditionComplete(cond("is-empty", []), catalogue)).toBe(true);
  });

  it("needs at least one member for a set operator", () => {
    expect(isConditionComplete(cond("is-any-of", []), catalogue)).toBe(false);
    expect(isConditionComplete(cond("is-any-of", ["a"]), catalogue)).toBe(true);
  });

  it("an incomplete condition excludes no row", () => {
    expect(check("contains", [], "anything", "text")).toBe(true);
    expect(check("between", [3], 999, "number")).toBe(true);
  });

  it("drops incomplete and unknown conditions at compile time", () => {
    const compiled = compileConditions(
      [cond("contains", ["ada"]), cond("contains", []), cond("no-such-operator", ["x"])],
      catalogue,
      { now: 0, type: "text" },
    );
    expect(compiled).toHaveLength(1);
  });
});

// ─── The filter function ─────────────────────────────────────────────────────

describe("createColumnFilterFn", () => {
  const catalogue = createOperatorCatalogue();
  const row = (value: unknown) => ({ getValue: () => value }) as never;

  it("ANDs every condition on the column", () => {
    const filterFn = createColumnFilterFn(catalogue, "date", () => 0);
    const prepared = filterFn.resolveFilterValue?.([
      cond("gt", ["2024-01-01"]),
      cond("lt", ["2024-06-01"]),
    ]);
    expect(filterFn(row("2024-03-01"), "col", prepared, () => {})).toBe(true);
    expect(filterFn(row("2023-12-01"), "col", prepared, () => {})).toBe(false);
    expect(filterFn(row("2024-09-01"), "col", prepared, () => {})).toBe(false);
  });

  it("auto-removes an empty condition list, so the column stops reading as filtered", () => {
    const filterFn = createColumnFilterFn(catalogue, "text", () => 0);
    expect(filterFn.autoRemove?.([])).toBe(true);
    expect(filterFn.autoRemove?.(undefined)).toBe(true);
    expect(filterFn.autoRemove?.([cond("contains", ["a"])])).toBe(false);
  });
});

describe("resolveRelativeDates", () => {
  const NOW = new Date(2024, 0, 15, 12, 0).getTime();

  it("pins a relative range to concrete dates for a server to consume", () => {
    const [resolved] = resolveRelativeDates([cond("in-last", [7], "day")], NOW);
    expect(resolved).toMatchObject({
      operator: "between",
      values: ["2024-01-09", "2024-01-15"],
    });
    // The unit was folded into the dates; carrying it further would be a lie.
    expect(resolved).not.toHaveProperty("unit");
  });

  it("leaves everything else exactly as it was", () => {
    const conditions = [cond("contains", ["ada"]), cond("between", [1, 5])];
    expect(resolveRelativeDates(conditions, NOW)).toEqual(conditions);
  });
});
