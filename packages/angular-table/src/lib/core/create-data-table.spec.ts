import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { signal } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { ACTIONS_COLUMN_ID, SELECTION_COLUMN_ID } from "@ui-organized/table-core";
import { createDataTable } from "./create-data-table.js";
import type { DataTableApi, TableColumn, UseDataTableOptions } from "./types.js";

/**
 * The factory, driven without a renderer.
 *
 * What is under test is the *binding*, not the behaviour: every decision about
 * what a sort does or what a shift-range covers lives in
 * `@ui-organized/table-core` and is unit-tested there as a pure function. These
 * assert the thing core cannot — that a factory which runs exactly once still
 * tracks its options, and that everything it hands back is a signal rather than
 * a snapshot of the first frame.
 *
 * That failure mode is why this file exists, and it bit this package twice: a
 * read accessor wrapped in `untracked` froze `data-selected` at whatever the
 * first render saw, and the table looked entirely correct while doing it.
 */

interface Member {
  id: string;
  name: string;
  role: string;
  seats: number;
}

const MEMBERS: Member[] = [
  { id: "1", name: "Ada", role: "Owner", seats: 3 },
  { id: "2", name: "Grace", role: "Admin", seats: 1 },
  { id: "3", name: "Alan", role: "Admin", seats: 7 },
];

const COLUMNS: TableColumn<Member>[] = [
  { accessorKey: "name", header: "Name", meta: { primary: true, filter: true } },
  { accessorKey: "role", header: "Role", meta: { filter: { type: "enum" } } },
  { accessorKey: "seats", header: "Seats", meta: { align: "end" } },
];

describe("createDataTable", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    TestBed.configureTestingModule({});
  });
  afterEach(() => {
    TestBed.resetTestingModule();
    vi.useRealTimers();
  });

  function mount(overrides: Partial<UseDataTableOptions<Member>> = {}) {
    const options = signal<UseDataTableOptions<Member>>({
      data: MEMBERS,
      columns: COLUMNS,
      label: "Members",
      getRowId: (row: Member) => row.id,
      ...overrides,
    });
    const api = TestBed.runInInjectionContext(() =>
      createDataTable<Member>(() => options()),
    ) as DataTableApi<Member>;
    /** Replace one option, the way a changed input would. */
    const set = (patch: Partial<UseDataTableOptions<Member>>) => {
      options.update((previous) => ({ ...previous, ...patch }));
      TestBed.tick();
    };
    return { api, set };
  }

  it("builds a table from the options it was given", () => {
    const { api } = mount();
    expect(api.rows()).toHaveLength(3);
    expect(api.rows().map((row) => row.id)).toEqual(["1", "2", "3"]);
    expect(api.label()).toBe("Members");
  });

  it("follows its options when they change", () => {
    // The one thing a factory can get wrong that a hook cannot: it runs once, so
    // an option read outside a `computed` is frozen at the first frame.
    const { api, set } = mount();
    set({ data: [...MEMBERS, { id: "4", name: "Katherine", role: "Analyst", seats: 2 }] });
    expect(api.rows()).toHaveLength(4);

    set({ size: "lg" });
    expect(api.size()).toBe("lg");
    expect(api.chrome().size).toBe("lg");
  });

  it("is a plain table until something can be operated", () => {
    // `interactive` is what decides `role="grid"` and the roving cursor, and it
    // is derived rather than declared — a table with nothing to operate stays a
    // plain table, which is both simpler and better announced.
    const { api, set } = mount();
    expect(api.interactive()).toBe(false);

    set({ selection: "multiple" });
    expect(api.interactive()).toBe(true);
  });

  it("sorts through the engine", () => {
    const { api } = mount();
    api.table.getColumn("name")!.toggleSorting(false);
    TestBed.tick();
    expect(api.rows().map((row) => row.original.name)).toEqual(["Ada", "Alan", "Grace"]);
  });

  it("filters on the deferred value, not the urgent one", () => {
    const { api } = mount({ searchable: true });
    // Settle the initial deferral first: until a pass has landed, the deferred
    // value falls through to the source, which is what makes SSR correct.
    TestBed.tick();
    vi.runAllTimers();
    TestBed.tick();

    api.setSearch("Ada");
    TestBed.tick();
    // The control is already showing the new value...
    expect(api.search()).toBe("Ada");
    // ...and the expensive pass has not run yet. This is the split the whole
    // package hangs on; see `create-deferred.ts`.
    expect(api.rows()).toHaveLength(3);

    vi.runAllTimers();
    TestBed.tick();
    expect(api.rows()).toHaveLength(1);
    expect(api.rows()[0]!.original.name).toBe("Ada");
  });

  it("renders seeded filters on the first pass", () => {
    // No scheduler has run, and none needs to: a table seeded with
    // `defaultFilters` has to be filtered before anything is scheduled, or a
    // server render emits the unfiltered rows.
    const { api } = mount({
      defaultFilters: [{ columnId: "role", operator: "is", values: ["Admin"] }],
    });
    expect(api.rows()).toHaveLength(2);
    expect(api.filters.conditions()).toHaveLength(1);
  });

  it("selects rows, and reports what the header checkbox should show", () => {
    const { api } = mount({ selection: "multiple" });
    expect(api.selection.header()).toEqual({ checked: false, indeterminate: false });

    api.selection.toggle("1", true);
    TestBed.tick();
    expect(api.selection.count()).toBe(1);
    expect(api.selection.isSelected("1")).toBe(true);
    expect(api.selection.header().indeterminate).toBe(true);

    api.selection.togglePage(true);
    TestBed.tick();
    expect(api.selection.count()).toBe(3);
    expect(api.selection.header()).toEqual({ checked: true, indeterminate: false });

    api.selection.clear();
    TestBed.tick();
    expect(api.selection.count()).toBe(0);
  });

  it("adds a system column for selection and one for row actions", () => {
    const { api, set } = mount({ selection: "multiple" });
    expect(api.table.getVisibleLeafColumns()[0]!.id).toBe(SELECTION_COLUMN_ID);

    set({ rowActions: [{ id: "edit", label: "Edit", onRun: () => {} }] });
    const ids = api.table.getVisibleLeafColumns().map((column) => column.id);
    expect(ids[0]).toBe(SELECTION_COLUMN_ID);
    expect(ids.at(-1)).toBe(ACTIONS_COLUMN_ID);
  });

  it("moves the cursor without taking focus, and reports it", () => {
    // `setCursor` follows focus that has already moved; `focusCell` takes it.
    // Merging the two broke inline editing in the React adapter — the editor's
    // input took focus, the cell's handler set the cursor, and the effect pulled
    // focus straight back out.
    const { api } = mount({ selection: "multiple" });
    expect(api.focus.cursor()).toEqual({ row: 0, col: 0 });

    api.focus.setCursor({ row: 1, col: 2 });
    TestBed.tick();
    expect(api.focus.cursor()).toEqual({ row: 1, col: 2 });
    expect(api.focus.isFocused(1, 2)).toBe(true);
    expect(api.focus.isFocused(0, 0)).toBe(false);
  });

  it("puts the tab stop in the header when there are no rows", () => {
    const { api } = mount({ data: [] });
    // Row -1 is the header, which is still operable (sorting) and still one tab
    // stop — a body with nothing in it has nowhere to hold one.
    expect(api.focus.cursor()).toEqual({ row: -1, col: 0 });
  });

  it("reports no horizontal overflow until something measures one", () => {
    // jsdom has no layout, so every width is zero and nothing overflows. The
    // assertion is that the state is *false* rather than undefined: a scroll
    // control renders on this, and `undefined` would render it permanently.
    const { api } = mount();
    expect(api.scroll.state()).toEqual({
      overflowing: false,
      canScrollLeft: false,
      canScrollRight: false,
    });
  });

  it("paginates, and counts the whole match rather than the page", () => {
    const { api } = mount({ paginated: true, pageSize: 2 });
    expect(api.rows()).toHaveLength(2);
    expect(api.selection.totalMatching()).toBe(3);

    api.table.setPageIndex(1);
    TestBed.tick();
    expect(api.rows()).toHaveLength(1);
    // `absoluteIndex` is what `aria-rowindex` reports, so it has to count from
    // the dataset rather than from the page.
    expect(api.renderRows()[0]!.absoluteIndex).toBe(2);
  });
});
