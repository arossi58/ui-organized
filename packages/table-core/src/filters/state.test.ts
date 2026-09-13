import { describe, expect, it } from "vitest";
import {
  INITIAL_FILTER_STATE,
  coerceValues,
  conditionsForColumn,
  filterReducer,
  fromColumnFilters,
  toColumnFilters,
  type TableFilterState,
} from "./state.js";
import { DEFAULT_CATALOGUE } from "./operators.js";

const reduce = (state: TableFilterState, ...actions: Parameters<typeof filterReducer>[1][]) =>
  actions.reduce(filterReducer, state);

describe("adding conditions", () => {
  it("appends, and gives each one a deterministic id", () => {
    const state = reduce(
      INITIAL_FILTER_STATE,
      { type: "add", columnId: "role", operator: "is-any-of" },
      { type: "add", columnId: "team", operator: "is-any-of" },
    );
    expect(state.conditions.map((c) => c.id)).toEqual(["f1", "f2"]);
  });

  /** The confirmed requirement: two chips on one column, independently removable. */
  it("allows several conditions on the same column", () => {
    const state = reduce(
      INITIAL_FILTER_STATE,
      { type: "add", columnId: "joined", operator: "gt", values: ["2024-01-01"] },
      { type: "add", columnId: "joined", operator: "lt", values: ["2024-06-01"] },
    );
    expect(conditionsForColumn(state.conditions, "joined")).toHaveLength(2);

    const afterRemove = filterReducer(state, { type: "remove", id: "f1" });
    expect(afterRemove.conditions).toHaveLength(1);
    expect(afterRemove.conditions[0]?.operator).toBe("lt");
  });

  it("replaces rather than appends when the column is declared single", () => {
    const state = reduce(
      INITIAL_FILTER_STATE,
      { type: "add", columnId: "role", operator: "is", values: ["admin"] },
      { type: "add", columnId: "role", operator: "is", values: ["owner"], single: true },
    );
    expect(state.conditions).toHaveLength(1);
    expect(state.conditions[0]?.values).toEqual(["owner"]);
  });
});

describe("changing an operator", () => {
  it("keeps what still fits when the arity shrinks", () => {
    expect(coerceValues([3, 7], "between", "gt", DEFAULT_CATALOGUE)).toEqual([3]);
  });

  it("pads when the arity grows, so the second field renders empty rather than absent", () => {
    expect(coerceValues([3], "gt", "between", DEFAULT_CATALOGUE)).toEqual([3, null]);
  });

  it("clears entirely for an operator that takes nothing", () => {
    expect(coerceValues([3, 7], "between", "is-empty", DEFAULT_CATALOGUE)).toEqual([]);
  });

  it("carries a single value into a set as its first member", () => {
    expect(coerceValues(["admin"], "is", "is-any-of", DEFAULT_CATALOGUE)).toEqual(["admin"]);
    expect(coerceValues([], "is", "is-any-of", DEFAULT_CATALOGUE)).toEqual([]);
  });

  it("coerces through the reducer, not just in isolation", () => {
    const state = reduce(INITIAL_FILTER_STATE, {
      type: "add",
      columnId: "seats",
      operator: "between",
      values: [3, 7],
    });
    const next = filterReducer(state, { type: "update", id: "f1", operator: "gte" });
    expect(next.conditions[0]).toMatchObject({ operator: "gte", values: [3] });
  });
});

describe("state identity", () => {
  /**
   * The row-model memo is keyed on the conditions array reference, so a no-op
   * that returns a fresh object re-filters the whole table for nothing.
   */
  it("returns the identical state for every no-op", () => {
    const state = reduce(INITIAL_FILTER_STATE, {
      type: "add",
      columnId: "role",
      operator: "is",
      values: ["admin"],
    });
    expect(filterReducer(state, { type: "remove", id: "nope" })).toBe(state);
    expect(filterReducer(state, { type: "clear-column", columnId: "nope" })).toBe(state);
    expect(filterReducer(state, { type: "update", id: "nope", values: ["x"] })).toBe(state);
    expect(filterReducer(state, { type: "set-expanded", expanded: false })).toBe(state);
    expect(filterReducer(INITIAL_FILTER_STATE, { type: "clear" })).toBe(INITIAL_FILTER_STATE);
    expect(filterReducer(state, { type: "replace", conditions: state.conditions })).toBe(state);
  });
});

describe("restore", () => {
  it("puts a condition back exactly as it was", () => {
    const state = reduce(INITIAL_FILTER_STATE, {
      type: "add",
      columnId: "name",
      operator: "contains",
      values: ["ada"],
    });
    const snapshot = state.conditions[0]!;
    const edited = filterReducer(state, { type: "update", id: "f1", values: ["turing"] });
    expect(edited.conditions[0]?.values).toEqual(["turing"]);

    const reverted = filterReducer(edited, { type: "restore", condition: snapshot });
    expect(reverted.conditions[0]).toEqual(snapshot);
  });
});

describe("TanStack interop", () => {
  const conditions = [
    { id: "f1", columnId: "joined", operator: "gt", values: ["2024-01-01"] },
    { id: "f2", columnId: "role", operator: "is-any-of", values: ["admin", "owner"] },
    { id: "f3", columnId: "joined", operator: "lt", values: ["2024-06-01"] },
  ];

  it("groups by column, keeping several conditions in one entry", () => {
    const entries = toColumnFilters(conditions);
    expect(entries.map((e) => e.id)).toEqual(["joined", "role"]);
    expect(entries[0]?.value).toHaveLength(2);
  });

  /** The identity round trip is the argument for this whole storage decision. */
  it("round-trips", () => {
    expect(fromColumnFilters(toColumnFilters(conditions))).toEqual([
      conditions[0],
      conditions[2],
      conditions[1],
    ]);
  });

  it("survives the escape hatch writing a filter value directly", () => {
    // `column.setFilterValue([...])` sets no columnId on the condition.
    const restored = fromColumnFilters([
      { id: "seats", value: [{ id: "x", operator: "gt", values: [3] }] },
    ]);
    expect(restored[0]).toMatchObject({ columnId: "seats", operator: "gt" });
  });

  it("ignores a filter value that is not a condition list", () => {
    expect(fromColumnFilters([{ id: "seats", value: "nonsense" }])).toEqual([]);
  });
});
