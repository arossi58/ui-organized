import { describe, it, expect, afterEach, beforeEach } from "vitest";
import { Component, provideZonelessChangeDetection } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { createDataTable } from "./core/create-data-table.js";
import { UIO_DATA_TABLE } from "./core/table-context.js";
import { UioTableSubBar } from "./components/table-sub-bar.js";
import { UioTableToolbar } from "./components/table-toolbar.js";
import type { BulkAction, DataTableApi, TableColumn, UseDataTableOptions } from "./core/types.js";

/**
 * While rows are selected, the bulk actions take the place of the toolbar's
 * own controls: deciding what to do with the selection comes before sorting or
 * filtering further. Asserted structurally — which element holds what — because
 * that is the part a stylesheet cannot recover from. Mirrors React's "the
 * selection's bulk actions" in `@ui-organized/react-table`.
 */

interface Row {
  id: string;
  name: string;
  role: string;
}

const DATA: Row[] = [
  { id: "1", name: "Ada", role: "Engineer" },
  { id: "2", name: "Grace", role: "Admiral" },
  { id: "3", name: "Alan", role: "Engineer" },
];

const COLUMNS: TableColumn<Row>[] = [
  { accessorKey: "name", header: "Name", meta: { primary: true, filter: true } },
  { accessorKey: "role", header: "Role", meta: { filter: { type: "enum" } } },
];

const BULK: BulkAction<Row>[] = [{ id: "export", label: "Export", onRun: () => {} }];

/**
 * The toolbar and sub-bar against a factory-built table, rather than the whole
 * `UioDataTable`: JIT registers no initializer-based input (see
 * `@ui-organized/angular`'s `select.spec.ts`), so the body's parts, whose
 * required inputs only a compiled template can bind, cannot mount here. The
 * rows are selected through the api; the keyboard path that does it is core's
 * and is tested there.
 */
let api: DataTableApi<Row>;

@Component({
  standalone: true,
  imports: [UioTableToolbar, UioTableSubBar],
  providers: [{ provide: UIO_DATA_TABLE, useFactory: () => api }],
  template: `
    <div uioTableToolbar></div>
    <div uioTableSubBar></div>
  `,
})
class Host {}

function mount() {
  const options: UseDataTableOptions<Row> = {
    label: "Team",
    columns: COLUMNS,
    data: DATA,
    getRowId: (row: Row) => row.id,
    selection: "multiple",
    bulkActions: BULK,
  };
  api = TestBed.runInInjectionContext(() => createDataTable<Row>(() => options));
  const fixture = TestBed.createComponent(Host);
  fixture.detectChanges();
  const dom = fixture.nativeElement as HTMLElement;
  const select = async () => {
    api.selection.toggle("1", true);
    TestBed.tick();
    await fixture.whenStable();
    fixture.detectChanges();
  };
  return { dom, select };
}

const toolbar = (dom: HTMLElement) => dom.querySelector(".data-table__toolbar");

describe("the selection's bulk actions", () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
  });
  afterEach(() => TestBed.resetTestingModule());

  it("are absent, and the sub-bar too, while nothing is filtered or selected", () => {
    const { dom } = mount();
    expect(dom.querySelector(".data-table__selection-bar")).toBeNull();
    expect(dom.querySelector(".data-table__subbar")).toBeNull();
    expect(toolbar(dom)?.querySelector('[aria-label="Add filter"]')).not.toBeNull();
  });

  it("replace the sort, filter and table actions in the toolbar row", async () => {
    const { dom, select } = mount();
    await select();

    const bar = toolbar(dom)?.querySelector(".data-table__selection-bar");
    expect(bar).not.toBeNull();
    // A plain labelled group, not a `role="toolbar"` with its own surface.
    expect(bar?.getAttribute("role")).toBe("group");
    expect(bar?.classList.contains("toolbar")).toBe(false);
    expect(toolbar(dom)?.querySelector('[aria-label="Add filter"]')).toBeNull();
    // Search stays: it narrows what is on screen, not what is selected.
    expect(toolbar(dom)?.querySelector('input[type="search"]')).not.toBeNull();
    expect(dom.querySelectorAll(".data-table__selection-bar")).toHaveLength(1);
  });

  // React's version renders chips and checks they stay below; the chips' own
  // required inputs need a compiled template, so here the other half: a
  // selection alone no longer brings the sub-bar up at all.
  it("do not bring up the row under the toolbar", async () => {
    const { dom, select } = mount();
    await select();

    expect(dom.querySelector(".data-table__subbar")).toBeNull();
    expect(
      dom.querySelector(".data-table__selection-bar")?.closest(".data-table__toolbar"),
    ).not.toBeNull();
  });
});
