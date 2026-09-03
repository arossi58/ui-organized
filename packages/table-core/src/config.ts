/**
 * The framework-free half of the table's configuration.
 *
 * TanStack splits into `table-core` (this) and thin per-framework adapters, and
 * that split is the reason the portability claim in TABLE.md is cheap rather
 * than aspirational: every row model, feature flag and filter function below is
 * shared, and an adapter adds only the state binding its framework needs.
 */
import {
  columnFacetingFeature,
  columnFilteringFeature,
  columnOrderingFeature,
  columnPinningFeature,
  columnResizingFeature,
  columnSizingFeature,
  columnVisibilityFeature,
  createCoreRowModel,
  createFacetedRowModel,
  createFacetedUniqueValues,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  globalFilteringFeature,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  type FilterFn,
  type RowData,
  type TableFeatures,
  type TableOptions,
} from "@tanstack/table-core";
import { columnId, metaOf, normalizeColumns } from "./columns.js";
import { DEFAULT_CATALOGUE } from "./filters/operators.js";
import { createColumnFilterFn } from "./filters/predicate.js";
import { normalizeFilterDef } from "./filters/types.js";
import type { FilterOperatorCatalogue, TableFilterType } from "./filters/types.js";
import { DEFAULT_COLUMN_WIDTH, MAX_COLUMN_WIDTH, MIN_COLUMN_WIDTH } from "./styles.js";
import type { TableColumn } from "./types.js";

export type SelectionMode = "none" | "single" | "multiple";

export interface CoreTableConfig<T extends RowData> {
  data: readonly T[];
  columns: readonly TableColumn<T>[];
  /**
   * Stable row identity. Selection, inline edit and the detail sheet are all
   * keyed by it, so without one they break the moment a row moves.
   */
  getRowId?: (row: T, index: number) => string;
  selection?: SelectionMode;
  sortable?: boolean;
  filterable?: boolean;
  paginated?: boolean;
  resizable?: boolean;
  /**
   * Server-driven. The table stops sorting, filtering and paginating locally and
   * reports what the user asked for through `onQueryChange` instead.
   */
  manual?: boolean;
  /** Total matching rows. Required in `manual` mode — the client cannot count. */
  rowCount?: number;
  /**
   * Resolved filter type per column id, for columns whose `meta.filter` does
   * not declare one. The adapter infers these from the data it has.
   */
  filterTypes?: Record<string, TableFilterType>;
  /** Operator definitions, including any the consumer registered. */
  catalogue?: FilterOperatorCatalogue;
  /**
   * Reads the clock for relative dates. Injected so core stays pure and so a
   * test can freeze it; called once per filter pass, never per row.
   */
  now?: () => number;
}

/**
 * The features every ui-organized table registers, and the row models that fill
 * their slots.
 *
 * v9 composes a table out of explicit features rather than inferring them from
 * which options were passed, so this is now the single declaration of what a
 * table in this design system *is*. Registering the whole set here rather than
 * per-call keeps every adapter's tables identical — a feature present in React
 * and absent in Vue would be a divergence no type could catch.
 *
 * The row models are attached conditionally in `coreTableOptions`, because each
 * one is a memoized pass over the data and an unused one still runs.
 */
export const TABLE_FEATURES = {
  columnFacetingFeature,
  columnFilteringFeature,
  columnOrderingFeature,
  columnPinningFeature,
  columnResizingFeature,
  columnSizingFeature,
  columnVisibilityFeature,
  globalFilteringFeature,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
} satisfies TableFeatures;

/**
 * The feature set, plus the row-model slots that fill it.
 *
 * The slots are optional because they are attached conditionally — a table with
 * sorting off never builds a sorted row model — but they have to be *in* the
 * type, because `TableOptions` is generic over the whole features object and
 * would reject them as excess properties otherwise.
 */
export type UioTableFeatures = typeof TABLE_FEATURES &
  Pick<
    TableFeatures,
    | "coreRowModel"
    | "sortedRowModel"
    | "filteredRowModel"
    | "paginatedRowModel"
    | "facetedRowModel"
    | "facetedUniqueValues"
  >;

/**
 * Everything an adapter can share. `Partial` plus the two genuinely required
 * options, so an adapter can spread this straight into its own `useTable` call
 * and still satisfy the required fields.
 */
export type SharedTableOptions<T extends RowData> = Partial<TableOptions<UioTableFeatures, T>> &
  Pick<TableOptions<UioTableFeatures, T>, "data" | "columns" | "features">;

/**
 * Global search: substring match against every column's rendered value.
 *
 * TanStack calls a global filter once per column and ORs the results, so this
 * only has to answer for one cell.
 */
export const globalTextFilter: FilterFn<any, any> = (row, id, filterValue) => {
  const needle = String(filterValue ?? "")
    .trim()
    .toLowerCase();
  if (!needle) return true;
  const value = row.getValue(id);
  if (value === null || value === undefined) return false;
  return String(value).toLowerCase().includes(needle);
};

/**
 * Gives every filterable column the one universal filter function, and closes
 * the door on every column that is not.
 *
 * `enableColumnFilter: false` makes the explicit opt-in **structural** rather
 * than a convention the UI happens to honour — `column.getCanFilter()` becomes
 * the single answer to "may this be filtered", so the Add-filter list and the
 * engine can never disagree. It deliberately does not affect
 * `getCanGlobalFilter()`, so a column excluded from the filter list is still
 * reachable by the search box.
 *
 * A column that names its own `filterFn` is overridden rather than respected:
 * its hand-written predicate would receive a condition *array* and silently
 * return nothing. The supported escape hatch is a custom operator, which is the
 * right level to extend at.
 */
function withFilterFns<T extends RowData>(
  columns: TableColumn<T>[],
  catalogue: FilterOperatorCatalogue,
  filterTypes: Record<string, TableFilterType>,
  now: () => number,
): TableColumn<T>[] {
  return columns.map((def) => {
    const filter = normalizeFilterDef(metaOf(def)?.filter);
    if (!filter) {
      return { ...def, enableColumnFilter: false } as TableColumn<T>;
    }
    const id = columnId(def);
    const type = filter.type ?? filterTypes[id] ?? "text";
    return {
      ...def,
      enableColumnFilter: true,
      filterFn: createColumnFilterFn(catalogue, type, now),
    } as TableColumn<T>;
  });
}

export function coreTableOptions<T extends RowData>(
  config: CoreTableConfig<T>,
): SharedTableOptions<T> {
  const sortable = config.sortable ?? true;
  const filterable = config.filterable ?? true;
  const paginated = config.paginated ?? false;
  const selection = config.selection ?? "none";

  return {
    data: config.data as T[],
    columns: withFilterFns(
      normalizeColumns(config.columns),
      config.catalogue ?? DEFAULT_CATALOGUE,
      config.filterTypes ?? {},
      config.now ?? Date.now,
    ),
    getRowId: config.getRowId,
    defaultColumn: {
      size: DEFAULT_COLUMN_WIDTH,
      minSize: MIN_COLUMN_WIDTH,
      maxSize: MAX_COLUMN_WIDTH,
    },

    // Features and their row-model slots, in one object: v9 reads both from
    // here. Row models are attached only when the feature is on, because each
    // one is a memoized pass over the data and an unused one still runs — and
    // in `manual` mode the server has already done the work.
    features: {
      ...TABLE_FEATURES,
      coreRowModel: createCoreRowModel(),
      ...(sortable && !config.manual ? { sortedRowModel: createSortedRowModel() } : {}),
      ...(filterable && !config.manual ? { filteredRowModel: createFilteredRowModel() } : {}),
      ...(paginated && !config.manual ? { paginatedRowModel: createPaginatedRowModel() } : {}),
      ...(filterable && !config.manual
        ? {
            facetedRowModel: createFacetedRowModel(),
            facetedUniqueValues: createFacetedUniqueValues(),
          }
        : {}),
    },

    enableSorting: sortable,
    enableFilters: filterable,
    enableGlobalFilter: filterable,
    globalFilterFn: globalTextFilter,

    enableRowSelection: selection !== "none",
    enableMultiRowSelection: selection === "multiple",

    enableColumnResizing: config.resizable ?? false,
    columnResizeMode: "onChange",

    manualSorting: config.manual ?? false,
    manualFiltering: config.manual ?? false,
    manualPagination: config.manual ?? false,
    rowCount: config.manual ? config.rowCount : undefined,
  };
}
