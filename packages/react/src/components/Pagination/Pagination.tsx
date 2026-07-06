import { clsx } from "clsx";
import { Button } from "../Button/index.js";
import { Menu, MenuTrigger, MenuContent, MenuItem } from "../Menu/index.js";
import type { PaginationProps } from "./Pagination.types.js";
import "./Pagination.css";

type Ellipsis = { type: "ellipsis"; pages: number[] };
type PageItem = number | Ellipsis;

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
): (number | "ellipsis")[] {
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
      ? (["ellipsis"] as const)
      : boundaryCount + 1 < count - boundaryCount
        ? [boundaryCount + 1]
        : []),
    ...range(siblingsStart, siblingsEnd),
    ...(siblingsEnd < count - boundaryCount - 1
      ? (["ellipsis"] as const)
      : count - boundaryCount > boundaryCount
        ? [count - boundaryCount]
        : []),
    ...endPages,
  ];
}

/**
 * Replaces each "ellipsis" marker with the concrete list of pages it collapses,
 * derived from the visible page numbers on either side. This lets the ellipsis
 * act as a jump menu into the hidden range.
 */
function withEllipsisPages(items: (number | "ellipsis")[]): PageItem[] {
  return items.map((item, index) => {
    if (item !== "ellipsis") return item;
    const prev = items[index - 1];
    const next = items[index + 1];
    const start = typeof prev === "number" ? prev + 1 : 1;
    const end = typeof next === "number" ? next - 1 : start;
    return { type: "ellipsis", pages: range(start, end) };
  });
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
  const items = withEllipsisPages(getPageItems(page, count, siblingCount, boundaryCount));

  return (
    <nav aria-label="Pagination" className={clsx("pagination", className)} {...props}>
      <ul className="pagination__list">
        {showPrevNext && (
          <li>
            <Button
              intent="ghost"
              icon="chevron-left"
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              aria-label="Previous page"
            />
          </li>
        )}
        {items.map((item, index) => (
          <li key={typeof item === "number" ? item : `ellipsis-${index}`}>
            {typeof item === "number" ? (
              <button
                type="button"
                className="pagination__page text-default-body-medium"
                onClick={() => onPageChange(item)}
                aria-current={item === page ? "page" : undefined}
                aria-label={`Go to page ${item}`}
              >
                {item}
              </button>
            ) : (
              <Menu>
                <MenuTrigger
                  render={
                    <button
                      type="button"
                      className="pagination__ellipsis"
                      aria-label={`Jump to a page between ${item.pages[0]} and ${item.pages[item.pages.length - 1]}`}
                    >
                      <span aria-hidden="true">…</span>
                    </button>
                  }
                />
                <MenuContent className="pagination__ellipsis-menu">
                  {item.pages.map((hiddenPage) => (
                    <MenuItem
                      key={hiddenPage}
                      value={String(hiddenPage)}
                      onSelect={() => onPageChange(hiddenPage)}
                    >
                      {hiddenPage}
                    </MenuItem>
                  ))}
                </MenuContent>
              </Menu>
            )}
          </li>
        ))}
        {showPrevNext && (
          <li>
            <Button
              intent="ghost"
              icon="chevron-right"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= count}
              aria-label="Next page"
            />
          </li>
        )}
      </ul>
    </nav>
  );
}
