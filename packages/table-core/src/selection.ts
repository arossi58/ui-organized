/**
 * Row selection, including the two cases a bare id set cannot express.
 *
 * 1. **Shift-range.** A range needs an anchor, and the anchor is state — it
 *    survives the clicks in between and is invalidated by re-sorting.
 * 2. **"Select all 40,000 results".** On a server-driven table the ids of the
 *    unloaded rows do not exist on the client, so selection is modelled as a
 *    flag plus an exclusion set rather than an enumeration.
 */

export interface SelectionState {
  /**
   * Explicitly selected row ids. TanStack's `rowSelection` shape, which since
   * v9 is `Record<string, true>` — a key is present when the row is selected and
   * absent when it is not, rather than present-and-false.
   *
   * That was always this module's behaviour (every write is `= true` or a
   * `delete`); the type just used to be wider than the code, which left two
   * spellings of "not selected" that no reader could tell apart.
   */
  rows: Record<string, true>;
  /** The row a shift-range extends from. Null until the first plain click. */
  anchor: string | null;
  /** Every row matching the current filters is selected, loaded or not. */
  allMatching: boolean;
  /** Rows deselected by hand while `allMatching` is on. */
  excluded: Record<string, true>;
}

export const EMPTY_SELECTION: SelectionState = {
  rows: {},
  anchor: null,
  allMatching: false,
  excluded: {},
};

export function isSelected(state: SelectionState, rowId: string): boolean {
  if (state.allMatching) return !state.excluded[rowId];
  return Boolean(state.rows[rowId]);
}

export function selectedIds(state: SelectionState): string[] {
  return Object.keys(state.rows).filter((id) => state.rows[id]);
}

/**
 * How many rows the user believes they have selected.
 *
 * With `allMatching` on, that is every row the current filters match minus the
 * ones they unticked — a number the client can state without holding the ids.
 */
export function selectionCount(state: SelectionState, totalMatching: number): number {
  if (state.allMatching) {
    return Math.max(
      0,
      totalMatching - Object.keys(state.excluded).filter((id) => state.excluded[id]).length,
    );
  }
  return selectedIds(state).length;
}

export function isEmpty(state: SelectionState): boolean {
  return selectionCount(state, Number.POSITIVE_INFINITY) === 0;
}

function setRow(state: SelectionState, rowId: string, checked: boolean): SelectionState {
  // With `allMatching` on, deselecting means *excluding*: there is no id set to
  // remove from.
  if (state.allMatching) {
    const excluded = { ...state.excluded };
    if (checked) delete excluded[rowId];
    else excluded[rowId] = true;
    return { ...state, excluded };
  }
  const rows = { ...state.rows };
  if (checked) rows[rowId] = true;
  else delete rows[rowId];
  return { ...state, rows };
}

/**
 * Set many rows at once, in one pass.
 *
 * The obvious version is `for (const id of ids) next = setRow(next, id, …)`,
 * and it is **quadratic**: `setRow` copies the whole selection object every
 * time, so N rows means N copies of an object that is itself growing towards N.
 * On a page of twenty that is invisible; on the 100,000-row table it was about
 * thirteen minutes of blocking work, which a browser reports to the user as a
 * crashed tab rather than as a slow function.
 *
 * One copy, then a linear loop over it. Same result, same immutability.
 */
function setRows(state: SelectionState, ids: readonly string[], checked: boolean): SelectionState {
  if (ids.length === 0) return state;

  // With `allMatching` on, deselecting means *excluding*: there is no id set to
  // remove from. Same branch `setRow` takes, hoisted out of the loop.
  if (state.allMatching) {
    const excluded = { ...state.excluded };
    for (const id of ids) {
      if (checked) delete excluded[id];
      else excluded[id] = true;
    }
    return { ...state, excluded };
  }

  const rows = { ...state.rows };
  for (const id of ids) {
    if (checked) rows[id] = true;
    else delete rows[id];
  }
  return { ...state, rows };
}

/**
 * The one entry point a row checkbox needs.
 *
 * `orderedIds` is the *rendered* order, so a range follows what the user can
 * see — after a sort, shift-clicking two rows selects what is visually between
 * them, which is the only definition that isn't surprising.
 */
export function rangeSelect(
  state: SelectionState,
  orderedIds: readonly string[],
  rowId: string,
  shift: boolean,
  checked: boolean,
): SelectionState {
  const anchorIndex = state.anchor === null ? -1 : orderedIds.indexOf(state.anchor);
  const targetIndex = orderedIds.indexOf(rowId);

  if (!shift || anchorIndex === -1 || targetIndex === -1) {
    return { ...setRow(state, rowId, checked), anchor: rowId };
  }

  const from = Math.min(anchorIndex, targetIndex);
  const to = Math.max(anchorIndex, targetIndex);
  // The anchor deliberately survives, so a second shift-click from the same
  // origin re-scopes the range instead of starting a new one.
  return setRows(state, orderedIds.slice(from, to + 1), checked);
}

/**
 * The header checkbox: select or clear the rows it governs.
 *
 * "The rows it governs" is the page when the table is paginated and the
 * *rendered window* when it is virtualized — see `useDataTable`. It is
 * deliberately never the whole dataset: enumerating 100,000 ids to answer one
 * click is work no one asked for, and `selectAllMatching` already expresses
 * "all of them" as a flag that costs nothing.
 */
export function selectPage(
  state: SelectionState,
  orderedIds: readonly string[],
  checked: boolean,
): SelectionState {
  const base: SelectionState = checked ? state : { ...state, allMatching: false, excluded: {} };
  return setRows(base, orderedIds, checked);
}

/** "Select all N matching" — the escape hatch from page-scoped selection. */
export function selectAllMatching(state: SelectionState): SelectionState {
  return { ...state, allMatching: true, rows: {}, excluded: {} };
}

export function clearSelection(state: SelectionState): SelectionState {
  return { ...EMPTY_SELECTION, anchor: state.anchor };
}

/** Header checkbox state: all / none / mixed. */
export function headerCheckboxState(
  state: SelectionState,
  orderedIds: readonly string[],
): { checked: boolean; indeterminate: boolean } {
  if (orderedIds.length === 0) return { checked: false, indeterminate: false };
  let selected = 0;
  for (const id of orderedIds) if (isSelected(state, id)) selected += 1;
  return {
    checked: selected === orderedIds.length,
    indeterminate: selected > 0 && selected < orderedIds.length,
  };
}

/**
 * What the consumer's bulk action actually receives in server mode: either the
 * enumerated ids, or the instruction to apply to everything the query matches.
 */
export type BulkSelection =
  | { mode: "ids"; ids: string[] }
  | { mode: "all-matching"; excluded: string[] };

export function toBulkSelection(state: SelectionState): BulkSelection {
  if (state.allMatching) {
    return {
      mode: "all-matching",
      excluded: Object.keys(state.excluded).filter((id) => state.excluded[id]),
    };
  }
  return { mode: "ids", ids: selectedIds(state) };
}
