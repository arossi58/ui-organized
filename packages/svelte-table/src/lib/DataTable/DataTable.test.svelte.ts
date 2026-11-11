import { describe, it, expect } from "vitest";
import { createRawSnippet, mount, unmount, flushSync } from "svelte";
import DataTable from "./DataTable.svelte";
import type { TableColumn } from "../core/types.js";

/**
 * The wrapper, mounted for real.
 *
 * The composable's own tests drive it directly; this drives it the way a user
 * does, through the parts — which is the only way to catch a control that is
 * wired to the wrong thing. The paging case here is not hypothetical: the
 * browser parity gate failed on exactly it, and the composable's test passed,
 * so the fault had to be between them.
 */
interface M {
  id: string;
  name: string;
}

const DATA: M[] = Array.from({ length: 8 }, (_, index) => ({
  id: `m-${index}`,
  name: `Name ${index}`,
}));
const COLUMNS: TableColumn<M>[] = [
  { accessorKey: "name", header: "Name", meta: { primary: true } },
];

function render(props: Record<string, unknown> = {}) {
  const target = document.createElement("div");
  document.body.appendChild(target);
  const app = mount(
    DataTable as never,
    {
      target,
      props: { data: DATA, columns: COLUMNS, label: "Members", getRowId: (r: M) => r.id, ...props },
    } as never,
  );
  flushSync();
  return {
    target,
    destroy: () => {
      unmount(app);
      target.remove();
    },
    rowIds: () =>
      [...target.querySelectorAll("tbody tr[data-row-id]")].map((row) =>
        row.getAttribute("data-row-id"),
      ),
  };
}

describe("<DataTable>", () => {
  it("renders a table with a caption, a header and every row", () => {
    const view = render();
    expect(view.target.querySelector("caption")?.textContent).toBe("Members");
    expect(view.target.querySelectorAll("thead th")).toHaveLength(1);
    expect(view.rowIds()).toHaveLength(8);
    view.destroy();
  });

  it("pages forward when the next control is used", () => {
    const view = render({ paginated: true, pageSize: 3 });
    expect(view.rowIds()).toEqual(["m-0", "m-1", "m-2"]);

    const next = view.target.querySelector<HTMLButtonElement>(
      '.data-table__pagination button[aria-label="Next page"]',
    );
    expect(next, "the next-page control is rendered").not.toBeNull();
    next!.click();
    flushSync();

    expect(view.rowIds()).toEqual(["m-3", "m-4", "m-5"]);
    view.destroy();
  });
});

/**
 * While rows are selected, the bulk actions take the place of the toolbar's
 * own controls: deciding what to do with the selection comes before sorting or
 * filtering further. Asserted structurally — which element holds what — because
 * that is the part a stylesheet cannot recover from.
 */
describe("the selection's bulk actions", () => {
  const withBulk = (defaultFilters?: unknown[]) =>
    render({
      // Filterable, so the toolbar has an "Add filter" control to give way.
      columns: [{ accessorKey: "name", header: "Name", meta: { primary: true, filter: true } }],
      selection: "multiple",
      defaultFilters,
      bulkActions: [{ id: "export", label: "Export", onRun: () => {} }],
    });
  const select = (target: HTMLElement) => {
    target
      .querySelector('[data-cell="0:1"]')
      ?.dispatchEvent(new KeyboardEvent("keydown", { key: " ", bubbles: true }));
    flushSync();
  };
  const toolbar = (target: HTMLElement) => target.querySelector(".data-table__toolbar");

  it("are absent, and the sub-bar too, while nothing is filtered or selected", () => {
    const view = withBulk();
    expect(view.target.querySelector(".data-table__selection-bar")).toBeNull();
    expect(view.target.querySelector(".data-table__subbar")).toBeNull();
    expect(toolbar(view.target)?.querySelector('[aria-label="Add filter"]')).not.toBeNull();
    view.destroy();
  });

  it("replace the sort, filter and table actions in the toolbar row", () => {
    const view = withBulk();
    select(view.target);

    const bar = toolbar(view.target)?.querySelector(".data-table__selection-bar");
    expect(bar).not.toBeNull();
    // A plain labelled group, not a `role="toolbar"` with its own surface.
    expect(bar?.getAttribute("role")).toBe("group");
    expect(bar?.classList.contains("toolbar")).toBe(false);
    expect(toolbar(view.target)?.querySelector('[aria-label="Add filter"]')).toBeNull();
    // Search stays: it narrows what is on screen, not what is selected.
    expect(toolbar(view.target)?.querySelector('input[type="search"]')).not.toBeNull();
    expect(view.target.querySelectorAll(".data-table__selection-bar")).toHaveLength(1);
    view.destroy();
  });

  it("leave the filter chips on the line below", () => {
    const view = withBulk([{ columnId: "name", operator: "contains", values: ["Name"] }]);
    select(view.target);

    const subbar = view.target.querySelector(".data-table__subbar");
    expect(subbar?.querySelector(".data-table__filters")).not.toBeNull();
    expect(subbar?.querySelector(".data-table__selection-bar")).toBeNull();
    view.destroy();
  });
});

/**
 * Column reordering: header move buttons, a toolbar-switched mode, and
 * Alt+Arrow on a focused header. Mirrors React's "column reordering"; dragging
 * is native drag and drop, which jsdom does not implement.
 */
describe("column reordering", () => {
  const COLS = [
    { accessorKey: "name", header: "Name", meta: { primary: true } },
    { accessorKey: "role", header: "Role" },
    { accessorKey: "seats", header: "Seats" },
  ];
  const ROWS = [
    { id: "a", name: "Ada", role: "Engineer", seats: 3 },
    { id: "b", name: "Grace", role: "Admin", seats: 1 },
  ];
  const reorderable = (setting: "always" | "toggle", extra: Record<string, unknown> = {}) =>
    render({ data: ROWS, columns: COLS, label: "Team", reorderable: setting, ...extra });
  const headers = (target: HTMLElement) =>
    [...target.querySelectorAll("thead th")]
      .map((cell) => cell.textContent?.replace(/\s+/g, " ").trim())
      .filter(Boolean);
  const button = (target: HTMLElement, label: string) =>
    target.querySelector<HTMLButtonElement>(`button[aria-label="${label}"]`);
  const click = (element: HTMLElement | null) => {
    element?.click();
    flushSync();
  };

  it("moves a column one place with its header buttons, disabled at the ends", () => {
    const view = reorderable("always");
    expect(headers(view.target)).toEqual(["Name", "Role", "Seats"]);
    expect(button(view.target, "Move Name left")?.disabled).toBe(true);
    expect(button(view.target, "Move Seats right")?.disabled).toBe(true);

    click(button(view.target, "Move Name right"));
    expect(headers(view.target)).toEqual(["Role", "Name", "Seats"]);
    click(button(view.target, "Move Seats left"));
    expect(headers(view.target)).toEqual(["Role", "Seats", "Name"]);
    view.destroy();
  });

  it("in toggle mode, offers moving only inside reorder mode", () => {
    const view = reorderable("toggle");
    expect(button(view.target, "Move Name right")).toBeNull();
    expect(view.target.querySelector('.data-table__head-inner[draggable="true"]')).toBeNull();

    click(button(view.target, "Reorder columns"));
    expect(button(view.target, "Move Name right")).not.toBeNull();
    expect(view.target.querySelectorAll('.data-table__head-inner[draggable="true"]')).toHaveLength(3);

    click(button(view.target, "Done reordering columns"));
    expect(button(view.target, "Move Name right")).toBeNull();
    view.destroy();
  });

  it("leaves the table's own columns where they are", () => {
    const view = reorderable("always", { selection: "multiple" });
    const select = view.target.querySelector("th.data-table__select-cell");
    expect(select?.querySelector('[draggable="true"]')).toBeNull();
    expect(select?.querySelector(".data-table__move")).toBeNull();
    expect(button(view.target, "Move Name left")?.disabled).toBe(true);
    view.destroy();
  });

  it("moves the focused header's column with Alt+Arrow, and focus goes with it", () => {
    const view = reorderable("always", { selection: "multiple" });
    const name = view.target.querySelector<HTMLElement>('[data-cell="-1:1"]');
    name?.focus();
    flushSync();
    name?.dispatchEvent(
      new KeyboardEvent("keydown", { key: "ArrowRight", altKey: true, bubbles: true }),
    );
    flushSync();
    expect(headers(view.target)).toEqual(["Role", "Name", "Seats"]);
    expect(
      view.target.querySelector('[data-cell][tabindex="0"]')?.getAttribute("data-cell"),
    ).toBe("-1:2");
    view.destroy();
  });
});

/**
 * `meta.date`: US-formatted strings in, the column's own format out, sorted as
 * dates. Mirrors React's "date columns".
 */
describe("date columns", () => {
  const parseUs = (value: unknown) => {
    const [m, d, y] = String(value).split("/").map(Number);
    return y && m && d ? new Date(y, m - 1, d) : null;
  };
  const dmy = (date: Date) => `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`;

  it("shows each date in the column's format, sorted as dates rather than strings", () => {
    const view = render({
      data: [
        { id: "a", name: "Ada", joined: "2/1/2026" },
        { id: "b", name: "Grace", joined: "11/10/2025" },
        { id: "c", name: "Alan", joined: "12/31/2025" },
      ],
      columns: [
        { accessorKey: "name", header: "Name", meta: { primary: true } },
        { accessorKey: "joined", header: "Joined", meta: { date: { parse: parseUs, format: dmy } } },
      ],
      defaultSorting: [{ id: "joined", desc: false }],
    });
    const joined = [...view.target.querySelectorAll("tbody tr")].map((row) =>
      row.lastElementChild?.textContent?.trim(),
    );
    expect(joined).toEqual(["10.11.2025", "31.12.2025", "1.2.2026"]);
    view.destroy();
  });
});

/**
 * How many rows are selected, and the offer to reach the ones off screen, sit
 * under the rows rather than in the toolbar. Mirrors React's "the selection
 * footer".
 */
describe("the selection footer", () => {
  const paged = () => render({ selection: "multiple", paginated: true, pageSize: 4 });
  const key = (target: HTMLElement, init: KeyboardEventInit) => {
    target
      .querySelector('[data-cell="0:1"]')
      ?.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, ...init }));
    flushSync();
  };
  const footer = (target: HTMLElement) => target.querySelector(".data-table__selection-footer");

  it("is absent while nothing is selected", () => {
    const view = paged();
    expect(footer(view.target)).toBeNull();
    view.destroy();
  });

  it("rides inside the viewport, after the table, and holds the count", () => {
    const view = paged();
    key(view.target, { key: " " });

    const bar = footer(view.target);
    expect(bar?.parentElement?.classList.contains("data-table__viewport")).toBe(true);
    expect(bar?.previousElementSibling?.tagName).toBe("TABLE");
    expect(
      footer(view.target)?.querySelector(".data-table__selection-count")?.textContent?.trim(),
    ).toBe("1 row selected");
    expect(view.target.querySelectorAll(".data-table__selection-count")).toHaveLength(1);
    expect(footer(view.target)?.querySelector("button")).toBeNull();
    view.destroy();
  });

  it("offers the hidden rows as a real button once the page is fully selected", () => {
    const view = paged();
    key(view.target, { key: " " });
    for (let i = 0; i < 3; i++) key(view.target, { key: "ArrowDown", shiftKey: true });

    const offer = footer(view.target)?.querySelector("button");
    expect(offer?.classList.contains("btn")).toBe(true);
    // Four of eight on the page are selected, so four are hidden.
    expect(offer?.textContent?.trim()).toBe("Select 4 hidden rows");

    offer?.click();
    flushSync();
    expect(
      footer(view.target)?.querySelector(".data-table__selection-count")?.textContent?.trim(),
    ).toBe("8 rows selected");
    expect(footer(view.target)?.querySelector("button")).toBeNull();
    view.destroy();
  });
});

/**
 * Card mode is the phone layout. Sort and filter open sheets from labelled
 * buttons that count what is applied, the chips row goes away, and each card
 * puts its controls in the top-right corner, checkbox last.
 */
describe("card mode", () => {
  const FILTERABLE: TableColumn<M>[] = [
    { accessorKey: "name", header: "Name", meta: { primary: true, filter: true } },
  ];
  const cards = (defaultFilters?: unknown[]) =>
    render({
      columns: FILTERABLE,
      selection: "multiple",
      responsive: { mode: "cards" },
      defaultFilters,
      defaultSorting: [{ id: "name", desc: false }],
      rowActions: [{ id: "edit", label: "Edit", onRun: () => {} }],
    });
  const button = (target: HTMLElement, name: RegExp) =>
    [...target.querySelectorAll<HTMLButtonElement>(".data-table__toolbar button")].find((b) =>
      name.test(b.textContent?.trim() ?? ""),
    );
  const ONE = [{ columnId: "name", operator: "contains", values: ["Name"] }];

  it("swaps the sort and filter menus for sheet buttons, counted by badges", () => {
    const view = cards(ONE);
    const filter = button(view.target, /^Filter/);
    const sort = button(view.target, /^Sort/);
    expect(filter?.querySelector(".data-table__badge")?.textContent).toBe("1");
    expect(filter?.textContent).toContain(", 1 applied");
    expect(sort?.querySelector(".data-table__badge")?.textContent).toBe("1");
    // The desktop funnel is gone.
    expect(
      view.target.querySelector('.data-table__toolbar [aria-label="Add filter"]'),
    ).toBeNull();
    view.destroy();
  });

  it("shows no badge while nothing is applied", () => {
    const view = render({ columns: FILTERABLE, responsive: { mode: "cards" } });
    expect(button(view.target, /^Filter/)?.querySelector(".data-table__badge")).toBeNull();
    view.destroy();
  });

  it("counts only complete conditions: a draft with no value is not applied", () => {
    const view = cards([{ columnId: "name", operator: "contains", values: [] }]);
    expect(button(view.target, /^Filter/)?.querySelector(".data-table__badge")).toBeNull();
    view.destroy();
  });

  it("keeps filters out of the chips row, which the sheet replaces", () => {
    const view = cards(ONE);
    expect(view.target.querySelector(".data-table__subbar")).toBeNull();
    expect(view.target.querySelector(".data-table__filter-chip")).toBeNull();
    view.destroy();
  });

  it("puts the row actions and then the checkbox at the card's top-right", () => {
    const view = cards();
    const header = view.target.querySelector(".data-table__card-header");
    const children = [...(header?.children ?? [])];
    expect(children[0]?.classList.contains("data-table__card-title")).toBe(true);
    const controls = header?.querySelector(".data-table__card-controls");
    expect(controls).toBe(children[children.length - 1]);
    const last = controls?.lastElementChild;
    expect(last?.querySelector('input[type="checkbox"]') ?? last).not.toBeNull();
    expect(controls?.querySelector('[aria-label^="Actions for"]')).not.toBeNull();
    view.destroy();
  });
});

describe("inline editing", () => {
  // The editor is a raw snippet: a plain <input> wired to the edit context.
  const editable = (onEdit: (patch: { value: unknown }) => void = () => {}) =>
    render({
      columns: [
        { accessorKey: "name", header: "Name", meta: { primary: true } },
        {
          id: "seats",
          accessorFn: (_row: M, index: number) => index + 1,
          header: "Seats",
          meta: {
            edit: {
              render: (ctx: {
                value: unknown;
                setValue: (value: unknown) => void;
                commit: () => void;
              }) =>
                createRawSnippet(() => ({
                  render: () => '<input aria-label="Seats" />',
                  setup: (input) => {
                    (input as HTMLInputElement).value = String(ctx.value ?? "");
                    input.addEventListener("input", () =>
                      ctx.setValue(Number((input as HTMLInputElement).value)),
                    );
                    input.addEventListener("change", () => ctx.commit());
                  },
                })),
            },
          },
        },
      ],
      onEdit,
    });

  it("marks the editable column's header, and only that one", () => {
    const view = editable();
    const seats = view.target.querySelector('thead th[data-column-id="seats"]');
    expect(seats?.classList.contains("data-table__head-cell--editable")).toBe(true);
    expect(seats?.querySelector(".data-table__edit-icon")).not.toBeNull();
    expect(seats?.textContent).toContain(", editable");
    expect(view.target.querySelectorAll("thead .data-table__edit-icon")).toHaveLength(1);
    expect(
      view.target
        .querySelector('[data-cell="0:1"]')
        ?.classList.contains("data-table__cell--editable"),
    ).toBe(true);
    expect(
      view.target
        .querySelector('[data-cell="0:0"]')
        ?.classList.contains("data-table__cell--editable"),
    ).toBe(false);
    view.destroy();
  });

  it("opens with one click, and a click inside the editor keeps the draft", async () => {
    const committed: unknown[] = [];
    const view = editable((patch) => committed.push(patch.value));
    view.target.querySelector<HTMLElement>('[data-cell="0:1"]')?.click();
    flushSync();

    const input = view.target.querySelector<HTMLInputElement>(".data-table__editor input");
    expect(input).not.toBeNull();
    flushSync();
    expect(document.activeElement).toBe(input);

    input!.value = "9";
    input!.dispatchEvent(new Event("input", { bubbles: true }));
    flushSync();
    // Each draft change re-renders the editor snippet, so query the live input.
    const live = () => view.target.querySelector<HTMLInputElement>(".data-table__editor input")!;
    live().click();
    flushSync();
    // Had the click restarted the edit, the draft would be back to 1.
    live().dispatchEvent(new Event("change", { bubbles: true }));
    flushSync();
    await Promise.resolve();
    expect(committed).toEqual([9]);
    view.destroy();
  });
});
