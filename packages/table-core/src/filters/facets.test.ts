import { describe, expect, it } from "vitest";
import { facetOptions, orderFilterableFields, searchOptions } from "./facets.js";

const facets = (entries: [string, number][]) => new Map<unknown, number>(entries);

describe("facetOptions", () => {
  it("carries the count through and marks what is selected", () => {
    const options = facetOptions(
      facets([
        ["admin", 5],
        ["owner", 2],
      ]),
      undefined,
      ["admin"],
    );
    expect(options).toEqual([
      { value: "admin", label: "admin", count: 5, disabled: false, selected: true },
      { value: "owner", label: "owner", count: 2, disabled: false, selected: false },
    ]);
  });

  it("sorts numeric values numerically, not as strings", () => {
    const options = facetOptions(
      facets([
        ["10", 1],
        ["2", 1],
        ["1", 1],
      ]),
      undefined,
      [],
    );
    expect(options.map((option) => option.value)).toEqual(["1", "2", "10"]);
  });

  it("disables a value that would match nothing", () => {
    const options = facetOptions(
      facets([
        ["a", 0],
        ["b", 3],
      ]),
      undefined,
      [],
    );
    expect(options.find((option) => option.value === "a")?.disabled).toBe(true);
  });

  /** Otherwise the user has no way to untick it. */
  it("never disables a value that is already selected", () => {
    const options = facetOptions(facets([["a", 0]]), undefined, ["a"]);
    expect(options[0]).toMatchObject({ disabled: false, selected: true });
  });

  /**
   * Facets reflect the other applied filters, so narrowing elsewhere can drop a
   * value the user has already chosen out of the facet map entirely.
   */
  it("keeps a selected value that the facets no longer contain", () => {
    const options = facetOptions(facets([["admin", 5]]), undefined, ["owner"]);
    expect(options.map((option) => option.value)).toEqual(["admin", "owner"]);
    expect(options[1]).toMatchObject({ selected: true, disabled: false });
  });

  it("lets a declared list own the order and the labels", () => {
    const options = facetOptions(
      facets([
        ["b", 1],
        ["a", 2],
      ]),
      [
        { value: "a", label: "Alpha" },
        { value: "b", label: "Beta" },
      ],
      [],
    );
    expect(options.map((option) => option.label)).toEqual(["Alpha", "Beta"]);
  });

  it("reports no counts and disables nothing when counting is off", () => {
    const options = facetOptions(undefined, [{ value: "a", label: "A" }], [], false);
    expect(options[0]).toMatchObject({ count: 0, disabled: false });
  });
});

describe("searchOptions", () => {
  const options = facetOptions(
    facets([
      ["platform", 1],
      ["growth", 2],
      ["design", 3],
    ]),
    undefined,
    [],
  );

  it("matches on the label, case-insensitively", () => {
    expect(searchOptions(options, "GRO").map((option) => option.value)).toEqual(["growth"]);
  });

  it("returns everything for an empty query, and caps a long list", () => {
    expect(searchOptions(options, "  ")).toHaveLength(3);
    expect(searchOptions(options, "", 2)).toHaveLength(2);
  });
});

describe("orderFilterableFields", () => {
  const field = (columnId: string, label: string, index: number, priority?: number) => ({
    columnId,
    label,
    index,
    priority,
  });

  it("puts declared priority first, then column order", () => {
    const ordered = orderFilterableFields([
      field("c", "Charlie", 0),
      field("a", "Alpha", 1, 1),
      field("b", "Bravo", 2),
    ]);
    expect(ordered.map((entry) => entry.columnId)).toEqual(["a", "c", "b"]);
  });

  it("switches to alphabetical once nobody could scan for meaning", () => {
    const many = Array.from({ length: 11 }, (_, i) =>
      field(`c${i}`, String.fromCharCode(122 - i), i),
    );
    expect(orderFilterableFields(many)[0]?.label).toBe("p");
  });
});
