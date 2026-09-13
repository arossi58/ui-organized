/**
 * `@ui-organized/angular-table` — the Angular data table.
 *
 * Three layers, the same three the React, Vue and Svelte packages ship: the
 * `createDataTable` factory, the styled parts, and a batteries-included
 * `<uio-data-table>`. The behaviour underneath all of them is
 * `@ui-organized/table-core`, shared verbatim — same class names, same
 * stylesheet, same token contract, no fork of the logic.
 */

// ── Layer 1: headless ───────────────────────────────────────────────────────
export { createDataTable } from "./lib/core/create-data-table.js";
export { trackStore } from "./lib/core/track-store.js";
export { createDeferred } from "./lib/core/create-deferred.js";
export {
  UIO_DATA_TABLE,
  provideDataTable,
  injectDataTable,
  injectOptionalDataTable,
} from "./lib/core/table-context.js";
export { selectionColumn, actionsColumn } from "./lib/core/system-columns.js";
export { UioTableProps, applyElementProps } from "./lib/core/element-props.js";
export { UioTableElementRef } from "./lib/core/element-ref.js";
export { UioTableSelectAllCell, UioTableSelectCell } from "./lib/core/select-cells.js";
export { UioTableActionsHeader } from "./lib/core/actions-header.js";

export type {
  AngularNode,
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
} from "./lib/core/types.js";

// ── Layer 2: parts ──────────────────────────────────────────────────────────
export {
  UioTable,
  UioTableViewport,
  UioTableHeader,
  UioTableBody,
} from "./lib/components/table.js";
export { UioTableHeadCell, UioTableResizeHandle } from "./lib/components/table-head-cell.js";
export { UioTableRow, UioTableCell } from "./lib/components/table-row.js";
export { UioTableEmpty, UioTableLoading, UioTableError } from "./lib/components/table-states.js";
/**
 * One part where the other three libraries export seven.
 *
 * `TableSearch`, `TableSortMenu`, `TableViewOptions`, `TableExportMenu`,
 * `TableActions` and `TableScrollButtons` each render exactly the element they
 * are in React, Vue and Svelte — a fragment, in effect. An Angular component
 * always has a host element, so each of those would put a node in the DOM the
 * other three do not render. They are composed inside `UioTableToolbar`
 * instead; see the note there.
 */
export { UioTableToolbar } from "./lib/components/table-toolbar.js";
/**
 * `TableFilterAdd` is not exported: like the six toolbar controls, it renders a
 * trigger and a portalled menu and nothing else, so an Angular host element
 * would be a node the other three libraries do not have. It is composed inside
 * `UioTableToolbar` and `UioTableFilters`.
 */
export {
  UioTableFilters,
  UioTableFilterChip,
  UioTableFilterEditor,
  UioTableFilterValueEditor,
  focusAfterRemoval,
} from "./lib/components/table-filters.js";
export { UioTablePagination } from "./lib/components/table-pagination.js";
export { UioTableSelectionBar } from "./lib/components/table-selection-bar.js";
export { UioTableRowActions } from "./lib/components/table-row-actions.js";

// ── Layer 3: the wrapper ────────────────────────────────────────────────────
export { UioDataTable } from "./lib/data-table.js";

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
