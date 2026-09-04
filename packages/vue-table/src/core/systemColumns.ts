import { h } from "vue";
import { ACTIONS_COLUMN_ID, SELECTION_COLUMN_ID, type RowData } from "@ui-organized/table-core";
import { TableRowActions } from "../components/TableRowActions/index.js";
import SelectAllCell from "./SelectAllCell.vue";
import SelectCell from "./SelectCell.vue";
import type { TableColumn } from "./types.js";

/**
 * The two columns the table adds for itself.
 *
 * They are built here rather than in the composable because their cells render
 * real components — `Checkbox`, `Menu` — and each cell reads the table from
 * `inject`, which works because cells render inside the provider.
 *
 * `h()` rather than SFC templates for the column definitions themselves: a
 * column's `cell` is a function returning a vnode, which is what TanStack calls
 * it for. The components it returns are SFCs, so the markup still lives in a
 * template.
 */
export function selectionColumn<T extends RowData>(): TableColumn<T> {
  return {
    id: SELECTION_COLUMN_ID,
    header: () => h(SelectAllCell),
    cell: ({ row, table }: any) => {
      // The identifying column's value is the only thing that makes one row's
      // checkbox distinguishable from another's in a screen reader's forms list.
      const primary = table
        .getAllLeafColumns()
        .find((column: any) => column.columnDef.meta?.primary)?.id;
      const name = primary ? String(row.getValue(primary) ?? row.id) : row.id;
      return h(SelectCell, { rowId: row.id, rowLabel: `Select ${name}` });
    },
    size: 48,
    minSize: 48,
    maxSize: 48,
    enableSorting: false,
    enableResizing: false,
    enableHiding: false,
    meta: { align: "center", hideFromViewOptions: true },
  } as TableColumn<T>;
}

export function actionsColumn<T extends RowData>(): TableColumn<T> {
  return {
    id: ACTIONS_COLUMN_ID,
    header: () => h("span", { class: "data-table__sr-only" }, "Actions"),
    cell: ({ row }: any) => h(TableRowActions, { row: row.original as T }),
    size: 56,
    minSize: 56,
    maxSize: 56,
    enableSorting: false,
    enableResizing: false,
    enableHiding: false,
    meta: { align: "end", sticky: "right", hideFromViewOptions: true },
  } as TableColumn<T>;
}
