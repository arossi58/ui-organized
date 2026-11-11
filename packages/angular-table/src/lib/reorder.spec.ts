import { describe, it, expect, afterEach, beforeEach } from "vitest";
import { Component, provideZonelessChangeDetection } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { createDataTable } from "./core/create-data-table.js";
import { UIO_DATA_TABLE } from "./core/table-context.js";
import { UioTableToolbar } from "./components/table-toolbar.js";
import type { DataTableApi, TableColumn, UseDataTableOptions } from "./core/types.js";

/**
 * Column reordering, through the api the header cells call. The header cells
 * themselves need a compiled template to mount (see selection-bar.spec.ts), so
 * the move buttons and the drag are covered by React's tests and the browser;
 * this pins the behaviour they drive. Mirrors React's "column reordering".
 */

interface Row {
  id: string;
  name: string;
  role: string;
  seats: number;
}

const DATA: Row[] = [
  { id: "1", name: "Ada", role: "Engineer", seats: 3 },
  { id: "2", name: "Grace", role: "Admiral", seats: 1 },
];

const COLUMNS: TableColumn<Row>[] = [
  { accessorKey: "name", header: "Name", meta: { primary: true } },
  { accessorKey: "role", header: "Role" },
  { accessorKey: "seats", header: "Seats" },
];

let api: DataTableApi<Row>;

function build(extra: Partial<UseDataTableOptions<Row>>) {
  const options: UseDataTableOptions<Row> = {
    label: "Team",
    columns: COLUMNS,
    data: DATA,
    getRowId: (row: Row) => row.id,
    ...extra,
  };
  api = TestBed.runInInjectionContext(() => createDataTable<Row>(() => options));
  return api;
}

const order = () =>
  api.table
    .getVisibleLeafColumns()
    .map((column) => column.id)
    .filter((id) => !id.startsWith("__"));

describe("column reordering", () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
  });
  afterEach(() => TestBed.resetTestingModule());

  it("is off unless asked for", () => {
    build({});
    expect(api.reorder.mode()).toBe("off");
    expect(api.reorder.active()).toBe(false);
    expect(api.reorder.canMove("name", 1)).toBe(false);
  });

  it("moves a column one place, and not past either end", () => {
    build({ reorderable: "always" });
    expect(api.reorder.active()).toBe(true);
    expect(api.reorder.canMove("name", -1)).toBe(false);
    expect(api.reorder.canMove("seats", 1)).toBe(false);

    api.reorder.move("name", 1);
    TestBed.tick();
    expect(order()).toEqual(["role", "name", "seats"]);
    api.reorder.move("seats", -1);
    TestBed.tick();
    expect(order()).toEqual(["role", "seats", "name"]);
  });

  it("reads true as always", () => {
    build({ reorderable: true });
    expect(api.reorder.mode()).toBe("always");
    expect(api.reorder.active()).toBe(true);
  });

  it("drops a dragged column before or after another", () => {
    build({ reorderable: "always" });
    api.reorder.drop("name", "seats", "after");
    TestBed.tick();
    expect(order()).toEqual(["role", "seats", "name"]);
    api.reorder.drop("name", "role", "before");
    TestBed.tick();
    expect(order()).toEqual(["name", "role", "seats"]);
  });

  it("in toggle mode, moves only inside reorder mode", () => {
    build({ reorderable: "toggle" });
    expect(api.reorder.active()).toBe(false);
    api.reorder.move("name", 1);
    TestBed.tick();
    expect(order()).toEqual(["name", "role", "seats"]);

    api.reorder.setActive(true);
    expect(api.reorder.active()).toBe(true);
    api.reorder.move("name", 1);
    TestBed.tick();
    expect(order()).toEqual(["role", "name", "seats"]);
  });

  it("leaves the table's own columns and pinned ones where they are", () => {
    build({
      reorderable: "always",
      selection: "multiple",
      columns: [
        { accessorKey: "name", header: "Name", meta: { primary: true, sticky: "left" } },
        { accessorKey: "role", header: "Role" },
        { accessorKey: "seats", header: "Seats" },
      ],
    });
    const selectId = api.table.getVisibleLeafColumns()[0]!.id;
    expect(api.reorder.isMovable(selectId)).toBe(false);
    expect(api.reorder.isMovable("name")).toBe(false);
    expect(api.reorder.isMovable("role")).toBe(true);
    // The first unpinned column cannot step left past the pinned one.
    expect(api.reorder.canMove("role", -1)).toBe(false);
  });
});

@Component({
  standalone: true,
  imports: [UioTableToolbar],
  providers: [{ provide: UIO_DATA_TABLE, useFactory: () => api }],
  template: `<div uioTableToolbar></div>`,
})
class ToolbarHost {}

describe("the reorder toggle", () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
  });
  afterEach(() => TestBed.resetTestingModule());

  const mount = () => {
    const fixture = TestBed.createComponent(ToolbarHost);
    fixture.detectChanges();
    return { fixture, dom: fixture.nativeElement as HTMLElement };
  };
  const toggle = (dom: HTMLElement) =>
    dom.querySelector<HTMLButtonElement>(
      'button[aria-label="Reorder columns"], button[aria-label="Done reordering columns"]',
    );

  it("is absent unless reorderable is toggle", () => {
    build({ reorderable: "always" });
    expect(toggle(mount().dom)).toBeNull();
  });

  it("switches reorder mode, and says what a press does next", async () => {
    build({ reorderable: "toggle" });
    const { fixture, dom } = mount();
    expect(toggle(dom)?.textContent?.trim()).toBe("Reorder");
    expect(toggle(dom)?.getAttribute("aria-label")).toBe("Reorder columns");

    toggle(dom)?.click();
    TestBed.tick();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(api.reorder.active()).toBe(true);
    expect(toggle(dom)?.textContent?.trim()).toBe("Done");
    expect(toggle(dom)?.getAttribute("aria-label")).toBe("Done reordering columns");
  });
});
