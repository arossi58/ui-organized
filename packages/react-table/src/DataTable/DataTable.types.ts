import type { UseDataTableOptions } from "../core/types.js";
import type { RowData } from "@ui-organized/table-core";

export interface DataTableProps<T extends RowData> extends UseDataTableOptions<T> {
  className?: string;
}
