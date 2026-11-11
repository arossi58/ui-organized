import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import {
  ElementRef,
  Injector,
  Renderer2,
  RendererFactory2,
  provideZonelessChangeDetection,
  runInInjectionContext,
  signal,
} from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { createDataTable } from "./core/create-data-table.js";
import { UIO_DATA_TABLE } from "./core/table-context.js";
import { UioTableHeadCell } from "./components/table-head-cell.js";
import { UioTableCell } from "./components/table-row.js";
import type { DataTableApi, TableColumn, UseDataTableOptions } from "./core/types.js";

/**
 * An editable column says so before anyone clicks — a pencil in its header and
 * a field-style hover on its cells — and one click opens the editor. Mirrors
 * React's "marks the editable column's header…" and "opens with one click…" in
 * `@ui-organized/react-table`.
 *
 * Neither part can mount here: JIT registers no initializer-based input (see
 * `selection-bar.spec.ts`), and both have required inputs. So each is built
 * directly in an injection context, with writable signals standing in for its
 * inputs and a real DOM renderer applying its props to a real element. That
 * covers the classes and the click; the pencil's markup is the template's, and
 * is asserted by the parity harness, which compiles it.
 */

interface Row {
  id: string;
  name: string;
  seats: number;
}

const DATA: Row[] = [
  { id: "1", name: "Ada", seats: 3 },
  { id: "2", name: "Grace", seats: 1 },
];

const COLUMNS: TableColumn<Row>[] = [
  { accessorKey: "name", header: "Name", meta: { primary: true } },
  { accessorKey: "seats", header: "Seats", meta: { edit: { render: () => null } } },
];

let api: DataTableApi<Row>;

function build<C>(make: () => C): { part: C; element: HTMLElement } {
  const element = document.createElement("td");
  const renderer = TestBed.inject(RendererFactory2).createRenderer(null, null);
  const injector = Injector.create({
    parent: TestBed.inject(Injector),
    providers: [
      { provide: ElementRef, useValue: new ElementRef(element) },
      { provide: Renderer2, useValue: renderer },
    ],
  });
  const part = runInInjectionContext(injector, make);
  TestBed.tick();
  return { part, element };
}

function setup() {
  const options: UseDataTableOptions<Row> = {
    label: "Team",
    columns: COLUMNS,
    data: DATA,
    getRowId: (row: Row) => row.id,
    onEdit: () => {},
  };
  api = TestBed.runInInjectionContext(() => createDataTable<Row>(() => options));
}

/** What the stand-in inputs start with; read by the field initialisers below. */
let inputs: Record<string, unknown> = {};

class HeadCell extends UioTableHeadCell<Row> {
  override readonly header = signal(inputs["header"]) as never;
  override readonly index = signal(inputs["index"]) as never;
}

class Cell extends UioTableCell<Row> {
  override readonly cell = signal(inputs["cell"]) as never;
  override readonly row = signal(inputs["row"]) as never;
  override readonly index = signal(inputs["index"]) as never;
  override readonly rowIndex = signal(0) as never;
  override readonly primary = signal(inputs["primary"]) as never;
}

function headCell(columnIndex: number) {
  inputs = { header: api.table.getHeaderGroups()[0]!.headers[columnIndex], index: columnIndex };
  return build(() => new HeadCell());
}

function bodyCell(columnIndex: number) {
  const row = api.table.getRowModel().rows[0]!;
  inputs = {
    cell: row.getVisibleCells()[columnIndex],
    row,
    index: columnIndex,
    primary: columnIndex === 0,
  };
  return build(() => new Cell());
}

describe("inline editing affordances", () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        { provide: UIO_DATA_TABLE, useFactory: () => api },
      ],
    });
    setup();
  });
  afterEach(() => TestBed.resetTestingModule());

  it("marks the editable column's header and cells, and only those", () => {
    expect(headCell(1).element.classList.contains("data-table__head-cell--editable")).toBe(true);
    expect(headCell(0).element.classList.contains("data-table__head-cell--editable")).toBe(false);
    expect(bodyCell(1).element.classList.contains("data-table__cell--editable")).toBe(true);
    expect(bodyCell(0).element.classList.contains("data-table__cell--editable")).toBe(false);
  });

  it("opens with one click, and a click inside the editor keeps the draft", () => {
    const { part } = bodyCell(1);
    const click = () => {
      const event = new MouseEvent("click", { bubbles: true });
      const stop = vi.spyOn(event, "stopPropagation");
      (part as unknown as { onClick: (event: Event) => void }).onClick(event);
      return stop;
    };

    // One click, not two — and it stops there, so the row does not activate.
    expect(click()).toHaveBeenCalled();
    expect(api.edit.state().target).toEqual({ rowId: "1", columnId: "seats" });

    api.edit.setValue(9);
    click();
    expect(api.edit.state().draft).toBe(9);
  });

  it("leaves a read-only cell's click to the row", () => {
    const { part } = bodyCell(0);
    const event = new MouseEvent("click", { bubbles: true });
    const stop = vi.spyOn(event, "stopPropagation");
    (part as unknown as { onClick: (event: Event) => void }).onClick(event);
    expect(stop).not.toHaveBeenCalled();
    expect(api.edit.state().target).toBeNull();
  });
});
