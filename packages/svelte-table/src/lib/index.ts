/**
 * `@ui-organized/svelte-table` — the Svelte data table.
 *
 * Three layers, the same three the React and Vue packages ship: the
 * `createDataTable` rune, the styled parts, and a batteries-included
 * `<DataTable>`. The behaviour underneath all of them is
 * `@ui-organized/table-core`, shared verbatim — same class names, same
 * stylesheet, same token contract, no fork of the logic.
 */

// ── Layer 1: headless ───────────────────────────────────────────────────────
export { createDataTable } from "./core/createDataTable.svelte.js";
export { trackStore } from "./core/trackStore.svelte.js";
export { createDeferred } from "./core/createDeferred.svelte.js";
export { setTable, getTable, getOptionalTable } from "./core/tableContext.js";
export { selectionColumn, actionsColumn } from "./core/systemColumns.js";
export { elementRef } from "./core/elementRef.js";

export type {
  BulkAction,
  DataTableApi,
  DetailApi,
  DetailConfig,
  EditApi,
  EmptyStateConfig,
  FilterableField,
  FiltersApi,
  FocusApi,
  HorizontalScrollApi,
  RenderRow,
  RowAction,
  SelectionApi,
  SvelteNode,
  TableAction,
  TableColumn,
  TableEditRenderer,
  TableFilterInput,
  UseDataTableOptions,
  VirtualApi,
} from "./core/types.js";

// ── Layer 2: parts ──────────────────────────────────────────────────────────
export {
  Table,
  TableViewport,
  TableHeader,
  TableHeadCell,
  TableBody,
  TableRow,
  TableCell,
  TableFooter,
} from "./components/Table/index.js";
export { TableEmpty, TableLoading, TableError } from "./components/TableStates/index.js";
export {
  TableToolbar,
  TableActions,
  TableSearch,
  TableSortMenu,
  TableViewOptions,
  TableExportMenu,
  TableScrollButtons,
} from "./components/TableToolbar/index.js";
export {
  TableFilters,
  TableFilterAdd,
  TableFilterChip,
  TableFilterEditor,
  TableFilterValueEditor,
  autoFocusField,
  focusAfterRemoval,
} from "./components/TableFilters/index.js";
export { TablePagination } from "./components/TablePagination/index.js";
export { TableSelectionBar } from "./components/TableSelectionBar/index.js";
export { TableCards, TableCard } from "./components/TableCards/index.js";
export { TableDetailSheet } from "./components/TableDetailSheet/index.js";
export { TableRowActions } from "./components/TableRowActions/index.js";

// ── Layer 3: the wrapper ────────────────────────────────────────────────────
export { DataTable } from "./DataTable/index.js";

// Re-exported so a consumer needs one import for the whole table, not two.
export type {
  DataTableQuery,
  SelectionMode,
  TableFilterCondition,
  TableFilterType,
  TableMode,
  TableRowModel,
  TableRowScope,
  TableSize,
  TableVariant,
  ResponsiveConfig,
  VirtualConfig,
} from "@ui-organized/table-core";
