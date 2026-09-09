import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { flushSync } from "svelte";
import { createDataTable } from "./createDataTable.svelte.js";
import type { DataTableApi, TableColumn, UseDataTableOptions } from "./types.js";

/**
 * The rune layer, driven without a component.
 *
 * What is under test is the *binding*, not the behaviour: every decision about
 * what a sort does or what a shift-range covers lives in
 * `@ui-organized/table-core` and is unit-tested there as a pure function. These
 * assert the thing core cannot — that the options getter is followed, and that
 * every state change reaches the engine and comes back out of `rows`.
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
  { id: "4", name: "Katherine", role: "Analyst", seats: 2 },
];

const COLUMNS: TableColumn<Member>[] = [
  { accessorKey: "name", header: "Name", meta: { primary: true, filter: true } },
  { accessorKey: "role", header: "Role", meta: { filter: { type: "enum" } } },
  { accessorKey: "seats", header: "Seats", meta: { align: "end" } },
];

describe("createDataTable", () => {
  let dispose: (() => void) | null = null;

  beforeEach(() => vi.useFakeTimers());
  afterEach(() => {
    dispose?.();
    dispose = null;
    vi.useRealTimers();
  });

  /**
   * `$effect.root` because the runes inside `createDataTable` need an owner and
   * there is no component here — the same thing a component's lifetime provides.
   */
  function mount(overrides: Partial<UseDataTableOptions<Member>> = {}) {
    let options = $state<UseDataTableOptions<Member>>({
      data: MEMBERS,
      columns: COLUMNS,
      label: "Members",
      getRowId: (row: Member) => row.id,
      ...overrides,
    });
    let api!: DataTableApi<Member>;
    dispose = $effect.root(() => {
      api = createDataTable<Member>(() => options);
    });
    flushSync();
    return {
      get api() {
        return api;
      },
      set: (patch: Partial<UseDataTableOptions<Member>>) => {
        options = { ...options, ...patch };
        flushSync();
      },
    };
  }

  it("builds a table from the options it was given", () => {
    const { api } = mount();
    expect(api.rows).toHaveLength(4);
    expect(api.rows.map((row) => row.id)).toEqual(["1", "2", "3", "4"]);
    expect(api.label).toBe("Members");
    expect(api.primaryColumnId).toBe("name");
  });

  it("follows its options when they change", () => {
    // The options arrive as a getter precisely so this works; a snapshot taken
    // at construction would render a correct table that never changes again.
    const table = mount();
    table.set({ data: [...MEMBERS, { id: "5", name: "Linus", role: "Admin", seats: 4 }] });
    expect(table.api.rows).toHaveLength(5);

    table.set({ size: "lg" });
    expect(table.api.size).toBe("lg");
    expect(table.api.chrome.size).toBe("lg");
  });

  it("is a plain table until something can be operated", () => {
    // `interactive` is what decides `role="grid"` and the roving cursor, and it
    // is derived rather than declared.
    const table = mount();
    expect(table.api.interactive).toBe(false);
    table.set({ selection: "multiple" });
    expect(table.api.interactive).toBe(true);
  });

  it("sorts through the engine", () => {
    const { api } = mount();
    api.table.getColumn("name")!.toggleSorting(false);
    flushSync();
    expect(api.rows.map((row) => row.original.name)).toEqual([
      "Ada",
      "Alan",
      "Grace",
      "Katherine",
    ]);
  });

  it("paginates, and moves when the page is set", () => {
    // The path the browser gate's "paged forward" scenario drives: a control
    // calls `setPageIndex`, which lands on `onPaginationChange`, which has to
    // reach the row model.
    const { api } = mount({ paginated: true, pageSize: 2 });
    expect(api.rows).toHaveLength(2);
    expect(api.rows[0]!.id).toBe("1");

    api.table.setPageIndex(1);
    flushSync();
    expect(api.rows[0]!.id).toBe("3");
    // `absoluteIndex` is what `aria-rowindex` reports, so it counts from the
    // dataset rather than from the page.
    expect(api.renderRows[0]!.absoluteIndex).toBe(2);
  });

  it("filters on the deferred value, not the urgent one", async () => {
    const { api } = mount();
    api.setSearch("Ada");
    flushSync();
    // The control is already showing the new value...
    expect(api.search).toBe("Ada");
    // ...and the expensive pass has not run yet.
    expect(api.rows).toHaveLength(4);

    await vi.runAllTimersAsync();
    flushSync();
    expect(api.rows).toHaveLength(1);
    expect(api.rows[0]!.original.name).toBe("Ada");
  });

  it("renders seeded filters on the first pass", () => {
    // No scheduler has run, and none needs to: a table seeded with
    // `defaultFilters` has to be filtered before anything is scheduled.
    const { api } = mount({
      defaultFilters: [{ columnId: "role", operator: "is", values: ["Admin"] }],
    });
    expect(api.rows).toHaveLength(2);
    expect(api.filters.conditions).toHaveLength(1);
  });

  it("selects rows, and reports what the header checkbox should show", () => {
    const { api } = mount({ selection: "multiple" });
    expect(api.selection.header).toEqual({ checked: false, indeterminate: false });

    api.selection.toggle("1", true);
    flushSync();
    expect(api.selection.count).toBe(1);
    expect(api.selection.isSelected("1")).toBe(true);
    expect(api.selection.header.indeterminate).toBe(true);

    api.selection.togglePage(true);
    flushSync();
    expect(api.selection.count).toBe(4);
    expect(api.selection.header).toEqual({ checked: true, indeterminate: false });
  });

  it("puts the tab stop in the header when there are no rows", () => {
    const { api } = mount({ data: [] });
    // Row -1 is the header, which is still operable (sorting) and still one tab
    // stop — a body with nothing in it has nowhere to hold one.
    expect(api.focus.cursor).toEqual({ row: -1, col: 0 });
  });
});
