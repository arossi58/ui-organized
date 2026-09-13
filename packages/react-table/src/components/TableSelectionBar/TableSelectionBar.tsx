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
  Toolbar,
} from "@ui-organized/react";
import type { CanonicalIconName } from "@ui-organized/utils";
import { useTableContext } from "../../core/TableContext.js";
import type { BulkAction } from "../../core/types.js";
import type { TableSelectionBarProps } from "./TableSelectionBar.types.js";
import type { RowData } from "@ui-organized/table-core";

/**
 * Appears only while something is selected.
 *
 * A `Toolbar` this time — it genuinely is a cluster of buttons, which is what
 * `role="toolbar"` and its roving focus are for. Destructive actions route
 * through `AlertDialog`; "archive 40,000 rows" is not an undo-able mis-click.
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
    <Toolbar className={clsx("data-table__selection-bar", className)} aria-label="Bulk actions">
      <span className="data-table__selection-count" aria-live="polite">
        {selection.count === 1 ? "1 row selected" : `${selection.count} rows selected`}
      </span>

      {selection.canSelectAllMatching && (
        <span className="data-table__selection-all">
          <button
            type="button"
            className="data-table__selection-link"
            onClick={selection.selectAllMatching}
          >
            Select all {selection.totalMatching} matching rows
          </button>
        </span>
      )}

      {items.map((action) => (
        <Button
          key={action.id}
          size={size}
          intent={action.destructive ? "destructive-ghost" : "ghost"}
          icon={action.icon as CanonicalIconName | undefined}
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
    </Toolbar>
  );
}
