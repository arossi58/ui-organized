/**
 * The column model: reading our `meta` off a column, and translating the parts
 * of it that TanStack owns (sizing) into the shape TanStack expects.
 */
import type { Column, ColumnDef, Table } from "@tanstack/table-core";
import type { StickyPosition } from "./props.js";
import { DEFAULT_COLUMN_WIDTH, MAX_COLUMN_WIDTH, MIN_COLUMN_WIDTH } from "./styles.js";
import type { TableAlign, TableColumn, TableColumnMeta } from "./types.js";

/** The selection checkbox column. Reserved — do not use as a data column id. */
export const SELECTION_COLUMN_ID = "__select";
/** The trailing row-actions column. Reserved. */
export const ACTIONS_COLUMN_ID = "__actions";

const RESERVED = new Set<string>([SELECTION_COLUMN_ID, ACTIONS_COLUMN_ID]);

export function isReservedColumn(id: string): boolean {
  return RESERVED.has(id);
}

/**
 * The id TanStack will assign, without needing a built table to ask.
 *
 * This has to match `createColumn`'s derivation exactly, and the surprising
 * part is the dot: `accessorKey: "owner.team"` reaches nested data, but the
 * column's *id* is `owner_team`. Getting that wrong is silent and total — the
 * column is simply never found, so `meta.primary` stops marking a row header
 * and `meta.filter` produces a filter that matches nothing and offers no
 * values.
 */
export function columnId<T>(def: TableColumn<T>): string {
  const candidate = def as { id?: string; accessorKey?: string | number; header?: unknown };
  if (candidate.id !== undefined) return String(candidate.id);
  if (candidate.accessorKey !== undefined) {
    return String(candidate.accessorKey).replaceAll(".", "_");
  }
  // TanStack's last resort, and the reason a header-only column still works.
  return typeof candidate.header === "string" ? candidate.header : "";
}

export function metaOf<T>(def: ColumnDef<T, any> | undefined): TableColumnMeta<T> | undefined {
  return def?.meta as TableColumnMeta<T> | undefined;
}

export function alignOf<T>(def: ColumnDef<T, any> | undefined): TableAlign {
  return metaOf(def)?.align ?? "start";
}

/**
 * The identifying column — row header, pinned on mobile, card title.
 *
 * The first one wins if several are marked, rather than throwing: a table that
 * renders with a slightly wrong row header is a better failure than a table that
 * does not render.
 */
export function primaryColumnId<T>(columns: readonly TableColumn<T>[]): string | undefined {
  for (const def of columns) if (metaOf(def)?.primary) return columnId(def);
  return undefined;
}

/**
 * Card-mode field order: `meta.priority` ascending, column order as the
 * tiebreak, primary column excluded (it is the card title).
 */
export function cardFieldOrder<T>(columns: readonly TableColumn<T>[]): string[] {
  const primary = primaryColumnId(columns);
  return columns
    .map((def, index) => ({ id: columnId(def), index, priority: metaOf(def)?.priority }))
    .filter((entry) => entry.id !== primary && !isReservedColumn(entry.id))
    .sort((a, b) => {
      const pa = a.priority ?? Number.MAX_SAFE_INTEGER;
      const pb = b.priority ?? Number.MAX_SAFE_INTEGER;
      return pa - pb || a.index - b.index;
    })
    .map((entry) => entry.id);
}

/**
 * Copies `meta.width` / `minWidth` / `maxWidth` onto TanStack's `size` /
 * `minSize` / `maxSize`.
 *
 * Both spellings exist because sizing is TanStack state (it has to be, for
 * resize to work) while everything else about a column is ours. Consumers write
 * one vocabulary; this is where it meets the other.
 */
export function normalizeColumns<T>(columns: readonly TableColumn<T>[]): TableColumn<T>[] {
  return columns.map((def) => {
    const meta = metaOf(def);
    if (!meta) return def;
    const sized = def as TableColumn<T> & { size?: number; minSize?: number; maxSize?: number };
    return {
      ...def,
      size: sized.size ?? meta.width ?? DEFAULT_COLUMN_WIDTH,
      minSize: sized.minSize ?? meta.minWidth ?? MIN_COLUMN_WIDTH,
      maxSize: sized.maxSize ?? meta.maxWidth ?? MAX_COLUMN_WIDTH,
    };
  });
}

/** Columns the visibility menu should offer. */
export function toggleableColumns<T>(columns: readonly Column<T, unknown>[]): Column<T, unknown>[] {
  return columns.filter(
    (column) =>
      column.getCanHide() &&
      !isReservedColumn(column.id) &&
      !metaOf(column.columnDef)?.hideFromViewOptions,
  );
}

/**
 * Where a pinned column sits, and whether it is the one that draws the edge
 * shadow.
 *
 * TanStack reports `getStart("left")` / `getAfter("right")` against the pinned
 * group, which is exactly the sticky offset — no accumulation of our own. The
 * edge is the innermost pinned column: the last on the left, the first on the
 * right.
 */
export function stickyPositionOf<T>(
  table: Table<T>,
  column: Column<T, unknown>,
): StickyPosition | undefined {
  const side = column.getIsPinned();
  if (side !== "left" && side !== "right") return undefined;
  const group = side === "left" ? table.getLeftLeafColumns() : table.getRightLeafColumns();
  const index = group.findIndex((pinned) => pinned.id === column.id);
  return {
    side,
    offset: side === "left" ? column.getStart("left") : column.getAfter("right"),
    last: side === "left" ? index === group.length - 1 : index === 0,
  };
}
