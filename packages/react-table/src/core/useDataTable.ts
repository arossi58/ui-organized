/**
 * The headless layer: core's stores and TanStack's React adapter, bound
 * together.
 *
 * Everything decided here is a *binding* decision — which React state holds
 * what, when a transition is used, how focus is restored. Every behavioural
 * decision (what Tab does, what a shift-range covers, when to virtualize) lives
 * in `@ui-organized/table-core` and is reached from here, which is what keeps a
 * second framework adapter to this file plus the components.
 */
import {
  startTransition,
  useCallback,
  useReducer,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import {
  useReactTable,
  type ColumnOrderState,
  type ColumnPinningState,
  type ColumnSizingState,
  type PaginationState,
  type SortingState,
  type Updater,
  type VisibilityState,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import {
  CARD_HEIGHT,
  DEFAULT_PAGE_SIZE,
  EMPTY_SELECTION,
  FACET_ROW_LIMIT,
  columnId as columnIdOf,
  copyRowsToClipboard,
  coreTableOptions,
  createFilterReducer,
  createOperatorCatalogue,
  defaultOperatorFor,
  describeCondition,
  facetOptions,
  filterAnnouncement,
  createDetailStore,
  createEditStore,
  estimateRowHeight,
  exportRowsToCsv,
  gridKeyDown,
  headerCheckboxState,
  horizontalScrollState,
  horizontalScrollTarget,
  isEditing as isEditingCell,
  INITIAL_FILTER_STATE,
  fromColumnFilters,
  inferFilterType,
  isNearEnd,
  layoutColumns,
  NO_HORIZONTAL_SCROLL,
  isSelected as isRowSelected,
  metaOf,
  overscanFor,
  primaryColumnId,
  rangeSelect,
  resolveMode,
  selectPage,
  selectAllMatching as selectAllMatchingCore,
  selectionCount as selectionCountCore,
  shouldVirtualize,
  spacerHeights,
  normalizeFilterDef,
  operatorLabel,
  operatorsFor,
  orderFilterableFields,
  stepRow,
  toBulkSelection,
  toColumnFilters,
  watchWidth,
  type FilterChangeKind,
  type GridCursor,
  type SelectionState,
  type TableFilterCondition,
  type TableFilterState,
  type TableFilterType,
  type TableChrome,
  type TableEditContext,
  type TableRowModel,
  type TableRowScope,
  type HorizontalScrollState,
} from "@ui-organized/table-core";
import { useStore } from "./useStore.js";
import { actionsColumn, selectionColumn } from "./systemColumns.js";
import type {
  DataTableApi,
  HorizontalScrollApi,
  TableColumn,
  TableFilterInput,
  UseDataTableOptions,
} from "./types.js";

/** Stable identity for the un-virtualized path. */
const NO_SPACERS = { top: 0, bottom: 0 };

/**
 * Ids are assigned here rather than accepted, so they are deterministic —
 * which is what keeps visual baselines and test assertions stable across runs.
 */
function seedFilterState(defaults: readonly TableFilterInput[] | undefined): TableFilterState {
  if (!defaults?.length) return INITIAL_FILTER_STATE;
  const conditions: TableFilterCondition[] = defaults.map((condition, index) => ({
    ...condition,
    id: `f${index + 1}`,
  }));
  return { ...INITIAL_FILTER_STATE, conditions, nextId: conditions.length + 1 };
}

/** Follows the same dot path `accessorKey` does, so nested data is reachable. */
function readPath(row: unknown, path: string): unknown {
  if (!path.includes(".")) return (row as Record<string, unknown> | undefined)?.[path];
  let value: unknown = row;
  for (const key of path.split(".")) {
    value = (value as Record<string, unknown> | undefined)?.[key];
  }
  return value;
}

/** A few real values from a column, for type inference. */
function sampleColumn<T>(data: readonly T[], def: TableColumn<T>, id: string): unknown[] {
  const key = (def as { accessorKey?: string }).accessorKey ?? id;
  // Twenty, not one: a leading null should not get to decide the type.
  return data.slice(0, 20).map((row) => readPath(row, key));
}

function applyUpdater<S>(updater: Updater<S>, previous: S): S {
  return typeof updater === "function" ? (updater as (old: S) => S)(previous) : updater;
}

/** `meta.sticky` is our vocabulary; `columnPinning` is TanStack's. */
function pinningFromMeta<T>(columns: readonly TableColumn<T>[]): ColumnPinningState {
  const left: string[] = [];
  const right: string[] = [];
  for (const def of columns) {
    const sticky = metaOf<T>(def)?.sticky;
    if (sticky === "left") left.push(columnIdOf(def));
    else if (sticky === "right") right.push(columnIdOf(def));
  }
  return { left, right };
}

export function useDataTable<T>(options: UseDataTableOptions<T>): DataTableApi<T> {
  const {
    data,
    columns,
    label,
    captionVisible = false,
    getRowId,
    size = "md",
    variant = "default",
    selection: selectionMode = "none",
    sortable = true,
    filterable = true,
    paginated = false,
    pageSize = DEFAULT_PAGE_SIZE,
    resizable = false,
    virtual = true,
    loading = false,
    manual = false,
    rowCount,
    onQueryChange,
    onLoadMore,
    onRowClick,
    onEdit,
    rowActions,
    detail,
    responsive,
    defaultSorting,
    defaultColumnVisibility,
    defaultFilters,
    filterOperators,
  } = options;

  // ── DOM handles ───────────────────────────────────────────────────────────
  // State rather than refs: an effect that observes the node has to re-run when
  // the node appears, and a ref assignment does not trigger that.
  const [rootEl, setRootEl] = useState<HTMLElement | null>(null);
  // `HTMLElement`, not `HTMLDivElement`: in card mode the scroll container is a
  // `<ul>`, and the virtualizer attaches to whichever one is rendered.
  const [viewportEl, setViewportEl] = useState<HTMLElement | null>(null);

  // ── Table state ───────────────────────────────────────────────────────────
  const [sorting, setSorting] = useState<SortingState>(defaultSorting ?? []);

  // Filters are a reducer, not `useState` and not an external store. The
  // reducer itself lives in core, where it is portable and testable without a
  // renderer; `useReducer` is the binding because it composes with the
  // urgent-update / deferred-read split below, which `useSyncExternalStore`
  // cannot express — its updates are always urgent, by design.
  const catalogue = useMemo(() => createOperatorCatalogue(filterOperators), [filterOperators]);
  const reduceFilters = useMemo(() => createFilterReducer(catalogue), [catalogue]);
  const [filterState, dispatchFilter] = useReducer(reduceFilters, defaultFilters, seedFilterState);
  const conditions = filterState.conditions;
  /**
   * Conditions update **urgently**; only the filtering they drive is deferred.
   *
   * The obvious spelling — dispatching inside `startTransition` — silently
   * breaks text filters: a controlled input whose value arrives in a transition
   * lags behind the keystrokes, and typing "ada" lands as "a". This is the same
   * split the global search already uses (`deferredSearch` below): the control
   * stays instant, the expensive re-filter happens at React's convenience.
   */
  const deferredConditions = useDeferredValue(conditions);
  const columnFilters = useMemo(() => toColumnFilters(deferredConditions), [deferredConditions]);
  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize });
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
    defaultColumnVisibility ?? {},
  );
  const [columnOrder, setColumnOrder] = useState<ColumnOrderState>([]);
  const [columnSizing, setColumnSizing] = useState<ColumnSizingState>({});
  const [selection, setSelection] = useState<SelectionState>(EMPTY_SELECTION);

  // Typing must never block. The deferred value is what the table filters on,
  // so the input updates on every keystroke while the (expensive) re-filter
  // happens at React's convenience.
  const deferredSearch = useDeferredValue(search);

  // ── Measurement ───────────────────────────────────────────────────────────
  // Two widths, because they answer different questions. The root's width picks
  // the responsive mode; the viewport's content width decides how much room the
  // columns actually have (it excludes the border, and shrinks when a vertical
  // scrollbar appears).
  const [width, setWidth] = useState<number | null>(null);
  const [viewportWidth, setViewportWidth] = useState<number | null>(null);
  useEffect(() => watchWidth(rootEl, setWidth), [rootEl]);
  useEffect(() => watchWidth(viewportEl, setViewportWidth), [viewportEl]);
  const mode = resolveMode(responsive, width);
  const scroll = useHorizontalScroll(viewportEl);

  // ── Columns ───────────────────────────────────────────────────────────────
  const allColumns = useMemo(() => {
    const out: TableColumn<T>[] = [...columns];
    if (selectionMode !== "none") out.unshift(selectionColumn<T>());
    if (rowActions?.length) out.push(actionsColumn<T>());
    return out;
  }, [columns, selectionMode, rowActions]);

  const primaryId = useMemo(() => primaryColumnId(columns), [columns]);
  const basePinning = useMemo(() => pinningFromMeta(allColumns), [allColumns]);

  const stores = useMemo(() => ({ edit: createEditStore(), detail: createDetailStore() }), []);
  const editState = useStore(stores.edit);
  const detailState = useStore(stores.detail);

  const editableColumns = useMemo(
    () => new Set(columns.filter((def) => metaOf<T>(def)?.edit).map((def) => columnIdOf(def))),
    [columns],
  );

  const interactive =
    selectionMode !== "none" ||
    editableColumns.size > 0 ||
    Boolean(onRowClick) ||
    Boolean(detail) ||
    Boolean(rowActions?.length);

  /**
   * The filter type per filterable column, from its declaration or inferred
   * from the data.
   *
   * Read off the raw rows rather than the table's, because this is an *input*
   * to building the table. That means an `accessorFn` column cannot be sampled
   * and falls back to `text`; declaring `meta.filter.type` is the answer there.
   */
  const filterTypes = useMemo(() => {
    const types: Record<string, TableFilterType> = {};
    for (const def of columns) {
      const filter = normalizeFilterDef(metaOf<T>(def)?.filter);
      if (!filter) continue;
      const id = columnIdOf(def);
      types[id] = filter.type ?? inferFilterType(sampleColumn(data, def, id), filter.options);
    }
    return types;
  }, [columns, data]);

  /**
   * Memoized, and that is not a micro-optimisation.
   *
   * TanStack memoizes `getAllColumns` on the `columns` array *reference*, and
   * this call maps over the columns to attach filter functions — so building it
   * inline rebuilt the entire column tree, and everything downstream of it, on
   * every single render. Which is precisely the mistake
   * `useUnstableIdentityWarning` below warns consumers about.
   */
  const tableOptions = useMemo(
    () =>
      coreTableOptions<T>({
        data,
        columns: allColumns,
        getRowId,
        selection: selectionMode,
        sortable,
        filterable,
        paginated,
        resizable,
        manual,
        rowCount,
        filterTypes,
        catalogue,
      }),
    [
      data,
      allColumns,
      getRowId,
      selectionMode,
      sortable,
      filterable,
      paginated,
      resizable,
      manual,
      rowCount,
      filterTypes,
      catalogue,
    ],
  );

  const table = useReactTable<T>({
    ...tableOptions,
    state: {
      sorting,
      columnFilters,
      globalFilter: deferredSearch,
      pagination,
      columnVisibility,
      columnOrder,
      columnSizing,
      columnPinning: basePinning,
      rowSelection: selection.rows,
    },
    // Sorting and filtering re-run every row model. Marking them as transitions
    // keeps a click on a header from blocking a keystroke already in flight.
    onSortingChange: (updater) =>
      startTransition(() => setSorting((prev) => applyUpdater(updater, prev))),
    // The raw TanStack instance is a documented escape hatch, so
    // `table.resetColumnFilters()` and `column.setFilterValue()` still have to
    // work. They land here and are translated back into conditions — one
    // direction of truth, and the round trip is the identity.
    onColumnFiltersChange: (updater) =>
      dispatchFilter({
        type: "replace",
        conditions: fromColumnFilters(applyUpdater(updater, columnFilters)),
      }),
    onGlobalFilterChange: (updater) => setSearch((prev) => applyUpdater(updater, prev)),
    onPaginationChange: (updater) => setPagination((prev) => applyUpdater(updater, prev)),
    onColumnVisibilityChange: (updater) =>
      setColumnVisibility((prev) => applyUpdater(updater, prev)),
    onColumnOrderChange: (updater) => setColumnOrder((prev) => applyUpdater(updater, prev)),
    onColumnSizingChange: (updater) => setColumnSizing((prev) => applyUpdater(updater, prev)),
    onRowSelectionChange: (updater) =>
      setSelection((prev) => ({ ...prev, rows: applyUpdater(updater, prev.rows) })),
  });

  const rows = table.getRowModel().rows;
  const visibleColumns = table.getVisibleLeafColumns();

  // A table narrower than its container would otherwise leave a bare strip where
  // the header band stops. The surplus goes to one column rather than being
  // spread across all of them — see `layoutColumns` for why that matters to
  // every pinned column's sticky offset.
  const layout = layoutColumns(
    visibleColumns.map((column) => ({
      id: column.id,
      size: column.getSize(),
      pinned: column.getIsPinned(),
    })),
    mode === "table" ? viewportWidth : null,
  );
  // Post-filter, pre-pagination: what "1–25 of 312" counts, and what
  // `aria-rowcount` reports.
  const totalMatching = manual
    ? (rowCount ?? rows.length)
    : table.getPrePaginationRowModel().rows.length;
  const rowOffset = paginated && !manual ? pagination.pageIndex * pagination.pageSize : 0;

  // ── Virtualization ────────────────────────────────────────────────────────
  const virtualizing = shouldVirtualize(rows.length, virtual);
  // Always constructed: hooks cannot be conditional, and an idle virtualizer
  // over a short list costs one scroll listener.
  const virtualizer = useVirtualizer<HTMLElement, HTMLElement>({
    count: virtualizing ? rows.length : 0,
    getScrollElement: () => viewportEl,
    // Cards are much taller than rows and vary far more, so the first guess
    // differs by mode. Both are corrected by `measureElement` on the first
    // frame; the estimate only has to be close enough for the initial scroll
    // height not to jump.
    estimateSize: () => (mode === "cards" ? CARD_HEIGHT : estimateRowHeight(size)),
    overscan: overscanFor(virtual),
    // Rows are measured rather than trusted: the estimate is derived from
    // tokens, and a re-themed table would otherwise mis-position its scroll
    // content by a few pixels per row.
    measureElement: (element) => element.getBoundingClientRect().height,
  });

  // Read unconditionally: TanStack memoizes this internally, so its identity is
  // stable between scroll frames, and reading it behind a conditional is what
  // would make it an unstable hook dependency below.
  const virtualItems = virtualizer.getVirtualItems();
  const spacers = virtualizing
    ? spacerHeights(virtualItems, virtualizer.getTotalSize())
    : NO_SPACERS;

  const renderRows = useMemo(() => {
    const build = (row: TableRowModel<T>, index: number) => ({
      row,
      // The cursor coordinate: where the row sits on the current page.
      index,
      // What `aria-rowindex` reports: where it sits in the whole dataset, so a
      // screen reader says "row 4,312 of 100,000" rather than "row 4 of 30".
      absoluteIndex: index + rowOffset,
    });
    if (!virtualizing) return rows.map(build);
    const out: { row: TableRowModel<T>; index: number; absoluteIndex: number }[] = [];
    for (const item of virtualItems) {
      const row = rows[item.index];
      if (row) out.push(build(row, item.index));
    }
    return out;
    // `virtualItems` is a new array every scroll frame by design.
  }, [virtualizing, rows, virtualItems, rowOffset]);

  // ── Grid focus ────────────────────────────────────────────────────────────
  const [cursor, setCursorState] = useState<GridCursor>({ row: 0, col: 0 });
  // A counter, not a boolean: the same cell can be re-focused (after an editor
  // closes, say) without the cursor changing, and a boolean ref would be
  // consumed by an unrelated render before the effect that needs it runs.
  const [focusRequest, setFocusRequest] = useState(0);
  // With no rows there is nothing in the body to hold the tab stop, so it moves
  // to the header — which is still operable (sorting) and still one tab stop.
  const effectiveCursor: GridCursor = useMemo(
    () => (rows.length === 0 ? { row: -1, col: cursor.col } : cursor),
    [cursor, rows.length],
  );
  const cursorRef = useRef(effectiveCursor);
  cursorRef.current = effectiveCursor;

  const moveCursor = useCallback((next: GridCursor) => {
    setCursorState((prev) => (prev.row === next.row && prev.col === next.col ? prev : next));
  }, []);

  /**
   * Follow focus that has already moved — a click, or Tab landing on a cell.
   * Deliberately does NOT take focus.
   *
   * The two used to be one function, and it broke inline editing outright: the
   * editor's input took focus, its cell's `onFocus` bubbled, the cursor was
   * "set", and the effect below dutifully focused the cell again — pulling focus
   * straight back out of the editor the user had just opened.
   */
  const setCursor = moveCursor;

  /** Move the cursor AND take DOM focus. Keyboard actions only. */
  const focusCell = useCallback(
    (next: GridCursor) => {
      moveCursor(next);
      setFocusRequest((count) => count + 1);
    },
    [moveCursor],
  );

  useEffect(() => {
    if (focusRequest === 0 || !viewportEl) return;
    let attempts = 0;
    const tryFocus = () => {
      const { row, col } = cursorRef.current;
      const element = viewportEl.querySelector<HTMLElement>(`[data-cell="${row}:${col}"]`);
      if (element) {
        element.focus();
        return;
      }
      // A PageDown into un-rendered territory scrolls first; the row exists one
      // frame later. Two attempts, then give up rather than spin.
      if (attempts++ < 2) requestAnimationFrame(tryFocus);
    };
    tryFocus();
    // Deliberately keyed on the request alone. Including the cursor would make
    // every click that moves it also re-assert focus, which is the bug above.
  }, [focusRequest, viewportEl]);

  // ── Selection ─────────────────────────────────────────────────────────────
  const pageRowIds = useMemo(() => rows.map((row) => row.id), [rows]);

  /**
   * The rows the header checkbox governs: what is **on screen**.
   *
   * For a paginated table that is the page, because `renderRows` is the page.
   * For a virtualized one it is the rendered window, and that distinction is
   * the whole point — `rows` on the 100,000-row table is all 100,000, so a
   * header checkbox scoped to it answers one click by enumerating a hundred
   * thousand ids. `selectAllMatching` already says "all of them" as a flag that
   * costs nothing, and the selection bar offers it the moment this is ticked.
   */
  const visibleRowIds = useMemo(() => renderRows.map((entry) => entry.row.id), [renderRows]);
  const headerState = headerCheckboxState(selection, visibleRowIds);

  const toggleRow = useCallback(
    (rowId: string, checked: boolean, shift = false) => {
      setSelection((prev) =>
        selectionMode === "single"
          ? { ...EMPTY_SELECTION, rows: checked ? { [rowId]: true } : {}, anchor: rowId }
          : rangeSelect(prev, pageRowIds, rowId, shift, checked),
      );
    },
    [pageRowIds, selectionMode],
  );

  const togglePage = useCallback(
    (checked: boolean) => setSelection((prev) => selectPage(prev, visibleRowIds, checked)),
    [visibleRowIds],
  );

  const selectEverythingMatching = useCallback(() => {
    setSelection((prev) => {
      const next = selectAllMatchingCore(prev);
      // The loaded rows are materialised as well as the flag, so
      // `getSelectedRowModel()` — and therefore CSV export and any bulk action
      // over real row objects — still works for the rows the client has.
      const rowsState: Record<string, boolean> = {};
      for (const row of table.getPrePaginationRowModel().rows) rowsState[row.id] = true;
      return { ...next, rows: rowsState };
    });
  }, [table]);

  const clearSelectionState = useCallback(() => setSelection(EMPTY_SELECTION), []);

  const selectedRows = useMemo(
    () => table.getSelectedRowModel().rows.map((row) => row.original),
    // `selection` is load-bearing even though it is not referenced: the table
    // instance is stable, so without it this memo would never recompute.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [table, selection],
  );

  // ── Inline edit ───────────────────────────────────────────────────────────
  const startEdit = useCallback(
    (row: TableRowModel<T>, colId: string) => {
      if (!editableColumns.has(colId)) return;
      stores.edit.dispatch({
        type: "start",
        target: { rowId: row.id, columnId: colId },
        value: row.getValue(colId),
      });
    },
    [editableColumns, stores.edit],
  );

  const commitEdit = useCallback(() => {
    const state = stores.edit.getState();
    const target = state.target;
    // `pending` is the re-entry guard. A commit is reachable from three places
    // at once — Enter, Tab, and the editor's own blur as focus returns to the
    // cell — and without this an edit is written twice.
    if (!target || state.invalid || state.pending) return;
    const row = table.getRow(target.rowId);
    const column = allColumns.find((def) => columnIdOf(def) === target.columnId);
    const edit = metaOf<T>(column)?.edit;
    const value = edit?.parse ? edit.parse(state.draft) : state.draft;
    const message = edit?.validate?.(value, row.original) ?? null;
    if (message) {
      stores.edit.dispatch({ type: "invalid", message });
      return;
    }
    const patch = {
      rowId: target.rowId,
      columnId: target.columnId,
      row: row.original,
      value,
      previousValue: state.original,
    };
    stores.edit.dispatch({ type: "commit-start" });
    Promise.resolve(onEdit?.(patch)).then(
      () => stores.edit.dispatch({ type: "commit-done" }),
      (error: unknown) =>
        stores.edit.dispatch({
          type: "commit-failed",
          message: error instanceof Error ? error.message : "Could not save the change",
        }),
    );
  }, [allColumns, onEdit, stores.edit, table]);

  const editContextFor = useCallback(
    (row: TableRowModel<T>, colId: string): TableEditContext<T> | null => {
      if (!isEditingCell(editState, row.id, colId)) return null;
      return {
        row: row.original,
        rowId: row.id,
        columnId: colId,
        value: editState.draft,
        size,
        invalid: editState.invalid,
        setValue: (value) => {
          const column = allColumns.find((def) => columnIdOf(def) === colId);
          const validate = metaOf<T>(column)?.edit?.validate;
          stores.edit.dispatch({
            type: "change",
            value,
            invalid: validate?.(value, row.original) ?? null,
          });
        },
        commit: commitEdit,
        cancel: () => stores.edit.dispatch({ type: "cancel" }),
      };
    },
    [allColumns, commitEdit, editState, size, stores.edit],
  );

  // ── Row detail ────────────────────────────────────────────────────────────
  const openDetail = useCallback(
    (rowId: string) => {
      const index = pageRowIds.indexOf(rowId);
      stores.detail.dispatch({ type: "open", rowId, index });
    },
    [pageRowIds, stores.detail],
  );

  const stepDetail = useCallback(
    (direction: -1 | 1) => {
      const state = stores.detail.getState();
      if (state.dirty) {
        stores.detail.dispatch({ type: "confirm", intent: direction === -1 ? "prev" : "next" });
        return;
      }
      const next = stepRow(pageRowIds, state.rowId, direction);
      if (next) stores.detail.dispatch({ type: "go", ...next });
    },
    [pageRowIds, stores.detail],
  );

  const closeDetail = useCallback(() => {
    const state = stores.detail.getState();
    if (state.dirty) {
      stores.detail.dispatch({ type: "confirm", intent: "close" });
      return;
    }
    stores.detail.dispatch({ type: "close" });
  }, [stores.detail]);

  const resolveDetailConfirm = useCallback(
    (discard: boolean) => {
      const state = stores.detail.getState();
      const intent = state.confirming;
      stores.detail.dispatch({ type: "dismiss" });
      if (!discard || !intent) return;
      if (intent === "close") {
        stores.detail.dispatch({ type: "close" });
        return;
      }
      const next = stepRow(pageRowIds, state.rowId, intent === "prev" ? -1 : 1);
      if (next) stores.detail.dispatch({ type: "go", ...next });
    },
    [pageRowIds, stores.detail],
  );

  const detailRow = useMemo(() => {
    if (!detailState.rowId) return null;
    const row = rows.find((candidate) => candidate.id === detailState.rowId);
    return row ? row.original : null;
  }, [detailState.rowId, rows]);

  // ── Export ────────────────────────────────────────────────────────────────
  const exportCsv = useCallback(
    (scope: TableRowScope = "view") => {
      exportRowsToCsv(table, {
        scope,
        filename: `${label.toLowerCase().replaceAll(/\s+/g, "-")}.csv`,
      });
    },
    [label, table],
  );

  const copySelection = useCallback(
    (scope: TableRowScope = "selected") => copyRowsToClipboard(table, { scope }),
    [table],
  );

  // ── Keyboard ──────────────────────────────────────────────────────────────
  const onGridKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLElement>) => {
      if (!interactive) return;
      const column = visibleColumns[effectiveCursor.col];
      const pageRows = Math.max(
        1,
        Math.floor((viewportEl?.clientHeight ?? 0) / estimateRowHeight(size)) - 1,
      );
      const action = gridKeyDown(
        {
          cursor: effectiveCursor,
          rowCount: rows.length,
          colCount: visibleColumns.length,
          pageRows,
          editing: Boolean(editState.target),
          editable: column ? editableColumns.has(column.id) : false,
          selectable: selectionMode !== "none",
          multiSelect: selectionMode === "multiple",
        },
        {
          key: event.key,
          shift: event.shiftKey,
          ctrl: event.ctrlKey,
          meta: event.metaKey,
          alt: event.altKey,
        },
      );
      if (action.type === "none") return;
      event.preventDefault();

      switch (action.type) {
        case "move":
          focusCell(action.cursor);
          break;
        case "page":
          if (virtualizing) virtualizer.scrollToIndex(action.cursor.row, { align: "center" });
          focusCell(action.cursor);
          break;
        case "extend": {
          const anchorRow = rows[effectiveCursor.row];
          const targetRow = rows[action.cursor.row];
          if (anchorRow && targetRow) {
            setSelection((prev) => {
              const seeded = prev.anchor ? prev : { ...prev, anchor: anchorRow.id };
              return rangeSelect(seeded, pageRowIds, targetRow.id, true, true);
            });
          }
          focusCell(action.cursor);
          break;
        }
        case "toggle-select": {
          const row = rows[effectiveCursor.row];
          if (row) toggleRow(row.id, !isRowSelected(selection, row.id));
          break;
        }
        case "select-all":
          togglePage(true);
          break;
        case "copy":
          void copySelection(action.scope);
          break;
        case "edit": {
          const row = rows[effectiveCursor.row];
          if (row && column) startEdit(row, column.id);
          break;
        }
        case "commit":
          commitEdit();
          // The editor is about to unmount; focus has to be given somewhere
          // deliberate, or it falls to <body> and the grid loses the user.
          focusCell(effectiveCursor);
          break;
        case "commit-and-move": {
          commitEdit();
          focusCell(action.cursor);
          break;
        }
        case "cancel":
          stores.edit.dispatch({ type: "cancel" });
          focusCell(effectiveCursor);
          break;
        case "activate": {
          if (effectiveCursor.row < 0) {
            if (column?.getCanSort()) column.toggleSorting();
            break;
          }
          const row = rows[effectiveCursor.row];
          if (!row) break;
          if (detail) openDetail(row.id);
          else onRowClick?.(row.original);
          break;
        }
        default:
          break;
      }
    },
    [
      commitEdit,
      copySelection,
      detail,
      editState.target,
      editableColumns,
      effectiveCursor,
      focusCell,
      interactive,
      onRowClick,
      openDetail,
      pageRowIds,
      rows,
      selection,
      selectionMode,
      size,
      startEdit,
      stores.edit,
      toggleRow,
      togglePage,
      viewportEl,
      virtualizer,
      virtualizing,
      visibleColumns,
    ],
  );

  // ── Server mode ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!manual || !onQueryChange) return;
    onQueryChange({
      sorting: sorting.map((entry) => ({ id: entry.id, desc: entry.desc })),
      filters: conditions,
      search: deferredSearch,
      pageIndex: pagination.pageIndex,
      pageSize: pagination.pageSize,
    });
  }, [manual, onQueryChange, sorting, conditions, deferredSearch, pagination]);

  // Infinite scroll. Attached to the viewport rather than to the virtualizer so
  // it works in the un-virtualized case too.
  useEffect(() => {
    if (!onLoadMore || !viewportEl) return;
    const onScroll = () => {
      if (
        isNearEnd(
          {
            scrollTop: viewportEl.scrollTop,
            scrollHeight: viewportEl.scrollHeight,
            clientHeight: viewportEl.clientHeight,
          },
          estimateRowHeight(size),
        )
      ) {
        onLoadMore();
      }
    };
    viewportEl.addEventListener("scroll", onScroll, { passive: true });
    return () => viewportEl.removeEventListener("scroll", onScroll);
  }, [onLoadMore, size, viewportEl]);

  // ── Filters ───────────────────────────────────────────────────────────────
  const [announcement, setAnnouncement] = useState("");

  const filterDefs = useMemo(() => {
    const defs = new Map<string, ReturnType<typeof normalizeFilterDef>>();
    for (const def of columns) {
      const filter = normalizeFilterDef(metaOf<T>(def)?.filter);
      if (filter) defs.set(columnIdOf(def), filter);
    }
    return defs;
  }, [columns]);

  const columnLabel = useCallback(
    (id: string) => {
      const column = table.getColumn(id);
      const header = column?.columnDef.header;
      return filterDefs.get(id)?.label ?? (typeof header === "string" ? header : id);
    },
    [filterDefs, table],
  );

  const typeOfColumn = useCallback((id: string) => filterTypes[id] ?? "text", [filterTypes]);

  const fields = useMemo(() => {
    const counts = new Map<string, number>();
    for (const condition of conditions) {
      counts.set(condition.columnId, (counts.get(condition.columnId) ?? 0) + 1);
    }
    return orderFilterableFields(
      [...filterDefs.entries()].map(([columnId, def], index) => ({
        columnId,
        label: columnLabel(columnId),
        type: typeOfColumn(columnId),
        count: counts.get(columnId) ?? 0,
        priority: def?.priority,
        index,
      })),
    );
  }, [columnLabel, conditions, filterDefs, typeOfColumn]);

  const describe = useCallback(
    (condition: TableFilterCondition) =>
      describeCondition(condition, {
        type: typeOfColumn(condition.columnId),
        columnLabel: columnLabel(condition.columnId),
        catalogue,
        options: filterDefs.get(condition.columnId)?.options,
        formatValue: filterDefs.get(condition.columnId)?.formatValue,
      }),
    [catalogue, columnLabel, filterDefs, typeOfColumn],
  );

  /** Announce discrete changes only — a per-keystroke live region is a firehose. */
  const announce = useCallback(
    (kind: FilterChangeKind, condition?: TableFilterCondition) => {
      setAnnouncement(
        filterAnnouncement(
          { kind, description: condition ? describe(condition).text : undefined },
          totalMatching,
        ),
      );
    },
    [describe, totalMatching],
  );

  const addFilter = useCallback(
    (columnId: string) => {
      const def = filterDefs.get(columnId);
      const type = typeOfColumn(columnId);
      // The id the reducer is about to assign, returned so the caller can open
      // the new chip's editor without waiting for a render to find it.
      const id = `f${filterState.nextId}`;
      dispatchFilter({
        type: "add",
        columnId,
        operator: defaultOperatorFor(type, catalogue, def),
        single: def?.single,
      });
      return id;
    },
    [catalogue, filterDefs, filterState.nextId, typeOfColumn],
  );

  const updateFilter = useCallback(
    (id: string, patch: Partial<Omit<TableFilterCondition, "id" | "columnId">>) => {
      dispatchFilter({ type: "update", id, ...patch });
    },
    [],
  );

  const removeFilter = useCallback(
    (id: string) => {
      const condition = conditions.find((entry) => entry.id === id);
      if (condition) announce("removed", condition);
      dispatchFilter({ type: "remove", id });
    },
    [announce, conditions],
  );

  const clearFilters = useCallback(() => {
    announce("cleared");
    dispatchFilter({ type: "clear" });
  }, [announce]);

  /**
   * Faceted options for an enum condition.
   *
   * `getFacetedUniqueValues` allocates an array per row, so it is capped: above
   * `FACET_ROW_LIMIT` the options render without counts and nothing is
   * disabled. A column can force either way with `meta.filter.counts`.
   */
  const optionsFor = useCallback(
    (condition: TableFilterCondition) => {
      const def = filterDefs.get(condition.columnId);
      const column = table.getColumn(condition.columnId);
      const showCounts = def?.counts ?? rows.length <= FACET_ROW_LIMIT;
      return facetOptions(
        showCounts ? column?.getFacetedUniqueValues() : undefined,
        def?.options,
        condition.values,
        showCounts,
      );
    },
    [filterDefs, rows.length, table],
  );

  const operatorsForCondition = useCallback(
    (condition: TableFilterCondition) => {
      const type = typeOfColumn(condition.columnId);
      return operatorsFor(type, catalogue, filterDefs.get(condition.columnId)?.operators).map(
        (op) => ({ id: op.id, label: operatorLabel(op, type) }),
      );
    },
    [catalogue, filterDefs, typeOfColumn],
  );

  /**
   * Row activation, as one stable callback: it is a prop on every rendered row,
   * and a new function identity per row per render would defeat the row memo.
   */
  const activate = useCallback(
    (row: TableRowModel<T>) => {
      if (detail) openDetail(row.id);
      else onRowClick?.(row.original);
    },
    [detail, onRowClick, openDetail],
  );

  useUnstableIdentityWarning(data, columns);

  const chrome: TableChrome = {
    size,
    variant,
    interactive,
    totalWidth: layout.totalWidth,
    rowCount: totalMatching,
    colCount: visibleColumns.length,
    label,
    multiSelectable: selectionMode === "multiple",
  };

  return {
    table,
    rows,
    renderRows,
    chrome,
    options,
    size,
    variant,
    label,
    captionVisible,
    interactive,
    mode,
    loading,
    search,
    setSearch,
    selection: {
      mode: selectionMode,
      state: selection,
      count: selectionCountCore(selection, totalMatching),
      rows: selectedRows,
      isSelected: (rowId) => isRowSelected(selection, rowId),
      toggle: toggleRow,
      togglePage,
      selectAllMatching: selectEverythingMatching,
      clear: clearSelectionState,
      header: headerState,
      canSelectAllMatching:
        selectionMode === "multiple" &&
        headerState.checked &&
        !selection.allMatching &&
        totalMatching > visibleRowIds.length,
      totalMatching,
      asBulk: () => toBulkSelection(selection),
    },
    filters: {
      conditions,
      fields,
      add: addFilter,
      update: updateFilter,
      restore: (condition) => dispatchFilter({ type: "restore", condition }),
      remove: removeFilter,
      clear: clearFilters,
      describe,
      operatorsFor: operatorsForCondition,
      optionsFor,
      typeOf: (condition) => typeOfColumn(condition.columnId),
      arityOf: (condition) => catalogue.get(condition.operator)?.arity ?? "one",
      expanded: filterState.expanded,
      setExpanded: (expanded) => dispatchFilter({ type: "set-expanded", expanded }),
      editing: filterState.editingId,
      setEditing: (id) => dispatchFilter({ type: "set-editing", id }),
      announcement,
    },
    edit: {
      enabled: editableColumns.size > 0,
      state: editState,
      isEditing: (rowId, colId) => isEditingCell(editState, rowId, colId),
      start: startEdit,
      setValue: (value) => stores.edit.dispatch({ type: "change", value }),
      commit: commitEdit,
      cancel: () => stores.edit.dispatch({ type: "cancel" }),
      contextFor: editContextFor,
    },
    detail: {
      enabled: Boolean(detail),
      state: detailState,
      row: detailRow,
      total: totalMatching,
      open: openDetail,
      close: closeDetail,
      step: stepDetail,
      canStep: (direction) => stepRow(pageRowIds, detailState.rowId, direction) !== null,
      setDirty: (dirty) => stores.detail.dispatch({ type: "dirty", dirty }),
      resolveConfirm: resolveDetailConfirm,
    },
    focus: {
      cursor: effectiveCursor,
      setCursor,
      focusCell,
      isFocused: (rowIndex, colIndex) =>
        effectiveCursor.row === rowIndex && effectiveCursor.col === colIndex,
    },
    virtual: { enabled: virtualizing, virtualizer, spacers },
    scroll,
    columnWidths: layout.widths,
    rootRef: setRootEl,
    viewportRef: setViewportEl,
    exportCsv,
    copySelection,
    onGridKeyDown,
    activate,
    primaryColumnId: primaryId,
  };
}

/**
 * Whether the viewport is hiding columns off its edges, and how to move it.
 *
 * Three signals, because three different things change the answer: the user
 * scrolls, the viewport is resized, and the content is re-laid out underneath it
 * — a column hidden, a column resized, a page of narrower values. That last one
 * moves neither the scroll offset nor the viewport's own box, which is why the
 * scrolled content is observed and not just its container.
 *
 * Every update goes through a bail-out compare. The numbers change on every
 * frame of a scroll; the three booleans they answer change only at the ends, so
 * the table re-renders twice per traversal rather than once per frame.
 */
function useHorizontalScroll(viewport: HTMLElement | null): HorizontalScrollApi {
  const [state, setState] = useState<HorizontalScrollState>(NO_HORIZONTAL_SCROLL);

  useEffect(() => {
    if (!viewport) {
      setState(NO_HORIZONTAL_SCROLL);
      return;
    }

    const read = () =>
      setState((previous) => {
        const next = horizontalScrollState(viewport);
        return next.overflowing === previous.overflowing &&
          next.canScrollLeft === previous.canScrollLeft &&
          next.canScrollRight === previous.canScrollRight
          ? previous
          : next;
      });

    read();
    viewport.addEventListener("scroll", read, { passive: true });
    // Guarded for jsdom and SSR, exactly as `watchWidth` is. Without an observer
    // the state is still correct on mount and on every scroll — it just stops
    // noticing a resize, which is the same trade the responsive watcher makes.
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(read);
    observer?.observe(viewport);
    // In table mode the scrolled content is the `<table>`. In card mode the list
    // *is* the scroll container, and is also the mode with nothing to scroll
    // sideways, so observing its first card costs nothing and reports nothing.
    const content = viewport.firstElementChild;
    if (content) observer?.observe(content);

    return () => {
      viewport.removeEventListener("scroll", read);
      observer?.disconnect();
    };
  }, [viewport]);

  const by = useCallback(
    (direction: -1 | 1) => {
      if (!viewport) return;
      const left = horizontalScrollTarget(viewport, direction);
      // Smooth unless the user asked for less motion — and unless the engine has
      // no options-taking `scrollTo` at all (jsdom), where the assignment is the
      // same scroll without the animation.
      if (typeof viewport.scrollTo === "function" && !prefersReducedMotion()) {
        viewport.scrollTo({ left, behavior: "smooth" });
      } else {
        viewport.scrollLeft = left;
      }
    },
    [viewport],
  );

  return useMemo(() => ({ ...state, by }), [state, by]);
}

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * The single most common cause of a slow TanStack table: `data` or `columns`
 * rebuilt as a fresh array on every render, which invalidates every memoized row
 * model on every keystroke.
 *
 * Identity alone is not evidence — real data updates change it too — so this
 * only fires when the identity changed while the *contents* plainly did not.
 * Dev-only, and once per mount.
 */
function useUnstableIdentityWarning(data: unknown, columns: unknown): void {
  const previous = useRef<{ data: unknown; columns: unknown } | null>(null);
  const warned = useRef(false);

  useEffect(() => {
    if (process.env.NODE_ENV === "production" || warned.current) {
      previous.current = { data, columns };
      return;
    }
    const before = previous.current;
    previous.current = { data, columns };
    if (!before) return;

    for (const [name, next, prev] of [
      ["data", data, before.data],
      ["columns", columns, before.columns],
    ] as const) {
      if (next === prev || !Array.isArray(next) || !Array.isArray(prev)) continue;
      const sameContents =
        next.length === prev.length && next[0] === prev[0] && next.at(-1) === prev.at(-1);
      if (!sameContents) continue;
      warned.current = true;
      console.warn(
        `[@ui-organized/react-table] \`${name}\` is a new array on every render but holds the ` +
          `same items. Every row model is recomputed as a result. Wrap it in \`useMemo\` ` +
          `(or hoist it out of the component) — this is the usual reason a large table feels slow.`,
      );
    }
  });
}
