import { flexRenderComponent } from "@tanstack/angular-table";
import { ACTIONS_COLUMN_ID, SELECTION_COLUMN_ID, type RowData } from "@ui-organized/table-core";
import { UioTableRowActions } from "../components/table-row-actions.js";
import { UioTableSelectAllCell, UioTableSelectCell } from "./select-cells.js";
import { UioTableActionsHeader } from "./actions-header.js";
import type { TableColumn } from "./types.js";

/**
 * The two columns the table adds for itself.
 *
 * They are built here rather than in the factory because their cells render real
 * components — `Checkbox`, `Menu` — and each reads the table from the injector,
 * which works because cells render inside the provider.
 *
 * `flexRenderComponent` rather than a bare component: the Angular adapter's
 * `FlexRender` identifies a component by the wrapper this returns, which is how
 * it tells "a component to mount" from "a string to print". The plan expected
 * this to need hand-rolled `TemplateRef` plumbing; v9's adapter ships it.
 */
export function selectionColumn<T extends RowData>(): TableColumn<T> {
  return {
    id: SELECTION_COLUMN_ID,
    header: () => flexRenderComponent(UioTableSelectAllCell),
    cell: ({ row, table }: any) => {
      // The identifying column's value is the only thing that makes one row's
      // checkbox distinguishable from another's in a screen reader's forms list.
      const primary = table
        .getAllLeafColumns()
        .find((column: any) => column.columnDef.meta?.primary)?.id;
      const name = primary ? String(row.getValue(primary) ?? row.id) : row.id;
      return flexRenderComponent(UioTableSelectCell, {
        inputs: { rowId: row.id, rowLabel: `Select ${name}` },
      });
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
    header: () => flexRenderComponent(UioTableActionsHeader),
    cell: ({ row }: any) =>
      flexRenderComponent(UioTableRowActions, { inputs: { row: row.original as T } }),
    size: 56,
    minSize: 56,
    maxSize: 56,
    enableSorting: false,
    enableResizing: false,
    enableHiding: false,
    meta: { align: "end", sticky: "right", hideFromViewOptions: true },
  } as TableColumn<T>;
}
