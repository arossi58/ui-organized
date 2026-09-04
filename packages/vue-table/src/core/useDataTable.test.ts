import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { effectScope, nextTick, reactive } from "vue";
import { ACTIONS_COLUMN_ID, SELECTION_COLUMN_ID } from "@ui-organized/table-core";
import { useDataTable } from "./useDataTable.js";
import type { DataTableApi, TableColumn } from "./types.js";

/**
 * The composable, driven without a renderer.
 *
 * What is under test is the *binding*, not the behaviour: every decision about
 * what a sort does or what a shift-range covers lives in
 * `@ui-organized/table-core` and is unit-tested there as a pure function. These
 * assert the thing core cannot — that a Vue composable which runs exactly once
 * still tracks its options, and that everything it hands back is reactive rather
 * than a snapshot of the first frame.
 *
 * That failure mode is the reason this file exists. A composable that returned
 * plain values instead of computeds renders a correct table and then never
 * changes again, and nothing about the first frame looks wrong.
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

describe("useDataTable", () => {
  let scope: ReturnType<typeof effectScope>;

  beforeEach(() => {
    vi.useFakeTimers();
    scope = effectScope();
  });
  afterEach(() => {
    scope.stop();
    vi.useRealTimers();
  });

  function mount(overrides: Partial<Parameters<typeof useDataTable<Member>>[0]> = {}) {
    const options = reactive({
      data: MEMBERS,
      columns: COLUMNS,
      label: "Members",
      getRowId: (row: Member) => row.id,
      ...overrides,
    }) as Parameters<typeof useDataTable<Member>>[0];
    const api = scope.run(() => useDataTable<Member>(options))! as DataTableApi<Member>;
    // The options bag is written to by these tests to prove the composable
    // follows it, which its own type does not allow — it describes what a caller
    // passes in, not a mutable record.
    return { api, options: options as unknown as Record<string, unknown> };
  }

  it("builds a table from the options it was given", () => {
    const { api } = mount();
    expect(api.rows.value).toHaveLength(3);
    expect(api.rows.value.map((row) => row.id)).toEqual(["1", "2", "3"]);
    expect(api.label.value).toBe("Members");
    expect(api.primaryColumnId.value).toBe("name");
  });

  it("follows its options when they change", async () => {
    // The one thing a composable can get wrong that a hook cannot: it runs once,
    // so an option read outside a computed is frozen at the first frame.
    const { api, options } = mount();
    options.data = [...MEMBERS, { id: "4", name: "Katherine", role: "Analyst", seats: 2 }];
    await nextTick();
    expect(api.rows.value).toHaveLength(4);

    options.size = "lg";
    await nextTick();
    expect(api.size.value).toBe("lg");
    expect(api.chrome.value.size).toBe("lg");
  });

  it("is a plain table until something can be operated", async () => {
    // `interactive` is what decides `role="grid"` and the roving cursor, and it
    // is derived rather than declared — a table with nothing to operate stays a
    // plain table, which is both simpler and better announced.
    const { api, options } = mount();
    expect(api.interactive.value).toBe(false);

    options.selection = "multiple";
    await nextTick();
    expect(api.interactive.value).toBe(true);
  });

  it("sorts through the engine", async () => {
    const { api } = mount();
    api.table.getColumn("name")!.toggleSorting(false);
    await nextTick();
    expect(api.rows.value.map((row) => row.original.name)).toEqual(["Ada", "Alan", "Grace"]);
  });

  it("filters on the deferred value, not the urgent one", async () => {
    const { api } = mount({ searchable: true } as never);
    api.setSearch("Ada");
    await nextTick();
    // The control is already showing the new value...
    expect(api.search.value).toBe("Ada");
    // ...and the expensive pass has not run yet. This is the split the whole
    // package hangs on; see `useDeferred.ts`.
    expect(api.rows.value).toHaveLength(3);

    await vi.runAllTimersAsync();
    expect(api.rows.value).toHaveLength(1);
    expect(api.rows.value[0]!.original.name).toBe("Ada");
  });

  it("renders seeded filters on the first pass", async () => {
    // No scheduler has run, and none needs to: a table seeded with
    // `defaultFilters` has to be filtered before anything is scheduled, or a
    // server render emits the unfiltered rows.
    const { api } = mount({
      defaultFilters: [{ columnId: "role", operator: "is", values: ["Admin"] }],
    } as never);
    expect(api.rows.value).toHaveLength(2);
    expect(api.filters.conditions.value).toHaveLength(1);
  });

  it("selects rows, and reports what the header checkbox should show", async () => {
    const { api } = mount({ selection: "multiple" } as never);
    expect(api.selection.header.value).toEqual({ checked: false, indeterminate: false });

    api.selection.toggle("1", true);
    await nextTick();
    expect(api.selection.count.value).toBe(1);
    expect(api.selection.isSelected("1")).toBe(true);
    expect(api.selection.header.value.indeterminate).toBe(true);

    api.selection.togglePage(true);
    await nextTick();
    expect(api.selection.count.value).toBe(3);
    expect(api.selection.header.value).toEqual({ checked: true, indeterminate: false });

    api.selection.clear();
    await nextTick();
    expect(api.selection.count.value).toBe(0);
  });

  it("adds a system column for selection and one for row actions", async () => {
    const { api, options } = mount({ selection: "multiple" } as never);
    expect(api.table.getVisibleLeafColumns()[0]!.id).toBe(SELECTION_COLUMN_ID);

    options.rowActions = [{ id: "edit", label: "Edit", onRun: () => {} }];
    await nextTick();
    const ids = api.table.getVisibleLeafColumns().map((column) => column.id);
    expect(ids[0]).toBe(SELECTION_COLUMN_ID);
    expect(ids.at(-1)).toBe(ACTIONS_COLUMN_ID);
  });

  it("moves the cursor without taking focus, and reports it", () => {
    // `setCursor` follows focus that has already moved; `focusCell` takes it.
    // Merging the two broke inline editing in the React adapter — the editor's
    // input took focus, the cell's handler set the cursor, and the effect pulled
    // focus straight back out.
    const { api } = mount({ selection: "multiple" } as never);
    expect(api.focus.cursor.value).toEqual({ row: 0, col: 0 });

    api.focus.setCursor({ row: 1, col: 2 });
    expect(api.focus.cursor.value).toEqual({ row: 1, col: 2 });
    expect(api.focus.isFocused(1, 2)).toBe(true);
    expect(api.focus.isFocused(0, 0)).toBe(false);
  });

  it("puts the tab stop in the header when there are no rows", () => {
    const { api } = mount({ data: [] } as never);
    // Row -1 is the header, which is still operable (sorting) and still one tab
    // stop — a body with nothing in it has nowhere to hold one.
    expect(api.focus.cursor.value).toEqual({ row: -1, col: 0 });
  });

  it("reports no horizontal overflow until something measures one", () => {
    // jsdom has no layout, so every width is zero and nothing overflows. The
    // assertion is that the state is *false* rather than undefined: a scroll
    // control renders on this, and `undefined` would render it permanently.
    const { api } = mount();
    expect(api.scroll.state.value).toEqual({
      overflowing: false,
      canScrollLeft: false,
      canScrollRight: false,
    });
  });

  it("paginates, and counts the whole match rather than the page", async () => {
    const { api } = mount({ paginated: true, pageSize: 2 } as never);
    expect(api.rows.value).toHaveLength(2);
    expect(api.selection.totalMatching.value).toBe(3);

    api.table.setPageIndex(1);
    await nextTick();
    expect(api.rows.value).toHaveLength(1);
    // `absoluteIndex` is what `aria-rowindex` reports, so it has to count from
    // the dataset rather than from the page.
    expect(api.renderRows.value[0]!.absoluteIndex).toBe(2);
  });
});
