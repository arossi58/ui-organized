import { describe, expect, it } from "vitest";
import { DEFAULT_CATALOGUE } from "./operators.js";
import { describeCondition, filterAnnouncement, filterSummary } from "./describe.js";
import type { TableFilterCondition, TableFilterType } from "./types.js";

const ctx = (type: TableFilterType, extra: Record<string, unknown> = {}) => ({
  type,
  columnLabel: "Team",
  catalogue: DEFAULT_CATALOGUE,
  ...extra,
});

const cond = (
  operator: string,
  values: TableFilterCondition["values"],
  unit?: TableFilterCondition["unit"],
): TableFilterCondition => ({ id: "f1", columnId: "team", operator, values, unit });

describe("describeCondition", () => {
  it("splits into three parts and joins them for the accessible name", () => {
    const d = describeCondition(cond("contains", ["plat"]), ctx("text"));
    expect(d).toMatchObject({ field: "Team", relative: "contains", value: "plat" });
    expect(d.text).toBe("Team contains plat");
  });

  it("uses the per-type operator label", () => {
    // The same comparison reads differently on a date than on a number.
    expect(describeCondition(cond("lt", [5]), ctx("number")).relative).toBe("is less than");
    expect(describeCondition(cond("lt", ["2024-01-01"]), ctx("date")).relative).toBe("is before");
  });

  it("prefers an enum option's label over its raw value", () => {
    const d = describeCondition(
      cond("is-any-of", ["plat"]),
      ctx("enum", { options: [{ value: "plat", label: "Platform" }] }),
    );
    expect(d.value).toBe("Platform");
  });

  it("falls back to the raw value when no option matches", () => {
    const d = describeCondition(cond("is-any-of", ["ghost"]), ctx("enum", { options: [] }));
    expect(d.value).toBe("ghost");
  });

  it("truncates a long set and reports how many are hidden", () => {
    const d = describeCondition(cond("is-any-of", ["a", "b", "c", "d"]), ctx("enum"));
    expect(d.value).toBe("a, b +2");
    expect(d.overflowCount).toBe(2);
  });

  it("renders a range with an en dash", () => {
    expect(describeCondition(cond("between", [3, 7]), ctx("number")).value).toBe("3 – 7");
  });

  it("pluralizes a relative date and puts the unit with the number", () => {
    expect(describeCondition(cond("in-last", [7], "day"), ctx("date")).value).toBe("7 days");
    expect(describeCondition(cond("in-last", [1], "day"), ctx("date")).value).toBe("1 day");
    expect(describeCondition(cond("in-last", [3], "month"), ctx("date")).value).toBe("3 months");
  });

  it("renders booleans as words", () => {
    expect(describeCondition(cond("is", [true]), ctx("boolean")).value).toBe("Yes");
    expect(describeCondition(cond("is", [false]), ctx("boolean")).value).toBe("No");
  });

  it("says nothing for an operator that takes nothing", () => {
    const d = describeCondition(cond("is-empty", []), ctx("text"));
    expect(d.value).toBe("");
    expect(d.text).toBe("Team is empty");
    expect(d.complete).toBe(true);
  });

  it("marks an unfilled condition incomplete and shows a placeholder", () => {
    const d = describeCondition(cond("contains", []), ctx("text"));
    expect(d.complete).toBe(false);
    expect(d.value).toBe("…");
  });

  it("hands over to formatValue when one is supplied", () => {
    const d = describeCondition(
      cond("is", [1700000000]),
      ctx("number", { formatValue: () => "a while ago" }),
    );
    expect(d.value).toBe("a while ago");
  });
});

describe("announcements", () => {
  it("names the change and the resulting count in one sentence", () => {
    expect(
      filterAnnouncement({ kind: "removed", description: "Team is any of Platform" }, 480),
    ).toBe("Filter removed: Team is any of Platform. 480 results.");
    expect(filterAnnouncement({ kind: "cleared" }, 512)).toBe("All filters cleared. 512 results.");
  });

  it("counts in the singular where it should", () => {
    expect(filterAnnouncement({ kind: "added", description: "X" }, 1)).toContain("1 result.");
    expect(filterSummary(1)).toBe("1 filter");
    expect(filterSummary(3)).toBe("3 filters");
    expect(filterSummary(0)).toBe("No filters");
  });
});

/**
 * The six operators Figma draws a glyph for, and the thirteen it does not.
 *
 * Pinned as a list rather than asserted one at a time, because the failure this
 * guards against is an operator quietly *gaining* or *losing* a glyph in a
 * refactor — and a chip that silently swaps a drawn relation for a written one
 * still renders perfectly.
 */
describe("comparison glyphs", () => {
  it("draws exactly the six the design system has icons for", () => {
    const withIcons = DEFAULT_CATALOGUE.all()
      .filter((operator) => operator.icon)
      .map((operator) => [operator.id, operator.icon]);

    expect(withIcons).toEqual([
      ["is", "equals"],
      ["is-any-of", "is-any-of"],
      ["contains", "contains"],
      ["not-contains", "does-not-contain"],
      ["starts-with", "starts-with"],
      ["ends-with", "ends-with"],
    ]);
  });

  it("keeps the words as the glyph's accessible name", () => {
    const description = describeCondition(
      { id: "f1", columnId: "name", operator: "contains", values: ["ada"] },
      { type: "text", columnLabel: "Name", catalogue: DEFAULT_CATALOGUE },
    );
    expect(description.icon).toBe("contains");
    // The chip draws the glyph, but `relative` still carries the relation — and
    // `text` is what the editor dialog and the live region are named from.
    expect(description.relative).toBe("contains");
    expect(description.text).toBe("Name contains ada");
  });

  it("leaves an operator with no glyph to its words", () => {
    const description = describeCondition(
      { id: "f1", columnId: "joined", operator: "in-last", values: [7], unit: "day" },
      { type: "date", columnLabel: "Joined", catalogue: DEFAULT_CATALOGUE },
    );
    expect(description.icon).toBeUndefined();
    expect(description.relative).toBe("is in the last");
  });
});
