import type { ComputedRef, Ref, VNode } from "vue";
import type { ButtonProps } from "@ui-organized/vue";
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
  TableMode,
  TableRowModel,
  TableRowScope,
  TableSize,
  TableVariant,
  VirtualConfig,
  RowData,
  UioTableFeatures,
} from "@ui-organized/table-core";
import type { VueTable } from "@tanstack/vue-table";
import type { Virtualizer } from "@tanstack/vue-virtual";

/**
 * Anything Vue will render.
 *
 * The counterpart of React's `ReactNode` in the one place a framework type
 * legitimately enters — a custom cell or edit renderer, which core declares as
 * `unknown` precisely so each adapter can narrow it to its own.
 */
export type VueNode = VNode | VNode[] | string | number | null | undefined;

/** The Vue column type. Identical to core's, with `meta.edit.render` narrowed. */
export type TableColumn<T extends RowData> = CoreTableColumn<T>;

export type TableEditRenderer<T extends RowData> = (ctx: TableEditContext<T>) => VueNode;

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

/**
 * ── Why so much of this API is a `ComputedRef` ──────────────────────────────
 *
 * React's `DataTableApi` is a plain object rebuilt on every render, so its
 * fields are values. A Vue composable runs **once**, so anything derived has to
 * arrive as a ref or it is a snapshot of the first frame that never updates
 * again — the single most likely way to port this file wrongly, and one that
 * fails silently: the table renders correctly and then never changes.
 *
 * So the rule here is uniform and worth stating once: **derived state is a
 * `ComputedRef`, actions are plain functions.** A component reads `api.rows.value`
 * and calls `api.selection.toggle(...)`. Nothing in between is a bare value.
 */
export interface FiltersApi {
  /** Every applied condition, in the order added. What the chips render from. */
  conditions: ComputedRef<TableFilterCondition[]>;
  /** Columns that may be filtered, in menu order. */
  fields: ComputedRef<FilterableField[]>;
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
  expanded: ComputedRef<boolean>;
  setExpanded: (expanded: boolean) => void;
  /**
   * The condition whose editor is open. `add` sets it, so a filter chosen from
   * the header opens for editing without the two components having to know
   * about each other.
   */
  editing: ComputedRef<string | null>;
  setEditing: (id: string | null) => void;
  /** Announced in the live region on add, remove, change and clear. */
  announcement: ComputedRef<string>;
}

export interface BulkAction<T extends RowData> {
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
 */
export interface TableAction {
  id: string;
  label: string;
  icon?: string;
  /** Button hierarchy. Defaults to `tertiary` — chrome, not a call to action. */
  intent?: ButtonProps["intent"];
  /** Drop the visible label and keep only the icon. `label` still names it. */
  iconOnly?: boolean;
  disabled?: boolean;
  onRun: () => void | Promise<void>;
}

export interface RowAction<T extends RowData> {
  id: string;
  label: string;
  icon?: string;
  destructive?: boolean;
  disabled?: (row: T) => boolean;
  onRun: (row: T) => void | Promise<void>;
}

export interface DetailConfig<T extends RowData> {
  render: (row: T) => VueNode;
  /** Sheet title. Defaults to the primary column's value. */
  title?: (row: T) => string;
  description?: (row: T) => string;
  /** Footer actions, rendered after the built-in Close. */
  footer?: (row: T) => VueNode;
}

export interface EmptyStateConfig {
  title?: string;
  description?: string;
  action?: VueNode;
}

/**
 * The options, read reactively.
 *
 * Passed as a plain object — a component's `props` is one, and that is the
 * intended caller. Every field is read inside a `computed`, so a reactive source
 * updates the table and a plain object simply never changes. That is why nothing
 * here is a `Ref`: wrapping is the caller's business, and requiring it would make
 * the common case (`useDataTable(props)`) the awkward one.
 */
export interface UseDataTableOptions<T extends RowData> {
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
  /** The header's sort button. On by default whenever any column is sortable. */
  sortMenu?: boolean;
  /** Offer CSV download and clipboard copy in the toolbar. */
  exportable?: boolean;

  /** Row virtualization. `true` uses the defaults; an object tunes them. */
  virtual?: boolean | VirtualConfig;
  /** Caps the scroll viewport. A table with no cap cannot scroll or virtualize. */
  maxHeight?: number | string;

  loading?: boolean;
  error?: VueNode;
  empty?: EmptyStateConfig;

  /** Server-driven mode. Sorting, filtering and pagination stop happening locally. */
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
  /** The table's own actions, rendered in the header row. */
  actions?: TableAction[];
  detail?: DetailConfig<T>;
  responsive?: ResponsiveConfig;

  defaultSorting?: { id: string; desc: boolean }[];
  defaultColumnVisibility?: Record<string, boolean>;
  /**
   * Conditions the table starts with. Also the only way to render a chip in a
   * static surface — a visual baseline, an axe scan, a jsdom test.
   */
  defaultFilters?: TableFilterInput[];
  /** Extra or replacement operators, including for localizing labels. */
  filterOperators?: FilterOperatorDef[];
}

export interface SelectionApi<T extends RowData> {
  mode: ComputedRef<SelectionMode>;
  state: ComputedRef<SelectionState>;
  /** Rows the user believes are selected, including the all-matching case. */
  count: ComputedRef<number>;
  /** Rows actually loaded and selected. */
  rows: ComputedRef<T[]>;
  isSelected: (rowId: string) => boolean;
  toggle: (rowId: string, checked: boolean, shift?: boolean) => void;
  togglePage: (checked: boolean) => void;
  selectAllMatching: () => void;
  clear: () => void;
  header: ComputedRef<{ checked: boolean; indeterminate: boolean }>;
  /** True when the page is fully selected and more rows match beyond it. */
  canSelectAllMatching: ComputedRef<boolean>;
  totalMatching: ComputedRef<number>;
  asBulk: () => BulkSelection;
}

export interface EditApi<T extends RowData> {
  enabled: ComputedRef<boolean>;
  state: ComputedRef<EditState>;
  isEditing: (rowId: string, columnId: string) => boolean;
  start: (row: TableRowModel<T>, columnId: string) => void;
  setValue: (value: unknown) => void;
  commit: () => void;
  cancel: () => void;
  contextFor: (row: TableRowModel<T>, columnId: string) => TableEditContext<T> | null;
}

export interface DetailApi<T extends RowData> {
  enabled: ComputedRef<boolean>;
  state: ComputedRef<DetailState>;
  row: ComputedRef<T | null>;
  total: ComputedRef<number>;
  open: (rowId: string) => void;
  close: () => void;
  step: (direction: -1 | 1) => void;
  canStep: (direction: -1 | 1) => boolean;
  setDirty: (dirty: boolean) => void;
  /** Answer the "discard unsaved changes?" prompt. */
  resolveConfirm: (discard: boolean) => void;
}

export interface FocusApi {
  cursor: ComputedRef<GridCursor>;
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
  enabled: ComputedRef<boolean>;
  virtualizer: Ref<Virtualizer<HTMLElement, HTMLElement>>;
  spacers: ComputedRef<{ top: number; bottom: number }>;
}

/**
 * The viewport's horizontal overflow, live. `overflowing` is false whenever
 * every column fits — which is what lets a scroll control render itself only
 * when there is something to scroll to.
 */
export interface HorizontalScrollApi {
  state: ComputedRef<HorizontalScrollState>;
  /** Move most of a viewport width: `-1` towards the first column, `1` away. */
  by: (direction: -1 | 1) => void;
}

/** One row as the renderer sees it: the model, plus both of its indices. */
export interface RenderRow<T extends RowData> {
  row: TableRowModel<T>;
  /** The cursor coordinate: where the row sits on the current page. */
  index: number;
  /** What `aria-rowindex` reports: where it sits in the whole dataset. */
  absoluteIndex: number;
}

export interface DataTableApi<T extends RowData> {
  /**
   * The raw TanStack instance. Exposed deliberately as the escape hatch: every
   * feature the wrapper does not cover is reachable through it, which is what
   * stops a missing prop from being a fork.
   *
   * The *Vue* instance, so `table.Subscribe` and the reactive atoms come with
   * it. Not a ref — the instance itself is created once and mutated in place;
   * its reactivity lives in the atoms it holds.
   */
  table: VueTable<UioTableFeatures, T>;
  /** The rows to render — the current page, before virtualization. */
  rows: ComputedRef<TableRowModel<T>[]>;
  /** The rows actually rendered, which under virtualization is a window. */
  renderRows: ComputedRef<RenderRow<T>[]>;
  chrome: ComputedRef<TableChrome>;
  options: UseDataTableOptions<T>;
  size: ComputedRef<TableSize>;
  variant: ComputedRef<TableVariant>;
  label: ComputedRef<string>;
  captionVisible: ComputedRef<boolean>;
  interactive: ComputedRef<boolean>;
  mode: ComputedRef<TableMode>;
  loading: ComputedRef<boolean>;
  /** The urgent search value. Bind an input to this, never to the deferred one. */
  search: Ref<string>;
  setSearch: (value: string) => void;
  selection: SelectionApi<T>;
  filters: FiltersApi;
  edit: EditApi<T>;
  detail: DetailApi<T>;
  focus: FocusApi;
  virtual: VirtualApi;
  scroll: HorizontalScrollApi;
  columnWidths: ComputedRef<Record<string, number>>;
  /**
   * Template refs, bound with `ref=` rather than called.
   *
   * React takes callback refs here because it needs a *re-render* when the node
   * appears — an effect that observes it has to re-run. Vue's `watch` on a ref
   * gives that for free, so these are the ordinary thing: `<div :ref="rootRef">`.
   */
  rootRef: Ref<HTMLElement | null>;
  viewportRef: Ref<HTMLElement | null>;
  exportCsv: (scope?: TableRowScope) => void;
  copySelection: (scope?: TableRowScope) => Promise<boolean>;
  onGridKeyDown: (event: KeyboardEvent) => void;
  activate: (row: TableRowModel<T>) => void;
  primaryColumnId: ComputedRef<string | undefined>;
}
