/**
 * The row detail state machine: which row is open, where it sits in the list,
 * and the dirty guard that stops navigation from silently discarding an edit.
 *
 * The package owns the shell — navigation, the guard, keyboard, commit and
 * rollback. The consumer supplies the field renderers and nothing else.
 */
import { createStore, type Store } from "./state.js";

/** What the user asked for while the panel was dirty. */
export type DetailIntent = "close" | "prev" | "next";

export interface DetailState {
  rowId: string | null;
  /** Position in the current row order, for "3 of 120" and for prev/next. */
  index: number;
  /** The consumer's form reports this; it is what arms the guard. */
  dirty: boolean;
  /** A confirmation is open because a navigation was attempted while dirty. */
  confirming: DetailIntent | null;
}

export const INITIAL_DETAIL_STATE: DetailState = {
  rowId: null,
  index: -1,
  dirty: false,
  confirming: null,
};

export type DetailAction =
  | { type: "open"; rowId: string; index: number }
  | { type: "close" }
  | { type: "go"; rowId: string; index: number }
  | { type: "dirty"; dirty: boolean }
  | { type: "confirm"; intent: DetailIntent }
  | { type: "dismiss" };

export function detailReducer(state: DetailState, action: DetailAction): DetailState {
  switch (action.type) {
    case "open":
      return { rowId: action.rowId, index: action.index, dirty: false, confirming: null };
    case "close":
      return INITIAL_DETAIL_STATE;
    case "go":
      // Navigating always lands on a clean panel: the previous row's draft is
      // either committed or discarded by the time this fires.
      return { rowId: action.rowId, index: action.index, dirty: false, confirming: null };
    case "dirty":
      if (state.dirty === action.dirty) return state;
      return { ...state, dirty: action.dirty };
    case "confirm":
      return { ...state, confirming: action.intent };
    case "dismiss":
      if (!state.confirming) return state;
      return { ...state, confirming: null };
    default:
      return state;
  }
}

export function createDetailStore(): Store<DetailState, DetailAction> {
  return createStore(INITIAL_DETAIL_STATE, detailReducer);
}

/**
 * The next row in a direction, or null at the end.
 *
 * Deliberately does not wrap: wrapping from the last row to the first in a
 * 100,000-row table looks like a bug, not a convenience.
 */
export function stepRow(
  orderedIds: readonly string[],
  currentId: string | null,
  direction: -1 | 1,
): { rowId: string; index: number } | null {
  if (currentId === null) return null;
  const index = orderedIds.indexOf(currentId);
  if (index === -1) return null;
  const next = index + direction;
  const rowId = orderedIds[next];
  return rowId === undefined ? null : { rowId, index: next };
}

/**
 * The one decision the guard exists for: may this navigation happen now, or does
 * the user have to answer for the unsaved edit first?
 */
export function guard(state: DetailState, intent: DetailIntent): DetailAction {
  return state.dirty
    ? { type: "confirm", intent }
    : { type: intent === "close" ? "close" : "dismiss" };
}
