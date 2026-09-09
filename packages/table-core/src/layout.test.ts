import { describe, expect, it } from "vitest";
import { layoutColumns, type ColumnLayoutInput } from "./layout.js";

const cols = (...sizes: [string, number, ColumnLayoutInput["pinned"]?][]): ColumnLayoutInput[] =>
  sizes.map(([id, size, pinned]) => ({ id, size, pinned: pinned ?? false }));

describe("layoutColumns", () => {
  it("leaves the columns alone when they already overflow", () => {
    const layout = layoutColumns(cols(["a", 200], ["b", 200]), 300);
    expect(layout.widths).toEqual({ a: 200, b: 200 });
    expect(layout.totalWidth).toBe(400);
    expect(layout.stretchedColumnId).toBeNull();
  });

  it("gives the whole surplus to one column, not proportionally to all", () => {
    const layout = layoutColumns(cols(["a", 100], ["b", 100]), 500);
    expect(layout.widths).toEqual({ a: 100, b: 400 });
    expect(layout.totalWidth).toBe(500);
    expect(layout.stretchedColumnId).toBe("b");
  });

  it("never stretches a pinned column — its own sticky offset would move", () => {
    const layout = layoutColumns(cols(["a", 100], ["b", 100], ["z", 60, "right"]), 500);
    expect(layout.widths).toEqual({ a: 100, b: 340, z: 60 });
    expect(layout.stretchedColumnId).toBe("b");
  });

  it("does nothing at all when every column is pinned", () => {
    const layout = layoutColumns(cols(["a", 100, "left"], ["z", 60, "right"]), 500);
    expect(layout.widths).toEqual({ a: 100, z: 60 });
    expect(layout.totalWidth).toBe(160);
    expect(layout.stretchedColumnId).toBeNull();
  });

  it("does nothing before the container has been measured", () => {
    const layout = layoutColumns(cols(["a", 100], ["b", 100]), null);
    expect(layout.totalWidth).toBe(200);
    expect(layout.stretchedColumnId).toBeNull();
  });
});
