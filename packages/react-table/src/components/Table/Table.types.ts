import type { ReactNode } from "react";
import type {
  GridCursor,
  TableEditContext,
  TableInstance,
  TableRowModel,
} from "@ui-organized/table-core";
import type { Cell, Header } from "@tanstack/react-table";

export interface TableProps {
  children?: ReactNode;
  className?: string;
}

export interface TableViewportProps {
  children?: ReactNode;
  className?: string;
  /** Caps the scroll height. Without a cap nothing scrolls and nothing virtualizes. */
  maxHeight?: number | string;
}

export interface TableHeaderProps {
  className?: string;
}

export interface TableHeadCellProps<T> {
  header: Header<T, unknown>;
  /** Index among visible columns — the `aria-colindex` and the cursor column. */
  index: number;
}

export interface TableBodyProps {
  children?: ReactNode;
}

export interface TableFooterProps {
  children?: ReactNode;
  className?: string;
}

/**
 * Everything the row needs, passed rather than read from context.
 *
 * That is what makes `React.memo` on this component worth anything: a row that
 * reads context re-renders whenever any table state changes, which is exactly
 * the case memoizing was supposed to avoid.
 */
export interface TableRowProps<T> {
  row: TableRowModel<T>;
  /** Index within the current page — the cursor's row coordinate. */
  index: number;
  /** Index within the whole dataset — what `aria-rowindex` reports. */
  absoluteIndex: number;
  selected: boolean;
  /** Row selection is enabled at all — gates `aria-selected`. */
  selectable: boolean;
  editing: boolean;
  /** Cursor column when the cursor is on this row, else null. */
  focusedCol: number | null;
  /** Non-null only for the row that has a cell open for editing. */
  editContext: TableEditContext<T> | null;
  interactive: boolean;
  clickable: boolean;
  primaryColumnId: string | undefined;
  table: TableInstance<T>;
  onFocusCell: (cursor: GridCursor) => void;
  /** Row activation — opens the detail sheet, or calls `onRowClick`. */
  onActivate?: (row: TableRowModel<T>) => void;
  onStartEdit?: (row: TableRowModel<T>, columnId: string) => void;
  /** The virtualizer's measurement hook. */
  measureElement?: (element: HTMLElement | null) => void;
}

export interface TableCellProps<T> {
  cell: Cell<T, unknown>;
  row: TableRowModel<T>;
  /** Index among visible columns. */
  index: number;
  /** The row's index within the current page — half of the cursor coordinate. */
  rowIndex: number;
  /** This is the identifying column, so the cell is a `<th scope="row">`. */
  primary: boolean;
  focused: boolean;
  interactive: boolean;
  /** The row's open editor, if it has one. Only one cell per row can be open. */
  editContext: TableEditContext<T> | null;
  table: TableInstance<T>;
  onFocusCell: (cursor: GridCursor) => void;
  onStartEdit?: (row: TableRowModel<T>, columnId: string) => void;
}
