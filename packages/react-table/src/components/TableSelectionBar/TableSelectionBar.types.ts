import type { BulkAction } from "../../core/types.js";
import type { RowData } from "@ui-organized/table-core";

export interface TableSelectionBarProps<T extends RowData> {
  /** Overrides the table's own `bulkActions`. */
  actions?: BulkAction<T>[];
  className?: string;
}
