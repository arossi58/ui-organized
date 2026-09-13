export interface PaginationProps {
  /** The current page (1-based). Use `v-model:page` for two-way binding. */
  page: number;
  /** Total number of pages. */
  count: number;
  /** Pages shown on each side of the current page. Defaults to 1. */
  siblingCount?: number;
  /** Pages always shown at the start and end. Defaults to 1. */
  boundaryCount?: number;
  /** Render the previous/next arrow controls. Defaults to true. */
  showPrevNext?: boolean;
}
