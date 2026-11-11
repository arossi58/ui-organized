import { describe, expect, it } from "vitest";
import { gridKeyDown } from "./keyboard.js";
import {
  canStepColumn,
  currentColumnOrder,
  dropColumn,
  dropSideAt,
  isMovableColumn,
  reorderModeOf,
  stepColumn,
} from "./reorder.js";
import { SELECTION_COLUMN_ID } from "./columns.js";

const SEL = SELECTION_COLUMN_ID;
const order = [SEL, "name", "email", "hidden", "role", "pinned"];
const hidden = new Set(["hidden"]);
const pinned = new Set(["pinned"]);
const movable = (id: string) => isMovableColumn(id, pinned.has(id)) && !hidden.has(id);

describe("reorderModeOf", () => {
  it("reads true and always as always, toggle as toggle, the rest as off", () => {
    expect(reorderModeOf(true)).toBe("always");
    expect(reorderModeOf("always")).toBe("always");
    expect(reorderModeOf("toggle")).toBe("toggle");
    expect(reorderModeOf(false)).toBe("off");
    expect(reorderModeOf(undefined)).toBe("off");
  });
});

describe("currentColumnOrder", () => {
  it("starts from definition order, and keeps columns added since", () => {
    expect(currentColumnOrder([], ["a", "b"])).toEqual(["a", "b"]);
    expect(currentColumnOrder(["b", "gone", "a"], ["a", "b", "c"])).toEqual(["b", "a", "c"]);
  });
});

describe("stepColumn", () => {
  it("trades places with the nearest movable neighbour, skipping hidden ones", () => {
    expect(stepColumn(order, "email", 1, movable)).toEqual([SEL, "name", "hidden", "role", "email", "pinned"]);
    expect(stepColumn(order, "email", -1, movable)).toEqual([SEL, "email", "name", "hidden", "role", "pinned"]);
  });

  it("never passes the table's own columns or a pinned one", () => {
    expect(canStepColumn(order, "name", -1, movable)).toBe(false);
    expect(canStepColumn(order, "role", 1, movable)).toBe(false);
    expect(stepColumn(order, "name", -1, movable)).toEqual(order);
  });

  it("refuses to move a column that is not movable itself", () => {
    expect(canStepColumn(order, SEL, 1, movable)).toBe(false);
    expect(canStepColumn(order, "pinned", -1, movable)).toBe(false);
  });
});

describe("dropColumn", () => {
  it("lands before or after the target", () => {
    expect(dropColumn(["a", "b", "c", "d"], "a", "c", "before")).toEqual(["b", "a", "c", "d"]);
    expect(dropColumn(["a", "b", "c", "d"], "a", "c", "after")).toEqual(["b", "c", "a", "d"]);
    expect(dropColumn(["a", "b", "c", "d"], "d", "a", "before")).toEqual(["d", "a", "b", "c"]);
  });

  it("is a no-op onto itself or an unknown column", () => {
    expect(dropColumn(["a", "b"], "a", "a", "after")).toEqual(["a", "b"]);
    expect(dropColumn(["a", "b"], "a", "zz", "after")).toEqual(["a", "b"]);
  });
});

describe("dropSideAt", () => {
  it("splits the target down the middle", () => {
    expect(dropSideAt(110, { left: 100, width: 100 })).toBe("before");
    expect(dropSideAt(160, { left: 100, width: 100 })).toBe("after");
  });
});

describe("Alt+Arrow on a header", () => {
  const state = { cursor: { row: -1, col: 2 }, rowCount: 5, colCount: 4, pageRows: 3, editing: false };

  it("moves the column when the header's column can move", () => {
    expect(gridKeyDown({ ...state, reorderable: true }, { key: "ArrowLeft", alt: true })).toEqual({
      type: "move-column",
      direction: -1,
    });
    expect(gridKeyDown({ ...state, reorderable: true }, { key: "ArrowRight", alt: true })).toEqual({
      type: "move-column",
      direction: 1,
    });
  });

  it("moves the cursor as before otherwise", () => {
    expect(gridKeyDown(state, { key: "ArrowLeft", alt: true }).type).toBe("move");
    expect(gridKeyDown({ ...state, reorderable: true }, { key: "ArrowLeft" }).type).toBe("move");
    expect(
      gridKeyDown({ ...state, cursor: { row: 1, col: 2 }, reorderable: true }, { key: "ArrowLeft", alt: true }).type,
    ).toBe("move");
  });
});
