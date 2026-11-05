import { Component, computed, effect, inject } from "@angular/core";
import { HostPresence } from "@ui-organized/angular";
import { injectDataTable } from "../core/table-context.js";
import { UioTableFilters } from "./table-filters.js";

/**
 * The row under the toolbar: what is filtered.
 *
 * The selection's bulk actions used to share this line. They now replace the
 * toolbar's own controls while anything is selected (see `UioTableToolbar`), so
 * acting on the selection happens in the row the user was already reading.
 *
 * It renders nothing at all until there is a filter to show, so an empty row
 * never takes a slice of the table's `gap` — and nothing in card mode, where
 * the filter sheet holds them.
 */
@Component({
  selector: "div[uioTableSubBar]",
  standalone: true,
  providers: [HostPresence],
  imports: [UioTableFilters],
  host: { class: "data-table__subbar" },
  // Gated, not just detached: HostPresence takes the host out of the DOM, but
  // the chips under it would still be built — and in card mode each chip's
  // editor popover would attach an overlay nobody can reach. React's sub-bar
  // returns null and mounts none of it; this is the same.
  template: `
    @if (render()) {
      <div uioTableFilters></div>
    }
  `,
})
export class UioTableSubBar {
  private readonly presence = inject(HostPresence);

  constructor() {
    // A row that renders nothing must not hold a line of layout: React returns
    // null, and an Angular host element cannot — so it takes itself out of the
    // DOM and puts itself back. The filters do the same, one level in.
    effect(() => this.presence.set(this.render()));
  }
  protected readonly table = injectDataTable();
  // In card mode every filter lives in the filter sheet, and the toolbar's
  // Filter button counts them; a chips row would repeat it above a list that is
  // already short of room.
  protected readonly render = computed(
    () =>
      this.table.options.filterable !== false &&
      this.table.filters.conditions().length > 0 &&
      this.table.mode() !== "cards",
  );
}
