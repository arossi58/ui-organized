import { clsx } from "clsx";
import { Button } from "@ui-organized/react";
import { selectHiddenLabel, selectionCountLabel } from "@ui-organized/table-core";
import { useTableContext } from "../../core/TableContext.js";
import type { TableSelectionFooterProps } from "./TableSelectionFooter.types.js";

/**
 * Under the rows: how many are selected, and the offer to select the matching
 * rows that are not on screen.
 *
 * At the bottom rather than in the toolbar, because that is where the user's
 * eye is once they have ticked down a page — and where the visible rows run
 * out is where "there are more of these" belongs. The bulk actions stay in the
 * toolbar (see `TableSelectionBar`).
 *
 * The offer is a real button, and counts the rows it would *add*: "Select
 * 99,981 hidden rows" says plainly that the ticks so far only reached what
 * was visible.
 */
export function TableSelectionFooter({ className }: TableSelectionFooterProps) {
  const { selection, size } = useTableContext();
  if (selection.count === 0) return null;

  return (
    <div className={clsx("data-table__selection-footer", className)}>
      {/* Announced on change: ticking a row changes nothing else a screen
          reader user would hear. */}
      <span className="data-table__selection-count" aria-live="polite">
        {selectionCountLabel(selection.count)}
      </span>

      {selection.canSelectAllMatching && (
        <Button size={size} intent="secondary" onClick={selection.selectAllMatching}>
          {selectHiddenLabel(selection.totalMatching, selection.count)}
        </Button>
      )}
    </div>
  );
}
