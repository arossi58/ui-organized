import { Component, computed, input } from "@angular/core";
import { UioPagination, UioSelect } from "@ui-organized/angular";
import { PAGE_SIZE_OPTIONS, pageSizeOptions } from "@ui-organized/table-core";
import { injectDataTable } from "../core/table-context.js";

/**
 * Wraps the library's `Pagination`, which takes a page *count* — the conversion
 * from row count and page size happens here so consumers never do that
 * arithmetic themselves and get the off-by-one wrong.
 */
@Component({
  selector: "div[uioTablePagination]",
  standalone: true,
  host: { class: "data-table__pagination" },
  imports: [UioPagination, UioSelect],
  template: `
    <!--
        Announced on change, because the rows it describes change underneath a
        screen reader user with no other signal that anything happened.
      -->
    <span class="data-table__pagination-status" aria-live="polite">{{ status() }}</span>

    <nav
      uioPagination
      [page]="pageIndex() + 1"
      [count]="pageCount()"
      (pageChange)="table.table.setPageIndex($event - 1)"
    ></nav>

    @if (showPageSize()) {
      <div class="data-table__page-size">
        <div
          uioSelect
          [size]="table.size()"
          variant="ghost"
          label="Rows per page"
          [value]="pageSizeValue()"
          [options]="sizeOptions()"
          (valueChange)="table.table.setPageSize(+$event)"
        ></div>
      </div>
    }
  `,
})
export class UioTablePagination {
  readonly showPageSize = input(true);
  readonly pageSizes = input<number[]>([...PAGE_SIZE_OPTIONS]);

  protected readonly table = injectDataTable();
  private readonly pagination = computed(() => this.table.state().pagination);
  protected readonly pageIndex = computed(() => this.pagination()?.pageIndex ?? 0);
  protected readonly pageSize = computed(() => this.pagination()?.pageSize ?? 10);
  protected readonly pageSizeValue = computed(() => String(this.pageSize()));
  private readonly total = computed(() => this.table.selection.totalMatching());
  protected readonly pageCount = computed(() =>
    Math.max(1, Math.ceil(this.total() / this.pageSize())),
  );

  protected readonly status = computed(() => {
    const total = this.total();
    if (total === 0) return "No rows";
    const first = this.pageIndex() * this.pageSize() + 1;
    const last = Math.min(total, (this.pageIndex() + 1) * this.pageSize());
    return `${first}–${last} of ${total}`;
  });

  protected readonly sizeOptions = computed(() =>
    pageSizeOptions(this.pageSizes(), this.pageSize()).map((entry) => ({
      value: String(entry),
      label: String(entry),
    })),
  );
}
