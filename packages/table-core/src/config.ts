/**
 * The framework-free half of the table's configuration.
 *
 * TanStack splits into `table-core` (this) and thin per-framework adapters, and
 * that split is the reason the portability claim in TABLE.md is cheap rather
 * than aspirational: every row model, feature flag and filter function below is
 * shared, and an adapter adds only the state binding its framework needs.
 */
import {
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type FilterFn,
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

export interface CoreTableConfig<T> {
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
 * Everything an adapter can share. `Partial` plus the three genuinely required
 * options, so an adapter can spread this straight into its own `useTable` call
 * and still satisfy the required fields.
 */
export type SharedTableOptions<T> = Partial<TableOptions<T>> &
  Pick<TableOptions<T>, "data" | "columns" | "getCoreRowModel">;

/**
 * Global search: substring match against every column's rendered value.
 *
 * TanStack calls a global filter once per column and ORs the results, so this
 * only has to answer for one cell.
 */
export const globalTextFilter: FilterFn<any> = (row, id, filterValue) => {
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
function withFilterFns<T>(
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

export function coreTableOptions<T>(config: CoreTableConfig<T>): SharedTableOptions<T> {
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

    getCoreRowModel: getCoreRowModel(),
    // Row models are only attached when the feature is on: each one is a
    // memoized pass over the data, and an unused one still runs.
    getSortedRowModel: sortable && !config.manual ? getSortedRowModel() : undefined,
    getFilteredRowModel: filterable && !config.manual ? getFilteredRowModel() : undefined,
    getPaginationRowModel: paginated && !config.manual ? getPaginationRowModel() : undefined,
    getFacetedRowModel: filterable && !config.manual ? getFacetedRowModel() : undefined,
    getFacetedUniqueValues: filterable && !config.manual ? getFacetedUniqueValues() : undefined,

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
