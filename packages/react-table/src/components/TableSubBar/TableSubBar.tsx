import { clsx } from "clsx";
import { useTableContext } from "../../core/TableContext.js";
import { TableFilters } from "../TableFilters/index.js";
import { TableSelectionBar } from "../TableSelectionBar/index.js";
import type { TableSubBarProps } from "./TableSubBar.types.js";

/**
 * The row under the toolbar: what is filtered, and what is selected.
 *
 * Both halves are summaries of applied state, so they share a line rather than
 * stacking. The earlier arrangement put the bulk actions on a third row, which
 * meant ticking a checkbox pushed the chips up and left the actions two rows
 * away from the sort and filter buttons they belong beside.
 *
 * It renders nothing at all until one of the halves has something to say — the
 * same rule each half already applies to itself, restated here so an empty row
 * never takes a slice of the table's `gap`.
 */
export function TableSubBar({ className }: TableSubBarProps) {
  const { filters, options, selection } = useTableContext();
  const hasFilters = options.filterable !== false && filters.conditions.length > 0;

  if (!hasFilters && selection.count === 0) return null;

  return (
    <div className={clsx("data-table__subbar", className)}>
      <TableFilters />
      <TableSelectionBar />
    </div>
  );
}
