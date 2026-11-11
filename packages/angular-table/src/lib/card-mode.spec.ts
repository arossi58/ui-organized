import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import {
  Component,
  Injector,
  provideZonelessChangeDetection,
  runInInjectionContext,
  signal,
} from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { createDataTable } from "./core/create-data-table.js";
import { UIO_DATA_TABLE } from "./core/table-context.js";
import { UioTableRowActions } from "./components/table-row-actions.js";
import { UioTableSubBar } from "./components/table-sub-bar.js";
import { UioTableToolbar } from "./components/table-toolbar.js";
import type { DataTableApi, TableColumn, UseDataTableOptions } from "./core/types.js";

/**
 * Card mode is the phone layout. Sort and filter open sheets from labelled
 * buttons that count what is applied, and the chips row goes away. Mirrors
 * React's "card mode" in `@ui-organized/react-table`.
 *
 * The toolbar and sub-bar are mounted against a factory-built table, as in
 * `selection-bar.spec.ts`: JIT registers no initializer-based input, so a part
 * with a required input — a card, a filter row in the sheet — can only mount
 * from a compiled template. The card's header order is checked in the browser
 * for that reason; what is asserted here is everything a JIT template can show.
 */

interface Row {
  id: string;
  name: string;
  role: string;
}

const DATA: Row[] = [
  { id: "1", name: "Ada", role: "Engineer" },
  { id: "2", name: "Grace", role: "Admiral" },
];

const COLUMNS: TableColumn<Row>[] = [
  { accessorKey: "name", header: "Name", meta: { primary: true, filter: true } },
  { accessorKey: "role", header: "Role", meta: { filter: { type: "enum" } } },
];

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

/** The sub-bar alone: with a filter applied, the toolbar's sheet would render a
 * filter row, whose required inputs only a compiled template can bind. */
@Component({
  standalone: true,
  imports: [UioTableSubBar],
  providers: [{ provide: UIO_DATA_TABLE, useFactory: () => api }],
  template: `<div uioTableSubBar></div>`,
})
class SubBarHost {}

function mount(extra: Partial<UseDataTableOptions<Row>> = {}, host: typeof Host = Host) {
  const options: UseDataTableOptions<Row> = {
    label: "Team",
    columns: COLUMNS,
    data: DATA,
    getRowId: (row: Row) => row.id,
    responsive: { mode: "cards" },
    ...extra,
  };
  api = TestBed.runInInjectionContext(() => createDataTable<Row>(() => options));
  const fixture = TestBed.createComponent(host);
  fixture.detectChanges();
  return fixture.nativeElement as HTMLElement;
}

const button = (dom: HTMLElement, name: RegExp) =>
  [...dom.querySelectorAll<HTMLButtonElement>(".data-table__toolbar button")].find((b) =>
    name.test(b.textContent?.trim() ?? ""),
  );

describe("card mode", () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
  });
  afterEach(() => TestBed.resetTestingModule());

  it("swaps the sort and filter menus for sheet buttons, counted by badges", () => {
    const dom = mount({ defaultSorting: [{ id: "name", desc: false }] });
    const sort = button(dom, /^Sort/);
    expect(sort?.getAttribute("aria-haspopup")).toBe("dialog");
    expect(sort?.querySelector(".data-table__badge")?.textContent?.trim()).toBe("1");
    expect(sort?.textContent).toContain(", 1 applied");
    expect(button(dom, /^Filter/)?.getAttribute("aria-haspopup")).toBe("dialog");
    // The desktop funnel and the icon-only sort menu are gone.
    expect(dom.querySelector('.data-table__toolbar [aria-label="Add filter"]')).toBeNull();
    expect(dom.querySelector('.data-table__toolbar [aria-label="Sort"]')).toBeNull();
  });

  it("shows no badge while nothing is applied", () => {
    const dom = mount();
    expect(button(dom, /^Filter/)?.querySelector(".data-table__badge")).toBeNull();
    expect(button(dom, /^Sort/)?.querySelector(".data-table__badge")).toBeNull();
  });

  it("keeps the table mode's menus outside card mode", () => {
    const dom = mount({ responsive: { mode: "table" } });
    expect(dom.querySelector('.data-table__toolbar [aria-label="Add filter"]')).not.toBeNull();
    expect(button(dom, /^Filter/)).toBeUndefined();
  });

  it("renders no chips row, which the filter sheet replaces", () => {
    const filter = [{ columnId: "role", operator: "is-any-of", values: ["Engineer"] }];
    expect(
      mount({ defaultFilters: filter }, SubBarHost).querySelector(".data-table__subbar"),
    ).toBeNull();
  });
});

/**
 * Row actions are the card's actions menu. Their picks come back through the
 * menu's own `(select)` with the item's value; `(select)` on an item binds a DOM
 * event `UioMenuItem` never fires, which left every row action inert.
 */
describe("row actions", () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
  });
  afterEach(() => TestBed.resetTestingModule());

  function build(onRun: () => void, disabled?: () => boolean) {
    api = TestBed.runInInjectionContext(() =>
      createDataTable<Row>(() => ({
        label: "Team",
        columns: COLUMNS,
        data: DATA,
        getRowId: (row: Row) => row.id,
        rowActions: [{ id: "edit", label: "Edit", onRun, disabled }],
      })),
    );
    const injector = Injector.create({
      parent: TestBed.inject(Injector),
      providers: [{ provide: UIO_DATA_TABLE, useValue: api }],
    });
    const part = runInInjectionContext(injector, () => new UioTableRowActions<Row>());
    // The required input, stood in for by a writable signal.
    (part as unknown as { row: unknown }).row = signal(DATA[0]);
    return part as unknown as { run: (id: string) => void };
  }

  it("runs the action whose value the menu reports", () => {
    const onRun = vi.fn();
    build(onRun).run("edit");
    expect(onRun).toHaveBeenCalledWith(DATA[0]);
  });

  it("does not run a disabled action, or one it does not know", () => {
    const onRun = vi.fn();
    const part = build(onRun, () => true);
    part.run("edit");
    part.run("nope");
    expect(onRun).not.toHaveBeenCalled();
  });
});
