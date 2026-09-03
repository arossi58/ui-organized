import type { ReactNode } from "react";
import type { ButtonProps } from "@ui-organized/react";
import type {
  BulkSelection,
  DataTableQuery,
  DetailState,
  EditState,
  GridCursor,
  HorizontalScrollState,
  ConditionDescription,
  FilterOperatorArity,
  FilterOperatorDef,
  ResponsiveConfig,
  SelectionMode,
  SelectionState,
  TableChrome,
  TableColumn as CoreTableColumn,
  TableEditContext,
  TableEditPatch,
  TableFilterCondition,
  TableFilterFacetOption,
  TableFilterType,
  TableInstance,
  TableMode,
  TableRowModel,
  TableRowScope,
  TableSize,
  TableVariant,
  VirtualConfig,
} from "@ui-organized/table-core";
import type { Virtualizer } from "@tanstack/react-virtual";

/**
 * The React column type. Identical to core's, except that `meta.edit.render`
 * returns a `ReactNode` rather than `unknown` — the one place a framework type
 * legitimately enters, narrowed by the adapter exactly as core intends.
 */
export type TableColumn<T> = CoreTableColumn<T>;

export type TableEditRenderer<T> = (ctx: TableEditContext<T>) => ReactNode;

/**
 * A condition a table starts with. `id` is omitted because the table assigns
 * them — deterministically, so baselines and assertions stay stable.
 */
export type TableFilterInput = Omit<TableFilterCondition, "id">;

/** One filterable column, as the "Add filter" list sees it. */
export interface FilterableField {
  columnId: string;
  label: string;
  type: TableFilterType;
  /** How many conditions already target it. Shown as a suffix in the list. */
  count: number;
}

export interface FiltersApi {
  /** Every applied condition, in the order added. What the chips render from. */
  conditions: TableFilterCondition[];
  /** Columns that may be filtered, in menu order. */
  fields: FilterableField[];
  /**
   * Add a condition on a column, starting on its default operator. Returns the
   * id it assigned, so the caller can open that chip's editor immediately.
   */
  add: (columnId: string) => string;
  update: (id: string, patch: Partial<Omit<TableFilterCondition, "id" | "columnId">>) => void;
  /** Put a condition back as it was — Escape in an open editor. */
  restore: (condition: TableFilterCondition) => void;
  remove: (id: string) => void;
  clear: () => void;
  /** The chip's words, decided in core so every adapter agrees. */
  describe: (condition: TableFilterCondition) => ConditionDescription;
  /** The operators a condition's column offers, in menu order. */
  operatorsFor: (condition: TableFilterCondition) => { id: string; label: string }[];
  /** Enum choices with faceted counts, and whether each would yield nothing. */
  optionsFor: (condition: TableFilterCondition) => TableFilterFacetOption[];
  /** The filter type of a condition's column. Decides which editor renders. */
  typeOf: (condition: TableFilterCondition) => TableFilterType;
  /** How many operands the condition's operator takes. Decides the editor's shape. */
  arityOf: (condition: TableFilterCondition) => FilterOperatorArity;
  /** Chips past the collapse limit are hidden until this is true. */
  expanded: boolean;
  setExpanded: (expanded: boolean) => void;
  /**
   * The condition whose editor is open. `add` sets it, so a filter chosen from
   * the header opens for editing without the two components having to know
   * about each other.
   */
  editing: string | null;
  setEditing: (id: string | null) => void;
  /** Announced in the live region on add, remove, change and clear. */
  announcement: string;
}

export interface BulkAction<T> {
  id: string;
  label: string;
  icon?: string;
  /** Routes through `AlertDialog` before running. */
  destructive?: boolean;
  /** Confirmation copy. Defaults are derived from `label`. */
  confirm?: { title?: string; description?: string; confirmLabel?: string };
  onRun: (rows: T[], selection: BulkSelection) => void | Promise<void>;
}

/**
 * A button in the table's header — "New user", "Import", "Refresh". The table's
 * own actions, as opposed to a row's or a selection's.
 *
 * `intent` is deliberately the full `Button` intent set rather than a narrowed
 * one: which of these is the page's primary action is a decision only the
 * developer building the screen can make, and a table that forces every header
 * action to look the same forces that decision wrong.
 */
export interface TableAction {
  id: string;
  label: string;
  icon?: string;
  /** Button hierarchy. Defaults to `tertiary` — chrome, not a call to action. */
  intent?: ButtonProps["intent"];
  /**
   * Drop the visible label and keep only the icon. `label` still names the
   * button for assistive tech, so this is safe; without an `icon` it is ignored.
   */
  iconOnly?: boolean;
  disabled?: boolean;
  onRun: () => void | Promise<void>;
}

export interface RowAction<T> {
  id: string;
  label: string;
  icon?: string;
  destructive?: boolean;
  disabled?: (row: T) => boolean;
  onRun: (row: T) => void | Promise<void>;
}

export interface DetailConfig<T> {
  render: (row: T) => ReactNode;
  /** Sheet title. Defaults to the primary column's value. */
  title?: (row: T) => string;
  description?: (row: T) => string;
  /** Footer actions, rendered after the built-in Close. */
  footer?: (row: T) => ReactNode;
}

export interface EmptyStateConfig {
  title?: string;
  description?: string;
  action?: ReactNode;
}

export interface UseDataTableOptions<T> {
  data: readonly T[];
  columns: readonly TableColumn<T>[];
  /**
   * The table's accessible name. Required, not optional: it becomes the
   * `<caption>`, and a table announced as "table" and nothing else is the most
   * common data-table accessibility failure there is.
   */
  label: string;
  /** Show the caption instead of hiding it visually. */
  captionVisible?: boolean;
  /**
   * Stable row identity. Selection, inline edit and the detail sheet are keyed
   * by it; without one they follow row *position*, which breaks on every sort.
   */
  getRowId?: (row: T, index: number) => string;

  size?: TableSize;
  variant?: TableVariant;

  selection?: SelectionMode;
  sortable?: boolean;
  filterable?: boolean;
  searchable?: boolean;
  paginated?: boolean;
  pageSize?: number;
  resizable?: boolean;
  reorderable?: boolean;
  hideableColumns?: boolean;
  /**
   * The header's sort button. On by default whenever any column is sortable —
   * it is the only way to sort in card mode, where there are no column headers
   * to click. Set `false` for a table whose headers are the whole story.
   */
  sortMenu?: boolean;
  /** Offer CSV download and clipboard copy in the toolbar. */
  exportable?: boolean;

  /** Row virtualization. `true` uses the defaults; an object tunes them. */
  virtual?: boolean | VirtualConfig;
  /** Caps the scroll viewport. A table with no cap cannot scroll or virtualize. */
  maxHeight?: number | string;

  loading?: boolean;
  error?: ReactNode;
  empty?: EmptyStateConfig;

  /**
   * Server-driven mode. Sorting, filtering and pagination stop happening
   * locally and are reported through `onQueryChange` instead.
   */
  manual?: boolean;
  /** Total matching rows. Required in `manual` mode — the client cannot count. */
  rowCount?: number;
  onQueryChange?: (query: DataTableQuery) => void;
  /** Infinite scroll: fires as the viewport approaches the end of the rows. */
  onLoadMore?: () => void;

  onRowClick?: (row: T) => void;
  onEdit?: (patch: TableEditPatch<T>) => void | Promise<void>;
  rowActions?: RowAction<T>[];
  bulkActions?: BulkAction<T>[];
  /**
   * The table's own actions, rendered in the header row. A divider separates
   * them from the table's chrome — filter, sort, export, columns — so the
   * developer's buttons read as belonging to the page rather than to the table.
   */
  actions?: TableAction[];
  detail?: DetailConfig<T>;
  responsive?: ResponsiveConfig;

  defaultSorting?: { id: string; desc: boolean }[];
  defaultColumnVisibility?: Record<string, boolean>;
  /**
   * Conditions the table starts with. Also the only way to render a chip in a
   * static surface — a visual baseline, an axe scan, a jsdom test — none of
   * which can open a dropdown to add one.
   */
  defaultFilters?: TableFilterInput[];
  /**
   * Extra or replacement operators. Passing a definition whose `id` matches a
   * built-in overrides it, which is also how labels get localized.
   */
  filterOperators?: FilterOperatorDef[];
}

export interface SelectionApi<T> {
  mode: SelectionMode;
  state: SelectionState;
  /** Rows the user believes are selected, including the all-matching case. */
  count: number;
  /** Rows actually loaded and selected. */
  rows: T[];
  isSelected: (rowId: string) => boolean;
  toggle: (rowId: string, checked: boolean, shift?: boolean) => void;
  togglePage: (checked: boolean) => void;
  selectAllMatching: () => void;
  clear: () => void;
  header: { checked: boolean; indeterminate: boolean };
  /** True when the page is fully selected and more rows match beyond it. */
  canSelectAllMatching: boolean;
  totalMatching: number;
  asBulk: () => BulkSelection;
}

export interface EditApi<T> {
  enabled: boolean;
  state: EditState;
  isEditing: (rowId: string, columnId: string) => boolean;
  start: (row: TableRowModel<T>, columnId: string) => void;
  setValue: (value: unknown) => void;
  commit: () => void;
  cancel: () => void;
  contextFor: (row: TableRowModel<T>, columnId: string) => TableEditContext<T> | null;
}

export interface DetailApi<T> {
  enabled: boolean;
  state: DetailState;
  row: T | null;
  total: number;
  open: (rowId: string) => void;
  close: () => void;
  step: (direction: -1 | 1) => void;
  canStep: (direction: -1 | 1) => boolean;
  setDirty: (dirty: boolean) => void;
  /** Answer the "discard unsaved changes?" prompt. */
  resolveConfirm: (discard: boolean) => void;
}

export interface FocusApi {
  cursor: GridCursor;
  /**
   * Follow focus that has already moved. Updates the cursor and takes no focus
   * of its own — which is what keeps it from pulling focus back out of an open
   * inline editor.
   */
  setCursor: (cursor: GridCursor) => void;
  /** Move the cursor and take DOM focus with it. */
  focusCell: (cursor: GridCursor) => void;
  isFocused: (rowIndex: number, colIndex: number) => boolean;
}

export interface VirtualApi {
  enabled: boolean;
  virtualizer: Virtualizer<HTMLElement, HTMLElement>;
  spacers: { top: number; bottom: number };
}

/**
 * The viewport's horizontal overflow, live. `overflowing` is false whenever
 * every column fits — which is what lets a scroll control render itself only
 * when there is something to scroll to, rather than sitting there permanently
 * disabled.
 */
export interface HorizontalScrollApi extends HorizontalScrollState {
  /** Move most of a viewport width: `-1` towards the first column, `1` away. */
  by: (direction: -1 | 1) => void;
}

export interface DataTableApi<T> {
  /**
   * The raw TanStack instance. Exposed deliberately as the escape hatch: every
   * feature the wrapper does not cover is reachable through it, which is what
   * stops a missing prop from being a fork.
   */
  table: TableInstance<T>;
  /** The rows to render — the current page, before virtualization. */
  rows: TableRowModel<T>[];
  /**
   * The rendered slice, once virtualization has been applied. `index` is the
   * row's position on the page (the cursor coordinate); `absoluteIndex` is its
   * position in the whole dataset (what `aria-rowindex` reports).
   */
  renderRows: { row: TableRowModel<T>; index: number; absoluteIndex: number }[];
  chrome: TableChrome;
  options: UseDataTableOptions<T>;

  size: TableSize;
  variant: TableVariant;
  label: string;
  captionVisible: boolean;
  interactive: boolean;
  mode: TableMode;
  loading: boolean;

  search: string;
  setSearch: (value: string) => void;

  selection: SelectionApi<T>;
  filters: FiltersApi;
  edit: EditApi<T>;
  detail: DetailApi<T>;
  focus: FocusApi;
  virtual: VirtualApi;
  scroll: HorizontalScrollApi;

  rootRef: (element: HTMLElement | null) => void;
  /** The scroll container: the viewport in table mode, the list in card mode. */
  viewportRef: (element: HTMLElement | null) => void;

  exportCsv: (scope?: TableRowScope) => void;
  copySelection: (scope?: TableRowScope) => Promise<boolean>;

  /** The key handler the grid installs — already normalized for core. */
  onGridKeyDown: (event: import("react").KeyboardEvent<HTMLElement>) => void;

  /**
   * Rendered width per column id. Not always `column.getSize()`: when the table
   * is narrower than its container the spare width is given to one column, so
   * the header band reaches the edge without every pinned column's sticky offset
   * drifting out of step with the sizes it was computed from.
   */
  columnWidths: Record<string, number>;

  /** Activate a row: opens the detail sheet, or calls `onRowClick`. */
  activate: (row: TableRowModel<T>) => void;

  /** The identifying column, if one is marked. Card title and row header. */
  primaryColumnId: string | undefined;
}
