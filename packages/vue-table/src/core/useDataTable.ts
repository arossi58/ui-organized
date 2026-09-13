/**
 * The headless layer: core's stores and TanStack's Vue adapter, bound together.
 *
 * Everything decided here is a *binding* decision — which ref holds what, when
 * a value is deferred, how focus is restored. Every behavioural decision (what
 * Tab does, what a shift-range covers, when to virtualize) lives in
 * `@ui-organized/table-core` and is reached from here, which is what keeps a
 * second framework adapter to this file plus the components.
 *
 * ── The three shape differences from the React adapter ──────────────────────
 *
 * 1. **A composable runs once.** React's hook re-runs on every render, so its
 *    derived values are ordinary expressions. Here every one of them is a
 *    `computed`, and anything that is not is a snapshot of the first frame that
 *    silently never updates again.
 * 2. **There is no priority scheduler.** React defers the expensive filter pass
 *    with `useDeferredValue`; `./useDeferred.ts` is what stands in for it, and
 *    its header explains why an idle callback rather than a debounce.
 * 3. **Options are read, not destructured.** `useDataTable(props)` is the
 *    intended call, and a component's props are reactive — so every option is
 *    read inside a `computed` rather than pulled out once at the top.
 */
import { computed, ref, shallowRef, watch, watchEffect, type Ref } from "vue";
// The state types come through the Vue adapter rather than from
// `@tanstack/table-core` directly: the adapter re-exports all of them, and
// depending on the core package as well would put a second copy of TanStack in
// the tree for any consumer whose resolver picked a different version.
import {
  useTable,
  type ColumnOrderState,
  type ColumnPinningState,
  type ColumnSizingState,
  type ColumnVisibilityState,
  type PaginationState,
  type SortingState,
  type TableState,
  type Updater,
  type VueTable,
} from "@tanstack/vue-table";
import { useVirtualizer } from "@tanstack/vue-virtual";
import {
  CARD_HEIGHT,
  DEFAULT_PAGE_SIZE,
  EMPTY_SELECTION,
  FACET_ROW_LIMIT,
  columnId as columnIdOf,
  copyRowsToClipboard,
  coreTableOptions,
  createDetailStore,
  createEditStore,
  createFilterReducer,
  createOperatorCatalogue,
  defaultOperatorFor,
  describeCondition,
  estimateRowHeight,
  exportRowsToCsv,
  facetOptions,
  filterAnnouncement,
  fromColumnFilters,
  gridKeyDown,
  headerCheckboxState,
  horizontalScrollState,
  horizontalScrollTarget,
  inferFilterType,
  INITIAL_FILTER_STATE,
  isEditing as isEditingCell,
  isNearEnd,
  isSelected as isRowSelected,
  layoutColumns,
  metaOf,
  NO_HORIZONTAL_SCROLL,
  normalizeFilterDef,
  operatorLabel,
  operatorsFor,
  orderFilterableFields,
  overscanFor,
  primaryColumnId,
  rangeSelect,
  resolveMode,
  selectAllMatching as selectAllMatchingCore,
  selectPage,
  selectionCount as selectionCountCore,
  shouldVirtualize,
  spacerHeights,
  stepRow,
  toBulkSelection,
  toColumnFilters,
  watchWidth,
  type FilterChangeKind,
  type GridCursor,
  type RowData,
  type SelectionState,
  type TableChrome,
  type TableEditContext,
  type TableFilterCondition,
  type TableFilterState,
  type TableFilterType,
  type TableRowModel,
  type TableRowScope,
  type HorizontalScrollState,
  type UioTableFeatures,
} from "@ui-organized/table-core";
import { useStore } from "./useStore.js";
import { useDeferred } from "./useDeferred.js";
import { actionsColumn, selectionColumn } from "./systemColumns.js";
import type {
  DataTableApi,
  HorizontalScrollApi,
  RenderRow,
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
function sampleColumn<T extends RowData>(
  data: readonly T[],
  def: TableColumn<T>,
  id: string,
): unknown[] {
  const key = (def as { accessorKey?: string }).accessorKey ?? id;
  // Twenty, not one: a leading null should not get to decide the type.
  return data.slice(0, 20).map((row) => readPath(row, key));
}

/** TanStack's logical pinning positions, in this design system's physical ones. */
const PINNED_SIDE: Record<string, "left" | "right" | false> = {
  start: "left",
  end: "right",
  false: false,
  undefined: false,
};

function applyUpdater<S>(updater: Updater<S>, previous: S): S {
  return typeof updater === "function" ? (updater as (old: S) => S)(previous) : updater;
}

/**
 * `meta.sticky` is our vocabulary; `columnPinning` is TanStack's.
 *
 * The two disagree on more than the key name since v9: TanStack pins to
 * `start`/`end`, which is the correct call for a library that has to work in
 * both writing directions, while this design system says `left`/`right` because
 * its sticky offsets are physical CSS properties. `stickyPositionOf` in
 * table-core translates the other direction; this is the way in.
 */
function pinningFromMeta<T extends RowData>(
  columns: readonly TableColumn<T>[],
): ColumnPinningState {
  const start: string[] = [];
  const end: string[] = [];
  for (const def of columns) {
    const sticky = metaOf<T>(def)?.sticky;
    if (sticky === "left") start.push(columnIdOf(def));
    else if (sticky === "right") end.push(columnIdOf(def));
  }
  return { start, end };
}

export function useDataTable<T extends RowData>(options: UseDataTableOptions<T>): DataTableApi<T> {
  // ── Options, read reactively ──────────────────────────────────────────────
  // Each of these is the Vue equivalent of one destructured default in the React
  // adapter. They are computeds rather than constants so that a table driven by
  // a component's props follows them.
  const label = computed(() => options.label);
  const captionVisible = computed(() => options.captionVisible ?? false);
  const size = computed(() => options.size ?? "md");
  const variant = computed(() => options.variant ?? "default");
  const selectionMode = computed(() => options.selection ?? "none");
  const sortable = computed(() => options.sortable ?? true);
  const filterable = computed(() => options.filterable ?? true);
  const paginated = computed(() => options.paginated ?? false);
  const resizable = computed(() => options.resizable ?? false);
  const virtualOption = computed(() => options.virtual ?? true);
  const loading = computed(() => options.loading ?? false);
  const manual = computed(() => options.manual ?? false);

  // ── DOM handles ───────────────────────────────────────────────────────────
  // Plain template refs. React needs callback refs here because an effect that
  // observes the node has to re-run when it appears, and a ref assignment does
  // not trigger a render; Vue's `watch` on a ref gives that for free.
  const rootRef = ref<HTMLElement | null>(null);
  // `HTMLElement`, not `HTMLDivElement`: in card mode the scroll container is a
  // `<ul>`, and the virtualizer attaches to whichever one is rendered.
  const viewportRef = ref<HTMLElement | null>(null);

  // ── Table state ───────────────────────────────────────────────────────────
  const sorting = ref<SortingState>(options.defaultSorting ?? []) as Ref<SortingState>;

  // Filters are a reducer, not a bag of refs. The reducer itself lives in core,
  // where it is portable and testable without a renderer; the binding here is a
  // `shallowRef` plus a dispatch, which is the same three lines `useStore` uses
  // and for the same reason.
  const catalogue = computed(() => createOperatorCatalogue(options.filterOperators));
  const filterState = shallowRef<TableFilterState>(seedFilterState(options.defaultFilters));
  const dispatchFilter = (action: Parameters<ReturnType<typeof createFilterReducer>>[1]) => {
    filterState.value = createFilterReducer(catalogue.value)(filterState.value, action);
  };
  const conditions = computed(() => filterState.value.conditions);

  /**
   * Conditions update **urgently**; only the filtering they drive is deferred.
   *
   * Same split the React adapter makes and for the same reason — a control whose
   * value arrives late lags behind the keystrokes, and typing "ada" lands as
   * "a". See `./useDeferred.ts` for what stands in for `useDeferredValue`.
   */
  const deferredConditions = useDeferred(() => conditions.value);
  const columnFilters = computed(() => toColumnFilters(deferredConditions.value));

  const search = ref("");
  // Typing must never block. The deferred value is what the table filters on, so
  // the input updates on every keystroke while the re-filter happens on an idle
  // beat.
  const deferredSearch = useDeferred(() => search.value);

  const pagination = ref<PaginationState>({
    pageIndex: 0,
    pageSize: options.pageSize ?? DEFAULT_PAGE_SIZE,
  }) as Ref<PaginationState>;
  const columnVisibility = ref<ColumnVisibilityState>(
    options.defaultColumnVisibility ?? {},
  ) as Ref<ColumnVisibilityState>;
  const columnOrder = ref<ColumnOrderState>([]) as Ref<ColumnOrderState>;
  const columnSizing = ref<ColumnSizingState>({}) as Ref<ColumnSizingState>;
  const selection = shallowRef<SelectionState>(EMPTY_SELECTION);

  // ── Measurement ───────────────────────────────────────────────────────────
  // Two widths, because they answer different questions. The root's width picks
  // the responsive mode; the viewport's content width decides how much room the
  // columns actually have (it excludes the border, and shrinks when a vertical
  // scrollbar appears).
  const width = ref<number | null>(null);
  const viewportWidth = ref<number | null>(null);
  watch(
    rootRef,
    (element, _old, onCleanup) => onCleanup(watchWidth(element, (value) => (width.value = value))),
    { immediate: true },
  );
  watch(
    viewportRef,
    (element, _old, onCleanup) =>
      onCleanup(watchWidth(element, (value) => (viewportWidth.value = value))),
    { immediate: true },
  );
  const mode = computed(() => resolveMode(options.responsive, width.value));
  const scroll = useHorizontalScroll(viewportRef);

  // ── Columns ───────────────────────────────────────────────────────────────
  const allColumns = computed(() => {
    const out: TableColumn<T>[] = [...options.columns];
    if (selectionMode.value !== "none") out.unshift(selectionColumn<T>());
    if (options.rowActions?.length) out.push(actionsColumn<T>());
    return out;
  });

  const primaryId = computed(() => primaryColumnId(options.columns));
  const basePinning = computed(() => pinningFromMeta(allColumns.value));

  // Created once, outside any computed: these are stores, not derived values,
  // and rebuilding one would discard an open editor mid-keystroke.
  const stores = { edit: createEditStore(), detail: createDetailStore() };
  const editState = useStore(stores.edit);
  const detailState = useStore(stores.detail);

  const editableColumns = computed(
    () =>
      new Set(options.columns.filter((def) => metaOf<T>(def)?.edit).map((def) => columnIdOf(def))),
  );

  const interactive = computed(
    () =>
      selectionMode.value !== "none" ||
      editableColumns.value.size > 0 ||
      Boolean(options.onRowClick) ||
      Boolean(options.detail) ||
      Boolean(options.rowActions?.length),
  );

  /**
   * The filter type per filterable column, from its declaration or inferred
   * from the data.
   *
   * Read off the raw rows rather than the table's, because this is an *input* to
   * building the table. That means an `accessorFn` column cannot be sampled and
   * falls back to `text`; declaring `meta.filter.type` is the answer there.
   */
  const filterTypes = computed(() => {
    const types: Record<string, TableFilterType> = {};
    for (const def of options.columns) {
      const filter = normalizeFilterDef(metaOf<T>(def)?.filter);
      if (!filter) continue;
      const id = columnIdOf(def);
      types[id] =
        filter.type ?? inferFilterType(sampleColumn(options.data, def, id), filter.options);
    }
    return types;
  });

  const tableOptions = computed(() =>
    coreTableOptions<T>({
      data: options.data,
      columns: allColumns.value,
      getRowId: options.getRowId,
      selection: selectionMode.value,
      sortable: sortable.value,
      filterable: filterable.value,
      paginated: paginated.value,
      resizable: resizable.value,
      manual: manual.value,
      rowCount: options.rowCount,
      filterTypes: filterTypes.value,
      catalogue: catalogue.value,
    }),
  );

  /**
   * The Vue adapter unwraps refs in its options and re-syncs the table when they
   * change, so the whole option bag and the controlled state go in as computeds.
   *
   * `data` and `columns` come through `tableOptions` rather than separately: the
   * call maps over the columns to attach filter functions, and TanStack memoizes
   * its column tree on the array's *reference* — so building it inline would
   * rebuild every column, and everything downstream, on every dependency change.
   */
  /**
   * The controlled state, in one place.
   *
   * Also handed back on the api, because `table.state` is a *React*-adapter
   * convenience — the Vue adapter exposes `atoms` instead. Reading it off the
   * engine would be the wrong direction anyway: the table is controlled, so
   * these refs are the source of truth and the engine is downstream of them.
   */
  const state = computed<Partial<TableState<UioTableFeatures>>>(() => ({
    sorting: sorting.value,
    columnFilters: columnFilters.value,
    globalFilter: deferredSearch.value,
    pagination: pagination.value,
    columnVisibility: columnVisibility.value,
    columnOrder: columnOrder.value,
    columnSizing: columnSizing.value,
    columnPinning: basePinning.value,
    rowSelection: selection.value.rows,
  }));

  const table = useTable<UioTableFeatures, T>({
    ...(tableOptions.value as object),
    data: computed(() => tableOptions.value.data),
    columns: computed(() => tableOptions.value.columns),
    features: computed(() => tableOptions.value.features),
    state,
    onSortingChange: (updater: Updater<SortingState>) => {
      sorting.value = applyUpdater(updater, sorting.value);
    },
    // The raw TanStack instance is a documented escape hatch, so
    // `table.resetColumnFilters()` and `column.setFilterValue()` still have to
    // work. They land here and are translated back into conditions — one
    // direction of truth, and the round trip is the identity.
    onColumnFiltersChange: (updater: Updater<ReturnType<typeof toColumnFilters>>) =>
      dispatchFilter({
        type: "replace",
        conditions: fromColumnFilters(applyUpdater(updater, columnFilters.value)),
      }),
    onGlobalFilterChange: (updater: Updater<string>) => {
      search.value = applyUpdater(updater, search.value);
    },
    onPaginationChange: (updater: Updater<PaginationState>) => {
      pagination.value = applyUpdater(updater, pagination.value);
    },
    onColumnVisibilityChange: (updater: Updater<ColumnVisibilityState>) => {
      columnVisibility.value = applyUpdater(updater, columnVisibility.value);
    },
    onColumnOrderChange: (updater: Updater<ColumnOrderState>) => {
      columnOrder.value = applyUpdater(updater, columnOrder.value);
    },
    onColumnSizingChange: (updater: Updater<ColumnSizingState>) => {
      columnSizing.value = applyUpdater(updater, columnSizing.value);
    },
    onRowSelectionChange: (updater: Updater<Record<string, true>>) => {
      selection.value = {
        ...selection.value,
        rows: applyUpdater(updater, selection.value.rows),
      };
    },
  } as never) as VueTable<UioTableFeatures, T>;

  const rows = computed(() => table.getRowModel().rows);
  const visibleColumns = computed(() => table.getVisibleLeafColumns());

  // A table narrower than its container would otherwise leave a bare strip where
  // the header band stops. The surplus goes to one column rather than being
  // spread across all of them — see `layoutColumns` for why that matters to
  // every pinned column's sticky offset.
  const layout = computed(() =>
    layoutColumns(
      visibleColumns.value.map((column) => ({
        id: column.id,
        size: column.getSize(),
        pinned: PINNED_SIDE[String(column.getIsPinned())] ?? false,
      })),
      mode.value === "table" ? viewportWidth.value : null,
    ),
  );

  // Post-filter, pre-pagination: what "1–25 of 312" counts, and what
  // `aria-rowcount` reports.
  const totalMatching = computed(() =>
    manual.value
      ? (options.rowCount ?? rows.value.length)
      : table.getPrePaginatedRowModel().rows.length,
  );
  const rowOffset = computed(() =>
    paginated.value && !manual.value ? pagination.value.pageIndex * pagination.value.pageSize : 0,
  );

  // ── Virtualization ────────────────────────────────────────────────────────
  const virtualizing = computed(() => shouldVirtualize(rows.value.length, virtualOption.value));
  // Always constructed, exactly as in React — not because Vue forbids a
  // conditional composable, but because tearing a virtualizer down and building
  // a new one when a filter drops the row count below the threshold would lose
  // the scroll position. An idle virtualizer costs one scroll listener.
  const virtualizer = useVirtualizer<HTMLElement, HTMLElement>(
    computed(() => ({
      count: virtualizing.value ? rows.value.length : 0,
      getScrollElement: () => viewportRef.value,
      // Cards are much taller than rows and vary far more, so the first guess
      // differs by mode. Both are corrected by `measureElement` on the first
      // frame; the estimate only has to be close enough for the initial scroll
      // height not to jump.
      estimateSize: () => (mode.value === "cards" ? CARD_HEIGHT : estimateRowHeight(size.value)),
      overscan: overscanFor(virtualOption.value),
      // Rows are measured rather than trusted: the estimate is derived from
      // tokens, and a re-themed table would otherwise mis-position its scroll
      // content by a few pixels per row.
      measureElement: (element: HTMLElement) => element.getBoundingClientRect().height,
    })),
  );

  const spacers = computed(() =>
    virtualizing.value
      ? spacerHeights(virtualizer.value.getVirtualItems(), virtualizer.value.getTotalSize())
      : NO_SPACERS,
  );

  const renderRows = computed<RenderRow<T>[]>(() => {
    const build = (row: TableRowModel<T>, index: number): RenderRow<T> => ({
      row,
      index,
      // What `aria-rowindex` reports: where it sits in the whole dataset, so a
      // screen reader says "row 4,312 of 100,000" rather than "row 4 of 30".
      absoluteIndex: index + rowOffset.value,
    });
    if (!virtualizing.value) return rows.value.map(build);
    const out: RenderRow<T>[] = [];
    for (const item of virtualizer.value.getVirtualItems()) {
      const row = rows.value[item.index];
      if (row) out.push(build(row, item.index));
    }
    return out;
  });

  // ── Grid focus ────────────────────────────────────────────────────────────
  const cursorState = ref<GridCursor>({ row: 0, col: 0 });
  // A counter, not a boolean: the same cell can be re-focused (after an editor
  // closes, say) without the cursor changing, and a boolean would be consumed by
  // an unrelated update before the watcher that needs it runs.
  const focusRequest = ref(0);
  // With no rows there is nothing in the body to hold the tab stop, so it moves
  // to the header — which is still operable (sorting) and still one tab stop.
  const effectiveCursor = computed<GridCursor>(() =>
    rows.value.length === 0 ? { row: -1, col: cursorState.value.col } : cursorState.value,
  );

  const moveCursor = (next: GridCursor) => {
    const prev = cursorState.value;
    if (prev.row === next.row && prev.col === next.col) return;
    cursorState.value = next;
  };

  /**
   * Follow focus that has already moved — a click, or Tab landing on a cell.
   * Deliberately does NOT take focus.
   *
   * The two used to be one function in the React adapter, and it broke inline
   * editing outright: the editor's input took focus, its cell's `focus` event
   * bubbled, the cursor was "set", and the watcher below dutifully focused the
   * cell again — pulling focus straight back out of the editor the user had just
   * opened. The same trap exists here and is avoided the same way.
   */
  const setCursor = moveCursor;

  /** Move the cursor AND take DOM focus. Keyboard actions only. */
  const focusCell = (next: GridCursor) => {
    moveCursor(next);
    focusRequest.value += 1;
  };

  watch(
    focusRequest,
    (count) => {
      const viewport = viewportRef.value;
      if (count === 0 || !viewport) return;
      let attempts = 0;
      const tryFocus = () => {
        const { row, col } = effectiveCursor.value;
        const element = viewport.querySelector<HTMLElement>(`[data-cell="${row}:${col}"]`);
        if (element) {
          element.focus();
          return;
        }
        // A PageDown into un-rendered territory scrolls first; the row exists one
        // frame later. Two attempts, then give up rather than spin.
        if (attempts++ < 2 && typeof requestAnimationFrame === "function") {
          requestAnimationFrame(tryFocus);
        }
      };
      // `post`, so the DOM the cursor moved to exists before it is queried.
      tryFocus();
    },
    { flush: "post" },
  );

  // ── Selection ─────────────────────────────────────────────────────────────
  const pageRowIds = computed(() => rows.value.map((row) => row.id));

  /**
   * The rows the header checkbox governs: what is **on screen**.
   *
   * For a paginated table that is the page, because `renderRows` is the page.
   * For a virtualized one it is the rendered window, and that distinction is the
   * whole point — `rows` on the 100,000-row table is all 100,000, so a header
   * checkbox scoped to it answers one click by enumerating a hundred thousand
   * ids. `selectAllMatching` already says "all of them" as a flag that costs
   * nothing, and the selection bar offers it the moment this is ticked.
   */
  const visibleRowIds = computed(() => renderRows.value.map((entry) => entry.row.id));
  const headerState = computed(() => headerCheckboxState(selection.value, visibleRowIds.value));

  const toggleRow = (rowId: string, checked: boolean, shift = false) => {
    selection.value =
      selectionMode.value === "single"
        ? { ...EMPTY_SELECTION, rows: checked ? { [rowId]: true } : {}, anchor: rowId }
        : rangeSelect(selection.value, pageRowIds.value, rowId, shift, checked);
  };

  const togglePage = (checked: boolean) => {
    selection.value = selectPage(selection.value, visibleRowIds.value, checked);
  };

  const selectEverythingMatching = () => {
    const next = selectAllMatchingCore(selection.value);
    // The loaded rows are materialised as well as the flag, so
    // `getSelectedRowModel()` — and therefore CSV export and any bulk action
    // over real row objects — still works for the rows the client has.
    const rowsState: Record<string, true> = {};
    for (const row of table.getPrePaginatedRowModel().rows) rowsState[row.id] = true;
    selection.value = { ...next, rows: rowsState };
  };

  const clearSelectionState = () => {
    selection.value = EMPTY_SELECTION;
  };

  const selectedRows = computed(() => {
    // `selection` is read explicitly even though `getSelectedRowModel` depends
    // on it: the table instance is stable and its row-model call is memoized, so
    // without this read the computed would have no reactive dependency at all.
    void selection.value;
    return table.getSelectedRowModel().rows.map((row) => row.original);
  });

  // ── Inline edit ───────────────────────────────────────────────────────────
  const startEdit = (row: TableRowModel<T>, colId: string) => {
    if (!editableColumns.value.has(colId)) return;
    stores.edit.dispatch({
      type: "start",
      target: { rowId: row.id, columnId: colId },
      value: row.getValue(colId),
    });
  };

  const commitEdit = () => {
    const state = stores.edit.getState();
    const target = state.target;
    // `pending` is the re-entry guard. A commit is reachable from three places
    // at once — Enter, Tab, and the editor's own blur as focus returns to the
    // cell — and without this an edit is written twice.
    if (!target || state.invalid || state.pending) return;
    const row = table.getRow(target.rowId);
    const column = allColumns.value.find((def) => columnIdOf(def) === target.columnId);
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
    Promise.resolve(options.onEdit?.(patch)).then(
      () => stores.edit.dispatch({ type: "commit-done" }),
      (error: unknown) =>
        stores.edit.dispatch({
          type: "commit-failed",
          message: error instanceof Error ? error.message : "Could not save the change",
        }),
    );
  };

  const editContextFor = (row: TableRowModel<T>, colId: string): TableEditContext<T> | null => {
    if (!isEditingCell(editState.value, row.id, colId)) return null;
    return {
      row: row.original,
      rowId: row.id,
      columnId: colId,
      value: editState.value.draft,
      size: size.value,
      invalid: editState.value.invalid,
      setValue: (value) => {
        const column = allColumns.value.find((def) => columnIdOf(def) === colId);
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
  };

  // ── Row detail ────────────────────────────────────────────────────────────
  const openDetail = (rowId: string) => {
    stores.detail.dispatch({ type: "open", rowId, index: pageRowIds.value.indexOf(rowId) });
  };

  const stepDetail = (direction: -1 | 1) => {
    const state = stores.detail.getState();
    if (state.dirty) {
      stores.detail.dispatch({ type: "confirm", intent: direction === -1 ? "prev" : "next" });
      return;
    }
    const next = stepRow(pageRowIds.value, state.rowId, direction);
    if (next) stores.detail.dispatch({ type: "go", ...next });
  };

  const closeDetail = () => {
    if (stores.detail.getState().dirty) {
      stores.detail.dispatch({ type: "confirm", intent: "close" });
      return;
    }
    stores.detail.dispatch({ type: "close" });
  };

  const resolveDetailConfirm = (discard: boolean) => {
    const state = stores.detail.getState();
    const intent = state.confirming;
    stores.detail.dispatch({ type: "dismiss" });
    if (!discard || !intent) return;
    if (intent === "close") {
      stores.detail.dispatch({ type: "close" });
      return;
    }
    const next = stepRow(pageRowIds.value, state.rowId, intent === "prev" ? -1 : 1);
    if (next) stores.detail.dispatch({ type: "go", ...next });
  };

  const detailRow = computed(() => {
    const rowId = detailState.value.rowId;
    if (!rowId) return null;
    const row = rows.value.find((candidate) => candidate.id === rowId);
    return row ? row.original : null;
  });

  // ── Export ────────────────────────────────────────────────────────────────
  const exportCsv = (scope: TableRowScope = "view") => {
    exportRowsToCsv(table, {
      scope,
      filename: `${label.value.toLowerCase().replaceAll(/\s+/g, "-")}.csv`,
    });
  };

  const copySelection = (scope: TableRowScope = "selected") =>
    copyRowsToClipboard(table, { scope });

  // ── Keyboard ──────────────────────────────────────────────────────────────
  const onGridKeyDown = (event: KeyboardEvent) => {
    if (!interactive.value) return;
    const cursor = effectiveCursor.value;
    const column = visibleColumns.value[cursor.col];
    const pageRows = Math.max(
      1,
      Math.floor((viewportRef.value?.clientHeight ?? 0) / estimateRowHeight(size.value)) - 1,
    );
    const action = gridKeyDown(
      {
        cursor,
        rowCount: rows.value.length,
        colCount: visibleColumns.value.length,
        pageRows,
        editing: Boolean(editState.value.target),
        editable: column ? editableColumns.value.has(column.id) : false,
        selectable: selectionMode.value !== "none",
        multiSelect: selectionMode.value === "multiple",
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
        if (virtualizing.value) {
          virtualizer.value.scrollToIndex(action.cursor.row, { align: "center" });
        }
        focusCell(action.cursor);
        break;
      case "extend": {
        const anchorRow = rows.value[cursor.row];
        const targetRow = rows.value[action.cursor.row];
        if (anchorRow && targetRow) {
          const seeded = selection.value.anchor
            ? selection.value
            : { ...selection.value, anchor: anchorRow.id };
          selection.value = rangeSelect(seeded, pageRowIds.value, targetRow.id, true, true);
        }
        focusCell(action.cursor);
        break;
      }
      case "toggle-select": {
        const row = rows.value[cursor.row];
        if (row) toggleRow(row.id, !isRowSelected(selection.value, row.id));
        break;
      }
      case "select-all":
        togglePage(true);
        break;
      case "copy":
        void copySelection(action.scope);
        break;
      case "edit": {
        const row = rows.value[cursor.row];
        if (row && column) startEdit(row, column.id);
        break;
      }
      case "commit":
        commitEdit();
        // The editor is about to unmount; focus has to be given somewhere
        // deliberate, or it falls to <body> and the grid loses the user.
        focusCell(cursor);
        break;
      case "commit-and-move":
        commitEdit();
        focusCell(action.cursor);
        break;
      case "cancel":
        stores.edit.dispatch({ type: "cancel" });
        focusCell(cursor);
        break;
      case "activate": {
        if (cursor.row < 0) {
          if (column?.getCanSort()) column.toggleSorting();
          break;
        }
        const row = rows.value[cursor.row];
        if (!row) break;
        if (options.detail) openDetail(row.id);
        else options.onRowClick?.(row.original);
        break;
      }
      default:
        break;
    }
  };

  // ── Server mode ───────────────────────────────────────────────────────────
  watchEffect(() => {
    if (!manual.value || !options.onQueryChange) return;
    options.onQueryChange({
      sorting: sorting.value.map((entry: SortingState[number]) => ({
        id: entry.id,
        desc: entry.desc,
      })),
      filters: conditions.value,
      search: deferredSearch.value,
      pageIndex: pagination.value.pageIndex,
      pageSize: pagination.value.pageSize,
    });
  });

  // Infinite scroll. Attached to the viewport rather than to the virtualizer so
  // it works in the un-virtualized case too.
  watch(
    [viewportRef, () => options.onLoadMore],
    ([viewport, onLoadMore], _old, onCleanup) => {
      if (!onLoadMore || !viewport) return;
      const onScroll = () => {
        if (
          isNearEnd(
            {
              scrollTop: viewport.scrollTop,
              scrollHeight: viewport.scrollHeight,
              clientHeight: viewport.clientHeight,
            },
            estimateRowHeight(size.value),
          )
        ) {
          onLoadMore();
        }
      };
      viewport.addEventListener("scroll", onScroll, { passive: true });
      onCleanup(() => viewport.removeEventListener("scroll", onScroll));
    },
    { immediate: true },
  );

  // ── Filters ───────────────────────────────────────────────────────────────
  const announcement = ref("");

  const filterDefs = computed(() => {
    const defs = new Map<string, ReturnType<typeof normalizeFilterDef>>();
    for (const def of options.columns) {
      const filter = normalizeFilterDef(metaOf<T>(def)?.filter);
      if (filter) defs.set(columnIdOf(def), filter);
    }
    return defs;
  });

  const columnLabel = (id: string) => {
    const column = table.getColumn(id);
    const header = column?.columnDef.header;
    return filterDefs.value.get(id)?.label ?? (typeof header === "string" ? header : id);
  };

  const typeOfColumn = (id: string) => filterTypes.value[id] ?? "text";

  const fields = computed(() => {
    const counts = new Map<string, number>();
    for (const condition of conditions.value) {
      counts.set(condition.columnId, (counts.get(condition.columnId) ?? 0) + 1);
    }
    return orderFilterableFields(
      [...filterDefs.value.entries()].map(([columnId, def], index) => ({
        columnId,
        label: columnLabel(columnId),
        type: typeOfColumn(columnId),
        count: counts.get(columnId) ?? 0,
        priority: def?.priority,
        index,
      })),
    );
  });

  const describe = (condition: TableFilterCondition) =>
    describeCondition(condition, {
      type: typeOfColumn(condition.columnId),
      columnLabel: columnLabel(condition.columnId),
      catalogue: catalogue.value,
      options: filterDefs.value.get(condition.columnId)?.options,
      formatValue: filterDefs.value.get(condition.columnId)?.formatValue,
    });

  /** Announce discrete changes only — a per-keystroke live region is a firehose. */
  const announce = (kind: FilterChangeKind, condition?: TableFilterCondition) => {
    announcement.value = filterAnnouncement(
      { kind, description: condition ? describe(condition).text : undefined },
      totalMatching.value,
    );
  };

  const addFilter = (columnId: string) => {
    const def = filterDefs.value.get(columnId);
    const type = typeOfColumn(columnId);
    // The id the reducer is about to assign, returned so the caller can open the
    // new chip's editor without waiting for a render to find it.
    const id = `f${filterState.value.nextId}`;
    dispatchFilter({
      type: "add",
      columnId,
      operator: defaultOperatorFor(type, catalogue.value, def),
      single: def?.single,
    });
    return id;
  };

  const removeFilter = (id: string) => {
    const condition = conditions.value.find((entry) => entry.id === id);
    if (condition) announce("removed", condition);
    dispatchFilter({ type: "remove", id });
  };

  const clearFilters = () => {
    announce("cleared");
    dispatchFilter({ type: "clear" });
  };

  /**
   * Faceted options for an enum condition.
   *
   * `getFacetedUniqueValues` allocates an array per row, so it is capped: above
   * `FACET_ROW_LIMIT` the options render without counts and nothing is disabled.
   * A column can force either way with `meta.filter.counts`.
   */
  const optionsFor = (condition: TableFilterCondition) => {
    const def = filterDefs.value.get(condition.columnId);
    const column = table.getColumn(condition.columnId);
    const showCounts = def?.counts ?? rows.value.length <= FACET_ROW_LIMIT;
    return facetOptions(
      showCounts ? column?.getFacetedUniqueValues() : undefined,
      def?.options,
      condition.values,
      showCounts,
    );
  };

  const operatorsForCondition = (condition: TableFilterCondition) => {
    const type = typeOfColumn(condition.columnId);
    return operatorsFor(
      type,
      catalogue.value,
      filterDefs.value.get(condition.columnId)?.operators,
    ).map((op) => ({ id: op.id, label: operatorLabel(op, type) }));
  };

  const activate = (row: TableRowModel<T>) => {
    if (options.detail) openDetail(row.id);
    else options.onRowClick?.(row.original);
  };

  const chrome = computed<TableChrome>(() => ({
    size: size.value,
    variant: variant.value,
    interactive: interactive.value,
    totalWidth: layout.value.totalWidth,
    rowCount: totalMatching.value,
    colCount: visibleColumns.value.length,
    label: label.value,
    multiSelectable: selectionMode.value === "multiple",
  }));

  return {
    table,
    state,
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
    setSearch: (value: string) => {
      search.value = value;
    },
    selection: {
      mode: selectionMode,
      state: computed(() => selection.value),
      count: computed(() => selectionCountCore(selection.value, totalMatching.value)),
      rows: selectedRows,
      isSelected: (rowId) => isRowSelected(selection.value, rowId),
      toggle: toggleRow,
      togglePage,
      selectAllMatching: selectEverythingMatching,
      clear: clearSelectionState,
      header: headerState,
      canSelectAllMatching: computed(
        () =>
          selectionMode.value === "multiple" &&
          headerState.value.checked &&
          !selection.value.allMatching &&
          totalMatching.value > visibleRowIds.value.length,
      ),
      totalMatching,
      asBulk: () => toBulkSelection(selection.value),
    },
    filters: {
      conditions,
      fields,
      add: addFilter,
      update: (id, patch) => dispatchFilter({ type: "update", id, ...patch }),
      restore: (condition) => dispatchFilter({ type: "restore", condition }),
      remove: removeFilter,
      clear: clearFilters,
      describe,
      operatorsFor: operatorsForCondition,
      optionsFor,
      typeOf: (condition) => typeOfColumn(condition.columnId),
      arityOf: (condition) => catalogue.value.get(condition.operator)?.arity ?? "one",
      expanded: computed(() => filterState.value.expanded),
      setExpanded: (expanded) => dispatchFilter({ type: "set-expanded", expanded }),
      editing: computed(() => filterState.value.editingId),
      setEditing: (id) => dispatchFilter({ type: "set-editing", id }),
      announcement: computed(() => announcement.value),
    },
    edit: {
      enabled: computed(() => editableColumns.value.size > 0),
      state: computed(() => editState.value),
      isEditing: (rowId, colId) => isEditingCell(editState.value, rowId, colId),
      start: startEdit,
      setValue: (value) => stores.edit.dispatch({ type: "change", value }),
      commit: commitEdit,
      cancel: () => stores.edit.dispatch({ type: "cancel" }),
      contextFor: editContextFor,
    },
    detail: {
      enabled: computed(() => Boolean(options.detail)),
      state: computed(() => detailState.value),
      row: detailRow,
      total: totalMatching,
      open: openDetail,
      close: closeDetail,
      step: stepDetail,
      canStep: (direction) =>
        stepRow(pageRowIds.value, detailState.value.rowId, direction) !== null,
      setDirty: (dirty) => stores.detail.dispatch({ type: "dirty", dirty }),
      resolveConfirm: resolveDetailConfirm,
    },
    focus: {
      cursor: effectiveCursor,
      setCursor,
      focusCell,
      isFocused: (rowIndex, colIndex) =>
        effectiveCursor.value.row === rowIndex && effectiveCursor.value.col === colIndex,
    },
    virtual: { enabled: virtualizing, virtualizer, spacers },
    scroll,
    columnWidths: computed(() => layout.value.widths),
    rootRef,
    viewportRef,
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
function useHorizontalScroll(viewport: Ref<HTMLElement | null>): HorizontalScrollApi {
  const state = shallowRef<HorizontalScrollState>(NO_HORIZONTAL_SCROLL);

  watch(
    viewport,
    (element, _old, onCleanup) => {
      if (!element) {
        state.value = NO_HORIZONTAL_SCROLL;
        return;
      }

      const read = () => {
        const next = horizontalScrollState(element);
        const previous = state.value;
        if (
          next.overflowing === previous.overflowing &&
          next.canScrollLeft === previous.canScrollLeft &&
          next.canScrollRight === previous.canScrollRight
        ) {
          return;
        }
        state.value = next;
      };

      read();
      element.addEventListener("scroll", read, { passive: true });
      // Guarded for jsdom and SSR, exactly as `watchWidth` is. Without an
      // observer the state is still correct on mount and on every scroll — it
      // just stops noticing a resize, which is the same trade the responsive
      // watcher makes.
      const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(read);
      observer?.observe(element);
      // In table mode the scrolled content is the `<table>`. In card mode the
      // list *is* the scroll container, and is also the mode with nothing to
      // scroll sideways, so observing its first card costs nothing.
      const content = element.firstElementChild;
      if (content) observer?.observe(content);

      onCleanup(() => {
        element.removeEventListener("scroll", read);
        observer?.disconnect();
      });
    },
    { immediate: true },
  );

  const by = (direction: -1 | 1) => {
    const element = viewport.value;
    if (!element) return;
    const left = horizontalScrollTarget(element, direction);
    // Smooth unless the user asked for less motion — and unless the engine has
    // no options-taking `scrollTo` at all (jsdom), where the assignment is the
    // same scroll without the animation.
    if (typeof element.scrollTo === "function" && !prefersReducedMotion()) {
      element.scrollTo({ left, behavior: "smooth" });
    } else {
      element.scrollLeft = left;
    }
  };

  return { state: computed(() => state.value), by };
}

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
