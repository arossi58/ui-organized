import { useEffect, useRef } from "react";
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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetTitle,
} from "@ui-organized/react";
import type { SheetVariants } from "@ui-organized/react";
import { useTableContext } from "../../core/TableContext.js";
import type { TableDetailSheetProps } from "./TableDetailSheet.types.js";

/**
 * The row detail panel.
 *
 * Core owns prev/next navigation and the dirty guard; this owns the two things
 * that are genuinely React's: returning focus to the row the panel was opened
 * from, and rendering the confirmation as a real `AlertDialog`.
 */
export function TableDetailSheet({ size = "md", className }: TableDetailSheetProps) {
  const { detail, options, table, label } = useTableContext();
  const config = options.detail;
  const openedFrom = useRef<HTMLElement | null>(null);
  const open = detail.state.rowId !== null;

  // Focus came from a cell; the Sheet moves it into the panel and, on close,
  // hands it back to `document.body` unless we remember where it was.
  useEffect(() => {
    if (open && !openedFrom.current) {
      openedFrom.current = document.activeElement as HTMLElement | null;
      return;
    }
    if (!open && openedFrom.current) {
      const previous = openedFrom.current;
      openedFrom.current = null;
      // After the Sheet's own close transition has released the focus trap.
      requestAnimationFrame(() => previous.isConnected && previous.focus());
    }
  }, [open]);

  if (!config) return null;

  const row = detail.row;
  const position = detail.state.index >= 0 ? detail.state.index + 1 : 0;
  const total = table.getRowModel().rows.length;

  return (
    <>
      <Sheet open={open} onOpenChange={(next) => !next && detail.close()}>
        <SheetContent
          side="right"
          size={size as SheetVariants["size"]}
          className={clsx("data-table__detail", className)}
        >
          {/* The title clears the Sheet's own close control, which sits in the
              same top-right corner; the row pager gets its own line rather than
              competing with it for that space. */}
          <div className="data-table__detail-header">
            <SheetTitle>{row ? (config.title?.(row) ?? label) : label}</SheetTitle>
            {row !== null && config.description ? (
              <SheetDescription>{config.description(row)}</SheetDescription>
            ) : null}
          </div>

          <div className="data-table__detail-nav">
            <span className="data-table__detail-position">
              {position} of {total}
            </span>
            <Button
              intent="ghost"
              size="sm"
              icon="chevron-up"
              aria-label="Previous row"
              disabled={!detail.canStep(-1)}
              onClick={() => detail.step(-1)}
            />
            <Button
              intent="ghost"
              size="sm"
              icon="chevron-down"
              aria-label="Next row"
              disabled={!detail.canStep(1)}
              onClick={() => detail.step(1)}
            />
          </div>

          <div className="data-table__detail-body">{row ? config.render(row) : null}</div>

          {row !== null && config.footer ? <SheetFooter>{config.footer(row)}</SheetFooter> : null}
        </SheetContent>
      </Sheet>

      {/* The dirty guard. Core decided it was needed; this only asks. */}
      <AlertDialog
        open={detail.state.confirming !== null}
        onOpenChange={(next) => !next && detail.resolveConfirm(false)}
      >
        <AlertDialogContent>
          <AlertDialogTitle>Discard unsaved changes?</AlertDialogTitle>
          <AlertDialogDescription>
            This row has edits that have not been saved. Leaving now loses them.
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => detail.resolveConfirm(false)}>
              Keep editing
            </AlertDialogCancel>
            <AlertDialogConfirm intent="destructive" onClick={() => detail.resolveConfirm(true)}>
              Discard
            </AlertDialogConfirm>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
