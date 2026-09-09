// The stylesheet, in cascade order. esbuild strips these imports from the JS
// bundle and concatenates the files into `dist/index.css`, which is what makes
// `@ui-organized/table-core/styles` a single import and lets a plain Node script
// import this package without a CSS loader.
import "./styles/table.css";
import "./styles/header.css";
import "./styles/states.css";
import "./styles/toolbar.css";
import "./styles/filters.css";
import "./styles/cards.css";
import "./styles/detail.css";

// ─── Types ───────────────────────────────────────────────────────────────────
/**
 * TanStack's row-data constraint, re-exported so an adapter can write
 * `<T extends RowData>` without taking a TanStack dependency of its own — the
 * same reason `TableInstance` and friends are re-exported below.
 */
export type { RowData } from "@tanstack/table-core";
export type {
  TableCellInstance,
  TableColumnInstance,
  TableHeaderGroupInstance,
  TableHeaderInstance,
  DataTableQuery,
  TableAlign,
  TableColumn,
  TableColumnMeta,
  TableEditContext,
  TableEditDef,
  BuiltInFilterOperator,
  FilterCompileContext,
  FilterOperatorArity,
  FilterOperatorCatalogue,
  FilterOperatorDef,
  TableFilterCondition,
  TableFilterDef,
  TableFilterOperator,
  TableFilterOption,
  TableFilterSetting,
  TableFilterType,
  TableFilterUnit,
  TableFilterValue,
  TableInstance,
  TableRowData,
  TableRowId,
  TableRowModel,
  TableRowScope,
  TableSize,
  TableSortSpec,
  TableVariant,
} from "./types.js";

// ─── Class contract and constants ────────────────────────────────────────────
export {
  CARD_BREAKPOINT,
  CARD_HEIGHT,
  DEFAULT_COLUMN_WIDTH,
  DEFAULT_PAGE_SIZE,
  HEADER_HEIGHT,
  MAX_COLUMN_WIDTH,
  MIN_COLUMN_WIDTH,
  OVERSCAN,
  PAGE_SIZE_OPTIONS,
  pageSizeOptions,
  RESIZE_STEP,
  RESIZE_STEP_FINE,
  ROW_HEIGHT,
  VIRTUAL_THRESHOLD,
  dataTableStyles,
  tableCellStyles,
  tableHeadCellStyles,
} from "./styles.js";
export type { DataTableVariants, TableCellVariants, TableHeadCellVariants } from "./styles.js";

// ─── Column model ────────────────────────────────────────────────────────────
export {
  ACTIONS_COLUMN_ID,
  SELECTION_COLUMN_ID,
  alignOf,
  cardFieldOrder,
  columnId,
  isReservedColumn,
  metaOf,
  normalizeColumns,
  primaryColumnId,
  stickyPositionOf,
  toggleableColumns,
} from "./columns.js";

// ─── Table configuration ─────────────────────────────────────────────────────
export { TABLE_FEATURES, coreTableOptions, globalTextFilter } from "./config.js";
export type {
  CoreTableConfig,
  SelectionMode,
  SharedTableOptions,
  UioTableFeatures,
} from "./config.js";

// ─── Prop builders ───────────────────────────────────────────────────────────
export {
  getCaptionProps,
  getCellProps,
  getColProps,
  getHeadCellProps,
  getHeaderRowProps,
  getResizeHandleProps,
  getRootProps,
  getRowProps,
  getSpacerProps,
  getTableProps,
  getViewportProps,
} from "./props.js";
export type {
  AttrValue,
  CellContext,
  ElementProps,
  HeadCellContext,
  ResizeHandleContext,
  RowContext,
  StickyPosition,
  TableChrome,
  TableStyle,
} from "./props.js";

// ─── Behaviours ──────────────────────────────────────────────────────────────
export { gridKeyDown } from "./keyboard.js";
export type { GridAction, GridCursor, GridState, KeyEvent } from "./keyboard.js";

export {
  EMPTY_SELECTION,
  clearSelection,
  headerCheckboxState,
  isEmpty,
  isSelected,
  rangeSelect,
  selectAllMatching,
  selectPage,
  selectedIds,
  selectionCount,
  toBulkSelection,
} from "./selection.js";
export type { BulkSelection, SelectionState } from "./selection.js";

// ─── Stores ──────────────────────────────────────────────────────────────────
export { createStore } from "./state.js";
export type { Reducer, Store } from "./state.js";

// ─── Export ──────────────────────────────────────────────────────────────────
export { escapeField, exportRowsToCsv, serializeRows } from "./csv.js";
export type { ExportOptions, SerializeOptions } from "./csv.js";
export { copyRowsToClipboard, writeClipboard } from "./clipboard.js";

// ─── Inline edit ─────────────────────────────────────────────────────────────
export { INITIAL_EDIT_STATE, createEditStore, editReducer, isEditing } from "./edit.js";
export type { EditAction, EditState, EditTarget, TableEditPatch } from "./edit.js";

// ─── Row detail ──────────────────────────────────────────────────────────────
export {
  INITIAL_DETAIL_STATE,
  createDetailStore,
  detailReducer,
  guard,
  stepRow,
} from "./detail.js";
export type { DetailAction, DetailIntent, DetailState } from "./detail.js";

// ─── Responsive ──────────────────────────────────────────────────────────────
export { resolveMode, watchWidth } from "./responsive.js";
export type { ResponsiveConfig, TableMode } from "./responsive.js";

// ─── Column resize and reorder ───────────────────────────────────────────────
export { moveColumn, resizeKeyDown, resizeStep } from "./resize.js";
export type { ResizeAction, ResizeBounds } from "./resize.js";

// ─── Filters ─────────────────────────────────────────────────────────────────
// The model is identifier + relative + value; see ./filters.
export {
  BUILT_IN_OPERATORS,
  DEFAULT_CATALOGUE,
  DEFAULT_OPERATORS_BY_TYPE,
  createOperatorCatalogue,
  defaultOperatorFor,
  inferFilterType,
  isEmptyCell,
  normalize,
  operatorLabel,
  operatorsFor,
  requiredOperands,
  toIsoDay,
  toNumber,
} from "./filters/operators.js";
export type { NormalizedValue } from "./filters/operators.js";

export {
  compileConditions,
  createColumnFilterFn,
  evaluateCondition,
  isConditionComplete,
  resolveRelativeDates,
  testCompiled,
} from "./filters/predicate.js";
export type { CompiledCondition } from "./filters/predicate.js";

export {
  INITIAL_FILTER_STATE,
  coerceValues,
  conditionsForColumn,
  createFilterReducer,
  createFilterStore,
  filterReducer,
  fromColumnFilters,
  toColumnFilters,
} from "./filters/state.js";
export type { ColumnFilterEntry, TableFilterAction, TableFilterState } from "./filters/state.js";

export {
  VALUE_PLACEHOLDER,
  describeCondition,
  filterAnnouncement,
  filterSummary,
} from "./filters/describe.js";
export type {
  ConditionDescription,
  DescribeContext,
  FilterChangeKind,
} from "./filters/describe.js";

export {
  ALPHABETICAL_FIELD_THRESHOLD,
  FACET_ROW_LIMIT,
  facetOptions,
  orderFilterableFields,
  searchOptions,
} from "./filters/facets.js";
export type { OrderableField, TableFilterFacetOption } from "./filters/facets.js";

export { normalizeFilterDef } from "./filters/types.js";

// ─── Column layout ───────────────────────────────────────────────────────────
export { layoutColumns } from "./layout.js";
export type { ColumnLayout, ColumnLayoutInput } from "./layout.js";

// ─── Virtualization ──────────────────────────────────────────────────────────
export {
  estimateRowHeight,
  isNearEnd,
  overscanFor,
  shouldVirtualize,
  spacerHeights,
} from "./virtual.js";
export type { ScrollPosition, VirtualConfig } from "./virtual.js";

// ─── Horizontal scroll ───────────────────────────────────────────────────────
export { NO_HORIZONTAL_SCROLL, horizontalScrollState, horizontalScrollTarget } from "./scroll.js";
export type { HorizontalScrollPosition, HorizontalScrollState } from "./scroll.js";
