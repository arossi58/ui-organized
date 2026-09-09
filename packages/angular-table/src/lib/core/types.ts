import type { Signal, TemplateRef, WritableSignal } from "@angular/core";
import type { ButtonIntent } from "@ui-organized/angular";
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
import type { AngularTable, TableState } from "@tanstack/angular-table";
import type { AngularVirtualizer } from "@tanstack/angular-virtual";

/**
 * Anything Angular will render from a renderer function.
 *
 * The counterpart of React's `ReactNode` in the one place a framework type
 * legitimately enters — a custom cell or edit renderer, which core declares as
 * `unknown` precisely so each adapter can narrow it to its own. A `TemplateRef`
 * is Angular's "a piece of markup you can hand around"; a string is the common
 * case and costs the caller nothing.
 */
export type AngularNode = TemplateRef<unknown> | string | number | null | undefined;

/** The Angular column type. Identical to core's, with `meta.edit.render` narrowed. */
export type TableColumn<T extends RowData> = CoreTableColumn<T>;

export type TableEditRenderer<T extends RowData> = (ctx: TableEditContext<T>) => AngularNode;

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
 * ── How this API is reactive ────────────────────────────────────────────────
 *
 * React's `DataTableApi` is a plain object rebuilt on every render, so its
 * fields are values. Angular's factory runs **once**, so anything derived has to
 * arrive as a `Signal` or it is a snapshot of the first frame that never updates
 * again — the single most likely way to port this file wrongly, and one that
 * fails silently: the table renders correctly and then never changes.
 *
 * So the rule is uniform and worth stating once: **derived state is a `Signal`,
 * actions are plain functions.** A template reads `api.rows()` and calls
 * `api.selection.toggle(...)`. Nothing in between is a bare value.
 */
export interface FiltersApi {
  /** Every applied condition, in the order added. What the chips render from. */
  conditions: Signal<TableFilterCondition[]>;
  /** Columns that may be filtered, in menu order. */
  fields: Signal<FilterableField[]>;
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
  expanded: Signal<boolean>;
  setExpanded: (expanded: boolean) => void;
  /**
   * The condition whose editor is open. `add` sets it, so a filter chosen from
   * the header opens for editing without the two components having to know
   * about each other.
   */
  editing: Signal<string | null>;
  setEditing: (id: string | null) => void;
  /** Announced in the live region on add, remove, change and clear. */
  announcement: Signal<string>;
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
  intent?: ButtonIntent;
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
  render: (row: T) => AngularNode;
  /** Sheet title. Defaults to the primary column's value. */
  title?: (row: T) => string;
  description?: (row: T) => string;
  /** Footer actions, rendered after the built-in Close. */
  footer?: (row: T) => AngularNode;
}

export interface EmptyStateConfig {
  title?: string;
  description?: string;
  action?: AngularNode;
}

/**
 * The options, read reactively.
 *
 * Handed to `createDataTable` as a **getter** — `createDataTable(() => ({ ... }))`
 * — so every field is read inside a `computed` and a signal-backed source keeps
 * the table in step. A component built on this passes its own `input()` signals
 * through the getter, which is what `<uio-data-table>` does.
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
  error?: AngularNode;
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
  mode: Signal<SelectionMode>;
  state: Signal<SelectionState>;
  /** Rows the user believes are selected, including the all-matching case. */
  count: Signal<number>;
  /** Rows actually loaded and selected. */
  rows: Signal<T[]>;
  isSelected: (rowId: string) => boolean;
  toggle: (rowId: string, checked: boolean, shift?: boolean) => void;
  togglePage: (checked: boolean) => void;
  selectAllMatching: () => void;
  clear: () => void;
  header: Signal<{ checked: boolean; indeterminate: boolean }>;
  /** True when the page is fully selected and more rows match beyond it. */
  canSelectAllMatching: Signal<boolean>;
  totalMatching: Signal<number>;
  asBulk: () => BulkSelection;
}

export interface EditApi<T extends RowData> {
  enabled: Signal<boolean>;
  state: Signal<EditState>;
  isEditing: (rowId: string, columnId: string) => boolean;
  start: (row: TableRowModel<T>, columnId: string) => void;
  setValue: (value: unknown) => void;
  commit: () => void;
  cancel: () => void;
  contextFor: (row: TableRowModel<T>, columnId: string) => TableEditContext<T> | null;
}

export interface DetailApi<T extends RowData> {
  enabled: Signal<boolean>;
  state: Signal<DetailState>;
  row: Signal<T | null>;
  total: Signal<number>;
  open: (rowId: string) => void;
  close: () => void;
  step: (direction: -1 | 1) => void;
  canStep: (direction: -1 | 1) => boolean;
  setDirty: (dirty: boolean) => void;
  /** Answer the "discard unsaved changes?" prompt. */
  resolveConfirm: (discard: boolean) => void;
}

export interface FocusApi {
  cursor: Signal<GridCursor>;
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
  enabled: Signal<boolean>;
  /**
   * The adapter's own proxy, not a signal wrapping one: it is callable — the
   * raw virtualizer is `virtualizer()` — and its `getVirtualItems` and
   * `getTotalSize` are already signals. Wrapping it again would add a `()` that
   * bought nothing.
   */
  virtualizer: AngularVirtualizer<HTMLElement, HTMLElement>;
  spacers: Signal<{ top: number; bottom: number }>;
}

/**
 * The viewport's horizontal overflow, live. `overflowing` is false whenever
 * every column fits — which is what lets a scroll control render itself only
 * when there is something to scroll to.
 */
export interface HorizontalScrollApi {
  state: Signal<HorizontalScrollState>;
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
   * The *Angular* instance, so its signal-backed atoms come with it. Not a
   * signal — the instance is created once and mutated in place; its reactivity
   * lives in the atoms it holds.
   */
  table: AngularTable<UioTableFeatures, T>;
  /**
   * The controlled state — sorting, pagination, visibility, selection.
   *
   * React's adapter hangs a `state` getter off the table instance; Angular's
   * exposes signal-backed `atoms` instead. It is handed back here rather than
   * reached for on the engine because the table is controlled: these values are
   * the source of truth and the engine is downstream of them.
   */
  state: Signal<Partial<TableState<UioTableFeatures>>>;
  /** The rows to render — the current page, before virtualization. */
  rows: Signal<TableRowModel<T>[]>;
  /** The rows actually rendered, which under virtualization is a window. */
  renderRows: Signal<RenderRow<T>[]>;
  chrome: Signal<TableChrome>;
  options: UseDataTableOptions<T>;
  size: Signal<TableSize>;
  variant: Signal<TableVariant>;
  label: Signal<string>;
  captionVisible: Signal<boolean>;
  interactive: Signal<boolean>;
  mode: Signal<TableMode>;
  loading: Signal<boolean>;
  /** The urgent search value. Bind an input to this, never to the deferred one. */
  search: Signal<string>;
  setSearch: (value: string) => void;
  selection: SelectionApi<T>;
  filters: FiltersApi;
  edit: EditApi<T>;
  detail: DetailApi<T>;
  focus: FocusApi;
  virtual: VirtualApi;
  scroll: HorizontalScrollApi;
  columnWidths: Signal<Record<string, number>>;
  /**
   * The root and viewport nodes, as writable signals a directive fills in.
   *
   * Angular has no per-element ref callback and `viewChild` cannot reach into a
   * *projected* node, which the viewport is — so `UioTableElementRef` writes
   * into these. A signal rather than a plain field because the resize and
   * scroll observers below are `effect`s that have to re-run when the node
   * arrives.
   */
  rootRef: WritableSignal<HTMLElement | null>;
  viewportRef: WritableSignal<HTMLElement | null>;
  exportCsv: (scope?: TableRowScope) => void;
  copySelection: (scope?: TableRowScope) => Promise<boolean>;
  onGridKeyDown: (event: KeyboardEvent) => void;
  activate: (row: TableRowModel<T>) => void;
  primaryColumnId: Signal<string | undefined>;
}
