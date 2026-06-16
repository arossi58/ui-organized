import { clsx } from "clsx";
import { Icon } from "../Icon/index.js";
import type { PaginationProps } from "./Pagination.types.js";
import "./Pagination.css";

type PageItem = number | "ellipsis";

function range(start: number, end: number): number[] {
  const out: number[] = [];
  for (let i = start; i <= end; i += 1) out.push(i);
  return out;
}

/**
 * Builds the visible page list with leading/trailing boundary pages and an
 * ellipsis where pages are collapsed. Mirrors the well-known MUI algorithm.
 */
function getPageItems(
  page: number,
  count: number,
  siblingCount: number,
  boundaryCount: number,
): PageItem[] {
  const startPages = range(1, Math.min(boundaryCount, count));
  const endPages = range(Math.max(count - boundaryCount + 1, boundaryCount + 1), count);

  const siblingsStart = Math.max(
    Math.min(page - siblingCount, count - boundaryCount - siblingCount * 2 - 1),
    boundaryCount + 2,
  );
  const siblingsEnd = Math.min(
    Math.max(page + siblingCount, boundaryCount + siblingCount * 2 + 2),
    endPages.length > 0 ? endPages[0]! - 2 : count - 1,
  );

  return [
    ...startPages,
    ...(siblingsStart > boundaryCount + 2
      ? (["ellipsis"] as PageItem[])
      : boundaryCount + 1 < count - boundaryCount
        ? [boundaryCount + 1]
        : []),
    ...range(siblingsStart, siblingsEnd),
    ...(siblingsEnd < count - boundaryCount - 1
      ? (["ellipsis"] as PageItem[])
      : count - boundaryCount > boundaryCount
        ? [count - boundaryCount]
        : []),
    ...endPages,
  ];
}

/** Numbered page navigation with previous/next controls. */
export function Pagination({
  page,
  count,
  onPageChange,
  siblingCount = 1,
  boundaryCount = 1,
  showPrevNext = true,
  className,
  ...props
}: PaginationProps) {
  const items = getPageItems(page, count, siblingCount, boundaryCount);

  return (
    <nav aria-label="Pagination" className={clsx("pagination", className)} {...props}>
      <ul className="pagination__list">
        {showPrevNext && (
          <li>
            <button
              type="button"
              className="pagination__nav"
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              aria-label="Previous page"
            >
              <Icon name="chevron-left" size={18} />
            </button>
          </li>
        )}
        {items.map((item, index) => (
          <li key={`${item}-${index}`}>
            {item === "ellipsis" ? (
              <span className="pagination__ellipsis" aria-hidden="true">
                …
              </span>
            ) : (
              <button
                type="button"
                className="pagination__page"
                onClick={() => onPageChange(item)}
                aria-current={item === page ? "page" : undefined}
                aria-label={`Go to page ${item}`}
              >
                {item}
              </button>
            )}
          </li>
        ))}
        {showPrevNext && (
          <li>
            <button
              type="button"
              className="pagination__nav"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= count}
              aria-label="Next page"
            >
              <Icon name="chevron-right" size={18} />
            </button>
          </li>
        )}
      </ul>
    </nav>
  );
}
