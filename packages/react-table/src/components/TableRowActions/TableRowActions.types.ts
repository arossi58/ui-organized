import type { RowAction } from "../../core/types.js";
import type { RowData } from "@ui-organized/table-core";

export interface TableRowActionsProps<T extends RowData> {
  /** The row the actions operate on. */
  row: T;
  /**
   * Overrides the table's own `rowActions`. Only needed when the part is used
   * outside a `<DataTable>`.
   */
  actions?: RowAction<T>[];
  /** Accessible name for the trigger. Defaults to "Row actions". */
  label?: string;
  className?: string;
}
