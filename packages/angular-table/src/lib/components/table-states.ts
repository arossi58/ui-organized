import { Component, computed, input } from "@angular/core";
import {
  UioEmptyState,
  UioEmptyStateActions,
  UioSkeleton,
  type IconGlyph,
  type IconName,
} from "@ui-organized/angular";
import { injectDataTable } from "../core/table-context.js";

/**
 * Empty, loading and error all live *inside* `<tbody>` rather than replacing the
 * table.
 *
 * Keeping the header on screen keeps the column widths, the scroll position and
 * the filter controls exactly where they were — so clearing a filter that
 * emptied the table does not also move every control the user was about to
 * click.
 */
@Component({
  selector: "tr[uioTableEmpty]",
  standalone: true,
  imports: [UioEmptyState, UioEmptyStateActions],
  host: { class: "data-table__row" },
  template: `
    <td class="data-table__state-cell" [attr.colspan]="table.chrome().colCount">
      <div uioEmptyState size="sm" [icon]="glyph()" [title]="heading()" [description]="detail()">
        <div uioEmptyStateActions><ng-content /></div>
      </div>
    </td>
  `,
})
export class UioTableEmpty {
  readonly title = input<string | undefined>(undefined);
  readonly description = input<string | undefined>(undefined);
  /** A topic icon above the title, drawn as a neutral FeaturedIcon. */
  readonly icon = input<IconName | IconGlyph | undefined>(undefined);

  protected readonly table = injectDataTable();
  protected readonly heading = computed(
    () => this.title() ?? this.table.options.empty?.title ?? "Nothing to show",
  );
  protected readonly detail = computed(
    () => this.description() ?? this.table.options.empty?.description,
  );
  protected readonly glyph = computed(() => this.icon() ?? this.table.options.empty?.icon);
}

/**
 * Skeleton rows sized to the real row height, so the table does not resize when
 * the data lands — which is the entire reason to prefer a skeleton to a spinner.
 * (A Spinner would hold no height at all, and the rows would jump when the data lands.)
 */
@Component({
  selector: "[uioTableLoading]",
  standalone: true,
  imports: [UioSkeleton],
  template: `
    @for (index of bars(); track index) {
      <tr class="data-table__row" aria-hidden="true">
        @for (column of columns(); track column.id) {
          <td class="data-table__skeleton-cell">
            <!--
              Varied but deterministic: identical bars read as a progress bar,
              and a random width changes on every render.
            -->
            <span
              uioSkeleton
              variant="text"
              [width]="widthFor(column.id)"
              [height]="barHeight()"
            ></span>
          </td>
        }
      </tr>
    }
  `,
})
export class UioTableLoading {
  readonly rows = input(8);

  protected readonly table = injectDataTable();
  protected readonly columns = computed(() => this.table.table.getVisibleLeafColumns());
  protected readonly bars = computed(() =>
    Array.from({ length: this.rows() }, (_, index) => index),
  );
  protected readonly barHeight = computed(() => (this.table.size() === "sm" ? 10 : 12));

  protected widthFor(columnId: string): string {
    return `${55 + ((columnId.length * 7) % 35)}%`;
  }
}

@Component({
  selector: "tr[uioTableError]",
  standalone: true,
  host: { class: "data-table__row" },
  template: `
    <td class="data-table__state-cell" [attr.colspan]="table.chrome().colCount">
      <!--
        "alert" rather than a plain region: the error arrives after the user has
        moved on, so it has to announce itself.
      -->
      <div class="data-table__state data-table__state--error" role="alert">
        <span class="data-table__state-title">{{ title() }}</span>
        @if (message(); as text) {
          <span class="data-table__state-description">{{ text }}</span>
        }
      </div>
    </td>
  `,
})
export class UioTableError {
  readonly title = input("Could not load this table");

  protected readonly table = injectDataTable();
  /** The table's `error` option, when it is a plain string. */
  protected readonly message = computed(() => {
    const error = this.table.options.error;
    return typeof error === "string" || typeof error === "number" ? String(error) : undefined;
  });
}
