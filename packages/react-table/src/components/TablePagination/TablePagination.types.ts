export interface TablePaginationProps {
  /** Offer a page-size control. Defaults to true. */
  showPageSize?: boolean;
  /** Page sizes to offer. Defaults to `PAGE_SIZE_OPTIONS` from core. */
  pageSizes?: number[];
  className?: string;
}
