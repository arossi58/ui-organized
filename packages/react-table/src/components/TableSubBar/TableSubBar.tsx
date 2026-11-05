import { clsx } from "clsx";
import { useTableContext } from "../../core/TableContext.js";
import { TableFilters } from "../TableFilters/index.js";
import type { TableSubBarProps } from "./TableSubBar.types.js";

/**
 * The row under the toolbar: what is filtered.
 *
 * The selection's bulk actions used to share this line. They now replace the
 * toolbar's own controls while anything is selected (see `TableToolbar`), so
 * acting on the selection happens in the row the user was already reading.
 *
 * It renders nothing at all until there is a filter to show, so an empty row
 * never takes a slice of the table's `gap` — and nothing in card mode, where
 * the filter sheet holds them.
 */
export function TableSubBar({ className }: TableSubBarProps) {
  const { filters, options, mode } = useTableContext();
  const hasFilters = options.filterable !== false && filters.conditions.length > 0;

  // In card mode every filter lives in the filter sheet, and the toolbar's
  // Filter button counts them; a chips row would repeat it above a list that is
  // already short of room.
  if (!hasFilters || mode === "cards") return null;

  return (
    <div className={clsx("data-table__subbar", className)}>
      <TableFilters />
    </div>
  );
}
