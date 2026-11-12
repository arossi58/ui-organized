import { Component, computed, effect, inject, input, signal } from "@angular/core";
import {
  UioAlertDialog,
  UioAlertDialogCancel,
  UioAlertDialogConfirm,
  UioAlertDialogDescription,
  UioAlertDialogFooter,
  UioAlertDialogTitle,
  UioButton,
} from "@ui-organized/angular";
import type { RowData } from "@ui-organized/table-core";
import { HostPresence } from "@ui-organized/angular";
import { injectDataTable } from "../core/table-context.js";
import type { BulkAction } from "../core/types.js";
import type { IconName } from "@ui-organized/angular";

/**
 * Appears only while something is selected, and then takes the place of the
 * toolbar's sort, filter and table actions: with rows selected, what to do
 * with them is the decision in front of the user, so it sits where they were
 * already looking rather than on a line of its own. The count, and the offer
 * to select the rows off screen, are in `UioTableSelectionFooter` under the
 * rows.
 *
 * Plain buttons in a labelled group, with no surface of its own. It shares the
 * toolbar row with the search box, so `role="toolbar"`'s roving focus would
 * make it the only cluster in that row that Tab skips through. Destructive
 * actions route through `UioAlertDialog`; "archive 40,000 rows" is not an
 * undo-able mis-click.
 */
@Component({
  selector: "div[uioTableSelectionBar]",
  standalone: true,
  providers: [HostPresence],
  /**
   * The host is the group itself, so this is one element, as React's single
   * `div.data-table__selection-bar[role=group]` is.
   */
  host: {
    role: "group",
    class: "data-table__selection-bar",
    "aria-label": "Bulk actions",
  },
  imports: [
    UioAlertDialog,
    UioAlertDialogTitle,
    UioAlertDialogDescription,
    UioAlertDialogFooter,
    UioAlertDialogCancel,
    UioAlertDialogConfirm,
    UioButton,
  ],
  template: `
    @if (count() > 0) {
      @for (action of items(); track action.id) {
        <button
          uioButton
          [size]="table.size()"
          [intent]="action.destructive ? 'destructive-ghost' : 'ghost'"
          [icon]="iconOf(action)"
          (click)="choose(action)"
        >
          {{ action.label }}
        </button>
      }

      <button uioButton [size]="table.size()" intent="ghost" (click)="table.selection.clear()">
        Clear
      </button>

      <!--
        Angular's alert dialog is parts rather than props — one component and
        five directives, the same shape every overlay in
        "@ui-organized/angular" takes.
      -->
      <uio-alert-dialog [open]="confirming() !== null" (openChange)="onOpenChange($event)">
        <h2 uioAlertDialogTitle>{{ confirmTitle() }}</h2>
        <div uioAlertDialogDescription>{{ confirmDescription() }}</div>
        <div uioAlertDialogFooter>
          <button uioAlertDialogCancel>Cancel</button>
          <button uioAlertDialogConfirm intent="destructive" (click)="runConfirmed()">
            {{ confirmLabel() }}
          </button>
        </div>
      </uio-alert-dialog>
    }
  `,
})
export class UioTableSelectionBar<T extends RowData> {
  private readonly presence = inject(HostPresence);

  constructor() {
    // A bar that renders nothing must not hold a row of layout: React
    // returns null, and an Angular host element cannot — so it takes
    // itself out of the DOM and puts itself back. See HostPresence.
    effect(() => this.presence.set(this.count() > 0));
  }
  readonly actions = input<BulkAction<T>[] | undefined>(undefined);

  protected readonly table = injectDataTable<T>();
  protected readonly confirming = signal<BulkAction<T> | null>(null);
  /**
   * The action Confirm runs, held apart from `confirming`. The alert's own
   * listener closes it before Confirm's `(click)` does anything, and
   * `onOpenChange` clears `confirming` on close — so by the time
   * `runConfirmed` runs, `confirming()` is already null.
   */
  private pending: BulkAction<T> | null = null;

  protected readonly items = computed(() => this.actions() ?? this.table.options.bulkActions ?? []);
  protected readonly count = computed(() => this.table.selection.count());
  private readonly rowsWord = computed(() =>
    this.count() === 1 ? "1 row" : `${this.count()} rows`,
  );

  protected readonly confirmTitle = computed(
    () => this.confirming()?.confirm?.title ?? `${this.confirming()?.label ?? "Continue"}?`,
  );
  protected readonly confirmDescription = computed(
    () =>
      this.confirming()?.confirm?.description ??
      `This will ${this.confirming()?.label.toLowerCase() ?? "act on"} ${this.rowsWord()}. This cannot be undone.`,
  );
  protected readonly confirmLabel = computed(
    () => this.confirming()?.confirm?.confirmLabel ?? this.confirming()?.label ?? "Confirm",
  );

  protected iconOf(action: BulkAction<T>): IconName | undefined {
    return action.icon;
  }

  private run(action: BulkAction<T>): void {
    void action.onRun(this.table.selection.rows(), this.table.selection.asBulk());
  }

  protected choose(action: BulkAction<T>): void {
    if (!action.destructive) return this.run(action);
    this.pending = action;
    this.confirming.set(action);
  }

  protected runConfirmed(): void {
    const action = this.pending;
    this.pending = null;
    this.confirming.set(null);
    if (action) this.run(action);
  }

  protected onOpenChange(open: boolean): void {
    if (!open) this.confirming.set(null);
  }
}
