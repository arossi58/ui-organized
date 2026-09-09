import { Component, computed, input } from "@angular/core";
import { FlexRender } from "@tanstack/angular-table";
import { UioIcon } from "@ui-organized/angular";
import {
  alignOf,
  getHeadCellProps,
  getResizeHandleProps,
  resizeKeyDown,
  stickyPositionOf,
  type RowData,
  type TableHeaderInstance,
  type TableInstance,
} from "@ui-organized/table-core";
import { UioTablePropsHost } from "../core/table-props-host.js";
import { injectDataTable } from "../core/table-context.js";

/**
 * Pointer drag and keyboard, on one control.
 *
 * The drag is TanStack's own handler; the keyboard is core's `resizeKeyDown`, so
 * the two cannot drift. It is a `role="separator"` with `aria-valuenow`, which is
 * what makes the column width something a screen reader can report rather than
 * something only a mouse can discover.
 */
@Component({
  selector: "button[uioTableResizeHandle]",
  standalone: true,
  host: {
    type: "button",
    "(mousedown)": "startResize($event)",
    "(touchstart)": "startResize($event)",
    "(click)": "$event.stopPropagation()",
    "(keydown)": "onKeyDown($event)",
  },
  template: "",
})
export class UioTableResizeHandle<T extends RowData> extends UioTablePropsHost {
  readonly header = input.required<TableHeaderInstance<T>>();

  protected readonly table = injectDataTable<T>();
  private readonly column = computed(() => this.header().column);

  private readonly bounds = computed(() => {
    const width = this.column().getSize();
    return {
      width,
      min: this.column().columnDef.minSize ?? 0,
      max: this.column().columnDef.maxSize ?? width,
    };
  });

  /** Applied to this button by `UioTablePropsHost`. */
  protected readonly tableProps = computed(() => {
    const headerDef = this.column().columnDef.header;
    const bounds = this.bounds();
    return getResizeHandleProps({
      columnId: this.column().id,
      columnLabel: typeof headerDef === "string" ? headerDef : this.column().id,
      width: bounds.width,
      min: bounds.min,
      max: bounds.max,
      active: this.column().getIsResizing(),
    });
  });

  /** Stops the header's sort button from firing on the same press. */
  protected startResize(event: MouseEvent | TouchEvent): void {
    event.stopPropagation();
    this.header().getResizeHandler()(event);
  }

  protected onKeyDown(event: KeyboardEvent): void {
    const action = resizeKeyDown(this.bounds(), {
      key: event.key,
      shift: event.shiftKey,
      ctrl: event.ctrlKey,
      meta: event.metaKey,
    });
    if (action.type === "none") return;
    event.preventDefault();
    event.stopPropagation();
    const id = this.column().id;
    if (action.type === "reset") {
      this.table.table.setColumnSizing((old: Record<string, number>) => {
        const next = { ...old };
        delete next[id];
        return next;
      });
      return;
    }
    this.table.table.setColumnSizing((old: Record<string, number>) => ({
      ...old,
      [id]: action.width,
    }));
  }
}

/** One header cell: the sort control, the roving tab stop, and the resize grip. */
@Component({
  selector: "th[uioTableHeadCell]",
  standalone: true,
  imports: [FlexRender, UioIcon, UioTableResizeHandle],
  host: {
    "[attr.data-cell]": "'-1:' + index()",
    "[attr.tabindex]": "tabIndex()",
    "(focus)": "onFocus()",
  },
  template: `
    <div class="data-table__head-inner">
      <!--
        The roving tabindex covers the header row too, so ArrowUp out of the
        first body row lands somewhere focusable and Enter sorts from there.
        Inner controls are not their own tab stops in a grid; the cell is.
      -->
      @if (sortable()) {
        <button
          type="button"
          class="data-table__sort-button"
          [attr.tabindex]="interactive() ? -1 : null"
          (click)="toggleSort($event)"
        >
          <span class="data-table__head-label">
            @if (!header().isPlaceholder) {
              <ng-container *flexRenderHeader="header(); let rendered">{{ rendered }}</ng-container>
            }
          </span>
          <span class="data-table__sort-icon">
            <span uioIcon [name]="sortIcon()" [size]="14"></span>
          </span>
        </button>
      } @else {
        <span class="data-table__head-label">
          @if (!header().isPlaceholder) {
            <ng-container *flexRenderHeader="header(); let rendered">{{ rendered }}</ng-container>
          }
        </span>
      }
    </div>
    @if (column().getCanResize()) {
      <button uioTableResizeHandle [header]="header()"></button>
    }
  `,
})
export class UioTableHeadCell<T extends RowData> extends UioTablePropsHost {
  readonly header = input.required<TableHeaderInstance<T>>();
  readonly index = input.required<number>();

  protected readonly table = injectDataTable<T>();
  protected readonly column = computed(() => this.header().column);
  protected readonly sortable = computed(() => this.column().getCanSort());
  protected readonly sorted = computed(() => this.column().getIsSorted());
  protected readonly interactive = computed(() => this.table.interactive());
  protected readonly sortIcon = computed(() =>
    this.sorted() === "desc" ? "sort-desc" : "sort-asc",
  );

  private readonly focused = computed(() => {
    const cursor = this.table.focus.cursor();
    return this.interactive() && cursor.row === -1 && cursor.col === this.index();
  });

  protected readonly tabIndex = computed(() =>
    this.interactive() ? (this.focused() ? 0 : -1) : null,
  );

  /** Applied to this `<th>` by `UioTablePropsHost`. */
  protected readonly tableProps = computed(() =>
    getHeadCellProps({
      columnId: this.column().id,
      index: this.index(),
      align: alignOf(this.column().columnDef),
      sortable: this.sortable(),
      sortDirection: this.sorted() === false ? false : (this.sorted() as "asc" | "desc"),
      sticky: stickyPositionOf(this.table.table as unknown as TableInstance<T>, this.column()),
      resizing: this.column().getIsResizing(),
      interactive: this.interactive(),
    }),
  );

  protected onFocus(): void {
    if (this.interactive()) this.table.focus.setCursor({ row: -1, col: this.index() });
  }

  protected toggleSort(event: Event): void {
    this.column().getToggleSortingHandler()?.(event);
  }
}
