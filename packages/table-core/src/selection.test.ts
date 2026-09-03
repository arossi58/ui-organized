import { describe, expect, it } from "vitest";
import {
  EMPTY_SELECTION,
  clearSelection,
  headerCheckboxState,
  isSelected,
  rangeSelect,
  selectAllMatching,
  selectPage,
  selectedIds,
  selectionCount,
  toBulkSelection,
} from "./selection.js";

const ids = ["a", "b", "c", "d", "e"];

describe("rangeSelect", () => {
  it("selects a single row and sets the anchor", () => {
    const state = rangeSelect(EMPTY_SELECTION, ids, "b", false, true);
    expect(selectedIds(state)).toEqual(["b"]);
    expect(state.anchor).toBe("b");
  });

  it("extends from the anchor on shift, inclusive at both ends", () => {
    const first = rangeSelect(EMPTY_SELECTION, ids, "b", false, true);
    const range = rangeSelect(first, ids, "d", true, true);
    expect(selectedIds(range).sort()).toEqual(["b", "c", "d"]);
  });

  it("extends backwards too", () => {
    const first = rangeSelect(EMPTY_SELECTION, ids, "d", false, true);
    const range = rangeSelect(first, ids, "b", true, true);
    expect(selectedIds(range).sort()).toEqual(["b", "c", "d"]);
  });

  it("keeps the anchor so a second shift-click re-scopes the range", () => {
    const first = rangeSelect(EMPTY_SELECTION, ids, "b", false, true);
    const wide = rangeSelect(first, ids, "e", true, true);
    expect(wide.anchor).toBe("b");
    const narrowed = rangeSelect(wide, ids, "d", true, false);
    expect(selectedIds(narrowed)).toEqual(["e"]);
  });

  it("falls back to a single toggle when there is no anchor", () => {
    const state = rangeSelect(EMPTY_SELECTION, ids, "c", true, true);
    expect(selectedIds(state)).toEqual(["c"]);
  });

  it("follows rendered order, so a range after sorting is what the user sees", () => {
    const sorted = ["e", "d", "c", "b", "a"];
    const first = rangeSelect(EMPTY_SELECTION, sorted, "e", false, true);
    const range = rangeSelect(first, sorted, "c", true, true);
    expect(selectedIds(range).sort()).toEqual(["c", "d", "e"]);
  });
});

describe("select-all-matching", () => {
  it("counts every matching row without holding its ids", () => {
    const all = selectAllMatching(EMPTY_SELECTION);
    expect(selectionCount(all, 40_000)).toBe(40_000);
    expect(isSelected(all, "a-row-nobody-loaded")).toBe(true);
  });

  it("deselecting a row while all-matching is on excludes it", () => {
    const all = selectAllMatching(EMPTY_SELECTION);
    const minusB = rangeSelect(all, ids, "b", false, false);
    expect(isSelected(minusB, "b")).toBe(false);
    expect(isSelected(minusB, "c")).toBe(true);
    expect(selectionCount(minusB, 40_000)).toBe(39_999);
  });

  it("reports itself to a bulk action as an instruction, not an enumeration", () => {
    const all = selectAllMatching(EMPTY_SELECTION);
    const minusB = rangeSelect(all, ids, "b", false, false);
    expect(toBulkSelection(minusB)).toEqual({ mode: "all-matching", excluded: ["b"] });
    expect(toBulkSelection(rangeSelect(EMPTY_SELECTION, ids, "a", false, true))).toEqual({
      mode: "ids",
      ids: ["a"],
    });
  });
});

describe("header checkbox", () => {
  it("is mixed when only some rows on the page are selected", () => {
    const some = rangeSelect(EMPTY_SELECTION, ids, "b", false, true);
    expect(headerCheckboxState(some, ids)).toEqual({ checked: false, indeterminate: true });
  });

  it("is checked when the whole page is selected", () => {
    const all = selectPage(EMPTY_SELECTION, ids, true);
    expect(headerCheckboxState(all, ids)).toEqual({ checked: true, indeterminate: false });
  });

  it("is unchecked, not mixed, for an empty page", () => {
    expect(headerCheckboxState(EMPTY_SELECTION, [])).toEqual({
      checked: false,
      indeterminate: false,
    });
  });

  it("clearing the page also drops all-matching", () => {
    const all = selectAllMatching(EMPTY_SELECTION);
    const cleared = selectPage(all, ids, false);
    expect(cleared.allMatching).toBe(false);
    expect(selectionCount(cleared, 40_000)).toBe(0);
  });
});

describe("clearSelection", () => {
  it("empties everything but keeps the anchor for the next range", () => {
    const state = rangeSelect(EMPTY_SELECTION, ids, "c", false, true);
    const cleared = clearSelection(state);
    expect(selectedIds(cleared)).toEqual([]);
    expect(cleared.allMatching).toBe(false);
    expect(cleared.anchor).toBe("c");
  });
});

/**
 * The 100,000-row table used to hang the browser on one click of the header
 * checkbox.
 *
 * The cause was not rendering: `selectPage` copied the whole selection object
 * once per row, so N rows meant N copies of an object growing towards N. Twenty
 * thousand rows took 32 seconds; a hundred thousand took long enough that the
 * browser reported a crashed tab.
 *
 * A timing assertion is a blunt instrument, but the failure it guards is
 * quadratic — the gap between the two implementations at this size is four
 * orders of magnitude, so the threshold can be loose enough never to flake and
 * still catch a regression the moment it lands.
 */
describe("large selections stay linear", () => {
  const many = Array.from({ length: 50_000 }, (_, i) => `r${i}`);

  it("selects fifty thousand rows in one pass", () => {
    const started = performance.now();
    const state = selectPage(EMPTY_SELECTION, many, true);
    const elapsed = performance.now() - started;

    expect(selectedIds(state)).toHaveLength(many.length);
    // The quadratic version needed minutes for this.
    expect(elapsed).toBeLessThan(1_000);
  });

  it("clears them again in one pass", () => {
    const selected = selectPage(EMPTY_SELECTION, many, true);
    const started = performance.now();
    const cleared = selectPage(selected, many, false);
    expect(performance.now() - started).toBeLessThan(1_000);
    expect(selectedIds(cleared)).toHaveLength(0);
  });

  it("shift-selects a range across the whole list in one pass", () => {
    const anchored = rangeSelect(EMPTY_SELECTION, many, "r0", false, true);
    const started = performance.now();
    const range = rangeSelect(anchored, many, `r${many.length - 1}`, true, true);
    expect(performance.now() - started).toBeLessThan(1_000);
    expect(selectedIds(range)).toHaveLength(many.length);
  });

  it("excludes in one pass when everything matching is selected", () => {
    const all = selectAllMatching(EMPTY_SELECTION);
    const started = performance.now();
    const next = selectPage(all, many, false);
    expect(performance.now() - started).toBeLessThan(1_000);
    // Deselecting under `allMatching` excludes rather than removing, and
    // clearing the header checkbox drops out of `allMatching` entirely.
    expect(next.allMatching).toBe(false);
  });
});
