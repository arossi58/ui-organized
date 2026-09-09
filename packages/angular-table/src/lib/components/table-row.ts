import { Component, ElementRef, computed, effect, inject, input, type Signal } from "@angular/core";
import { FlexRender } from "@tanstack/angular-table";
import {
  alignOf,
  getCellProps,
  getRowProps,
  metaOf,
  stickyPositionOf,
  type RowData,
  type TableCellInstance,
  type TableInstance,
  type TableRowModel,
} from "@ui-organized/table-core";
import { UioTablePropsHost } from "../core/table-props-host.js";
import { injectDataTable } from "../core/table-context.js";

/**
 * One cell.
 *
 * The identifying column is a real row header, which is what makes a screen
 * reader announce "Ada Lovelace, Role, Engineer" instead of just "Engineer" —
 * so the row picks `th` or `td` and this decorates whichever it wrote. Angular
 * has no dynamic element by name, and a component selector that matched both
 * would be two selectors on one class, so the tag choice lives in the row's
 * template and the behaviour lives here.
 */
@Component({
  selector: "[uioTableCell]",
  standalone: true,
  imports: [FlexRender],
  host: {
    "[attr.data-cell]": "rowIndex() + ':' + index()",
    "(focus)": "onFocus()",
    "(dblclick)": "onDoubleClick()",
  },
  template: `
    @if (editing()) {
      <span class="data-table__editor" #editor>
        <ng-container *ngTemplateOutlet="editorTemplate()" />
      </span>
    } @else {
      <ng-container *flexRenderCell="cell(); let rendered">{{ rendered }}</ng-container>
    }
  `,
})
export class UioTableCell<T extends RowData> extends UioTablePropsHost {
  readonly cell = input.required<TableCellInstance<T>>();
  readonly row = input.required<TableRowModel<T>>();
  readonly index = input.required<number>();
  readonly rowIndex = input.required<number>();
  readonly primary = input.required<boolean>();

  protected readonly table = injectDataTable<T>();
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  protected readonly column = computed(() => this.cell().column);
  private readonly meta = computed(() => metaOf<T>(this.column().columnDef));

  protected readonly editing = computed(() =>
    this.table.edit.contextFor(this.row(), this.column().id),
  );

  private readonly focused = computed(() => {
    const cursor = this.table.focus.cursor();
    return cursor.row === this.rowIndex() && cursor.col === this.index();
  });

  /** Applied to this cell by `UioTablePropsHost`. */
  protected readonly tableProps = computed(() =>
    getCellProps({
      columnId: this.column().id,
      index: this.index(),
      align: alignOf(this.column().columnDef),
      primary: this.primary(),
      sticky: stickyPositionOf(this.table.table as unknown as TableInstance<T>, this.column()),
      focused: this.focused(),
      editing: Boolean(this.editing()),
      invalid: Boolean(this.editing()?.invalid),
      interactive: this.table.interactive(),
    }),
  );

  protected readonly editorTemplate: Signal<unknown> = computed(() => {
    const context = this.editing();
    return context ? this.meta()?.edit?.render(context) : null;
  });

  constructor() {
    super();
    /**
     * The editor's mount focus, which is the package's job rather than the
     * consumer's: `meta.edit.render` returns whatever control the consumer
     * likes, and most of the library's controls do not expose their inner
     * `<input>`. React and Vue put this in a `CellEditor` component so the hook
     * exists only while editing; here the same guard is the `if` below.
     */
    effect(() => {
      if (!this.editing()) return;
      queueMicrotask(() => {
        const focusable = this.host.nativeElement.querySelector<HTMLElement>(
          '.data-table__editor input:not([type="hidden"]), .data-table__editor textarea, .data-table__editor select, .data-table__editor [contenteditable="true"]',
        );
        focusable?.focus();
        if (focusable instanceof HTMLInputElement) focusable.select();
      });
    });
  }

  protected onFocus(): void {
    if (this.table.interactive()) {
      this.table.focus.setCursor({ row: this.rowIndex(), col: this.index() });
    }
  }

  protected onDoubleClick(): void {
    if (this.meta()?.edit) this.table.edit.start(this.row(), this.column().id);
  }
}

/**
 * One row.
 *
 * React memoizes this on a hand-written nine-field comparator, and threads every
 * value it needs through props so the comparator can see them. Angular needs
 * neither: a signal-driven template updates only what changed, so the row takes
 * what genuinely *varies per row* as inputs and reads the rest from the
 * injector.
 */
@Component({
  selector: "tr[uioTableRow]",
  standalone: true,
  imports: [UioTableCell],
  host: {
    "[attr.data-index]": "index()",
    "(click)": "table.activate(row())",
  },
  template: `
    @for (cell of cells(); track cell.id; let colIndex = $index) {
      @if (cell.column.id === table.primaryColumnId()) {
        <th
          uioTableCell
          scope="row"
          [cell]="cell"
          [row]="row()"
          [index]="colIndex"
          [rowIndex]="index()"
          [primary]="true"
        ></th>
      } @else {
        <td
          uioTableCell
          [cell]="cell"
          [row]="row()"
          [index]="colIndex"
          [rowIndex]="index()"
          [primary]="false"
        ></td>
      }
    }
  `,
})
export class UioTableRow<T extends RowData> extends UioTablePropsHost {
  readonly row = input.required<TableRowModel<T>>();
  readonly index = input.required<number>();
  readonly absoluteIndex = input.required<number>();

  protected readonly table = injectDataTable<T>();
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  protected readonly cells = computed(() => this.row().getVisibleCells());

  /** Applied to this `<tr>` by `UioTablePropsHost`. */
  protected readonly tableProps = computed(() =>
    getRowProps({
      rowId: this.row().id,
      index: this.absoluteIndex(),
      selected: this.table.selection.isSelected(this.row().id),
      editing: this.table.edit.state().target?.rowId === this.row().id,
      selectable: this.table.selection.mode() !== "none",
      interactive: this.table.interactive(),
      clickable: Boolean(this.table.options.onRowClick) || Boolean(this.table.options.detail),
    }),
  );

  constructor() {
    super();
    /**
     * The virtualizer measures the real row rather than trusting the estimate,
     * so a re-themed row height corrects itself on the first frame. Angular has
     * no per-element ref callback, so the row measures itself.
     */
    effect(() => {
      if (this.table.virtual.enabled()) {
        this.table.virtual.virtualizer().measureElement(this.host.nativeElement);
      }
    });
  }
}
