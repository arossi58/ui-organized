import { Component, computed, effect, inject, input, signal } from "@angular/core";
import {
  UioAlertDialog,
  UioAlertDialogCancel,
  UioAlertDialogConfirm,
  UioAlertDialogDescription,
  UioAlertDialogFooter,
  UioAlertDialogTitle,
  UioButton,
  UioToolbar,
} from "@ui-organized/angular";
import type { CanonicalIconName } from "@ui-organized/utils";
import type { RowData } from "@ui-organized/table-core";
import { HostPresence } from "@ui-organized/angular";
import { injectDataTable } from "../core/table-context.js";
import type { BulkAction } from "../core/types.js";

/**
 * Appears only while something is selected.
 *
 * A `UioToolbar` this time — it genuinely is a cluster of buttons, which is what
 * `role="toolbar"` and its roving focus are for. Destructive actions route
 * through `UioAlertDialog`; "archive 40,000 rows" is not an undo-able mis-click.
 */
@Component({
  selector: "div[uioTableSelectionBar]",
  standalone: true,
  providers: [HostPresence],
  /**
   * The host *is* the toolbar. Applying `UioToolbar` here rather than to a
   * wrapper inside the template is what makes this one element instead of two:
   * React renders a single `div.toolbar.data-table__selection-bar[role=toolbar]`,
   * and an inner wrapper would nest a second `role="toolbar"` inside the first —
   * which is both a DOM difference and a genuine a11y defect, since a nested
   * toolbar captures the roving focus of the one containing it.
   */
  hostDirectives: [UioToolbar],
  host: {
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
      <span class="data-table__selection-count" aria-live="polite">{{ countLabel() }}</span>

      @if (table.selection.canSelectAllMatching()) {
        <span class="data-table__selection-all">
          <button
            type="button"
            class="data-table__selection-link"
            (click)="table.selection.selectAllMatching()"
          >
            Select all {{ table.selection.totalMatching() }} matching rows
          </button>
        </span>
      }

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

  protected readonly items = computed(() => this.actions() ?? this.table.options.bulkActions ?? []);
  protected readonly count = computed(() => this.table.selection.count());
  protected readonly countLabel = computed(() =>
    this.count() === 1 ? "1 row selected" : `${this.count()} rows selected`,
  );
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

  protected iconOf(action: BulkAction<T>): CanonicalIconName | undefined {
    return action.icon as CanonicalIconName | undefined;
  }

  private run(action: BulkAction<T>): void {
    void action.onRun(this.table.selection.rows(), this.table.selection.asBulk());
  }

  protected choose(action: BulkAction<T>): void {
    if (action.destructive) this.confirming.set(action);
    else this.run(action);
  }

  protected runConfirmed(): void {
    const action = this.confirming();
    if (action) this.run(action);
    this.confirming.set(null);
  }

  protected onOpenChange(open: boolean): void {
    if (!open) this.confirming.set(null);
  }
}
