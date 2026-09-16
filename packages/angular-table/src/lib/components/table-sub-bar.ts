import { Component, computed, effect, inject } from "@angular/core";
import { HostPresence } from "@ui-organized/angular";
import { injectDataTable } from "../core/table-context.js";
import { UioTableFilters } from "./table-filters.js";
import { UioTableSelectionBar } from "./table-selection-bar.js";

/**
 * The row under the toolbar: what is filtered, and what is selected.
 *
 * Both halves are summaries of applied state, so they share a line rather than
 * stacking. The earlier arrangement put the bulk actions on a third row, which
 * meant ticking a checkbox pushed the chips up and left the actions two rows
 * away from the sort and filter buttons they belong beside.
 *
 * It renders nothing at all until one of the halves has something to say — the
 * same rule each half already applies to itself, restated here so an empty row
 * never takes a slice of the table's `gap`.
 */
@Component({
  selector: "div[uioTableSubBar]",
  standalone: true,
  providers: [HostPresence],
  imports: [UioTableFilters, UioTableSelectionBar],
  host: { class: "data-table__subbar" },
  template: `
    <div uioTableFilters></div>
    <div uioTableSelectionBar></div>
  `,
})
export class UioTableSubBar {
  private readonly presence = inject(HostPresence);

  constructor() {
    // A row that renders nothing must not hold a line of layout: React returns
    // null, and an Angular host element cannot — so it takes itself out of the
    // DOM and puts itself back. Its two children do the same, one level in.
    effect(() => this.presence.set(this.render()));
  }
  protected readonly table = injectDataTable();
  private readonly hasFilters = computed(
    () => this.table.options.filterable !== false && this.table.filters.conditions().length > 0,
  );
  protected readonly render = computed(() => this.hasFilters() || this.table.selection.count() > 0);
}
