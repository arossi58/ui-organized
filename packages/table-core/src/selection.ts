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

/**
 * The selection footer's count. Shared so the four libraries say it the same
 * way, down to the thousands separator.
 */
export function selectionCountLabel(count: number): string {
  return count === 1 ? "1 row selected" : `${count.toLocaleString()} rows selected`;
}

/**
 * The selection footer's offer to reach past the page: "Select 99,981 hidden
 * rows". Counted as the rows it would *add* — every matching row not already
 * selected — rather than the matching total, because the total reads as though
 * the rows on screen were not already in it. "Hidden" is the point: the user
 * has ticked what they can see, and this is what they cannot.
 */
export function selectHiddenLabel(totalMatching: number, count: number): string {
  const hidden = Math.max(0, totalMatching - count);
  return hidden === 1 ? "Select 1 hidden row" : `Select ${hidden.toLocaleString()} hidden rows`;
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
 * The header checkbox. Ticking it selects the rows it governs; unticking it
 * clears the **whole** selection.
 *
 * "The rows it governs" is the page when the table is paginated and the
 * *rendered window* when it is virtualized — see `useDataTable`. Ticking is
 * deliberately never the whole dataset: enumerating 100,000 ids to answer one
 * click is work no one asked for, and `selectAllMatching` already expresses
 * "all of them" as a flag that costs nothing.
 *
 * Unticking is not symmetric, on purpose. A checked header box reads as "all
 * selected", so unticking it reads as "none" — and clearing only the rows in
 * view left any selected on another page, or scrolled out of a virtualized
 * window, still selected: the count stayed above zero, the bulk actions stayed
 * up, and the table never left selection mode. Clearing costs nothing, so
 * "none" can mean none. The anchor survives, as it does for `clearSelection`.
 */
export function selectPage(
  state: SelectionState,
  orderedIds: readonly string[],
  checked: boolean,
): SelectionState {
  if (!checked) return clearSelection(state);
  return setRows(state, orderedIds, checked);
}

/** "Select N hidden rows" — the escape hatch from page-scoped selection. */
export function selectAllMatching(state: SelectionState): SelectionState {
  return { ...state, allMatching: true, rows: {}, excluded: {} };
}

export function clearSelection(state: SelectionState): SelectionState {
  return { ...EMPTY_SELECTION, anchor: state.anchor };
}

/**
 * Header checkbox state: all / none / mixed.
 *
 * Checked when every row in view is selected. Mixed whenever anything is
 * selected short of that — **including rows out of view**. Counting only the
 * rows in view showed an empty box over a selection the user had made a
 * moment earlier, as soon as they scrolled a virtualized table or turned a
 * page; the box then *added* the new rows instead of offering to clear, and
 * the table could not be got out of selection mode from the header at all.
 */
export function headerCheckboxState(
  state: SelectionState,
  orderedIds: readonly string[],
): { checked: boolean; indeterminate: boolean } {
  if (orderedIds.length === 0) return { checked: false, indeterminate: false };
  let selected = 0;
  for (const id of orderedIds) if (isSelected(state, id)) selected += 1;
  const checked = selected === orderedIds.length;
  return {
    checked,
    indeterminate: !checked && (selected > 0 || !isEmpty(state)),
  };
}

/**
 * Whether the selection footer offers "Select N hidden rows".
 *
 * Every row in view selected is the cue, and the condition is that some
 * matching row is **still unselected** — not that more rows match than are in
 * view. Those are different the moment a selection outlives a smaller view:
 * select all 100 rows at 100 per page, drop to 10 per page, and the old test
 * (100 matching, 10 in view) offered to "Select 0 hidden rows".
 */
export function canSelectHiddenRows(
  state: SelectionState,
  header: { checked: boolean },
  totalMatching: number,
  mode: "none" | "single" | "multiple",
): boolean {
  return (
    mode === "multiple" &&
    header.checked &&
    !state.allMatching &&
    selectionCount(state, totalMatching) < totalMatching
  );
}

/**
 * What a click on the header checkbox does: select the rows in view from an
 * empty box, and clear the whole selection from a checked or mixed one.
 *
 * Decided here, from the state the box shows, rather than from the checkbox's
 * own `checked` change — a mixed box clicks through to *checked*, which would
 * select more rows when the user is reaching for "none". This is the
 * convention of every mail client and data grid with a mixed header.
 */
export function headerToggleTarget(header: { checked: boolean; indeterminate: boolean }): boolean {
  return !(header.checked || header.indeterminate);
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
