import { Component, ElementRef, computed, effect, inject, input, viewChild } from "@angular/core";
import { NgTemplateOutlet } from "@angular/common";
import { FlexRender } from "@tanstack/angular-table";
import { UioCheckbox } from "@ui-organized/angular";
import { cardFieldOrder, type RowData, type TableRowModel } from "@ui-organized/table-core";
import { injectDataTable } from "../core/table-context.js";
import { UioTableRowActions } from "./table-row-actions.js";
import { UioTableEmpty } from "./table-states.js";

/**
 * One card: the row's title, its controls in the top-right corner, and every
 * other visible column as a label and value.
 *
 * Title first, then the row's controls: the actions menu, and the checkbox
 * last, in the corner a thumb reaches and where a ticked card is easiest to scan
 * for down a list.
 */
@Component({
  selector: "li[uioTableCard]",
  standalone: true,
  imports: [FlexRender, NgTemplateOutlet, UioCheckbox, UioTableRowActions],
  host: {
    class: "data-table__card",
    "[class.data-table__card--selected]": "selected()",
    "[attr.data-index]": "index()",
    "[attr.data-row-id]": "row().id",
  },
  template: `
    <div class="data-table__card-header">
      <!--
        A button rather than a clickable card: a card is not an interactive
        element, and making one is how a keyboard user loses the row.
      -->
      @if (clickable()) {
        <button
          type="button"
          class="data-table__card-title data-table__sort-button"
          (click)="table.activate(row())"
        >
          <ng-container [ngTemplateOutlet]="title" />
        </button>
      } @else {
        <span class="data-table__card-title"><ng-container [ngTemplateOutlet]="title" /></span>
      }
      @if (hasActions() || selectable()) {
        <span class="data-table__card-controls">
          @if (hasActions()) {
            <span
              uioTableRowActions
              style="display: contents"
              [row]="row().original"
              [label]="'Actions for ' + titleText()"
            ></span>
          }
          @if (selectable()) {
            <label
              uioCheckbox
              [checked]="selected()"
              [attr.aria-label]="'Select ' + titleText()"
              (checkedChange)="table.selection.toggle(row().id, $event)"
            ></label>
          }
        </span>
      }
    </div>

    <dl class="data-table__card-fields">
      @for (field of fields(); track field.id) {
        <dt class="data-table__card-label">{{ field.label }}</dt>
        <dd class="data-table__card-value">
          <ng-container *flexRenderCell="field.cell; let rendered">{{ rendered }}</ng-container>
        </dd>
      }
    </dl>

    <ng-template #title>
      @if (primaryCell(); as cell) {
        <ng-container *flexRenderCell="cell; let rendered">{{ rendered }}</ng-container>
      } @else {
        {{ row().id }}
      }
    </ng-template>
  `,
})
export class UioTableCard<T extends RowData> {
  readonly row = input.required<TableRowModel<T>>();
  readonly index = input.required<number>();
  /** Column ids in card order — `cardFieldOrder`, computed once by the list. */
  readonly fieldOrder = input.required<readonly string[]>();

  protected readonly table = injectDataTable<T>();
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  protected readonly selected = computed(() => this.table.selection.isSelected(this.row().id));
  protected readonly selectable = computed(() => this.table.selection.mode() !== "none");
  protected readonly hasActions = computed(() => (this.table.options.rowActions?.length ?? 0) > 0);
  protected readonly clickable = computed(
    () => Boolean(this.table.options.detail) || Boolean(this.table.options.onRowClick),
  );

  private readonly cells = computed(() => this.row().getVisibleCells());
  protected readonly primaryCell = computed(() => {
    const id = this.table.primaryColumnId();
    return id ? this.cells().find((cell) => cell.column.id === id) : undefined;
  });
  /** The words the card's controls are named with: "Select Ada Lovelace". */
  protected readonly titleText = computed(() => {
    const value = this.primaryCell()?.getValue();
    return typeof value === "string" ? value : this.row().id;
  });

  protected readonly fields = computed(() =>
    this.fieldOrder().flatMap((columnId) => {
      const cell = this.cells().find((candidate) => candidate.column.id === columnId);
      if (!cell) return [];
      const header = this.table.table.getColumn(columnId)?.columnDef.header;
      return [{ id: columnId, cell, label: typeof header === "string" ? header : columnId }];
    }),
  );

  constructor() {
    // Card heights vary with content, so the virtualizer measures rather than
    // estimates. Angular has no per-element ref callback; the card measures
    // itself, exactly as a table row does.
    effect(() => {
      if (this.table.virtual.enabled()) {
        this.table.virtual.virtualizer().measureElement(this.host.nativeElement);
      }
    });
  }
}

/**
 * Card mode: one card per row, below the breakpoint.
 *
 * The table is *replaced*, not hidden — rendering both trees and hiding one with
 * a container query would double the DOM and defeat virtualization on exactly
 * the devices that can least afford it. Selection, row actions and the detail
 * sheet all keep working, because they are table state rather than table markup.
 *
 * The host is `display: contents` and the list is inside it, because the list
 * is a `<ul>` with rows and a `<table>` with the empty state without them, and
 * an Angular host element cannot change its tag.
 */
@Component({
  selector: "div[uioTableCards]",
  standalone: true,
  imports: [UioTableCard, UioTableEmpty],
  host: { style: "display: contents" },
  template: `
    @if (table.renderRows().length === 0) {
      <div class="data-table__cards">
        <table class="data-table__table">
          <caption class="data-table__sr-only">
            {{
              table.label()
            }}
          </caption>
          <tbody>
            <tr uioTableEmpty></tr>
          </tbody>
        </table>
      </div>
    } @else {
      <ul
        #list
        class="data-table__cards"
        [attr.aria-label]="table.label()"
        [style.--data-table-max-height]="maxHeight()"
      >
        @if (spacers().top > 0) {
          <li
            class="data-table__card-spacer"
            aria-hidden="true"
            [style.height.px]="spacers().top"
          ></li>
        }
        @for (entry of table.renderRows(); track entry.row.id) {
          <li uioTableCard [row]="entry.row" [index]="entry.index" [fieldOrder]="fieldOrder()"></li>
        }
        @if (spacers().bottom > 0) {
          <li
            class="data-table__card-spacer"
            aria-hidden="true"
            [style.height.px]="spacers().bottom"
          ></li>
        }
      </ul>
    }
  `,
})
export class UioTableCards {
  protected readonly table = injectDataTable();
  private readonly list = viewChild<ElementRef<HTMLElement>>("list");

  protected readonly fieldOrder = computed(() => cardFieldOrder(this.table.options.columns));
  protected readonly spacers = computed(() =>
    this.table.virtual.enabled() ? this.table.virtual.spacers() : { top: 0, bottom: 0 },
  );
  protected readonly maxHeight = computed(() => {
    const cap = this.table.options.maxHeight;
    if (cap === undefined) return null;
    return typeof cap === "number" ? `${cap}px` : cap;
  });

  constructor() {
    // The list is the scroll container in card mode, so it is what the
    // virtualizer watches — the same signal the table viewport sets.
    effect((onCleanup) => {
      const element = this.list()?.nativeElement ?? null;
      this.table.viewportRef.set(element);
      onCleanup(() => this.table.viewportRef.set(null));
    });
  }
}
