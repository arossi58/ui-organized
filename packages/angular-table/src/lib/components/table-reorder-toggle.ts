import { Directive, computed } from "@angular/core";
import { injectDataTable } from "../core/table-context.js";

/**
 * Enters and leaves reorder mode, for `reorderable: "toggle"`.
 *
 * A directive on a `uioButton` rather than a component of its own: React's
 * toggle is a single `<button>`, and an Angular component would put a host
 * element around it. So the button is the caller's, and this supplies what it
 * does and what it is called:
 *
 *   <button uioButton uioTableReorderToggle #reorder="uioTableReorderToggle"
 *     [intent]="reorder.active() ? 'primary' : 'secondary'">{{ reorder.text() }}</button>
 *
 * The label says what a press does next — "Reorder", then "Done" — rather
 * than carrying a pressed state, so it reads the same to a screen reader as
 * it does on screen. Render it only while `table.reorder.mode()` is "toggle"
 * and the table is not in card mode, as the toolbar does.
 */
@Directive({
  selector: "button[uioTableReorderToggle]",
  standalone: true,
  exportAs: "uioTableReorderToggle",
  host: {
    type: "button",
    "[attr.aria-label]": "active() ? 'Done reordering columns' : 'Reorder columns'",
    "(click)": "toggle()",
  },
})
export class UioTableReorderToggle {
  private readonly table = injectDataTable();

  readonly active = computed(() => this.table.reorder.active());
  readonly text = computed(() => (this.active() ? "Done" : "Reorder"));

  protected toggle(): void {
    this.table.reorder.setActive(!this.active());
  }
}
