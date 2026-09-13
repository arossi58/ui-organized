/**
 * The inline-edit state machine.
 *
 * All of it lives here rather than in the adapter because the interesting parts
 * are not rendering: what Tab does mid-edit, what a failed `onEdit` does to the
 * optimistic value, and when a draft is discarded. Those decisions are identical
 * in every framework.
 */
import { createStore, type Store } from "./state.js";

export interface EditTarget {
  rowId: string;
  columnId: string;
}

export interface EditState {
  /** The open editor, or null when nothing is being edited. */
  target: EditTarget | null;
  /** The draft value. Not the committed one — that is the consumer's data. */
  draft: unknown;
  /** The value the editor opened with, for rollback. */
  original: unknown;
  /** Validation message, or null when the draft is valid. */
  invalid: string | null;
  /** A commit is in flight. The editor stays open and disabled until it lands. */
  pending: boolean;
}

export const INITIAL_EDIT_STATE: EditState = {
  target: null,
  draft: undefined,
  original: undefined,
  invalid: null,
  pending: false,
};

export type EditAction =
  | { type: "start"; target: EditTarget; value: unknown }
  | { type: "change"; value: unknown; invalid?: string | null }
  | { type: "invalid"; message: string }
  | { type: "commit-start" }
  | { type: "commit-done" }
  | { type: "commit-failed"; message: string }
  | { type: "cancel" };

export function editReducer(state: EditState, action: EditAction): EditState {
  switch (action.type) {
    case "start":
      // Starting a new edit while one is pending would drop the in-flight
      // commit's rollback target, so the request wins and the click is ignored.
      if (state.pending) return state;
      return {
        target: action.target,
        draft: action.value,
        original: action.value,
        invalid: null,
        pending: false,
      };
    case "change":
      if (!state.target) return state;
      return { ...state, draft: action.value, invalid: action.invalid ?? null };
    case "invalid":
      if (!state.target) return state;
      return { ...state, invalid: action.message };
    case "commit-start":
      if (!state.target || state.invalid) return state;
      return { ...state, pending: true };
    case "commit-done":
      return INITIAL_EDIT_STATE;
    case "commit-failed":
      // The editor reopens on the rejected value with the reason attached: the
      // optimistic update is rolled back by the consumer's data not changing,
      // and the user keeps what they typed rather than losing it to a 500.
      return { ...state, pending: false, invalid: action.message };
    case "cancel":
      return INITIAL_EDIT_STATE;
    default:
      return state;
  }
}

export function createEditStore(): Store<EditState, EditAction> {
  return createStore(INITIAL_EDIT_STATE, editReducer);
}

export function isEditing(state: EditState, rowId: string, columnId: string): boolean {
  return state.target?.rowId === rowId && state.target.columnId === columnId;
}

/** What `onEdit` receives. Deliberately a patch, not a whole row. */
export interface TableEditPatch<T> {
  rowId: string;
  columnId: string;
  row: T;
  value: unknown;
  previousValue: unknown;
}
