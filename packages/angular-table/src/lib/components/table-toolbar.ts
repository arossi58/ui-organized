import { Component, computed } from "@angular/core";
import {
  UioButton,
  UioDivider,
  UioMenu,
  UioMenuCheckboxItem,
  UioMenuGroup,
  UioMenuGroupLabel,
  UioMenuItem,
  UioMenuRadioGroup,
  UioMenuRadioItem,
  UioMenuSeparator,
  UioMenuTrigger,
  UioSearchInput,
} from "@ui-organized/angular";
import type { CanonicalIconName } from "@ui-organized/utils";
import { toggleableColumns } from "@ui-organized/table-core";
import { injectDataTable } from "../core/table-context.js";
import type { TableAction } from "../core/types.js";

/**
 * The row above the table: search, filters, and the controls that change what
 * the table shows rather than what it contains.
 *
 * Not a `UioToolbar` — that is a `role="toolbar"` with roving focus, which is
 * right for a cluster of icon buttons and wrong for a row containing a text
 * input. The selection bar, which *is* a button cluster, does use it.
 *
 * ── Why the controls are inline rather than six exported parts ──────────────
 *
 * React, Vue and Svelte export `TableSearch`, `TableSortMenu`, `TableViewOptions`,
 * `TableExportMenu`, `TableActions` and `TableScrollButtons` separately, and each
 * renders exactly the element it is — a fragment, in effect. **An Angular
 * component always has a host element**, so each of those would put a node in
 * the DOM that the other three do not render, and every parity case would differ.
 *
 * A directive on the caller's element is the usual escape, and it does not work
 * here: these parts configure themselves *from the table* rather than from
 * bindings, so a host directive would need the caller to bind what the part
 * already knows.
 *
 * So Angular's layer 2 is one part coarser here. The toolbar is still a part —
 * `<div uioTableToolbar>` — and everything it composes is still core's decision;
 * what a consumer loses is the ability to reorder the six controls, which the
 * other three allow. Recorded rather than hidden.
 */
@Component({
  selector: "div[uioTableToolbar]",
  standalone: true,
  imports: [
    UioButton,
    UioDivider,
    UioMenu,
    UioMenuTrigger,
    UioMenuGroup,
    UioMenuGroupLabel,
    UioMenuItem,
    UioMenuCheckboxItem,
    UioMenuRadioGroup,
    UioMenuRadioItem,
    UioMenuSeparator,
    UioSearchInput,
  ],
  host: { class: "data-table__toolbar" },
  template: `
    @if (searchable()) {
      <div
        uioSearchInput
        class="data-table__search"
        [size]="table.size()"
        [value]="table.search()"
        placeholder="Search"
        [aria-label]="searchLabel()"
        (valueChange)="table.setSearch($event)"
      ></div>
    }
    <div class="data-table__toolbar-spacer"></div>

    <!--
      The developer's own header buttons. Real buttons rather than an overflow
      menu, because these are the actions a page is *for*: a primary action
      hidden behind a menu is a primary action nobody finds.
    -->
    @if (actions().length > 0) {
      <div class="data-table__toolbar-actions">
        @for (action of actions(); track action.id) {
          <button
            uioButton
            [intent]="action.intent ?? 'tertiary'"
            [size]="table.size()"
            [icon]="iconOf(action)"
            [disabled]="!!action.disabled"
            [attr.aria-label]="isIconOnly(action) ? action.label : null"
            (click)="action.onRun()"
          >
            @if (!isIconOnly(action)) {
              {{ action.label }}
            }
          </button>
        }
      </div>
      <!--
        Only when there is something on both sides of it. A rule with nothing to
        its left is a rule separating the toolbar from its own edge.
      -->
      <div uioDivider orientation="vertical" class="data-table__toolbar-divider"></div>
    }

    <!--
      Sorting from the header rather than from a column. The column headers
      already sort, so in table mode this is a convenience — in **card mode it is
      the only sort control there is**, and a table that silently loses the
      ability to sort at 640px is a table that is broken on phones.
    -->
    @if (sortMenu()) {
      <button
        uioButton
        uioMenuTrigger
        [menu]="sortMenuSurface"
        intent="secondary"
        [size]="table.size()"
        [icon]="sortIcon()"
        aria-label="Sort"
      ></button>
      <uio-menu #sortMenuSurface="uioMenu" align="end" class="data-table__sort-menu">
        <div uioMenuGroup>
          <div uioMenuGroupLabel>Sort by</div>
          <div uioMenuRadioGroup [value]="activeSortId()" (valueChange)="chooseColumn($event)">
            @for (column of sortableColumns(); track column.id) {
              <div uioMenuRadioItem [value]="column.id">{{ headerOf(column) }}</div>
            }
          </div>
        </div>
        <div uioMenuSeparator></div>
        <div uioMenuGroup>
          <div uioMenuGroupLabel>Direction</div>
          <div uioMenuRadioGroup [value]="sortDirection()" (valueChange)="chooseDirection($event)">
            <!--
              Disabled rather than hidden: the choice is always part of the
              menu's shape, and a menu that changes length as you use it is
              harder to aim at the second time.
            -->
            <div uioMenuRadioItem value="asc" [disabled]="!activeSortId()">Ascending</div>
            <div uioMenuRadioItem value="desc" [disabled]="!activeSortId()">Descending</div>
          </div>
        </div>
        @if (activeSortId()) {
          <div uioMenuSeparator></div>
          <div uioMenuItem value="clear-sorting" (select)="table.table.setSorting([])">
            Clear sorting
          </div>
        }
      </uio-menu>
    }

    @if (filterable() && filterFields().length > 0) {
      <!--
        aria-label on the trigger also names the menu it opens: the machine
        points the menu's aria-labelledby at its trigger, which wins over any
        aria-label on the content. So the button's name has to be the menu's name
        too — "Add filter", not "Filter".

        A field that already carries conditions stays in the list — several
        conditions on one column is the point — with a count so it is obvious
        this adds another rather than replacing.
      -->
      <button
        uioButton
        uioMenuTrigger
        [menu]="filterSurface"
        intent="secondary"
        [size]="table.size()"
        icon="filter"
        aria-label="Add filter"
      ></button>
      <uio-menu #filterSurface="uioMenu" align="end" class="data-table__filter-picker">
        @for (field of filterFields(); track field.columnId) {
          <div uioMenuItem [value]="field.columnId" (select)="table.filters.add(field.columnId)">
            {{ field.count > 0 ? field.label + " (" + field.count + ")" : field.label }}
          </div>
        }
      </uio-menu>
    }

    <!--
      Export scopes are separate items rather than one button, because "download"
      means three different things depending on what is filtered and what is
      ticked — and silently picking one is how an export loses rows.
    -->
    @if (exportable()) {
      <button
        uioButton
        uioMenuTrigger
        [menu]="exportSurface"
        intent="secondary"
        [size]="table.size()"
        icon="download"
        aria-label="Export"
      ></button>
      <uio-menu #exportSurface="uioMenu" align="end">
        <div uioMenuItem value="csv-view" icon="download" (select)="table.exportCsv('view')">
          Download this view (CSV)
        </div>
        <div
          uioMenuItem
          value="csv-selected"
          icon="download"
          [disabled]="!hasSelection()"
          (select)="table.exportCsv('selected')"
        >
          Download selected rows (CSV)
        </div>
        <div uioMenuItem value="csv-all" icon="download" (select)="table.exportCsv('all')">
          Download all rows (CSV)
        </div>
        <div uioMenuSeparator></div>
        <div
          uioMenuItem
          value="copy"
          icon="copy"
          [disabled]="!hasSelection()"
          (select)="table.copySelection('selected')"
        >
          Copy selection to clipboard
        </div>
      </uio-menu>
    }

    <!--
      Column visibility, and — when reordering is on — the keyboard-reachable
      half of reordering. A drag-only affordance fails the a11y gate, so the menu
      is the primary control and the drag is the enhancement.
    -->
    @if (hideable() && toggleable().length > 0) {
      <button
        uioButton
        uioMenuTrigger
        [menu]="columnsSurface"
        intent="secondary"
        [size]="table.size()"
        icon="settings"
        aria-label="Columns"
      ></button>
      <uio-menu #columnsSurface="uioMenu" align="end">
        <div uioMenuGroup>
          <div uioMenuGroupLabel>Visible columns</div>
          @for (column of toggleable(); track column.id) {
            <div
              uioMenuCheckboxItem
              [value]="column.id"
              [checked]="column.getIsVisible()"
              (checkedChange)="column.toggleVisibility($event)"
            >
              {{ headerOf(column) }}
            </div>
          }
        </div>
        @if (table.options.reorderable) {
          <div uioMenuSeparator></div>
          <div uioMenuGroup>
            <div uioMenuGroupLabel>Reset</div>
            <div uioMenuItem value="reset-order" (select)="table.table.resetColumnOrder()">
              Reset column order
            </div>
            <div uioMenuItem value="reset-sizing" (select)="table.table.resetColumnSizing()">
              Reset column widths
            </div>
          </div>
        }
      </uio-menu>
    }

    <!--
      Left and right, for a table wider than its viewport. The scrollbar is the
      primary affordance; this is the *visible* one. Absent rather than disabled
      when everything fits: a pair of permanently dead buttons in every toolbar
      is worse noise than no buttons at all.
    -->
    @if (scroll().overflowing) {
      <div class="data-table__scroll-buttons">
        <button
          uioButton
          intent="secondary"
          [size]="table.size()"
          icon="chevron-left"
          aria-label="Scroll left"
          [disabled]="!scroll().canScrollLeft"
          (click)="table.scroll.by(-1)"
        ></button>
        <button
          uioButton
          intent="secondary"
          [size]="table.size()"
          icon="chevron-right"
          aria-label="Scroll right"
          [disabled]="!scroll().canScrollRight"
          (click)="table.scroll.by(1)"
        ></button>
      </div>
    }
  `,
})
export class UioTableToolbar {
  protected readonly table = injectDataTable();

  protected readonly searchable = computed(() => this.table.options.searchable ?? true);
  protected readonly hideable = computed(() => this.table.options.hideableColumns ?? false);
  protected readonly exportable = computed(() => this.table.options.exportable ?? false);
  protected readonly filterable = computed(() => this.table.options.filterable ?? true);
  protected readonly actions = computed(() => this.table.options.actions ?? []);
  protected readonly scroll = computed(() => this.table.scroll.state());
  protected readonly hasSelection = computed(() => this.table.selection.count() > 0);
  protected readonly searchLabel = computed(() => `Search ${this.table.label()}`);
  protected readonly filterFields = computed(() => this.table.filters.fields());

  protected readonly sortableColumns = computed(() =>
    this.table.table.getAllLeafColumns().filter((column) => column.getCanSort()),
  );
  protected readonly toggleable = computed(() =>
    toggleableColumns(this.table.table.getAllLeafColumns()),
  );
  protected readonly sortMenu = computed(
    () =>
      (this.table.options.sortMenu ?? true) &&
      (this.table.options.sortable ?? true) &&
      this.sortableColumns().length > 0,
  );

  private readonly activeSort = computed(() => this.table.state().sorting?.[0]);
  protected readonly activeSortId = computed(() => this.activeSort()?.id ?? "");
  protected readonly sortDirection = computed(() => (this.activeSort()?.desc ? "desc" : "asc"));
  protected readonly sortIcon = computed<CanonicalIconName>(() =>
    this.activeSortId() ? (this.activeSort()?.desc ? "sort-desc" : "sort-asc") : "sort",
  );

  protected iconOf(action: TableAction): CanonicalIconName | undefined {
    return action.icon as CanonicalIconName | undefined;
  }
  // An icon-only button drops its visible label but keeps its accessible one —
  // the label is the whole name either way.
  protected isIconOnly(action: TableAction): boolean {
    return action.iconOnly === true && action.icon !== undefined;
  }
  protected headerOf(column: { id: string; columnDef: { header?: unknown } }): string {
    return typeof column.columnDef.header === "string" ? column.columnDef.header : column.id;
  }
  protected chooseColumn(id: string): void {
    this.table.table.setSorting(id ? [{ id, desc: this.sortDirection() === "desc" }] : []);
  }
  protected chooseDirection(next: string): void {
    const id = this.activeSortId();
    if (id) this.table.table.setSorting([{ id, desc: next === "desc" }]);
  }
}
