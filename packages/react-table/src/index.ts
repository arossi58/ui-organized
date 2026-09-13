// Core's stylesheet, re-exported through this package so a consumer imports one
// path rather than two. tsup pulls only the CSS subpath back in (see
// tsup.config.ts); the JS API stays external.
import "@ui-organized/table-core/styles";

// ─── Layer 1 — headless ──────────────────────────────────────────────────────
export { useDataTable } from "./core/useDataTable.js";
export { TableProvider, useTableContext, useOptionalTableContext } from "./core/TableContext.js";
export type { TableProviderProps } from "./core/TableContext.js";
export type {
  BulkAction,
  DataTableApi,
  FilterableField,
  FiltersApi,
  TableFilterInput,
  DetailApi,
  DetailConfig,
  EditApi,
  EmptyStateConfig,
  FocusApi,
  HorizontalScrollApi,
  RowAction,
  SelectionApi,
  TableAction,
  TableColumn,
  TableEditRenderer,
  UseDataTableOptions,
  VirtualApi,
} from "./core/types.js";

// ─── Layer 2 — styled parts ──────────────────────────────────────────────────
export {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHeadCell,
  TableHeader,
  TableRow,
  TableViewport,
} from "./components/Table/index.js";
export type {
  TableBodyProps,
  TableCellProps,
  TableFooterProps,
  TableHeadCellProps,
  TableHeaderProps,
  TableProps,
  TableRowProps,
  TableViewportProps,
} from "./components/Table/index.js";

export { TableEmpty, TableError, TableLoading } from "./components/TableStates/index.js";
export type {
  TableEmptyProps,
  TableErrorProps,
  TableLoadingProps,
} from "./components/TableStates/index.js";

export {
  TableActions,
  TableExportMenu,
  TableScrollButtons,
  TableSearch,
  TableSortMenu,
  TableToolbar,
  TableViewOptions,
} from "./components/TableToolbar/index.js";
export type {
  TableActionsProps,
  TableExportMenuProps,
  TableScrollButtonsProps,
  TableSearchProps,
  TableSortMenuProps,
  TableToolbarProps,
  TableViewOptionsProps,
} from "./components/TableToolbar/index.js";

export {
  TableFilterAdd,
  TableFilterChip,
  TableFilterEditor,
  TableFilters,
  TableFilterValueEditor,
} from "./components/TableFilters/index.js";
export type {
  TableFilterAddProps,
  TableFilterChipProps,
  TableFilterEditorProps,
  TableFiltersProps,
  TableFilterValueEditorProps,
} from "./components/TableFilters/index.js";

export { TablePagination } from "./components/TablePagination/index.js";
export type { TablePaginationProps } from "./components/TablePagination/index.js";

export { TableSelectionBar } from "./components/TableSelectionBar/index.js";
export type { TableSelectionBarProps } from "./components/TableSelectionBar/index.js";

export { TableRowActions } from "./components/TableRowActions/index.js";
export type { TableRowActionsProps } from "./components/TableRowActions/index.js";

export { TableDetailSheet } from "./components/TableDetailSheet/index.js";
export type { TableDetailSheetProps } from "./components/TableDetailSheet/index.js";

export { TableCard, TableCards } from "./components/TableCards/index.js";
export type { TableCardProps, TableCardsProps } from "./components/TableCards/index.js";

// ─── Layer 3 — the wrapper ───────────────────────────────────────────────────
export { DataTable } from "./DataTable/index.js";
export type { DataTableProps } from "./DataTable/index.js";

// ─── Re-exported from core ───────────────────────────────────────────────────
// So a consumer never has to add `@ui-organized/table-core` — or TanStack — to
// their own package.json just to type a column.
export type {
  BulkSelection,
  DataTableQuery,
  SelectionMode,
  SelectionState,
  TableAlign,
  TableColumnMeta,
  TableEditContext,
  TableEditDef,
  TableEditPatch,
  TableFilterCondition,
  TableFilterDef,
  TableFilterOperator,
  TableFilterOption,
  TableFilterType,
  TableFilterValue,
  TableInstance,
  TableMode,
  TableRowModel,
  TableRowScope,
  TableSize,
  TableVariant,
} from "@ui-organized/table-core";
export {
  ACTIONS_COLUMN_ID,
  CARD_BREAKPOINT,
  DEFAULT_PAGE_SIZE,
  PAGE_SIZE_OPTIONS,
  SELECTION_COLUMN_ID,
  copyRowsToClipboard,
  exportRowsToCsv,
  serializeRows,
} from "@ui-organized/table-core";
