import { clsx } from "clsx";
import { Skeleton } from "@ui-organized/react";
import { useTableContext } from "../../core/TableContext.js";
import type { TableEmptyProps, TableErrorProps, TableLoadingProps } from "./TableStates.types.js";

/**
 * Empty, loading and error all live *inside* `<tbody>` rather than replacing the
 * table.
 *
 * Keeping the header on screen keeps the column widths, the scroll position and
 * the filter controls exactly where they were — so clearing a filter that
 * emptied the table does not also move every control the user was about to
 * click.
 */

export function TableEmpty({ title, description, action, className }: TableEmptyProps) {
  const { chrome, options } = useTableContext();
  const empty = options.empty;

  return (
    <tr className="data-table__row">
      <td className={clsx("data-table__state-cell", className)} colSpan={chrome.colCount}>
        <div className="data-table__state">
          <span className="data-table__state-title">
            {title ?? empty?.title ?? "Nothing to show"}
          </span>
          {(description ?? empty?.description) && (
            <span className="data-table__state-description">
              {description ?? empty?.description}
            </span>
          )}
          {(action ?? empty?.action) && (
            <div className="data-table__state-actions">{action ?? empty?.action}</div>
          )}
        </div>
      </td>
    </tr>
  );
}

/**
 * Skeleton rows sized to the real row height, so the table does not resize when
 * the data lands — which is the entire reason to prefer a skeleton to a spinner.
 * (There is no Spinner in the library, which settles it anyway.)
 */
export function TableLoading({ rows = 8, className }: TableLoadingProps) {
  const { table, size } = useTableContext();
  const columns = table.getVisibleLeafColumns();

  return (
    <>
      {Array.from({ length: rows }, (_, rowIndex) => (
        <tr key={rowIndex} className="data-table__row" aria-hidden="true">
          {columns.map((column) => (
            <td key={column.id} className={clsx("data-table__skeleton-cell", className)}>
              <Skeleton
                variant="text"
                // Varied but deterministic: identical bars read as a progress
                // bar, and a random width changes on every render.
                width={`${55 + ((column.id.length * 7) % 35)}%`}
                height={size === "sm" ? 10 : 12}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

export function TableError({
  title = "Could not load this table",
  children,
  className,
}: TableErrorProps) {
  const { chrome } = useTableContext();
  return (
    <tr className="data-table__row">
      <td className={clsx("data-table__state-cell", className)} colSpan={chrome.colCount}>
        {/* `alert` rather than a plain region: the error arrives after the user
            has moved on, so it has to announce itself. */}
        <div className="data-table__state data-table__state--error" role="alert">
          <span className="data-table__state-title">{title}</span>
          {children && <span className="data-table__state-description">{children}</span>}
        </div>
      </td>
    </tr>
  );
}
