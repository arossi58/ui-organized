import { useState } from "react";
import { clsx } from "clsx";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogConfirm,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
  Button,
} from "@ui-organized/react";
import { useTableContext } from "../../core/TableContext.js";
import type { BulkAction } from "../../core/types.js";
import type { TableSelectionBarProps } from "./TableSelectionBar.types.js";
import type { RowData } from "@ui-organized/table-core";

/**
 * Appears only while something is selected, and then takes the place of the
 * toolbar's sort, filter and table actions: with rows selected, what to do
 * with them is the decision in front of the user, so it sits where they were
 * already looking rather than on a line of its own. The count, and the offer
 * to select the rows off screen, are in `TableSelectionFooter` under the rows.
 *
 * Plain buttons in a labelled group, with no surface of its own. It shares the
 * toolbar row with the search box, so `role="toolbar"`'s roving focus would
 * make it the only cluster in that row that Tab skips through. Destructive
 * actions route through `AlertDialog`; "archive 40,000 rows" is not an
 * undo-able mis-click.
 */
export function TableSelectionBar<T extends RowData>({
  actions,
  className,
}: TableSelectionBarProps<T>) {
  const { selection, size, options } = useTableContext<T>();
  const [confirming, setConfirming] = useState<BulkAction<T> | null>(null);
  const items = actions ?? options.bulkActions ?? [];

  if (selection.count === 0) return null;

  const run = (action: BulkAction<T>) => {
    void action.onRun(selection.rows, selection.asBulk());
  };

  return (
    <div
      role="group"
      className={clsx("data-table__selection-bar", className)}
      aria-label="Bulk actions"
    >
      {items.map((action) => (
        <Button
          key={action.id}
          size={size}
          intent={action.destructive ? "destructive-ghost" : "ghost"}
          icon={action.icon}
          onClick={() => (action.destructive ? setConfirming(action) : run(action))}
        >
          {action.label}
        </Button>
      ))}

      <Button size={size} intent="ghost" onClick={selection.clear}>
        Clear
      </Button>

      <AlertDialog open={confirming !== null} onOpenChange={(open) => !open && setConfirming(null)}>
        <AlertDialogContent>
          <AlertDialogTitle>
            {confirming?.confirm?.title ?? `${confirming?.label ?? "Continue"}?`}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {confirming?.confirm?.description ??
              `This will ${confirming?.label.toLowerCase() ?? "act on"} ${
                selection.count === 1 ? "1 row" : `${selection.count} rows`
              }. This cannot be undone.`}
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogConfirm
              intent="destructive"
              onClick={() => {
                if (confirming) run(confirming);
                setConfirming(null);
              }}
            >
              {confirming?.confirm?.confirmLabel ?? confirming?.label ?? "Confirm"}
            </AlertDialogConfirm>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
