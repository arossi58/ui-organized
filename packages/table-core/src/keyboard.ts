/**
 * Grid keyboard navigation, as a pure function over a normalized key.
 *
 * The signature is the whole point of the framework boundary: this takes
 * `{ key, shift, ctrl, meta }` and returns an action, never a DOM event and
 * never a synthetic one. React's `KeyboardEvent` is a React type; keeping it out
 * of here is what lets a Vue adapter reuse every one of these decisions.
 *
 * Row `-1` is the header row. It is part of the same cursor space on purpose:
 * ArrowUp out of the first body row lands on the column header, where Enter
 * sorts — which is how a keyboard user reaches sorting without tabbing out of
 * the grid.
 */
import type { TableRowScope } from "./types.js";

export interface KeyEvent {
  key: string;
  shift?: boolean;
  ctrl?: boolean;
  meta?: boolean;
  alt?: boolean;
}

export interface GridCursor {
  /** -1 is the header row; 0..rowCount-1 are body rows. */
  row: number;
  col: number;
}

export interface GridState {
  cursor: GridCursor;
  /** Body rows currently reachable — the page in paginated mode, not the dataset. */
  rowCount: number;
  colCount: number;
  /** Rows that fit in one viewport, for PageUp/PageDown. */
  pageRows: number;
  /** A cell editor is open. Most keys belong to the editor while it is. */
  editing: boolean;
  /** The focused cell has an `edit` definition. */
  editable?: boolean;
  /** Row selection is enabled. */
  selectable?: boolean;
  /** Multiple rows can be selected — gates range extension and select-all. */
  multiSelect?: boolean;
}

export type GridAction =
  /** Nothing to do; the adapter must NOT call preventDefault. */
  | { type: "none" }
  | { type: "move"; cursor: GridCursor }
  /** Shift+Arrow: move the cursor and extend the selection to cover the range. */
  | { type: "extend"; cursor: GridCursor }
  /** PageUp/PageDown also drive the virtualizer, not just the cursor. */
  | { type: "page"; cursor: GridCursor; direction: -1 | 1 }
  | { type: "edit" }
  | { type: "commit" }
  /** Tab while editing: commit, then move to the next cell. */
  | { type: "commit-and-move"; cursor: GridCursor }
  | { type: "cancel" }
  /** Enter on a non-editable cell, or on a header cell (sort). */
  | { type: "activate" }
  | { type: "toggle-select" }
  | { type: "select-all" }
  | { type: "copy"; scope: TableRowScope };

const clamp = (value: number, min: number, max: number) =>
  value < min ? min : value > max ? max : value;

function at(state: GridState, row: number, col: number, minRow = -1): GridCursor {
  return {
    row: clamp(row, minRow, Math.max(state.rowCount - 1, minRow)),
    col: clamp(col, 0, Math.max(state.colCount - 1, 0)),
  };
}

/**
 * Paging stays in the body. Overshooting upwards should land on the first row,
 * not on the header — the header is somewhere you step onto deliberately with
 * ArrowUp, not somewhere a page scroll dumps you.
 */
function page(state: GridState, row: number, col: number): GridCursor {
  return at(state, row, col, 0);
}

/** Tab order inside the grid: left to right, wrapping onto the next row. */
function nextCell(state: GridState, cursor: GridCursor, step: 1 | -1): GridCursor {
  const flat = cursor.row * state.colCount + cursor.col + step;
  if (flat < 0) return { row: 0, col: 0 };
  const lastFlat = state.rowCount * state.colCount - 1;
  if (flat > lastFlat) return { row: state.rowCount - 1, col: state.colCount - 1 };
  return { row: Math.floor(flat / state.colCount), col: flat % state.colCount };
}

export function gridKeyDown(state: GridState, event: KeyEvent): GridAction {
  const { cursor } = state;
  const mod = Boolean(event.ctrl || event.meta);

  // ── While an editor is open, it owns the keyboard ──────────────────────────
  if (state.editing) {
    switch (event.key) {
      case "Escape":
        return { type: "cancel" };
      case "Enter":
        return { type: "commit" };
      case "Tab":
        return { type: "commit-and-move", cursor: nextCell(state, cursor, event.shift ? -1 : 1) };
      default:
        return { type: "none" };
    }
  }

  switch (event.key) {
    // ── Movement ────────────────────────────────────────────────────────────
    case "ArrowRight":
      return { type: "move", cursor: at(state, cursor.row, cursor.col + 1) };
    case "ArrowLeft":
      return { type: "move", cursor: at(state, cursor.row, cursor.col - 1) };
    case "ArrowDown": {
      const next = at(state, cursor.row + 1, cursor.col);
      // Extending a range out of the header would select rows the cursor never
      // visited, so Shift only extends within the body.
      return event.shift && state.multiSelect && cursor.row >= 0
        ? { type: "extend", cursor: next }
        : { type: "move", cursor: next };
    }
    case "ArrowUp": {
      const next = at(state, cursor.row - 1, cursor.col);
      return event.shift && state.multiSelect && cursor.row > 0
        ? { type: "extend", cursor: next }
        : { type: "move", cursor: next };
    }
    case "Home":
      return {
        type: "move",
        cursor: mod ? at(state, 0, 0) : at(state, cursor.row, 0),
      };
    case "End":
      return {
        type: "move",
        cursor: mod
          ? at(state, state.rowCount - 1, state.colCount - 1)
          : at(state, cursor.row, state.colCount - 1),
      };
    case "PageDown":
      return {
        type: "page",
        direction: 1,
        cursor: page(state, cursor.row + state.pageRows, cursor.col),
      };
    case "PageUp":
      return {
        type: "page",
        direction: -1,
        cursor: page(state, cursor.row - state.pageRows, cursor.col),
      };

    // ── Activation ──────────────────────────────────────────────────────────
    case "Enter":
      if (cursor.row < 0) return { type: "activate" };
      return state.editable ? { type: "edit" } : { type: "activate" };
    case "F2":
      return state.editable ? { type: "edit" } : { type: "none" };
    case " ":
    case "Spacebar":
      if (cursor.row < 0) return { type: "activate" };
      return state.selectable ? { type: "toggle-select" } : { type: "none" };

    // ── Bulk ────────────────────────────────────────────────────────────────
    case "a":
    case "A":
      return mod && state.selectable && state.multiSelect
        ? { type: "select-all" }
        : { type: "none" };
    case "c":
    case "C":
      // Only when the user has a selection to copy; otherwise the browser's own
      // copy of whatever text is selected is the better behaviour.
      return mod && state.selectable ? { type: "copy", scope: "selected" } : { type: "none" };

    default:
      return { type: "none" };
  }
}
