import { Component, computed, effect, inject } from "@angular/core";
import { HostPresence, UioButton } from "@ui-organized/angular";
import { selectHiddenLabel, selectionCountLabel } from "@ui-organized/table-core";
import { injectDataTable } from "../core/table-context.js";

/**
 * Under the rows: how many are selected, and the offer to select the matching
 * rows that are not on screen.
 *
 * At the bottom rather than in the toolbar, because that is where the user's
 * eye is once they have ticked down a page — and where the visible rows run
 * out is where "there are more of these" belongs. The bulk actions stay in the
 * toolbar (see `UioTableSelectionBar`).
 *
 * The offer is a real button, and counts the rows it would *add*: "Select
 * 99,981 hidden rows" says plainly that the ticks so far only reached what was
 * visible.
 */
@Component({
  selector: "div[uioTableSelectionFooter]",
  standalone: true,
  providers: [HostPresence],
  imports: [UioButton],
  // The host is the footer itself, so this is one element, as React's single
  // `div.data-table__selection-footer` is.
  host: { class: "data-table__selection-footer" },
  template: `
    @if (count() > 0) {
      <!-- Announced on change: ticking a row changes nothing else a screen
           reader user would hear. -->
      <span class="data-table__selection-count" aria-live="polite">{{ countLabel() }}</span>

      @if (table.selection.canSelectAllMatching()) {
        <button
          uioButton
          [size]="table.size()"
          intent="secondary"
          (click)="table.selection.selectAllMatching()"
        >
          {{ hiddenLabel() }}
        </button>
      }
    }
  `,
})
export class UioTableSelectionFooter {
  private readonly presence = inject(HostPresence);

  constructor() {
    // A footer that renders nothing must not hold a row of layout: React
    // returns null, and an Angular host element cannot — so it takes itself
    // out of the DOM and puts itself back. See HostPresence.
    effect(() => this.presence.set(this.count() > 0));
  }

  protected readonly table = injectDataTable();
  protected readonly count = computed(() => this.table.selection.count());
  protected readonly countLabel = computed(() => selectionCountLabel(this.count()));
  protected readonly hiddenLabel = computed(() =>
    selectHiddenLabel(this.table.selection.totalMatching(), this.count()),
  );
}
