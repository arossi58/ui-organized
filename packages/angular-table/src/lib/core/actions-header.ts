import { Component } from "@angular/core";

/**
 * The actions column's header: a name for assistive tech and nothing visible.
 *
 * A component rather than a plain string, because the string would be *shown* —
 * a column of ellipsis buttons under a visible "Actions" heading is not what the
 * design draws, and a column with no accessible name at all is worse.
 */
@Component({
  selector: "uio-table-actions-header",
  standalone: true,
  template: `<span class="data-table__sr-only">Actions</span>`,
})
export class UioTableActionsHeader {}
