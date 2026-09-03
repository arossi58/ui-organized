/**
 * The public type model. Everything here is framework-free by construction:
 * nothing in this file imports React, and the one place a framework type could
 * legitimately enter — a custom cell or edit renderer — is declared as
 * `unknown`, which each adapter narrows to its own element type.
 */
import type {
  Cell,
  Column,
  ColumnDef,
  Header,
  HeaderGroup,
  Row,
  RowData,
  Table,
  TableFeatures,
} from "@tanstack/table-core";
import type { UioTableFeatures } from "./config.js";
import type { TableFilterCondition, TableFilterSetting } from "./filters/types.js";

// ─── Shared axes ─────────────────────────────────────────────────────────────

/**
 * The repo's shared size axis. Row height and every inner control scale
 * together; the pixel values live in `ROW_HEIGHT` (styles.ts) and are mirrored
 * by `--data-table-row-height` in the stylesheet.
 */
export type TableSize = "sm" | "md" | "lg";

/**
 * Emphasis axis. Per the repo's `variant`-xor-`intent` rule there is no
 * `intent` prop anywhere in the table.
 */
export type TableVariant = "default" | "bordered";

export type TableAlign = "start" | "center" | "end";

// ─── Filters ─────────────────────────────────────────────────────────────────
//
// The model lives in ./filters — a filter is identifier + relative + value, and
// that needed more room than a type alias. Re-exported here so the public
// surface stays one import.

export type {
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
} from "./filters/types.js";

// ─── Inline edit ─────────────────────────────────────────────────────────────

export interface TableEditContext<T> {
  /** The row being edited. */
  row: T;
  rowId: string;
  columnId: string;
  /** The draft value — not the committed one. */
  value: unknown;
  /** Update the draft. Does not commit. */
  setValue: (value: unknown) => void;
  /** Commit the draft through `onEdit`. */
  commit: () => void;
  /** Discard the draft and leave edit mode. */
  cancel: () => void;
  /** Validation message, or null when the draft is valid. */
  invalid: string | null;
  /** Size to pass to whatever control the renderer returns. */
  size: TableSize;
}

export interface TableEditDef<T> {
  /**
   * The editor for this cell. Returns `unknown` on purpose: core cannot name a
   * React element without importing React, so each adapter re-declares this
   * with its own element type. See `react-table`'s `TableColumn`.
   */
  render: (ctx: TableEditContext<T>) => unknown;
  /** Return a message to block the commit, or null to allow it. */
  validate?: (value: unknown, row: T) => string | null;
  /** Convert the raw control value before it reaches `onEdit`. */
  parse?: (raw: unknown) => unknown;
}

// ─── Column meta ─────────────────────────────────────────────────────────────

export interface TableColumnMeta<T = unknown> {
  /** Text alignment for the head cell and every body cell. */
  align?: TableAlign;
  /**
   * The identifying column. Rendered as a `<th scope="row">` row header, pinned
   * left on narrow viewports, and used as the card title in card mode. At most
   * one column should set it; the first one wins.
   */
  primary?: boolean;
  /** Ordering within a card. Lower comes first. Defaults to column order. */
  priority?: number;
  /** Pin the column to an edge of the scroll viewport. */
  sticky?: "left" | "right";
  width?: number;
  minWidth?: number;
  maxWidth?: number;
  /**
   * Makes the column filterable — it appears in the "Add filter" list and the
   * user builds conditions against it. `true` means "filterable, everything
   * inferred", so exposing a column is never a reason to write a config block.
   */
  filter?: TableFilterSetting;
  /** Makes the cell editable in place. */
  edit?: TableEditDef<T>;
  /** Value used by CSV/TSV export in preference to the raw cell value. */
  exportValue?: (row: T) => string | number | null;
  /** Hide from the column visibility menu (e.g. the selection checkbox column). */
  hideFromViewOptions?: boolean;
}

/**
 * Declaration merging so `column.columnDef.meta.align` is typed everywhere,
 * including inside TanStack's own generics. The alternative — casting at every
 * read site — is how `meta` silently drifts out of sync with what reads it.
 */
declare module "@tanstack/table-core" {
  // v9 carries the feature set in the first parameter; the shape must match
  // TanStack's own declaration exactly or the merge is rejected outright.
  /* eslint-disable @typescript-eslint/no-unused-vars */
  interface ColumnMeta<
    TFeatures extends TableFeatures,
    TData extends RowData,
    TValue,
  > extends TableColumnMeta<TData> {}
  /* eslint-enable @typescript-eslint/no-unused-vars */
}

/**
 * The public column type. Wraps TanStack's `ColumnDef` so the third-party type
 * never appears unaliased in our API and can be swapped without a breaking
 * change to consumers.
 */
export type TableColumn<T extends RowData> = ColumnDef<UioTableFeatures, T, any> & {
  meta?: TableColumnMeta<T>;
};

// ─── Server mode ─────────────────────────────────────────────────────────────

export interface TableSortSpec {
  id: string;
  desc: boolean;
}

/**
 * What a server-driven table hands back to its consumer on every state change.
 * `manual` mode means the table stops sorting, filtering and paginating locally
 * and just reports what the user asked for.
 */
export interface DataTableQuery {
  sorting: TableSortSpec[];
  /**
   * One entry per condition, flat — several may share a `columnId` and are
   * ANDed. Flat rather than grouped because a `WHERE` clause is a flat
   * conjunction, and grouping would only make every consumer flatten it again.
   *
   * Every field is a JSON primitive, so this is a legitimate cache key and a
   * legitimate URL parameter. Relative dates (`in-last`) are reported
   * **unresolved**, because the server's clock is the authority; call
   * `resolveRelativeDates` if you would rather pin them client-side.
   */
  filters: TableFilterCondition[];
  search: string;
  pageIndex: number;
  pageSize: number;
}

// ─── Misc ────────────────────────────────────────────────────────────────────

export type TableRowId = string;

/** What `exportRowsToCsv` / `copyRowsToClipboard` operate on. */
export type TableRowScope = "view" | "selected" | "all";

/**
 * The TanStack types, with this design system's feature set already bound.
 *
 * v9 carries the registered features in a type parameter, so a bare `Table<T>`
 * no longer says what a table can do — `getIsPinned` and `getCanHide` exist only
 * when the pinning and visibility features are declared. Binding `TFeatures`
 * once, here, is what keeps every other file in this package (and every adapter)
 * writing `TableInstance<T>` rather than repeating the feature list, and what
 * makes "the four libraries build the same table" a thing the compiler checks.
 *
 * Re-exported so consumers never have to add a TanStack dependency of their own.
 */
export type TableInstance<T extends RowData> = Table<UioTableFeatures, T>;
export type TableRowModel<T extends RowData> = Row<UioTableFeatures, T>;
export type TableColumnInstance<T extends RowData> = Column<UioTableFeatures, T, any>;
export type TableCellInstance<T extends RowData> = Cell<UioTableFeatures, T, any>;
export type TableHeaderInstance<T extends RowData> = Header<UioTableFeatures, T, any>;
export type TableHeaderGroupInstance<T extends RowData> = HeaderGroup<UioTableFeatures, T>;

/** A row as the table sees it, for callbacks that hand one back. */
export type TableRowData<T extends RowData> = Row<UioTableFeatures, T>;
