import { clsx } from "clsx";
import { Pagination, Select } from "@ui-organized/react";
import { PAGE_SIZE_OPTIONS } from "@ui-organized/table-core";
import { useTableContext } from "../../core/TableContext.js";
import type { TablePaginationProps } from "./TablePagination.types.js";

/**
 * Wraps the library's `Pagination`, which takes a page *count* — the conversion
 * from row count and page size happens here so consumers never do that
 * arithmetic themselves and get the off-by-one wrong.
 */
export function TablePagination({
  showPageSize = true,
  pageSizes = PAGE_SIZE_OPTIONS,
  className,
}: TablePaginationProps) {
  const { table, size, selection } = useTableContext();
  const { pageIndex, pageSize } = table.getState().pagination;
  const total = selection.totalMatching;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));

  const first = total === 0 ? 0 : pageIndex * pageSize + 1;
  const last = Math.min(total, (pageIndex + 1) * pageSize);

  return (
    <div className={clsx("data-table__pagination", className)}>
      {/* Announced on change, because the rows it describes change underneath a
          screen reader user with no other signal that anything happened. */}
      <span className="data-table__pagination-status" aria-live="polite">
        {total === 0 ? "No rows" : `${first}–${last} of ${total}`}
      </span>

      <Pagination
        page={pageIndex + 1}
        count={pageCount}
        onPageChange={(page) => table.setPageIndex(page - 1)}
      />

      {showPageSize && (
        <div className="data-table__page-size">
          <Select
            size={size}
            variant="ghost"
            label="Rows per page"
            value={String(pageSize)}
            options={pageSizes.map((entry) => ({ value: String(entry), label: String(entry) }))}
            onValueChange={(next) => table.setPageSize(Number(next))}
          />
        </div>
      )}
    </div>
  );
}
