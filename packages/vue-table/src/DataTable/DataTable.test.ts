import { afterEach, beforeAll, describe, expect, it } from "vitest";
import { createApp, h, nextTick, type App } from "vue";
import { registerIconSet } from "@ui-organized/vue";
import DataTable from "./DataTable.vue";
import type { TableColumn, TableFilterInput } from "../core/types.js";

/**
 * The markup contract for where the selection's bulk actions sit, mirroring
 * React's "the selection's bulk actions" suite.
 *
 * While rows are selected, the bulk actions take the place of the toolbar's own
 * controls: deciding what to do with the selection comes before sorting or
 * filtering further. Asserted structurally — which element holds what —
 * because that is the part a stylesheet cannot recover from.
 */

interface Row {
  id: string;
  name: string;
  role: string;
  seats: number;
}

const DATA: Row[] = [
  { id: "a", name: "Ada", role: "Engineer", seats: 3 },
  { id: "b", name: "Grace", role: "Admin", seats: 1 },
  { id: "c", name: "Alan", role: "Engineer", seats: 7 },
];

const COLUMNS: TableColumn<Row>[] = [
  { accessorKey: "name", header: "Name", meta: { primary: true } },
  { accessorKey: "role", header: "Role", meta: { filter: true } },
  { accessorKey: "seats", header: "Seats", meta: { align: "end" } },
];

let app: App | undefined;

beforeAll(() => {
  // A stub set, so icons resolve without the "no icon set registered" warning.
  registerIconSet({
    library: "lucide",
    outline: new Proxy({}, { get: () => () => null }),
    svgProps: () => ({}),
  } as never);
  // The virtualizer and the responsive watcher both want one; jsdom ships neither.
  globalThis.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
  globalThis.matchMedia ??= ((query: string) => ({
    matches: false,
    media: query,
    addEventListener() {},
    removeEventListener() {},
  })) as unknown as typeof matchMedia;
});

afterEach(() => {
  app?.unmount();
  app = undefined;
  document.body.innerHTML = "";
});

async function withBulk(defaultFilters?: TableFilterInput[]) {
  const container = document.createElement("div");
  document.body.append(container);
  app = createApp({
    render: () =>
      h(DataTable as never, {
        label: "Team",
        columns: COLUMNS,
        data: DATA,
        getRowId: (row: Row) => row.id,
        selection: "multiple",
        defaultFilters,
        bulkActions: [{ id: "export", label: "Export", onRun: () => {} }],
      }),
  });
  app.mount(container);
  await nextTick();
  return container;
}

async function press(element: Element | null, key: string) {
  element?.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true }));
  await nextTick();
  await nextTick();
}

const toolbar = (dom: HTMLElement) => dom.querySelector(".data-table__toolbar");

describe("the selection's bulk actions", () => {
  it("are absent, and the sub-bar too, while nothing is filtered or selected", async () => {
    const dom = await withBulk();
    expect(dom.querySelector(".data-table__selection-bar")).toBeNull();
    expect(dom.querySelector(".data-table__subbar")).toBeNull();
    expect(toolbar(dom)?.querySelector('[aria-label="Add filter"]')).not.toBeNull();
  });

  it("replace the sort, filter and table actions in the toolbar row", async () => {
    const dom = await withBulk();
    await press(dom.querySelector('[data-cell="0:1"]'), " ");

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

  it("leave the filter chips on the line below", async () => {
    const dom = await withBulk([{ columnId: "role", operator: "is-any-of", values: ["Engineer"] }]);
    await press(dom.querySelector('[data-cell="0:1"]'), " ");

    const subbar = dom.querySelector(".data-table__subbar");
    expect(subbar?.querySelector(".data-table__filters")).not.toBeNull();
    expect(subbar?.querySelector(".data-table__selection-bar")).toBeNull();
    expect(toolbar(dom)?.querySelector(".data-table__selection-bar")).not.toBeNull();
  });
});

describe("inline editing", () => {
  async function editable() {
    const container = document.createElement("div");
    document.body.append(container);
    const columns: TableColumn<Row>[] = [
      { accessorKey: "name", header: "Name", meta: { primary: true } },
      {
        accessorKey: "seats",
        header: "Seats",
        meta: {
          edit: {
            render: ({ value, setValue }) =>
              h("input", {
                "aria-label": "Seats",
                value: String(value ?? ""),
                onInput: (event: Event) =>
                  setValue(Number((event.target as HTMLInputElement).value)),
              }),
          },
        },
      },
    ];
    app = createApp({
      render: () =>
        h(DataTable as never, {
          label: "Team",
          columns,
          data: DATA,
          getRowId: (row: Row) => row.id,
          onEdit: () => {},
        }),
    });
    app.mount(container);
    await nextTick();
    return container;
  }

  it("marks the editable column's header, and only that one", async () => {
    const dom = await editable();
    const seats = dom.querySelector('thead th[data-column-id="seats"]');
    expect(seats?.classList.contains("data-table__head-cell--editable")).toBe(true);
    expect(seats?.querySelector(".data-table__edit-icon")).not.toBeNull();
    expect(seats?.textContent).toContain(", editable");
    expect(dom.querySelectorAll("thead .data-table__edit-icon")).toHaveLength(1);
    expect(
      dom.querySelector('[data-cell="0:1"]')?.classList.contains("data-table__cell--editable"),
    ).toBe(true);
    expect(
      dom.querySelector('[data-cell="0:0"]')?.classList.contains("data-table__cell--editable"),
    ).toBe(false);
  });

  it("opens with one click, and a click inside the editor keeps the draft", async () => {
    const dom = await editable();
    dom.querySelector<HTMLElement>('[data-cell="0:1"]')?.click();
    await nextTick();
    await nextTick();

    const input = dom.querySelector<HTMLInputElement>(".data-table__editor input");
    expect(input).not.toBeNull();
    expect(document.activeElement).toBe(input);

    input!.value = "9";
    input!.dispatchEvent(new Event("input", { bubbles: true }));
    await nextTick();
    input!.click();
    await nextTick();
    expect(dom.querySelector<HTMLInputElement>(".data-table__editor input")?.value).toBe("9");
  });
});

/**
 * Card mode is the phone layout, mirroring React's "card mode" suite. Sort and
 * filter open sheets from labelled buttons that count what is applied, the
 * chips row goes away, and each card puts its controls in the top-right
 * corner, checkbox last.
 */
describe("card mode", () => {
  async function cards(props: Record<string, unknown> = {}) {
    const container = document.createElement("div");
    document.body.append(container);
    app = createApp({
      render: () =>
        h(DataTable as never, {
          label: "Team",
          columns: COLUMNS,
          data: DATA,
          getRowId: (row: Row) => row.id,
          selection: "multiple",
          responsive: { mode: "cards" },
          defaultSorting: [{ id: "name", desc: false }],
          rowActions: [{ id: "edit", label: "Edit", onRun: () => {} }],
          ...props,
        }),
    });
    app.mount(container);
    await nextTick();
    await nextTick();
    return container;
  }
  const button = (dom: HTMLElement, name: RegExp) =>
    [...dom.querySelectorAll<HTMLButtonElement>(".data-table__toolbar button")].find((b) =>
      name.test(b.textContent?.trim() ?? ""),
    );
  const ENGINEERS: TableFilterInput[] = [
    { columnId: "role", operator: "is-any-of", values: ["Engineer"] },
  ];

  it("swaps the sort and filter menus for sheet buttons, counted by badges", async () => {
    const dom = await cards({ defaultFilters: ENGINEERS });
    const filter = button(dom, /^Filter/);
    const sort = button(dom, /^Sort/);
    expect(filter?.querySelector(".data-table__badge")?.textContent).toBe("1");
    expect(filter?.textContent).toContain(", 1 applied");
    expect(sort?.querySelector(".data-table__badge")?.textContent).toBe("1");
    // The desktop funnel is gone.
    expect(dom.querySelector('.data-table__toolbar [aria-label="Add filter"]')).toBeNull();
  });

  it("shows no badge while nothing is applied", async () => {
    const dom = await cards({ selection: "none", defaultSorting: [], rowActions: [] });
    expect(button(dom, /^Filter/)?.querySelector(".data-table__badge")).toBeNull();
  });

  it("keeps filters out of the chips row, which the sheet replaces", async () => {
    const dom = await cards({ defaultFilters: ENGINEERS });
    expect(dom.querySelector(".data-table__subbar")).toBeNull();
    expect(dom.querySelector(".data-table__filter-chip")).toBeNull();
  });

  it("counts only complete conditions on the badge", async () => {
    // A condition with no value is a draft: kept, never applied, never counted.
    const dom = await cards({
      defaultFilters: [{ columnId: "role", operator: "is-any-of", values: [] }],
      defaultSorting: [],
    });
    expect(button(dom, /^Filter/)?.querySelector(".data-table__badge")).toBeNull();
  });

  it("opens one accordion section per field, seeds drafts, and drops them on close", async () => {
    const dom = await cards({ defaultFilters: ENGINEERS, defaultSorting: [] });
    button(dom, /^Filter/)?.click();
    for (let i = 0; i < 6; i++) await nextTick();

    // Both sheets stay mounted while closed; the filter one is the open one.
    const OPEN = '.data-table__sheet[data-state="open"]';
    const sheet = document.querySelector(OPEN);
    expect(sheet).not.toBeNull();
    // No field picker and no add button: every field is already a section.
    expect(sheet?.querySelector('[aria-label="Add filter"]')).toBeNull();
    expect(sheet?.querySelectorAll(".accordion__item")).toHaveLength(1);
    expect(sheet?.querySelector(".data-table__sheet-section-summary")?.textContent).toBe(
      "is any of Engineer",
    );
    // The applied condition has a clear button; it is the only condition.
    expect(sheet?.querySelectorAll(".data-table__sheet-filter")).toHaveLength(1);
    expect(sheet?.querySelector('[aria-label^="Clear filter:"]')).not.toBeNull();

    // Clearing it re-seeds an empty draft, so the section keeps an editor…
    sheet?.querySelector<HTMLButtonElement>('[aria-label^="Clear filter:"]')?.click();
    for (let i = 0; i < 4; i++) await nextTick();
    expect(document.querySelectorAll(`${OPEN} .data-table__sheet-filter`)).toHaveLength(1);
    expect(document.querySelector(`${OPEN} [aria-label^="Clear filter:"]`)).toBeNull();
    expect(button(dom, /^Filter/)?.querySelector(".data-table__badge")).toBeNull();

    // …and closing drops the draft nobody filled in. The sheet stays mounted
    // while closed, so an undropped draft would still render its editor here.
    const sheetEl = document.querySelector(OPEN);
    [...(sheetEl?.querySelectorAll<HTMLButtonElement>("button") ?? [])]
      .find((b) => b.textContent?.trim() === "Done")
      ?.click();
    for (let i = 0; i < 6; i++) await nextTick();
    expect(sheetEl?.getAttribute("data-state")).toBe("closed");
    expect(sheetEl?.querySelectorAll(".data-table__sheet-filter")).toHaveLength(0);
  });

  it("puts the row actions and then the checkbox at the card's top-right", async () => {
    const dom = await cards();
    const header = dom.querySelector(".data-table__card-header");
    const children = [...(header?.children ?? [])];
    expect(children[0]?.classList.contains("data-table__card-title")).toBe(true);
    const controls = header?.querySelector(".data-table__card-controls");
    expect(controls).toBe(children[children.length - 1]);
    const last = controls?.lastElementChild;
    expect(last?.querySelector('input[type="checkbox"]') ?? last).not.toBeNull();
    expect(last?.querySelector('[aria-label^="Actions for"]')).toBeNull();
    expect(controls?.querySelector('[aria-label^="Actions for"]')).not.toBeNull();
  });
});
