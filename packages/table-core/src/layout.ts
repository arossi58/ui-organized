/**
 * How the columns actually get their pixels.
 *
 * `table-layout: fixed` plus an explicit `<colgroup>` is what stops columns
 * jittering as virtualized rows swap in and out — but it also means the table is
 * exactly as wide as its columns say, and a table narrower than its container
 * leaves a bare strip where the header band simply stops.
 *
 * The obvious fix — `width: 100%` and let the fixed-layout algorithm distribute
 * the surplus — is wrong here: it stretches every column proportionally, so a
 * column's rendered width stops matching `column.getSize()`, and every pinned
 * column's sticky offset (which comes from `getStart()`, i.e. from those sizes)
 * lands in the wrong place.
 *
 * So the surplus goes to exactly one column instead: the last unpinned one.
 * Every other column keeps the width it was given, nothing to the left of the
 * stretched column moves, and the right-pinned group's offsets are sums over
 * right-pinned columns only — so they are untouched too.
 */

export interface ColumnLayoutInput {
  id: string;
  /** The column's own width, from `column.getSize()`. */
  size: number;
  pinned: false | "left" | "right";
}

export interface ColumnLayout {
  /** Rendered width per column id — what the `<col>` elements get. */
  widths: Record<string, number>;
  /** The table's width: the columns' total, or the container if that is wider. */
  totalWidth: number;
  /** The column the surplus went to, if any. */
  stretchedColumnId: string | null;
}

export function layoutColumns(
  columns: readonly ColumnLayoutInput[],
  containerWidth: number | null,
): ColumnLayout {
  const widths: Record<string, number> = {};
  let total = 0;
  for (const column of columns) {
    widths[column.id] = column.size;
    total += column.size;
  }

  const surplus = containerWidth === null ? 0 : containerWidth - total;
  if (surplus <= 0) return { widths, totalWidth: total, stretchedColumnId: null };

  // Last unpinned column. A pinned one would move its own sticky offset, and the
  // *first* unpinned one would push everything after it out of step with the
  // sizes the offsets were computed from.
  let target: ColumnLayoutInput | undefined;
  for (const column of columns) if (!column.pinned) target = column;
  if (!target) return { widths, totalWidth: total, stretchedColumnId: null };

  widths[target.id] = (widths[target.id] ?? 0) + surplus;
  return { widths, totalWidth: total + surplus, stretchedColumnId: target.id };
}
