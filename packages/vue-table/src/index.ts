/**
 * `@ui-organized/vue-table` — the Vue data table.
 *
 * Three layers, the same three the React package ships: the `useDataTable`
 * composable, the styled parts, and a batteries-included `<DataTable>`. The
 * behaviour underneath all of them is `@ui-organized/table-core`, shared
 * verbatim — same class names, same stylesheet, same token contract, no fork of
 * the logic.
 */

// ── Layer 1: headless ───────────────────────────────────────────────────────
export { useDataTable } from "./core/useDataTable.js";
export { useStore } from "./core/useStore.js";
export { useDeferred } from "./core/useDeferred.js";
export { provideTable, useTableContext, useOptionalTableContext } from "./core/tableContext.js";
export { selectionColumn, actionsColumn } from "./core/systemColumns.js";

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
  TableAction,
  TableColumn,
  TableEditRenderer,
  TableFilterInput,
  UseDataTableOptions,
  VirtualApi,
  VueNode,
} from "./core/types.js";

// ── Layer 2: parts ──────────────────────────────────────────────────────────
export { TableRowActions } from "./components/TableRowActions/index.js";

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
