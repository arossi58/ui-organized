import { describe, expect, it } from "vitest";
import { gridKeyDown, type GridState } from "./keyboard.js";

const base: GridState = {
  cursor: { row: 0, col: 0 },
  rowCount: 10,
  colCount: 4,
  pageRows: 5,
  editing: false,
  selectable: true,
  multiSelect: true,
};

const at = (row: number, col: number, extra: Partial<GridState> = {}): GridState => ({
  ...base,
  ...extra,
  cursor: { row, col },
});

describe("gridKeyDown", () => {
  it("moves with the arrow keys", () => {
    expect(gridKeyDown(at(2, 1), { key: "ArrowRight" })).toEqual({
      type: "move",
      cursor: { row: 2, col: 2 },
    });
    expect(gridKeyDown(at(2, 1), { key: "ArrowUp" })).toEqual({
      type: "move",
      cursor: { row: 1, col: 1 },
    });
  });

  it("clamps at the edges instead of wrapping", () => {
    expect(gridKeyDown(at(0, 3), { key: "ArrowRight" })).toEqual({
      type: "move",
      cursor: { row: 0, col: 3 },
    });
    expect(gridKeyDown(at(9, 0), { key: "ArrowDown" })).toEqual({
      type: "move",
      cursor: { row: 9, col: 0 },
    });
  });

  it("reaches the header row above the first body row", () => {
    expect(gridKeyDown(at(0, 2), { key: "ArrowUp" })).toEqual({
      type: "move",
      cursor: { row: -1, col: 2 },
    });
    // ...and no further.
    expect(gridKeyDown(at(-1, 2), { key: "ArrowUp" })).toEqual({
      type: "move",
      cursor: { row: -1, col: 2 },
    });
  });

  it("sorts rather than selects when the cursor is on the header", () => {
    expect(gridKeyDown(at(-1, 1), { key: "Enter" })).toEqual({ type: "activate" });
    expect(gridKeyDown(at(-1, 1), { key: " " })).toEqual({ type: "activate" });
  });

  it("extends a range with Shift+Arrow, but not out of the header", () => {
    expect(gridKeyDown(at(3, 0), { key: "ArrowDown", shift: true })).toEqual({
      type: "extend",
      cursor: { row: 4, col: 0 },
    });
    expect(gridKeyDown(at(0, 0), { key: "ArrowUp", shift: true })).toEqual({
      type: "move",
      cursor: { row: -1, col: 0 },
    });
  });

  it("does not extend when only one row can be selected", () => {
    expect(
      gridKeyDown(at(3, 0, { multiSelect: false }), { key: "ArrowDown", shift: true }),
    ).toEqual({ type: "move", cursor: { row: 4, col: 0 } });
  });

  it("moves a viewport page and says which way, so the virtualizer can follow", () => {
    expect(gridKeyDown(at(0, 0), { key: "PageDown" })).toEqual({
      type: "page",
      direction: 1,
      cursor: { row: 5, col: 0 },
    });
    expect(gridKeyDown(at(2, 0), { key: "PageUp" })).toEqual({
      type: "page",
      direction: -1,
      cursor: { row: 0, col: 0 },
    });
  });

  it("Home/End work on the row, Ctrl+Home/End on the whole grid", () => {
    expect(gridKeyDown(at(4, 3), { key: "Home" })).toEqual({
      type: "move",
      cursor: { row: 4, col: 0 },
    });
    expect(gridKeyDown(at(4, 3), { key: "End" })).toEqual({
      type: "move",
      cursor: { row: 4, col: 3 },
    });
    expect(gridKeyDown(at(4, 3), { key: "Home", ctrl: true })).toEqual({
      type: "move",
      cursor: { row: 0, col: 0 },
    });
    expect(gridKeyDown(at(4, 3), { key: "End", meta: true })).toEqual({
      type: "move",
      cursor: { row: 9, col: 3 },
    });
  });

  it("enters edit on Enter only where a cell is editable", () => {
    expect(gridKeyDown(at(1, 1, { editable: true }), { key: "Enter" })).toEqual({ type: "edit" });
    expect(gridKeyDown(at(1, 1, { editable: false }), { key: "Enter" })).toEqual({
      type: "activate",
    });
    expect(gridKeyDown(at(1, 1, { editable: true }), { key: "F2" })).toEqual({ type: "edit" });
  });

  it("hands the keyboard to the editor while one is open", () => {
    const editing = at(1, 1, { editing: true, editable: true });
    expect(gridKeyDown(editing, { key: "Escape" })).toEqual({ type: "cancel" });
    expect(gridKeyDown(editing, { key: "Enter" })).toEqual({ type: "commit" });
    expect(gridKeyDown(editing, { key: "ArrowDown" })).toEqual({ type: "none" });
    expect(gridKeyDown(editing, { key: "x" })).toEqual({ type: "none" });
  });

  it("Tab commits and moves to the next cell, wrapping onto the next row", () => {
    const editing = at(1, 3, { editing: true });
    expect(gridKeyDown(editing, { key: "Tab" })).toEqual({
      type: "commit-and-move",
      cursor: { row: 2, col: 0 },
    });
    expect(gridKeyDown(at(1, 0, { editing: true }), { key: "Tab", shift: true })).toEqual({
      type: "commit-and-move",
      cursor: { row: 0, col: 3 },
    });
  });

  it("toggles selection on Space and selects all on Ctrl+A", () => {
    expect(gridKeyDown(at(2, 1), { key: " " })).toEqual({ type: "toggle-select" });
    expect(gridKeyDown(at(2, 1, { selectable: false }), { key: " " })).toEqual({ type: "none" });
    expect(gridKeyDown(at(2, 1), { key: "a", meta: true })).toEqual({ type: "select-all" });
    // Plain "a" is a character, not a command.
    expect(gridKeyDown(at(2, 1), { key: "a" })).toEqual({ type: "none" });
  });

  it("copies the selection on Ctrl+C", () => {
    expect(gridKeyDown(at(2, 1), { key: "c", ctrl: true })).toEqual({
      type: "copy",
      scope: "selected",
    });
  });

  it("returns none for keys it does not own, so the adapter leaves them alone", () => {
    expect(gridKeyDown(at(2, 1), { key: "Escape" })).toEqual({ type: "none" });
    expect(gridKeyDown(at(2, 1), { key: "Tab" })).toEqual({ type: "none" });
  });
});
