import type { ReactNode } from "react";

export interface TableEmptyProps {
  title?: string;
  description?: string;
  /** A call to action — "Add the first row", "Clear filters". */
  action?: ReactNode;
  className?: string;
}

export interface TableLoadingProps {
  /** Skeleton rows to render. Defaults to 8. */
  rows?: number;
  className?: string;
}

export interface TableErrorProps {
  title?: string;
  children?: ReactNode;
  className?: string;
}
