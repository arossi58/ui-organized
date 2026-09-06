import { Component, computed, input } from "@angular/core";
import { UioCheckbox } from "@ui-organized/angular";
import { injectDataTable } from "./table-context.js";

/**
 * ── Why the host is the `<span>` ────────────────────────────────────────────
 *
 * Both of these are rendered by `flexRenderComponent`, which creates the
 * component's host element — so the host is a node in the table whether it is
 * wanted or not. Selecting on `span[uioTableSelectCell]` rather than a custom
 * element makes that unavoidable node *be* the hit target React renders, instead
 * of an extra `<uio-table-select-cell>` wrapped around it.
 *
 * The same reasoning as everywhere else in this package: an Angular component
 * always has a host element, so the only way to match React's DOM is to make the
 * host the element React renders.
 */

/** The header's tri-state checkbox: it governs the rows on screen. */
@Component({
  selector: "span[uioTableSelectAllCell]",
  standalone: true,
  imports: [UioCheckbox],
  host: { class: "data-table__select-hit" },
  template: `
    <label
      uioCheckbox
      [checked]="table.selection.header().checked"
      [indeterminate]="table.selection.header().indeterminate"
      [attr.aria-label]="selectAllLabel()"
      (checkedChange)="table.selection.togglePage($event)"
    ></label>
  `,
})
export class UioTableSelectAllCell {
  protected readonly table = injectDataTable();
  // "shown", not "on this page": when the table is virtualized the checkbox
  // governs the rendered window rather than a page, and the selection bar's
  // "Select all N matching" is the way to reach the rest.
  protected readonly selectAllLabel = computed(
    () => `Select the rows shown in ${this.table.label()}`,
  );
}

/**
 * A row's selection checkbox, with shift-click range selection.
 *
 * Given a `UioCheckbox` with a closed prop API, the wrapper records `shiftKey`
 * from the pointer or keyboard event that *precedes* the change, which the
 * change handler then reads. It needs no change to `@ui-organized/angular`,
 * which is the point: widening a component's API to serve one consumer is how a
 * design system's props turn into a junk drawer.
 */
@Component({
  selector: "span[uioTableSelectCell]",
  standalone: true,
  imports: [UioCheckbox],
  host: {
    class: "data-table__select-hit",
    "(mousedown)": "remember($event)",
    "(keydown)": "remember($event)",
  },
  template: `
    <label
      uioCheckbox
      [checked]="table.selection.isSelected(rowId())"
      [attr.aria-label]="rowLabel()"
      (checkedChange)="change($event)"
    ></label>
  `,
})
export class UioTableSelectCell {
  readonly rowId = input.required<string>();
  readonly rowLabel = input.required<string>();

  protected readonly table = injectDataTable();
  private shift = false;

  protected remember(event: MouseEvent | KeyboardEvent): void {
    this.shift = event.shiftKey;
  }

  protected change(checked: boolean): void {
    this.table.selection.toggle(this.rowId(), checked, this.shift);
    this.shift = false;
  }
}
