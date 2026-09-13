/**
 * The headless layer: core's stores and TanStack's Svelte adapter, bound
 * together.
 *
 * Everything decided here is a *binding* decision — which rune holds what, when
 * a value is deferred, how focus is restored. Every behavioural decision (what
 * Tab does, what a shift-range covers, when to virtualize) lives in
 * `@ui-organized/table-core` and is reached from here, which is what keeps a
 * third framework adapter to this file plus the components.
 *
 * ── The shape, and why it is a class ────────────────────────────────────────
 *
 * React's hook returns values, rebuilt per render. Vue's composable returns
 * refs, read with `.value`. Svelte's returns **an object of getters over
 * `$derived`**, so a component writes `table.rows` and the read is tracked — the
 * same property access React has, with none of Vue's ceremony.
 *
 * A class rather than an object literal because `$state` and `$derived` are
 * legal in class fields and the getters come for free, and because the field
 * order *is* the dependency order: a `$derived` may read a field declared above
 * it and not one below.
 *
 * ── The one thing Svelte does not have ──────────────────────────────────────
 *
 * `useDeferredValue`. See `./createDeferred.svelte.ts`, which is deliberately the
 * same answer `@ui-organized/vue-table` gives — two designs for one problem in
 * one design system would be a defect in itself.
 */
import { untrack } from "svelte";
import {
  createTable,
  type ColumnOrderState,
  type ColumnPinningState,
  type ColumnSizingState,
  type ColumnVisibilityState,
  type PaginationState,
  type SortingState,
  type SvelteTable,
  type TableState,
  type Updater,
} from "@tanstack/svelte-table";
import { createVirtualizer, type Virtualizer } from "@tanstack/svelte-virtual";
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
import { trackStore } from "./trackStore.svelte.js";
import { createDeferred } from "./createDeferred.svelte.js";
import { actionsColumn, selectionColumn } from "./systemColumns.js";
import type {
  DataTableApi,
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
 * its sticky offsets are physical CSS properties.
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

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function createDataTable<T extends RowData>(
  options: () => UseDataTableOptions<T>,
): DataTableApi<T> {
  // ── Options, read reactively ──────────────────────────────────────────────
  const label = $derived(options().label);
  const captionVisible = $derived(options().captionVisible ?? false);
  const size = $derived(options().size ?? "md");
  const variant = $derived(options().variant ?? "default");
  const selectionMode = $derived(options().selection ?? "none");
  const sortable = $derived(options().sortable ?? true);
  const filterable = $derived(options().filterable ?? true);
  const paginated = $derived(options().paginated ?? false);
  const resizable = $derived(options().resizable ?? false);
  const virtualOption = $derived(options().virtual ?? true);
  const loading = $derived(options().loading ?? false);
  const manual = $derived(options().manual ?? false);

  // ── DOM handles ───────────────────────────────────────────────────────────
  // `$state` written by a callback ref rather than `bind:this`: a plain variable
  // assignment is not something a `$derived` elsewhere can watch, and the resize
  // and scroll observers below have to re-run when the node arrives.
  let rootEl = $state<HTMLElement | null>(null);
  // `HTMLElement`, not `HTMLDivElement`: in card mode the scroll container is a
  // `<ul>`, and the virtualizer attaches to whichever one is rendered.
  let viewportEl = $state<HTMLElement | null>(null);

  // ── Table state ───────────────────────────────────────────────────────────
  let sorting = $state<SortingState>(options().defaultSorting ?? []);

  const catalogue = $derived(createOperatorCatalogue(options().filterOperators));
  let filterState = $state<TableFilterState>(seedFilterState(options().defaultFilters));
  const dispatchFilter = (action: Parameters<ReturnType<typeof createFilterReducer>>[1]) => {
    filterState = createFilterReducer(catalogue)(filterState, action);
  };
  const conditions = $derived(filterState.conditions);

  /**
   * Conditions update **urgently**; only the filtering they drive is deferred.
   * See `./createDeferred.svelte.ts`.
   */
  const deferredConditions = createDeferred(() => conditions);
  const columnFilters = $derived(toColumnFilters(deferredConditions.current));

  let search = $state("");
  const deferredSearch = createDeferred(() => search);

  let pagination = $state<PaginationState>({
    pageIndex: 0,
    pageSize: options().pageSize ?? DEFAULT_PAGE_SIZE,
  });
  let columnVisibility = $state<ColumnVisibilityState>(options().defaultColumnVisibility ?? {});
  let columnOrder = $state<ColumnOrderState>([]);
  let columnSizing = $state<ColumnSizingState>({});
  let selection = $state<SelectionState>(EMPTY_SELECTION);

  // ── Measurement ───────────────────────────────────────────────────────────
  // Two widths, because they answer different questions. The root's width picks
  // the responsive mode; the viewport's content width decides how much room the
  // columns actually have.
  let width = $state<number | null>(null);
  let viewportWidth = $state<number | null>(null);
  $effect(() => watchWidth(rootEl, (value) => (width = value)));
  $effect(() => watchWidth(viewportEl, (value) => (viewportWidth = value)));

  const mode = $derived(resolveMode(options().responsive, width));

  // ── Horizontal scroll ─────────────────────────────────────────────────────
  let scrollState = $state<HorizontalScrollState>(NO_HORIZONTAL_SCROLL);

  /**
   * Three signals, because three different things change the answer: the user
   * scrolls, the viewport is resized, and the content is re-laid out underneath
   * it. That last one moves neither the scroll offset nor the viewport's own
   * box, which is why the scrolled content is observed and not just its
   * container.
   *
   * Every update goes through a bail-out compare. The numbers change on every
   * frame of a scroll; the three booleans they answer change only at the ends.
   */
  $effect(() => {
    const element = viewportEl;
    if (!element) {
      scrollState = NO_HORIZONTAL_SCROLL;
      return;
    }
    const read = () => {
      const next = horizontalScrollState(element);
      if (
        next.overflowing === scrollState.overflowing &&
        next.canScrollLeft === scrollState.canScrollLeft &&
        next.canScrollRight === scrollState.canScrollRight
      ) {
        return;
      }
      scrollState = next;
    };
    read();
    element.addEventListener("scroll", read, { passive: true });
    // Guarded for jsdom and SSR, exactly as `watchWidth` is.
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(read);
    observer?.observe(element);
    const content = element.firstElementChild;
    if (content) observer?.observe(content);
    return () => {
      element.removeEventListener("scroll", read);
      observer?.disconnect();
    };
  });

  // ── Columns ───────────────────────────────────────────────────────────────
  const allColumns = $derived.by(() => {
    const out: TableColumn<T>[] = [...options().columns];
    if (selectionMode !== "none") out.unshift(selectionColumn<T>());
    if (options().rowActions?.length) out.push(actionsColumn<T>());
    return out;
  });

  const primaryId = $derived(primaryColumnId(options().columns));
  const basePinning = $derived(pinningFromMeta(allColumns));

  // Created once, outside any rune: these are stores, not derived values, and
  // rebuilding one would discard an open editor mid-keystroke.
  const stores = { edit: createEditStore(), detail: createDetailStore() };
  const editState = trackStore(stores.edit);
  const detailState = trackStore(stores.detail);

  const editableColumns = $derived(
    new Set(
      options()
        .columns.filter((def) => metaOf<T>(def)?.edit)
        .map((def) => columnIdOf(def)),
    ),
  );

  const interactive = $derived(
    selectionMode !== "none" ||
      editableColumns.size > 0 ||
      Boolean(options().onRowClick) ||
      Boolean(options().detail) ||
      Boolean(options().rowActions?.length),
  );

  /**
   * The filter type per filterable column, from its declaration or inferred from
   * the data. Read off the raw rows rather than the table's, because this is an
   * *input* to building the table.
   */
  const filterTypes = $derived.by(() => {
    const types: Record<string, TableFilterType> = {};
    for (const def of options().columns) {
      const filter = normalizeFilterDef(metaOf<T>(def)?.filter);
      if (!filter) continue;
      const id = columnIdOf(def);
      types[id] =
        filter.type ?? inferFilterType(sampleColumn(options().data, def, id), filter.options);
    }
    return types;
  });

  const tableOptions = $derived(
    coreTableOptions<T>({
      data: options().data,
      columns: allColumns,
      getRowId: options().getRowId,
      selection: selectionMode,
      sortable,
      filterable,
      paginated,
      resizable,
      manual,
      rowCount: options().rowCount,
      filterTypes,
      catalogue,
    }),
  );

  /**
   * The controlled state, in one place — and handed back on the api, because
   * `table.state` is a *React*-adapter convenience. The Svelte adapter exposes
   * rune-aware `atoms` instead, so the parts would have no equivalent to read.
   */
  const state = $derived<Partial<TableState<UioTableFeatures>>>({
    sorting,
    columnFilters,
    globalFilter: deferredSearch.current,
    pagination,
    columnVisibility,
    columnOrder,
    columnSizing,
    columnPinning: basePinning,
    rowSelection: selection.rows,
  });

  /**
   * Options as **getters**, which is the Svelte adapter's reactivity contract:
   * it syncs in `$effect.pre`, reading whatever the getters return, so a getter
   * that reads a `$derived` keeps the table in step without a watcher.
   */
  const table = createTable<UioTableFeatures, T>({
    get data() {
      return tableOptions.data;
    },
    get columns() {
      return tableOptions.columns;
    },
    get features() {
      return tableOptions.features;
    },
    get defaultColumn() {
      return tableOptions.defaultColumn;
    },
    get getRowId() {
      return tableOptions.getRowId;
    },
    get enableSorting() {
      return tableOptions.enableSorting;
    },
    get enableFilters() {
      return tableOptions.enableFilters;
    },
    get enableGlobalFilter() {
      return tableOptions.enableGlobalFilter;
    },
    get globalFilterFn() {
      return tableOptions.globalFilterFn;
    },
    get enableRowSelection() {
      return tableOptions.enableRowSelection;
    },
    get enableMultiRowSelection() {
      return tableOptions.enableMultiRowSelection;
    },
    get enableColumnResizing() {
      return tableOptions.enableColumnResizing;
    },
    get columnResizeMode() {
      return tableOptions.columnResizeMode;
    },
    get manualSorting() {
      return tableOptions.manualSorting;
    },
    get manualFiltering() {
      return tableOptions.manualFiltering;
    },
    get manualPagination() {
      return tableOptions.manualPagination;
    },
    get rowCount() {
      return tableOptions.rowCount;
    },
    /**
     * TanStack's own page reset is turned **off**, and replaced below. This is
     * the one behavioural workaround in this package and it is forced by the
     * adapter rather than chosen.
     *
     * ── What goes wrong ─────────────────────────────────────────────────────
     *
     * `@tanstack/svelte-table@9.2.4` backs its options store with `$state`,
     * which **deep-proxies**. Every option sync replaces the options object, so
     * `table.options.data` comes back as a *fresh proxy of the same array* —
     * a new identity every time. The core row model memoizes on
     * `[table.options.data]`, so it rebuilds on every state change, and its
     * `onAfterUpdate` calls `table_autoResetPageIndex`.
     *
     * The result: clicking "next page" set the page to 1, the sync fired, the
     * row model rebuilt, and the page was reset to 0 before anything rendered.
     * Paging simply did nothing, with no error.
     *
     * `@tanstack/vue-table` backs the same store with `shallowRef`, which does
     * not proxy, so identity survives and neither Vue nor React sees this.
     *
     * ── Why this is the workaround ──────────────────────────────────────────
     *
     * `autoResetPageIndex` is the only *behaviour* the spurious rebuild breaks;
     * the rebuilds themselves are wasteful but correct. So the flag goes off and
     * the effect below does the reset explicitly, on the inputs TanStack itself
     * resets for — data, filters, search, sorting. Remove both when the adapter
     * stops proxying its options.
     */
    autoResetPageIndex: false,
    get state() {
      return state;
    },
    onSortingChange: (updater: Updater<SortingState>) => {
      sorting = applyUpdater(updater, sorting);
    },
    // The raw TanStack instance is a documented escape hatch, so
    // `table.resetColumnFilters()` still has to work. It lands here and is
    // translated back into conditions — one direction of truth.
    onColumnFiltersChange: (updater: Updater<ReturnType<typeof toColumnFilters>>) =>
      dispatchFilter({
        type: "replace",
        conditions: fromColumnFilters(applyUpdater(updater, columnFilters)),
      }),
    onGlobalFilterChange: (updater: Updater<string>) => {
      search = applyUpdater(updater, search);
    },
    onPaginationChange: (updater: Updater<PaginationState>) => {
      pagination = applyUpdater(updater, pagination);
    },
    onColumnVisibilityChange: (updater: Updater<ColumnVisibilityState>) => {
      columnVisibility = applyUpdater(updater, columnVisibility);
    },
    onColumnOrderChange: (updater: Updater<ColumnOrderState>) => {
      columnOrder = applyUpdater(updater, columnOrder);
    },
    onColumnSizingChange: (updater: Updater<ColumnSizingState>) => {
      columnSizing = applyUpdater(updater, columnSizing);
    },
    onRowSelectionChange: (updater: Updater<Record<string, true>>) => {
      selection = { ...selection, rows: applyUpdater(updater, selection.rows) };
    },
  } as never) as SvelteTable<UioTableFeatures, T>;

  /**
   * The page reset TanStack would do for us, done here. See `autoResetPageIndex`
   * above for why it cannot.
   *
   * `skipFirstRun` in spirit: a table seeded with `defaultFilters` must not have
   * its page reset on mount, which is why the first pass only records.
   */
  let resetSeen = false;
  $effect(() => {
    // Read every input TanStack resets on, so this effect depends on them.
    void options().data;
    void columnFilters;
    void deferredSearch.current;
    void sorting;
    if (!resetSeen) {
      resetSeen = true;
      return;
    }
    untrack(() => {
      if (pagination.pageIndex !== 0) pagination = { ...pagination, pageIndex: 0 };
    });
  });

  const rows = $derived(table.getRowModel().rows);
  const visibleColumns = $derived(table.getVisibleLeafColumns());

  // A table narrower than its container would otherwise leave a bare strip where
  // the header band stops. The surplus goes to one column rather than being
  // spread across all of them — see `layoutColumns`.
  const layout = $derived(
    layoutColumns(
      visibleColumns.map((column) => ({
        id: column.id,
        size: column.getSize(),
        pinned: PINNED_SIDE[String(column.getIsPinned())] ?? false,
      })),
      mode === "table" ? viewportWidth : null,
    ),
  );

  // Post-filter, pre-pagination: what "1–25 of 312" counts.
  const totalMatching = $derived(
    manual ? (options().rowCount ?? rows.length) : table.getPrePaginatedRowModel().rows.length,
  );
  const rowOffset = $derived(paginated && !manual ? pagination.pageIndex * pagination.pageSize : 0);

  // ── Virtualization ────────────────────────────────────────────────────────
  const virtualizing = $derived(shouldVirtualize(rows.length, virtualOption));
  // Always constructed — tearing a virtualizer down when a filter drops the row
  // count below the threshold would lose the scroll position. An idle one costs
  // one scroll listener.
  const virtualizer = createVirtualizer<HTMLElement, HTMLElement>({
    get count() {
      return virtualizing ? rows.length : 0;
    },
    getScrollElement: () => viewportEl,
    // Cards are much taller than rows and vary far more, so the first guess
    // differs by mode. Both are corrected by `measureElement` on the first frame.
    estimateSize: () => (mode === "cards" ? CARD_HEIGHT : estimateRowHeight(size)),
    get overscan() {
      return overscanFor(virtualOption);
    },
    // Rows are measured rather than trusted: the estimate is derived from
    // tokens, and a re-themed table would otherwise mis-position its content.
    measureElement: (element: HTMLElement) => element.getBoundingClientRect().height,
  }) as unknown as { current: Virtualizer<HTMLElement, HTMLElement> };

  const spacers = $derived(
    virtualizing
      ? spacerHeights(virtualizer.current.getVirtualItems(), virtualizer.current.getTotalSize())
      : NO_SPACERS,
  );

  const renderRows = $derived.by<RenderRow<T>[]>(() => {
    const build = (row: TableRowModel<T>, index: number): RenderRow<T> => ({
      row,
      index,
      // What `aria-rowindex` reports: where it sits in the whole dataset.
      absoluteIndex: index + rowOffset,
    });
    if (!virtualizing) return rows.map(build);
    const out: RenderRow<T>[] = [];
    for (const item of virtualizer.current.getVirtualItems()) {
      const row = rows[item.index];
      if (row) out.push(build(row, item.index));
    }
    return out;
  });

  // ── Grid focus ────────────────────────────────────────────────────────────
  let cursorState = $state<GridCursor>({ row: 0, col: 0 });
  // A counter, not a boolean: the same cell can be re-focused (after an editor
  // closes) without the cursor changing.
  let focusRequest = $state(0);
  // With no rows there is nothing in the body to hold the tab stop, so it moves
  // to the header — still operable (sorting), still one tab stop.
  const effectiveCursor = $derived<GridCursor>(
    rows.length === 0 ? { row: -1, col: cursorState.col } : cursorState,
  );

  const moveCursor = (next: GridCursor) => {
    if (cursorState.row === next.row && cursorState.col === next.col) return;
    cursorState = next;
  };

  /**
   * Follow focus that has already moved — a click, or Tab landing on a cell.
   * Deliberately does NOT take focus.
   *
   * The two used to be one function in the React adapter, and it broke inline
   * editing outright: the editor's input took focus, its cell's `focus` event
   * bubbled, the cursor was "set", and the effect below focused the cell again —
   * pulling focus straight back out of the editor the user had just opened.
   */
  const setCursor = moveCursor;

  /** Move the cursor AND take DOM focus. Keyboard actions only. */
  const focusCell = (next: GridCursor) => {
    moveCursor(next);
    focusRequest += 1;
  };

  $effect(() => {
    const count = focusRequest;
    const viewport = viewportEl;
    if (count === 0 || !viewport) return;
    let attempts = 0;
    const tryFocus = () => {
      const { row, col } = effectiveCursor;
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
    tryFocus();
  });

  // ── Selection ─────────────────────────────────────────────────────────────
  const pageRowIds = $derived(rows.map((row) => row.id));

  /**
   * The rows the header checkbox governs: what is **on screen**.
   *
   * For a paginated table that is the page. For a virtualized one it is the
   * rendered window, and that distinction is the whole point — `rows` on the
   * 100,000-row table is all 100,000, so a header checkbox scoped to it answers
   * one click by enumerating a hundred thousand ids.
   */
  const visibleRowIds = $derived(renderRows.map((entry) => entry.row.id));
  const headerState = $derived(headerCheckboxState(selection, visibleRowIds));

  const toggleRow = (rowId: string, checked: boolean, shift = false) => {
    selection =
      selectionMode === "single"
        ? { ...EMPTY_SELECTION, rows: checked ? { [rowId]: true } : {}, anchor: rowId }
        : rangeSelect(selection, pageRowIds, rowId, shift, checked);
  };

  const togglePage = (checked: boolean) => {
    selection = selectPage(selection, visibleRowIds, checked);
  };

  const selectEverythingMatching = () => {
    const next = selectAllMatchingCore(selection);
    // The loaded rows are materialised as well as the flag, so
    // `getSelectedRowModel()` — and therefore CSV export and any bulk action
    // over real row objects — still works for the rows the client has.
    const rowsState: Record<string, true> = {};
    for (const row of table.getPrePaginatedRowModel().rows) rowsState[row.id] = true;
    selection = { ...next, rows: rowsState };
  };

  const selectedRows = $derived.by(() => {
    // `selection` is read explicitly even though `getSelectedRowModel` depends on
    // it: the table instance is stable and its row-model call is memoized, so
    // without this read the derived would have no dependency at all.
    void selection;
    return table.getSelectedRowModel().rows.map((row) => row.original);
  });

  // ── Inline edit ───────────────────────────────────────────────────────────
  const startEdit = (row: TableRowModel<T>, colId: string) => {
    if (!editableColumns.has(colId)) return;
    stores.edit.dispatch({
      type: "start",
      target: { rowId: row.id, columnId: colId },
      value: row.getValue(colId),
    });
  };

  const commitEdit = () => {
    const editing = stores.edit.getState();
    const target = editing.target;
    // `pending` is the re-entry guard. A commit is reachable from three places
    // at once — Enter, Tab, and the editor's own blur as focus returns to the
    // cell — and without this an edit is written twice.
    if (!target || editing.invalid || editing.pending) return;
    const row = table.getRow(target.rowId);
    const column = allColumns.find((def) => columnIdOf(def) === target.columnId);
    const edit = metaOf<T>(column)?.edit;
    const value = edit?.parse ? edit.parse(editing.draft) : editing.draft;
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
      previousValue: editing.original,
    };
    stores.edit.dispatch({ type: "commit-start" });
    Promise.resolve(options().onEdit?.(patch)).then(
      () => stores.edit.dispatch({ type: "commit-done" }),
      (error: unknown) =>
        stores.edit.dispatch({
          type: "commit-failed",
          message: error instanceof Error ? error.message : "Could not save the change",
        }),
    );
  };

  const editContextFor = (row: TableRowModel<T>, colId: string): TableEditContext<T> | null => {
    if (!isEditingCell(editState.current, row.id, colId)) return null;
    return {
      row: row.original,
      rowId: row.id,
      columnId: colId,
      value: editState.current.draft,
      size,
      invalid: editState.current.invalid,
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
  };

  // ── Row detail ────────────────────────────────────────────────────────────
  const openDetail = (rowId: string) => {
    stores.detail.dispatch({ type: "open", rowId, index: pageRowIds.indexOf(rowId) });
  };

  const stepDetail = (direction: -1 | 1) => {
    const detail = stores.detail.getState();
    if (detail.dirty) {
      stores.detail.dispatch({ type: "confirm", intent: direction === -1 ? "prev" : "next" });
      return;
    }
    const next = stepRow(pageRowIds, detail.rowId, direction);
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
    const detail = stores.detail.getState();
    const intent = detail.confirming;
    stores.detail.dispatch({ type: "dismiss" });
    if (!discard || !intent) return;
    if (intent === "close") {
      stores.detail.dispatch({ type: "close" });
      return;
    }
    const next = stepRow(pageRowIds, detail.rowId, intent === "prev" ? -1 : 1);
    if (next) stores.detail.dispatch({ type: "go", ...next });
  };

  const detailRow = $derived.by(() => {
    const rowId = detailState.current.rowId;
    if (!rowId) return null;
    const row = rows.find((candidate) => candidate.id === rowId);
    return row ? row.original : null;
  });

  // ── Export ────────────────────────────────────────────────────────────────
  const exportCsv = (scope: TableRowScope = "view") => {
    exportRowsToCsv(table, {
      scope,
      filename: `${label.toLowerCase().replaceAll(/\s+/g, "-")}.csv`,
    });
  };

  const copySelection = (scope: TableRowScope = "selected") =>
    copyRowsToClipboard(table, { scope });

  // ── Keyboard ──────────────────────────────────────────────────────────────
  const onGridKeyDown = (event: KeyboardEvent) => {
    if (!interactive) return;
    const cursor = effectiveCursor;
    const column = visibleColumns[cursor.col];
    const pageRows = Math.max(
      1,
      Math.floor((viewportEl?.clientHeight ?? 0) / estimateRowHeight(size)) - 1,
    );
    const action = gridKeyDown(
      {
        cursor,
        rowCount: rows.length,
        colCount: visibleColumns.length,
        pageRows,
        editing: Boolean(editState.current.target),
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
        if (virtualizing) virtualizer.current.scrollToIndex(action.cursor.row, { align: "center" });
        focusCell(action.cursor);
        break;
      case "extend": {
        const anchorRow = rows[cursor.row];
        const targetRow = rows[action.cursor.row];
        if (anchorRow && targetRow) {
          const seeded = selection.anchor ? selection : { ...selection, anchor: anchorRow.id };
          selection = rangeSelect(seeded, pageRowIds, targetRow.id, true, true);
        }
        focusCell(action.cursor);
        break;
      }
      case "toggle-select": {
        const row = rows[cursor.row];
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
        const row = rows[cursor.row];
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
        const row = rows[cursor.row];
        if (!row) break;
        if (options().detail) openDetail(row.id);
        else options().onRowClick?.(row.original);
        break;
      }
      default:
        break;
    }
  };

  // ── Server mode ───────────────────────────────────────────────────────────
  $effect(() => {
    if (!manual) return;
    const onQueryChange = options().onQueryChange;
    if (!onQueryChange) return;
    onQueryChange({
      sorting: sorting.map((entry) => ({ id: entry.id, desc: entry.desc })),
      filters: conditions,
      search: deferredSearch.current,
      pageIndex: pagination.pageIndex,
      pageSize: pagination.pageSize,
    });
  });

  // Infinite scroll. Attached to the viewport rather than to the virtualizer so
  // it works in the un-virtualized case too.
  $effect(() => {
    const viewport = viewportEl;
    const onLoadMore = options().onLoadMore;
    if (!viewport || !onLoadMore) return;
    const rowHeight = estimateRowHeight(size);
    const onScroll = () => {
      if (
        isNearEnd(
          {
            scrollTop: viewport.scrollTop,
            scrollHeight: viewport.scrollHeight,
            clientHeight: viewport.clientHeight,
          },
          rowHeight,
        )
      ) {
        onLoadMore();
      }
    };
    viewport.addEventListener("scroll", onScroll, { passive: true });
    return () => viewport.removeEventListener("scroll", onScroll);
  });

  // ── Filters ───────────────────────────────────────────────────────────────
  let announcement = $state("");

  const filterDefs = $derived.by(() => {
    const defs = new Map<string, ReturnType<typeof normalizeFilterDef>>();
    for (const def of options().columns) {
      const filter = normalizeFilterDef(metaOf<T>(def)?.filter);
      if (filter) defs.set(columnIdOf(def), filter);
    }
    return defs;
  });

  const columnLabel = (id: string) => {
    const column = table.getColumn(id);
    const header = column?.columnDef.header;
    return filterDefs.get(id)?.label ?? (typeof header === "string" ? header : id);
  };

  const typeOfColumn = (id: string) => filterTypes[id] ?? "text";

  const fields = $derived.by(() => {
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
  });

  const describe = (condition: TableFilterCondition) =>
    describeCondition(condition, {
      type: typeOfColumn(condition.columnId),
      columnLabel: columnLabel(condition.columnId),
      catalogue,
      options: filterDefs.get(condition.columnId)?.options,
      formatValue: filterDefs.get(condition.columnId)?.formatValue,
    });

  /** Announce discrete changes only — a per-keystroke live region is a firehose. */
  const announce = (kind: FilterChangeKind, condition?: TableFilterCondition) => {
    announcement = filterAnnouncement(
      { kind, description: condition ? describe(condition).text : undefined },
      totalMatching,
    );
  };

  const addFilter = (columnId: string) => {
    const def = filterDefs.get(columnId);
    const type = typeOfColumn(columnId);
    // The id the reducer is about to assign, returned so the caller can open the
    // new chip's editor without waiting for a render to find it.
    const id = `f${filterState.nextId}`;
    dispatchFilter({
      type: "add",
      columnId,
      operator: defaultOperatorFor(type, catalogue, def),
      single: def?.single,
    });
    return id;
  };

  const removeFilter = (id: string) => {
    const condition = conditions.find((entry) => entry.id === id);
    if (condition) announce("removed", condition);
    dispatchFilter({ type: "remove", id });
  };

  const clearFilters = () => {
    announce("cleared");
    dispatchFilter({ type: "clear" });
  };

  /**
   * `getFacetedUniqueValues` allocates an array per row, so it is capped: above
   * `FACET_ROW_LIMIT` the options render without counts and nothing is disabled.
   */
  const optionsForCondition = (condition: TableFilterCondition) => {
    const def = filterDefs.get(condition.columnId);
    const column = table.getColumn(condition.columnId);
    const showCounts = def?.counts ?? rows.length <= FACET_ROW_LIMIT;
    return facetOptions(
      showCounts ? column?.getFacetedUniqueValues() : undefined,
      def?.options,
      condition.values,
      showCounts,
    );
  };

  const operatorsForCondition = (condition: TableFilterCondition) => {
    const type = typeOfColumn(condition.columnId);
    return operatorsFor(type, catalogue, filterDefs.get(condition.columnId)?.operators).map(
      (op) => ({ id: op.id, label: operatorLabel(op, type) }),
    );
  };

  const activate = (row: TableRowModel<T>) => {
    if (options().detail) openDetail(row.id);
    else options().onRowClick?.(row.original);
  };

  const chrome = $derived<TableChrome>({
    size,
    variant,
    interactive,
    totalWidth: layout.totalWidth,
    rowCount: totalMatching,
    colCount: visibleColumns.length,
    label,
    multiSelectable: selectionMode === "multiple",
  });

  const scrollBy = (direction: -1 | 1) => {
    const element = viewportEl;
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

  return {
    table,
    get state() {
      return state;
    },
    get rows() {
      return rows;
    },
    get renderRows() {
      return renderRows;
    },
    get chrome() {
      return chrome;
    },
    get options() {
      return options();
    },
    get size() {
      return size;
    },
    get variant() {
      return variant;
    },
    get label() {
      return label;
    },
    get captionVisible() {
      return captionVisible;
    },
    get interactive() {
      return interactive;
    },
    get mode() {
      return mode;
    },
    get loading() {
      return loading;
    },
    get search() {
      return search;
    },
    setSearch: (value: string) => {
      search = value;
    },
    selection: {
      get mode() {
        return selectionMode;
      },
      get state() {
        return selection;
      },
      get count() {
        return selectionCountCore(selection, totalMatching);
      },
      get rows() {
        return selectedRows;
      },
      isSelected: (rowId) => isRowSelected(selection, rowId),
      toggle: toggleRow,
      togglePage,
      selectAllMatching: selectEverythingMatching,
      clear: () => {
        selection = EMPTY_SELECTION;
      },
      get header() {
        return headerState;
      },
      get canSelectAllMatching() {
        return (
          selectionMode === "multiple" &&
          headerState.checked &&
          !selection.allMatching &&
          totalMatching > visibleRowIds.length
        );
      },
      get totalMatching() {
        return totalMatching;
      },
      asBulk: () => toBulkSelection(selection),
    },
    filters: {
      get conditions() {
        return conditions;
      },
      get fields() {
        return fields;
      },
      add: addFilter,
      update: (id, patch) => dispatchFilter({ type: "update", id, ...patch }),
      restore: (condition) => dispatchFilter({ type: "restore", condition }),
      remove: removeFilter,
      clear: clearFilters,
      describe,
      operatorsFor: operatorsForCondition,
      optionsFor: optionsForCondition,
      typeOf: (condition) => typeOfColumn(condition.columnId),
      arityOf: (condition) => catalogue.get(condition.operator)?.arity ?? "one",
      get expanded() {
        return filterState.expanded;
      },
      setExpanded: (expanded) => dispatchFilter({ type: "set-expanded", expanded }),
      get editing() {
        return filterState.editingId;
      },
      setEditing: (id) => dispatchFilter({ type: "set-editing", id }),
      get announcement() {
        return announcement;
      },
    },
    edit: {
      get enabled() {
        return editableColumns.size > 0;
      },
      get state() {
        return editState.current;
      },
      isEditing: (rowId, colId) => isEditingCell(editState.current, rowId, colId),
      start: startEdit,
      setValue: (value) => stores.edit.dispatch({ type: "change", value }),
      commit: commitEdit,
      cancel: () => stores.edit.dispatch({ type: "cancel" }),
      contextFor: editContextFor,
    },
    detail: {
      get enabled() {
        return Boolean(options().detail);
      },
      get state() {
        return detailState.current;
      },
      get row() {
        return detailRow;
      },
      get total() {
        return totalMatching;
      },
      open: openDetail,
      close: closeDetail,
      step: stepDetail,
      canStep: (direction) => stepRow(pageRowIds, detailState.current.rowId, direction) !== null,
      setDirty: (dirty) => stores.detail.dispatch({ type: "dirty", dirty }),
      resolveConfirm: resolveDetailConfirm,
    },
    focus: {
      get cursor() {
        return effectiveCursor;
      },
      setCursor,
      focusCell,
      isFocused: (rowIndex, colIndex) =>
        effectiveCursor.row === rowIndex && effectiveCursor.col === colIndex,
    },
    virtual: {
      get enabled() {
        return virtualizing;
      },
      get virtualizer() {
        return virtualizer.current;
      },
      get spacers() {
        return spacers;
      },
    },
    scroll: {
      get state() {
        return scrollState;
      },
      by: scrollBy,
    },
    get columnWidths() {
      return layout.widths;
    },
    rootRef: (element) => {
      rootEl = element;
    },
    viewportRef: (element) => {
      viewportEl = element;
    },
    exportCsv,
    copySelection,
    onGridKeyDown,
    activate,
    get primaryColumnId() {
      return primaryId;
    },
  };
}
