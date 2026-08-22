import { clsx } from "clsx";
import { getPageItems, withEllipsisPages, type PageItem } from "@ui-organized/core";
import { Button } from "../Button/index.js";
import { Menu, MenuTrigger, MenuContent, MenuItem } from "../Menu/index.js";
import type { PaginationProps } from "./Pagination.types.js";
import "@ui-organized/core/components/Pagination/Pagination.css";

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
