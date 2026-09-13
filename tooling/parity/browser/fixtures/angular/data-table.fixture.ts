import { Component } from "@angular/core";
import { UioDataTable, type TableColumn } from "@ui-organized/angular-table";
import {
  MEMBERS,
  columnsFor,
  memberRowId,
  type ColumnSet,
  type Member,
} from "../../../src/fixtures/tableFixture.js";
import { ANGULAR_ROOT, parityProps } from "./parity-props.js";

/**
 * The same table the React builder composes, from the same data and the same
 * columns — see `src/fixtures/tableFixture.ts` for why the shape is shared and
 * only the switches travel in the case.
 *
 * Angular's wrapper takes one `input()` per option rather than a props object,
 * so the case's switches are unpacked here. That is the shape difference the
 * plan predicted; it costs length, not correctness.
 */
@Component({
  selector: ANGULAR_ROOT,
  standalone: true,
  imports: [UioDataTable],
  template: `
    <div
      uioDataTable
      [data]="data"
      [columns]="columns"
      [getRowId]="rowId"
      label="Members"
      [captionVisible]="!!p['captionVisible']"
      [size]="p['size'] ?? 'md'"
      [variant]="p['variant'] ?? 'default'"
      [selection]="p['selection'] ?? 'none'"
      [paginated]="!!p['paginated']"
      [pageSize]="p['pageSize']"
      [searchable]="p['searchable'] ?? true"
      [loading]="!!p['loading']"
      [virtual]="p['virtual'] ?? true"
      [maxHeight]="p['maxHeight']"
      [empty]="p['empty']"
      [rowActions]="rowActions"
      [defaultSorting]="p['defaultSorting']"
      [defaultColumnVisibility]="p['defaultColumnVisibility']"
      [defaultFilters]="p['defaultFilters']"
    ></div>
  `,
})
export class DataTableFixture {
  protected readonly p = parityProps();
  protected readonly rowId = memberRowId;
  protected readonly data = (this.p["noData"] ? [] : MEMBERS) as Member[];
  protected readonly columns = columnsFor(
    this.p["columnSet"] as ColumnSet,
  ) as unknown as TableColumn<Member>[];
  // The functions the case cannot carry, built here — the one place a fixture
  // writes framework-specific code, and exactly what a consumer writes.
  protected readonly rowActions = this.p["rowActions"]
    ? [
        { id: "edit", label: "Edit", onRun: () => {} },
        { id: "remove", label: "Remove", destructive: true, onRun: () => {} },
      ]
    : undefined;
}
