import type { HTMLAttributes } from "svelte/elements";

export interface PaginationProps extends Omit<HTMLAttributes<HTMLElement>, "class" | "children"> {
  /** The current page (1-based). Bindable: `bind:page`. */
  page: number;
  /** Total number of pages. */
  count: number;
  /**
   * Called with the next page when a control is activated.
   *
   * Optional here where React requires it, because `bind:page` is the other half
   * of the same job and a consumer who binds needs no callback. Kept alongside so
   * the API still matches the React package — the same split `Collapsible` makes
   * between `bind:open` and `onOpenChange`.
   */
  onPageChange?: (page: number) => void;
  /** Pages shown on each side of the current page. Defaults to 1. */
  siblingCount?: number;
  /** Pages always shown at the start and end. Defaults to 1. */
  boundaryCount?: number;
  /** Render the previous/next arrow controls. Defaults to true. */
  showPrevNext?: boolean;
  class?: string;
}
