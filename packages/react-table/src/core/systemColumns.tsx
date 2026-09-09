import { useRef } from "react";
import { Checkbox } from "@ui-organized/react";
import { ACTIONS_COLUMN_ID, SELECTION_COLUMN_ID, type RowData } from "@ui-organized/table-core";
import { TableRowActions } from "../components/TableRowActions/index.js";
import { useTableContext } from "./TableContext.js";
import type { TableColumn } from "./types.js";

/**
 * The two columns the table adds for itself.
 *
 * They are built here rather than in the hook because their cells render real
 * components — `Checkbox`, `Menu` — and the hook has to stay a hook. Each cell
 * reads the table from context, which is available because cells render inside
 * the provider.
 */

function SelectAllCell() {
  const { selection, label } = useTableContext();
  return (
    <span className="data-table__select-hit">
      <Checkbox
        checked={selection.header.checked}
        indeterminate={selection.header.indeterminate}
        onCheckedChange={(checked) => selection.togglePage(checked)}
        // "shown", not "on this page": when the table is virtualized the
        // checkbox governs the rendered window rather than a page, and the
        // selection bar's "Select all N matching" is the way to reach the rest.
        aria-label={`Select the rows shown in ${label}`}
      />
    </span>
  );
}

/**
 * Shift-click range selection, given a `Checkbox` with a closed prop API — no
 * `ref`, no `onClick`, no `data-*` passthrough.
 *
 * The wrapper records `shiftKey` from the pointer/keyboard event that *precedes*
 * the change, which `onCheckedChange` then reads. It needs no change to
 * `@ui-organized/react`, which is the point: widening a component's API to serve
 * one consumer is how a design system's props turn into a junk drawer.
 */
function SelectCell({ rowId, rowLabel }: { rowId: string; rowLabel: string }) {
  const { selection } = useTableContext();
  const shift = useRef(false);

  return (
    <span
      className="data-table__select-hit"
      onMouseDownCapture={(event) => {
        shift.current = event.shiftKey;
      }}
      onKeyDownCapture={(event) => {
        shift.current = event.shiftKey;
      }}
    >
      <Checkbox
        checked={selection.isSelected(rowId)}
        onCheckedChange={(checked) => {
          selection.toggle(rowId, checked, shift.current);
          shift.current = false;
        }}
        aria-label={rowLabel}
      />
    </span>
  );
}

export function selectionColumn<T extends RowData>(): TableColumn<T> {
  return {
    id: SELECTION_COLUMN_ID,
    header: () => <SelectAllCell />,
    cell: ({ row, table }) => {
      // The identifying column's value is the only thing that makes one row's
      // checkbox distinguishable from another's in a screen reader's forms list.
      const primary = table
        .getAllLeafColumns()
        .find((column) => column.columnDef.meta?.primary)?.id;
      const name = primary ? String(row.getValue(primary) ?? row.id) : row.id;
      return <SelectCell rowId={row.id} rowLabel={`Select ${name}`} />;
    },
    size: 48,
    minSize: 48,
    maxSize: 48,
    enableSorting: false,
    enableResizing: false,
    enableHiding: false,
    meta: { align: "center", hideFromViewOptions: true },
  };
}

export function actionsColumn<T extends RowData>(): TableColumn<T> {
  return {
    id: ACTIONS_COLUMN_ID,
    header: () => <span className="data-table__sr-only">Actions</span>,
    cell: ({ row }) => <TableRowActions row={row.original as T} />,
    size: 56,
    minSize: 56,
    maxSize: 56,
    enableSorting: false,
    enableResizing: false,
    enableHiding: false,
    meta: { align: "end", sticky: "right", hideFromViewOptions: true },
  };
}
