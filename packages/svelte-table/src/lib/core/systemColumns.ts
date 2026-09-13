import { renderComponent } from "@tanstack/svelte-table";
import { ACTIONS_COLUMN_ID, SELECTION_COLUMN_ID, type RowData } from "@ui-organized/table-core";
import TableRowActions from "../components/TableRowActions/TableRowActions.svelte";
import SelectAllCell from "./SelectAllCell.svelte";
import SelectCell from "./SelectCell.svelte";
import ActionsHeader from "./ActionsHeader.svelte";
import type { TableColumn } from "./types.js";

/**
 * The two columns the table adds for itself.
 *
 * They are built here rather than in the composable because their cells render
 * real components — `Checkbox`, `Menu` — and each reads the table from context,
 * which works because cells render inside the provider.
 *
 * `renderComponent` rather than a bare component: the Svelte adapter's
 * `FlexRender` identifies a component by the wrapper class this returns, which
 * is how it tells "a component to mount" from "a string to print".
 */
export function selectionColumn<T extends RowData>(): TableColumn<T> {
  return {
    id: SELECTION_COLUMN_ID,
    header: () => renderComponent(SelectAllCell, {}),
    cell: ({ row, table }: any) => {
      // The identifying column's value is the only thing that makes one row's
      // checkbox distinguishable from another's in a screen reader's forms list.
      const primary = table
        .getAllLeafColumns()
        .find((column: any) => column.columnDef.meta?.primary)?.id;
      const name = primary ? String(row.getValue(primary) ?? row.id) : row.id;
      return renderComponent(SelectCell, { rowId: row.id, rowLabel: `Select ${name}` });
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
    header: () => renderComponent(ActionsHeader, {}),
    cell: ({ row }: any) => renderComponent(TableRowActions, { row: row.original as T }),
    size: 56,
    minSize: 56,
    maxSize: 56,
    enableSorting: false,
    enableResizing: false,
    enableHiding: false,
    meta: { align: "end", sticky: "right", hideFromViewOptions: true },
  } as TableColumn<T>;
}
