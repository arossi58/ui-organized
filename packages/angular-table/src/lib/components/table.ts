import { Component, Directive, ElementRef, computed, effect, inject } from "@angular/core";
import {
  getCaptionProps,
  getColProps,
  getHeaderRowProps,
  getRootProps,
  getSpacerProps,
  getTableProps,
  getViewportProps,
} from "@ui-organized/table-core";
import { UioTableProps } from "../core/element-props.js";
import { UioTablePropsHost } from "../core/table-props-host.js";
import { injectDataTable } from "../core/table-context.js";
import { UioTableHeadCell } from "./table-head-cell.js";
import { UioTableRow } from "./table-row.js";
import { UioTableEmpty, UioTableError, UioTableLoading } from "./table-states.js";

/**
 * The parts, flat-exported — `UioTableHeader`, not `Table.Header`. That is the
 * repo's convention everywhere else (`UioDialogContent`, `UioMenuItem`) and
 * there is no reason for the table to be the exception.
 *
 * The DOM they compose to:
 *
 *   <div uioTable>              class="data-table"    root, size + variant
 *     <div uioTableToolbar>     …
 *     <div uioTableViewport>    class="data-table__viewport", then <table>
 *       <thead uioTableHeader>
 *       <tbody uioTableBody>    spacer / rows / spacer
 *     <div uioTablePagination>
 *
 * ── Why every part is an attribute directive ────────────────────────────────
 *
 * `@ui-organized/angular` puts its components on the caller's own element
 * (`<button uioButton>`, `<span uioChip>`) rather than on a custom element, and
 * the table has two reasons of its own to do the same. A custom element between
 * `<table>` and `<thead>` is invalid HTML — the browser hoists the `<thead>`
 * straight back out — so `<uio-table-header>` cannot exist at all. And anywhere
 * else, a host element is a DOM node the other three libraries do not render,
 * which the parity gate reports as a difference on every case.
 *
 * So the caller writes the element and the part decorates it. Each one also
 * binds core's prop bag through `UioTablePropsHost` rather than unpacking it
 * field by field — see `../core/element-props.ts` for why that is the whole of
 * Angular's "no prop spread" cost.
 */

/** The root: size, variant, and the element every part measures itself against. */
@Directive({
  selector: "div[uioTable]",
  standalone: true,
})
export class UioTable extends UioTablePropsHost {
  protected readonly table = injectDataTable();
  protected readonly tableProps = computed(() => getRootProps(this.table.chrome()));

  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);

  constructor() {
    super();
    // What a callback ref does in React and an action does in Svelte. The
    // responsive watcher is an effect that re-runs when this arrives.
    effect((onCleanup) => {
      this.table.rootRef.set(this.element.nativeElement);
      onCleanup(() => this.table.rootRef.set(null));
    });
  }
}

/**
 * The scroll container and the `<table>` element, which are inseparable: a
 * viewport with two tables in it means nothing, and `<caption>` and `<colgroup>`
 * have to be emitted between them.
 */
@Component({
  selector: "div[uioTableViewport]",
  standalone: true,
  imports: [UioTableProps],
  template: `
    <!--
      One key handler for the whole grid rather than one per cell: the cursor is
      table state, so the key only has to reach the table. It sits on the element
      that carries "role=grid", not on the scroll container — which is also what
      stops it being a keyboard handler on a div with no role at all.
    -->
    <table [uioTableProps]="tableAttrs()" (keydown)="onKeyDown($event)">
      <!-- First child of table, per the content model. -->
      <caption [uioTableProps]="caption()">
        {{
          table.label()
        }}
      </caption>
      <colgroup>
        @for (column of columns(); track column.id) {
          <col [uioTableProps]="colProps(column.id)" />
        }
      </colgroup>
      <ng-content />
    </table>
  `,
})
export class UioTableViewport extends UioTablePropsHost {
  protected readonly table = injectDataTable();
  protected readonly tableProps = computed(() => {
    const props = getViewportProps(this.table.chrome());
    const cap = this.table.options.maxHeight;
    if (cap === undefined) return props;
    // The max height rides in on the same bag rather than a second binding, so
    // the diffing in `applyElementProps` owns every attribute on this element.
    return { ...props, style: { ...props.style, maxHeight: cap } };
  });

  protected readonly tableAttrs = computed(() => getTableProps(this.table.chrome()));
  protected readonly caption = computed(() => getCaptionProps(this.table.captionVisible()));
  protected readonly columns = computed(() => this.table.table.getVisibleLeafColumns());

  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);

  constructor() {
    super();
    effect((onCleanup) => {
      this.table.viewportRef.set(this.element.nativeElement);
      onCleanup(() => this.table.viewportRef.set(null));
    });
  }

  protected colProps(columnId: string) {
    return getColProps(this.table.columnWidths()[columnId]);
  }

  protected onKeyDown(event: KeyboardEvent): void {
    if (this.table.interactive()) this.table.onGridKeyDown(event);
  }
}

@Component({
  selector: "thead[uioTableHeader]",
  standalone: true,
  imports: [UioTableProps, UioTableHeadCell],
  host: { class: "data-table__head" },
  template: `
    @for (group of groups(); track group.id) {
      <tr [uioTableProps]="rowProps">
        @for (header of group.headers; track header.id; let index = $index) {
          <th uioTableHeadCell [header]="header" [index]="index"></th>
        }
      </tr>
    }
  `,
})
export class UioTableHeader {
  protected readonly table = injectDataTable();
  protected readonly groups = computed(() => this.table.table.getHeaderGroups());
  protected readonly rowProps = getHeaderRowProps();
}

/**
 * The body, and the four states it decides between on its own.
 *
 * Projected content wins: layer-2 composition is the point of these parts.
 * Otherwise `<tbody uioTableBody>` alone is a complete table body — the error,
 * the loading skeleton, the empty state and the rows are all its business.
 */
@Component({
  selector: "tbody[uioTableBody]",
  standalone: true,
  imports: [UioTableProps, UioTableRow, UioTableEmpty, UioTableError, UioTableLoading],
  host: { class: "data-table__body" },
  template: `
    @switch (state()) {
      @case ("error") {
        <tr uioTableError></tr>
      }
      @case ("loading") {
        <ng-container uioTableLoading />
      }
      @case ("empty") {
        <tr uioTableEmpty></tr>
      }
      @default {
        @if (spacers().top > 0) {
          <tr [uioTableProps]="spacerRow(spacers().top)">
            <td [uioTableProps]="spacerCell(spacers().top)"></td>
          </tr>
        }
        @for (entry of table.renderRows(); track entry.row.id) {
          <tr
            uioTableRow
            [row]="entry.row"
            [index]="entry.index"
            [absoluteIndex]="entry.absoluteIndex"
          ></tr>
        }
        @if (spacers().bottom > 0) {
          <tr [uioTableProps]="spacerRow(spacers().bottom)">
            <td [uioTableProps]="spacerCell(spacers().bottom)"></td>
          </tr>
        }
      }
    }
    <ng-content />
  `,
})
export class UioTableBody {
  protected readonly table = injectDataTable();
  protected readonly spacers = computed(() =>
    this.table.virtual.enabled() ? this.table.virtual.spacers() : { top: 0, bottom: 0 },
  );

  protected readonly state = computed(() => {
    if (this.table.options.error) return "error";
    if (this.table.loading() && this.table.renderRows().length === 0) return "loading";
    if (this.table.renderRows().length === 0) return "empty";
    return "rows";
  });

  protected spacerRow(height: number) {
    return getSpacerProps(height, this.table.chrome().colCount).row;
  }
  protected spacerCell(height: number) {
    return getSpacerProps(height, this.table.chrome().colCount).cell;
  }
}
