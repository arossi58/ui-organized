import { Component, computed, input } from "@angular/core";
import { UioButton, UioMenu, UioMenuItem, UioMenuTrigger } from "@ui-organized/angular";
import type { CanonicalIconName } from "@ui-organized/utils";
import type { RowData } from "@ui-organized/table-core";
import { injectDataTable } from "../core/table-context.js";
import type { RowAction } from "../core/types.js";

/**
 * Per-row actions, as a menu rather than a row of buttons.
 *
 * A menu is one tab stop per row instead of three, which matters a great deal
 * when there are two hundred rows — and it is the only affordance that survives
 * card mode unchanged.
 *
 * The six menu parts this needs are the ones §E added to `@ui-organized/angular`
 * before this package could exist.
 */
@Component({
  selector: "[uioTableRowActions]",
  standalone: true,
  imports: [UioButton, UioMenu, UioMenuTrigger, UioMenuItem],
  template: `
    <!--
      Angular's menu surface *is* the "uio-menu" element — there is no separate
      content part, which is why "align" lands on the menu itself. The trigger
      sits beside it and names it, the way every overlay in
      "@ui-organized/angular" is written.
    -->
    @if (items().length > 0) {
      <button
        uioButton
        uioMenuTrigger
        [menu]="menu"
        intent="ghost"
        [size]="table.size()"
        icon="menu"
        [attr.aria-label]="label()"
      ></button>
      <uio-menu #menu="uioMenu" align="end">
        @for (action of items(); track action.id) {
          <div
            uioMenuItem
            [value]="action.id"
            [icon]="iconOf(action)"
            [destructive]="!!action.destructive"
            [disabled]="!!action.disabled?.(row())"
            (select)="action.onRun(row())"
          >
            {{ action.label }}
          </div>
        }
      </uio-menu>
    }
  `,
})
export class UioTableRowActions<T extends RowData> {
  /** The row the actions operate on. */
  readonly row = input.required<T>();
  /**
   * Overrides the table's own `rowActions`. Only needed when the part is used
   * outside a `<uio-data-table>`.
   */
  readonly actions = input<RowAction<T>[] | undefined>(undefined);
  /** Accessible name for the trigger. Defaults to "Row actions". */
  readonly label = input("Row actions");

  protected readonly table = injectDataTable<T>();
  protected readonly items = computed(() => this.actions() ?? this.table.options.rowActions ?? []);

  protected iconOf(action: RowAction<T>): CanonicalIconName | undefined {
    return action.icon as CanonicalIconName | undefined;
  }
}
