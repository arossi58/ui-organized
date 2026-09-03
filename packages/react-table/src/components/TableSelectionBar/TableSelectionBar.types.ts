import type { BulkAction } from "../../core/types.js";

export interface TableSelectionBarProps<T> {
  /** Overrides the table's own `bulkActions`. */
  actions?: BulkAction<T>[];
  className?: string;
}
