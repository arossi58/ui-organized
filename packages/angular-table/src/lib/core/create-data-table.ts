/**
 * The headless layer: core's stores and TanStack's Angular adapter, bound
 * together.
 *
 * Everything decided here is a *binding* decision — which signal holds what,
 * when a value is deferred, how focus is restored. Every behavioural decision
 * (what Tab does, what a shift-range covers, when to virtualize) lives in
 * `@ui-organized/table-core` and is reached from here, which is what keeps a
 * fourth framework adapter to this file plus the components.
 *
 * ── The three things Angular does differently ───────────────────────────────
 *
 * 1. **No prop spread.** Core hands back plain objects of classes and ARIA that
 *    the other three adapters spread onto an element. `UioTableProps` in
 *    `./element-props.ts` is the directive that stands in for it, and it has to
 *    *diff* rather than assign — these bags change shape, not just value.
 * 2. **No per-element ref callback.** `viewChild` cannot reach a projected node,
 *    which the viewport is, so `UioTableElementRef` writes into a signal.
 * 3. **No priority scheduler.** `./create-deferred.ts` stands in for
 *    `useDeferredValue`, and is the same answer the Vue and Svelte packages give
 *    rather than a third design.
 *
 * What Angular does *not* cost, contrary to the plan's estimate: `flexRender`.
 * `@tanstack/angular-table` v9 ships `FlexRender` as a structural directive, so
 * a header or cell renderer needs no `TemplateRef` plumbing of our own.
 */
import {
  DestroyRef,
  computed,
  effect,
  inject,
  linkedSignal,
  signal,
  untracked,
} from "@angular/core";
import {
  injectTable,
  type AngularTable,
  type ColumnOrderState,
  type ColumnPinningState,
  type ColumnSizingState,
  type ColumnVisibilityState,
  type PaginationState,
  type SortingState,
  type TableState,
  type Updater,
} from "@tanstack/angular-table";
import { injectVirtualizer } from "@tanstack/angular-virtual";
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
import { trackStore } from "./track-store.js";
import { createDeferred } from "./create-deferred.js";
import { actionsColumn, selectionColumn } from "./system-columns.js";
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
  const destroyRef = inject(DestroyRef);

  // ── Options, read reactively ──────────────────────────────────────────────
  const label = computed(() => options().label);
  const captionVisible = computed(() => options().captionVisible ?? false);
  const size = computed(() => options().size ?? "md");
  const variant = computed(() => options().variant ?? "default");
  const selectionMode = computed(() => options().selection ?? "none");
  const sortable = computed(() => options().sortable ?? true);
  const filterable = computed(() => options().filterable ?? true);
  const paginated = computed(() => options().paginated ?? false);
  const resizable = computed(() => options().resizable ?? false);
  const virtualOption = computed(() => options().virtual ?? true);
  const loading = computed(() => options().loading ?? false);
  const manual = computed(() => options().manual ?? false);

  // ── DOM handles ───────────────────────────────────────────────────────────
  // Signals written by `UioTableElementRef`, because Angular has no per-element
  // ref callback and `viewChild` cannot reach a *projected* node — which the
  // viewport is. The observers below are effects that must re-run when the node
  // arrives, which is why these are signals rather than plain fields.
  const rootRef = signal<HTMLElement | null>(null);
  // `HTMLElement`, not `HTMLDivElement`: in card mode the scroll container is a
  // `<ul>`, and the virtualizer attaches to whichever one is rendered.
  const viewportRef = signal<HTMLElement | null>(null);

  // ── Table state ───────────────────────────────────────────────────────────
  /**
   * Seeded state is a `linkedSignal`, and that is forced rather than stylistic.
   *
   * `signal(untracked(() => options().defaultSorting))` reads the options *at
   * construction* — and this factory can be constructed before the host
   * component's inputs are set, because a child part asks the injector for the
   * api during the creation pass while inputs are bound in the update pass.
   * Angular says so outright (NG0950: "Input `data` is required but no value is
   * available yet") and the table never bootstrapped.
   *
   * A `linkedSignal` is writable like a `signal` and computes its seed on the
   * first *read*, which happens during rendering — by which time the inputs
   * exist. It also re-seeds if the default changes, which for a static
   * `defaultSorting` is the same thing as seeding once.
   */
  const sorting = linkedSignal<SortingState>(() => options().defaultSorting ?? []);

  const catalogue = computed(() => createOperatorCatalogue(options().filterOperators));
  const filterState = linkedSignal<TableFilterState>(() =>
    seedFilterState(options().defaultFilters),
  );
  const dispatchFilter = (action: Parameters<ReturnType<typeof createFilterReducer>>[1]) => {
    filterState.set(createFilterReducer(catalogue())(filterState(), action));
  };
  const conditions = computed(() => filterState().conditions);

  /**
   * Conditions update **urgently**; only the filtering they drive is deferred.
   * See `./create-deferred.ts`.
   */
  const deferredConditions = createDeferred(() => conditions());
  const columnFilters = computed(() => toColumnFilters(deferredConditions()));

  const search = signal("");
  const deferredSearch = createDeferred(() => search());

  const pagination = linkedSignal<PaginationState>(() => ({
    pageIndex: 0,
    pageSize: options().pageSize ?? DEFAULT_PAGE_SIZE,
  }));
  const columnVisibility = linkedSignal<ColumnVisibilityState>(
    () => options().defaultColumnVisibility ?? {},
  );
  const columnOrder = signal<ColumnOrderState>([]);
  const columnSizing = signal<ColumnSizingState>({});
  const selection = signal<SelectionState>(EMPTY_SELECTION);

  // ── Measurement ───────────────────────────────────────────────────────────
  // Two widths, because they answer different questions. The root's width picks
  // the responsive mode; the viewport's content width decides how much room the
  // columns actually have.
  const width = signal<number | null>(null);
  const viewportWidth = signal<number | null>(null);
  effect((onCleanup) => {
    const stop = watchWidth(rootRef(), (value) => width.set(value));
    onCleanup(stop);
  });
  effect((onCleanup) => {
    const stop = watchWidth(viewportRef(), (value) => viewportWidth.set(value));
    onCleanup(stop);
  });

  const mode = computed(() => resolveMode(options().responsive, width()));

  // ── Horizontal scroll ─────────────────────────────────────────────────────
  const scrollState = signal<HorizontalScrollState>(NO_HORIZONTAL_SCROLL);

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
  effect((onCleanup) => {
    const element = viewportRef();
    if (!element) {
      scrollState.set(NO_HORIZONTAL_SCROLL);
      return;
    }
    const read = () => {
      const next = horizontalScrollState(element);
      const previous = untracked(scrollState);
      if (
        next.overflowing === previous.overflowing &&
        next.canScrollLeft === previous.canScrollLeft &&
        next.canScrollRight === previous.canScrollRight
      ) {
        return;
      }
      scrollState.set(next);
    };
    read();
    element.addEventListener("scroll", read, { passive: true });
    // Guarded for jsdom and SSR, exactly as `watchWidth` is.
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(read);
    observer?.observe(element);
    const content = element.firstElementChild;
    if (content) observer?.observe(content);
    onCleanup(() => {
      element.removeEventListener("scroll", read);
      observer?.disconnect();
    });
  });

  // ── Columns ───────────────────────────────────────────────────────────────
  const allColumns = computed(() => {
    const out: TableColumn<T>[] = [...options().columns];
    if (selectionMode() !== "none") out.unshift(selectionColumn<T>());
    if (options().rowActions?.length) out.push(actionsColumn<T>());
    return out;
  });

  const primaryId = computed(() => primaryColumnId(options().columns));
  const basePinning = computed(() => pinningFromMeta(allColumns()));

  // Created once, outside any computed: these are stores, not derived values,
  // and rebuilding one would discard an open editor mid-keystroke.
  const stores = { edit: createEditStore(), detail: createDetailStore() };
  const editState = trackStore(stores.edit);
  const detailState = trackStore(stores.detail);

  const editableColumns = computed(
    () =>
      new Set(
        options()
          .columns.filter((def) => metaOf<T>(def)?.edit)
          .map((def) => columnIdOf(def)),
      ),
  );

  const interactive = computed(
    () =>
      selectionMode() !== "none" ||
      editableColumns().size > 0 ||
      Boolean(options().onRowClick) ||
      Boolean(options().detail) ||
      Boolean(options().rowActions?.length),
  );

  /**
   * The filter type per filterable column, from its declaration or inferred from
   * the data. Read off the raw rows rather than the table's, because this is an
   * *input* to building the table.
   */
  const filterTypes = computed(() => {
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

  const tableOptions = computed(() =>
    coreTableOptions<T>({
      data: options().data,
      columns: allColumns(),
      getRowId: options().getRowId,
      selection: selectionMode(),
      sortable: sortable(),
      filterable: filterable(),
      paginated: paginated(),
      resizable: resizable(),
      manual: manual(),
      rowCount: options().rowCount,
      filterTypes: filterTypes(),
      catalogue: catalogue(),
    }),
  );

  /**
   * The controlled state, in one place — and handed back on the api, because
   * `table.state` is a *React*-adapter convenience. The Angular adapter exposes
   * signal-backed `atoms` instead, so the parts would have no equivalent to
   * read.
   */
  const state = computed<Partial<TableState<UioTableFeatures>>>(() => ({
    sorting: sorting(),
    columnFilters: columnFilters(),
    globalFilter: deferredSearch(),
    pagination: pagination(),
    columnVisibility: columnVisibility(),
    columnOrder: columnOrder(),
    columnSizing: columnSizing(),
    columnPinning: basePinning(),
    rowSelection: selection().rows,
  }));

  /**
   * An options *factory*, which is the Angular adapter's reactivity contract: it
   * re-reads the factory inside its own computed, so anything signal-backed in
   * here keeps the table in step without a watcher.
   */
  const table = injectTable<UioTableFeatures, T>(
    () =>
      ({
        ...tableOptions(),
        state: state(),
        onSortingChange: (updater: Updater<SortingState>) =>
          sorting.set(applyUpdater(updater, sorting())),
        // The raw TanStack instance is a documented escape hatch, so
        // `table.resetColumnFilters()` still has to work. It lands here and is
        // translated back into conditions — one direction of truth.
        onColumnFiltersChange: (updater: Updater<ReturnType<typeof toColumnFilters>>) =>
          dispatchFilter({
            type: "replace",
            conditions: fromColumnFilters(applyUpdater(updater, columnFilters())),
          }),
        onGlobalFilterChange: (updater: Updater<string>) =>
          search.set(applyUpdater(updater, search())),
        onPaginationChange: (updater: Updater<PaginationState>) =>
          pagination.set(applyUpdater(updater, pagination())),
        onColumnVisibilityChange: (updater: Updater<ColumnVisibilityState>) =>
          columnVisibility.set(applyUpdater(updater, columnVisibility())),
        onColumnOrderChange: (updater: Updater<ColumnOrderState>) =>
          columnOrder.set(applyUpdater(updater, columnOrder())),
        onColumnSizingChange: (updater: Updater<ColumnSizingState>) =>
          columnSizing.set(applyUpdater(updater, columnSizing())),
        onRowSelectionChange: (updater: Updater<Record<string, true>>) =>
          selection.set({ ...selection(), rows: applyUpdater(updater, selection().rows) }),
      }) as never,
  ) as AngularTable<UioTableFeatures, T>;

  const rows = computed(() => table.getRowModel().rows);
  const visibleColumns = computed(() => table.getVisibleLeafColumns());

  // A table narrower than its container would otherwise leave a bare strip where
  // the header band stops. The surplus goes to one column rather than being
  // spread across all of them — see `layoutColumns`.
  const layout = computed(() =>
    layoutColumns(
      visibleColumns().map((column) => ({
        id: column.id,
        size: column.getSize(),
        pinned: PINNED_SIDE[String(column.getIsPinned())] ?? false,
      })),
      mode() === "table" ? viewportWidth() : null,
    ),
  );

  // Post-filter, pre-pagination: what "1–25 of 312" counts.
  const totalMatching = computed(() =>
    manual() ? (options().rowCount ?? rows().length) : table.getPrePaginatedRowModel().rows.length,
  );
  const rowOffset = computed(() =>
    paginated() && !manual() ? pagination().pageIndex * pagination().pageSize : 0,
  );

  // ── Virtualization ────────────────────────────────────────────────────────
  const virtualizing = computed(() => shouldVirtualize(rows().length, virtualOption()));
  // Always constructed — tearing a virtualizer down when a filter drops the row
  // count below the threshold would lose the scroll position. An idle one costs
  // one scroll listener.
  const virtualizer = injectVirtualizer<HTMLElement, HTMLElement>(() => ({
    count: virtualizing() ? rows().length : 0,
    // `scrollElement`, not `getScrollElement`: the Angular adapter takes the
    // element itself and re-reads the factory when the signal fills in.
    scrollElement: viewportRef() ?? undefined,
    // Cards are much taller than rows and vary far more, so the first guess
    // differs by mode. Both are corrected by `measureElement` on the first frame.
    estimateSize: () => (mode() === "cards" ? CARD_HEIGHT : estimateRowHeight(size())),
    overscan: overscanFor(virtualOption()),
    // Rows are measured rather than trusted: the estimate is derived from
    // tokens, and a re-themed table would otherwise mis-position its content.
    measureElement: (element: HTMLElement) => element.getBoundingClientRect().height,
  }));

  const spacers = computed(() =>
    virtualizing()
      ? spacerHeights(virtualizer.getVirtualItems(), virtualizer.getTotalSize())
      : NO_SPACERS,
  );

  const renderRows = computed<RenderRow<T>[]>(() => {
    const build = (row: TableRowModel<T>, index: number): RenderRow<T> => ({
      row,
      index,
      // What `aria-rowindex` reports: where it sits in the whole dataset.
      absoluteIndex: index + rowOffset(),
    });
    if (!virtualizing()) return rows().map(build);
    const out: RenderRow<T>[] = [];
    for (const item of virtualizer.getVirtualItems()) {
      const row = rows()[item.index];
      if (row) out.push(build(row, item.index));
    }
    return out;
  });

  // ── Grid focus ────────────────────────────────────────────────────────────
  const cursorState = signal<GridCursor>({ row: 0, col: 0 });
  // A counter, not a boolean: the same cell can be re-focused (after an editor
  // closes) without the cursor changing.
  const focusRequest = signal(0);
  // With no rows there is nothing in the body to hold the tab stop, so it moves
  // to the header — still operable (sorting), still one tab stop.
  const effectiveCursor = computed<GridCursor>(() =>
    rows().length === 0 ? { row: -1, col: cursorState().col } : cursorState(),
  );

  const moveCursor = (next: GridCursor) => {
    const prev = untracked(cursorState);
    if (prev.row === next.row && prev.col === next.col) return;
    cursorState.set(next);
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
    focusRequest.update((count) => count + 1);
  };

  effect(() => {
    const count = focusRequest();
    const viewport = untracked(viewportRef);
    if (count === 0 || !viewport) return;
    let attempts = 0;
    const tryFocus = () => {
      const { row, col } = untracked(effectiveCursor);
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
  const pageRowIds = computed(() => rows().map((row) => row.id));

  /**
   * The rows the header checkbox governs: what is **on screen**.
   *
   * For a paginated table that is the page. For a virtualized one it is the
   * rendered window, and that distinction is the whole point — `rows` on the
   * 100,000-row table is all 100,000, so a header checkbox scoped to it answers
   * one click by enumerating a hundred thousand ids.
   */
  const visibleRowIds = computed(() => renderRows().map((entry) => entry.row.id));
  const headerState = computed(() => headerCheckboxState(selection(), visibleRowIds()));

  const toggleRow = (rowId: string, checked: boolean, shift = false) => {
    selection.set(
      untracked(selectionMode) === "single"
        ? { ...EMPTY_SELECTION, rows: checked ? { [rowId]: true } : {}, anchor: rowId }
        : rangeSelect(untracked(selection), untracked(pageRowIds), rowId, shift, checked),
    );
  };

  const togglePage = (checked: boolean) => {
    selection.set(selectPage(untracked(selection), untracked(visibleRowIds), checked));
  };

  const selectEverythingMatching = () => {
    const next = selectAllMatchingCore(untracked(selection));
    // The loaded rows are materialised as well as the flag, so
    // `getSelectedRowModel()` — and therefore CSV export and any bulk action
    // over real row objects — still works for the rows the client has.
    const rowsState: Record<string, true> = {};
    for (const row of table.getPrePaginatedRowModel().rows) rowsState[row.id] = true;
    selection.set({ ...next, rows: rowsState });
  };

  const selectedRows = computed(() => {
    // `selection` is read explicitly even though `getSelectedRowModel` depends on
    // it: the table instance is stable and its row-model call is memoized, so
    // without this read the computed would have no dependency at all.
    selection();
    return table.getSelectedRowModel().rows.map((row) => row.original);
  });

  // ── Inline edit ───────────────────────────────────────────────────────────
  const startEdit = (row: TableRowModel<T>, colId: string) => {
    if (!untracked(editableColumns).has(colId)) return;
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
    const column = untracked(allColumns).find((def) => columnIdOf(def) === target.columnId);
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
    Promise.resolve(untracked(options).onEdit?.(patch)).then(
      () => stores.edit.dispatch({ type: "commit-done" }),
      (error: unknown) =>
        stores.edit.dispatch({
          type: "commit-failed",
          message: error instanceof Error ? error.message : "Could not save the change",
        }),
    );
  };

  const editContextFor = (row: TableRowModel<T>, colId: string): TableEditContext<T> | null => {
    if (!isEditingCell(editState(), row.id, colId)) return null;
    return {
      row: row.original,
      rowId: row.id,
      columnId: colId,
      value: editState().draft,
      size: size(),
      invalid: editState().invalid,
      setValue: (value) => {
        const column = untracked(allColumns).find((def) => columnIdOf(def) === colId);
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
    stores.detail.dispatch({ type: "open", rowId, index: untracked(pageRowIds).indexOf(rowId) });
  };

  const stepDetail = (direction: -1 | 1) => {
    const detail = stores.detail.getState();
    if (detail.dirty) {
      stores.detail.dispatch({ type: "confirm", intent: direction === -1 ? "prev" : "next" });
      return;
    }
    const next = stepRow(untracked(pageRowIds), detail.rowId, direction);
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
    const next = stepRow(untracked(pageRowIds), detail.rowId, intent === "prev" ? -1 : 1);
    if (next) stores.detail.dispatch({ type: "go", ...next });
  };

  const detailRow = computed(() => {
    const rowId = detailState().rowId;
    if (!rowId) return null;
    const row = rows().find((candidate) => candidate.id === rowId);
    return row ? row.original : null;
  });

  // ── Export ────────────────────────────────────────────────────────────────
  const exportCsv = (scope: TableRowScope = "view") => {
    exportRowsToCsv(table, {
      scope,
      filename: `${untracked(label).toLowerCase().replace(/\s+/g, "-")}.csv`,
    });
  };

  const copySelection = (scope: TableRowScope = "selected") =>
    copyRowsToClipboard(table, { scope });

  // ── Keyboard ──────────────────────────────────────────────────────────────
  const onGridKeyDown = (event: KeyboardEvent) => {
    if (!untracked(interactive)) return;
    const cursor = untracked(effectiveCursor);
    const columns = untracked(visibleColumns);
    const column = columns[cursor.col];
    const pageRows = Math.max(
      1,
      Math.floor((untracked(viewportRef)?.clientHeight ?? 0) / estimateRowHeight(untracked(size))) -
        1,
    );
    const action = gridKeyDown(
      {
        cursor,
        rowCount: untracked(rows).length,
        colCount: columns.length,
        pageRows,
        editing: Boolean(untracked(editState).target),
        editable: column ? untracked(editableColumns).has(column.id) : false,
        selectable: untracked(selectionMode) !== "none",
        multiSelect: untracked(selectionMode) === "multiple",
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
        if (untracked(virtualizing)) {
          virtualizer().scrollToIndex(action.cursor.row, { align: "center" });
        }
        focusCell(action.cursor);
        break;
      case "extend": {
        const all = untracked(rows);
        const anchorRow = all[cursor.row];
        const targetRow = all[action.cursor.row];
        if (anchorRow && targetRow) {
          const current = untracked(selection);
          const seeded = current.anchor ? current : { ...current, anchor: anchorRow.id };
          selection.set(rangeSelect(seeded, untracked(pageRowIds), targetRow.id, true, true));
        }
        focusCell(action.cursor);
        break;
      }
      case "toggle-select": {
        const row = untracked(rows)[cursor.row];
        if (row) toggleRow(row.id, !isRowSelected(untracked(selection), row.id));
        break;
      }
      case "select-all":
        togglePage(true);
        break;
      case "copy":
        void copySelection(action.scope);
        break;
      case "edit": {
        const row = untracked(rows)[cursor.row];
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
        const row = untracked(rows)[cursor.row];
        if (!row) break;
        const opts = untracked(options);
        if (opts.detail) openDetail(row.id);
        else opts.onRowClick?.(row.original);
        break;
      }
      default:
        break;
    }
  };

  // ── Server mode ───────────────────────────────────────────────────────────
  effect(() => {
    if (!manual()) return;
    const onQueryChange = options().onQueryChange;
    if (!onQueryChange) return;
    onQueryChange({
      sorting: sorting().map((entry) => ({ id: entry.id, desc: entry.desc })),
      filters: conditions(),
      search: deferredSearch(),
      pageIndex: pagination().pageIndex,
      pageSize: pagination().pageSize,
    });
  });

  // Infinite scroll. Attached to the viewport rather than to the virtualizer so
  // it works in the un-virtualized case too.
  effect((onCleanup) => {
    const viewport = viewportRef();
    const onLoadMore = options().onLoadMore;
    if (!viewport || !onLoadMore) return;
    const rowHeight = estimateRowHeight(size());
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
    onCleanup(() => viewport.removeEventListener("scroll", onScroll));
  });

  // ── Filters ───────────────────────────────────────────────────────────────
  const announcement = signal("");

  const filterDefs = computed(() => {
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
    return filterDefs().get(id)?.label ?? (typeof header === "string" ? header : id);
  };

  const typeOfColumn = (id: string) => filterTypes()[id] ?? "text";

  const fields = computed(() => {
    const counts = new Map<string, number>();
    for (const condition of conditions()) {
      counts.set(condition.columnId, (counts.get(condition.columnId) ?? 0) + 1);
    }
    return orderFilterableFields(
      [...filterDefs().entries()].map(([columnId, def], index) => ({
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
      catalogue: catalogue(),
      options: filterDefs().get(condition.columnId)?.options,
      formatValue: filterDefs().get(condition.columnId)?.formatValue,
    });

  /** Announce discrete changes only — a per-keystroke live region is a firehose. */
  const announce = (kind: FilterChangeKind, condition?: TableFilterCondition) => {
    announcement.set(
      filterAnnouncement(
        { kind, description: condition ? describe(condition).text : undefined },
        untracked(totalMatching),
      ),
    );
  };

  const addFilter = (columnId: string) => {
    const def = filterDefs().get(columnId);
    const type = typeOfColumn(columnId);
    // The id the reducer is about to assign, returned so the caller can open the
    // new chip's editor without waiting for a render to find it.
    const id = `f${untracked(filterState).nextId}`;
    dispatchFilter({
      type: "add",
      columnId,
      operator: defaultOperatorFor(type, catalogue(), def),
      single: def?.single,
    });
    return id;
  };

  const removeFilter = (id: string) => {
    const condition = untracked(conditions).find((entry) => entry.id === id);
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
    const def = filterDefs().get(condition.columnId);
    const column = table.getColumn(condition.columnId);
    const showCounts = def?.counts ?? rows().length <= FACET_ROW_LIMIT;
    return facetOptions(
      showCounts ? column?.getFacetedUniqueValues() : undefined,
      def?.options,
      condition.values,
      showCounts,
    );
  };

  const operatorsForCondition = (condition: TableFilterCondition) => {
    const type = typeOfColumn(condition.columnId);
    return operatorsFor(type, catalogue(), filterDefs().get(condition.columnId)?.operators).map(
      (op) => ({ id: op.id, label: operatorLabel(op, type) }),
    );
  };

  const activate = (row: TableRowModel<T>) => {
    const opts = untracked(options);
    if (opts.detail) openDetail(row.id);
    else opts.onRowClick?.(row.original);
  };

  const chrome = computed<TableChrome>(() => ({
    size: size(),
    variant: variant(),
    interactive: interactive(),
    totalWidth: layout().totalWidth,
    rowCount: totalMatching(),
    colCount: visibleColumns().length,
    label: label(),
    multiSelectable: selectionMode() === "multiple",
  }));

  const scrollBy = (direction: -1 | 1) => {
    const element = untracked(viewportRef);
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

  // Kept so a caller that tears the table down mid-flight has somewhere to hang
  // cleanup; the effects above register their own.
  void destroyRef;

  return {
    table,
    state,
    rows,
    renderRows,
    chrome,
    get options() {
      return options();
    },
    size,
    variant,
    label,
    captionVisible,
    interactive,
    mode,
    loading,
    search: search.asReadonly(),
    setSearch: (value: string) => search.set(value),
    selection: {
      mode: selectionMode,
      state: selection.asReadonly(),
      count: computed(() => selectionCountCore(selection(), totalMatching())),
      rows: selectedRows,
      // No `untracked`: this is read from every row's prop bag, which is a
      // `computed` — untracking it would freeze `data-selected` at whatever
      // the first render saw.
      isSelected: (rowId) => isRowSelected(selection(), rowId),
      toggle: toggleRow,
      togglePage,
      selectAllMatching: selectEverythingMatching,
      clear: () => selection.set(EMPTY_SELECTION),
      header: headerState,
      canSelectAllMatching: computed(
        () =>
          selectionMode() === "multiple" &&
          headerState().checked &&
          !selection().allMatching &&
          totalMatching() > visibleRowIds().length,
      ),
      totalMatching,
      asBulk: () => toBulkSelection(selection()),
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
      optionsFor: optionsForCondition,
      typeOf: (condition) => typeOfColumn(condition.columnId),
      arityOf: (condition) => catalogue().get(condition.operator)?.arity ?? "one",
      expanded: computed(() => filterState().expanded),
      setExpanded: (expanded) => dispatchFilter({ type: "set-expanded", expanded }),
      editing: computed(() => filterState().editingId),
      setEditing: (id) => dispatchFilter({ type: "set-editing", id }),
      announcement: announcement.asReadonly(),
    },
    edit: {
      enabled: computed(() => editableColumns().size > 0),
      state: editState,
      isEditing: (rowId, colId) => isEditingCell(editState(), rowId, colId),
      start: startEdit,
      setValue: (value) => stores.edit.dispatch({ type: "change", value }),
      commit: commitEdit,
      cancel: () => stores.edit.dispatch({ type: "cancel" }),
      contextFor: editContextFor,
    },
    detail: {
      enabled: computed(() => Boolean(options().detail)),
      state: detailState,
      row: detailRow,
      total: totalMatching,
      open: openDetail,
      close: closeDetail,
      step: stepDetail,
      canStep: (direction) => stepRow(pageRowIds(), detailState().rowId, direction) !== null,
      setDirty: (dirty) => stores.detail.dispatch({ type: "dirty", dirty }),
      resolveConfirm: resolveDetailConfirm,
    },
    focus: {
      cursor: effectiveCursor,
      setCursor,
      focusCell,
      isFocused: (rowIndex, colIndex) => {
        const cursor = effectiveCursor();
        return cursor.row === rowIndex && cursor.col === colIndex;
      },
    },
    virtual: { enabled: virtualizing, virtualizer, spacers },
    scroll: { state: scrollState.asReadonly(), by: scrollBy },
    columnWidths: computed(() => layout().widths),
    rootRef,
    viewportRef,
    exportCsv,
    copySelection,
    onGridKeyDown,
    activate,
    primaryColumnId: primaryId,
  };
}
