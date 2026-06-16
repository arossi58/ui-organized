import type * as React from "react";

export interface PaginationProps
  extends Omit<React.ComponentPropsWithRef<"nav">, "onChange"> {
  /** The current page (1-based). */
  page: number;
  /** Total number of pages. */
  count: number;
  /** Called with the next page when a control is activated. */
  onPageChange: (page: number) => void;
  /** Pages shown on each side of the current page. Defaults to 1. */
  siblingCount?: number;
  /** Pages always shown at the start and end. Defaults to 1. */
  boundaryCount?: number;
  /** Render the previous/next arrow controls. Defaults to true. */
  showPrevNext?: boolean;
}
