// @vitest-environment jsdom
/**
 * The markup contract, asserted where it is actually produced.
 *
 * Core's own tests cover the behaviours as pure functions; these cover the half
 * that only exists once something has rendered — that the table is a real
 * `<table>` with a caption and a row header, that `aria-rowindex` reports the
 * position in the dataset rather than in the rendered window, and that the
 * states replace the body rather than the table.
 */
import { act, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeAll, describe, expect, it } from "vitest";
import { registerIconSet } from "@ui-organized/react";
import { DataTable } from "./DataTable/index.js";
import type { TableColumn, TableFilterInput } from "./core/types.js";

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

let container: HTMLDivElement;
let root: Root;

beforeAll(() => {
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  // A stub set, so the sort icons resolve. Without one every render prints the
  // library's (correct, and here irrelevant) "no icon set registered" warning,
  // and the real failures get lost in it. lucide-react is not a dependency of
  // this package and should not become one just to run a test.
  registerIconSet({
    library: "lucide",
    outline: new Proxy({}, { get: () => () => null }),
    svgProps: () => ({}),
  });
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

function render(element: React.ReactElement) {
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
  act(() => {
    root.render(element);
  });
  return container;
}

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

describe("DataTable markup", () => {
  it("renders a real table with a caption as its accessible name", () => {
    const dom = render(
      <DataTable<Row>
        label="Team members"
        columns={COLUMNS}
        data={DATA}
        getRowId={(row) => row.id}
      />,
    );
    const table = dom.querySelector("table");
    expect(table).not.toBeNull();
    const caption = table?.querySelector("caption");
    expect(caption?.textContent).toBe("Team members");
    // Hidden visually, present for assistive tech — never `display: none`.
    expect(caption?.className).toContain("data-table__caption--hidden");
    expect(caption).toBe(table?.firstElementChild);
  });

  it("gives every column an explicit <col> width, so rows cannot jitter", () => {
    const dom = render(
      <DataTable<Row> label="Team" columns={COLUMNS} data={DATA} getRowId={(row) => row.id} />,
    );
    const cols = dom.querySelectorAll("colgroup col");
    expect(cols).toHaveLength(COLUMNS.length);
    expect((cols[0] as HTMLElement).style.width).not.toBe("");
    expect((dom.querySelector("table") as HTMLElement).style.tableLayout).toBe("fixed");
  });

  it("reports the dataset position, not the rendered position", () => {
    const dom = render(
      <DataTable<Row> label="Team" columns={COLUMNS} data={DATA} getRowId={(row) => row.id} />,
    );
    const table = dom.querySelector("table");
    expect(table?.getAttribute("aria-rowcount")).toBe("4"); // 3 rows + the header
    const rows = [...dom.querySelectorAll("tbody tr")];
    expect(rows.map((row) => row.getAttribute("aria-rowindex"))).toEqual(["2", "3", "4"]);
    expect(dom.querySelector("thead tr")?.getAttribute("aria-rowindex")).toBe("1");
  });

  it("makes the identifying column a row header", () => {
    const dom = render(
      <DataTable<Row> label="Team" columns={COLUMNS} data={DATA} getRowId={(row) => row.id} />,
    );
    const first = dom.querySelector("tbody tr");
    const header = first?.querySelector("th");
    expect(header?.getAttribute("scope")).toBe("row");
    expect(header?.textContent).toBe("Ada");
  });

  it("is a plain table until something in it is operable", () => {
    const dom = render(
      <DataTable<Row> label="Team" columns={COLUMNS} data={DATA} getRowId={(row) => row.id} />,
    );
    const table = dom.querySelector("table");
    expect(table?.getAttribute("role")).toBeNull();
    // The scroll container has to be reachable by keyboard when nothing inside
    // it is, which is both an axe rule and a real problem.
    const viewport = dom.querySelector(".data-table__viewport");
    expect(viewport?.getAttribute("role")).toBe("region");
    expect(viewport?.getAttribute("tabindex")).toBe("0");
    expect(viewport?.getAttribute("aria-label")).toBe("Team");
  });

  it("becomes a grid, with no aria-selected on a plain table, once rows are selectable", () => {
    const dom = render(
      <DataTable<Row>
        label="Team"
        columns={COLUMNS}
        data={DATA}
        getRowId={(row) => row.id}
        selection="multiple"
      />,
    );
    const table = dom.querySelector("table");
    expect(table?.getAttribute("role")).toBe("grid");
    expect(table?.getAttribute("aria-multiselectable")).toBe("true");
    expect(dom.querySelector("tbody tr")?.getAttribute("aria-selected")).toBe("false");
    // Exactly one tab stop in the grid: the roving cursor.
    const tabbable = [...dom.querySelectorAll("[data-cell]")].filter(
      (cell) => cell.getAttribute("tabindex") === "0",
    );
    expect(tabbable).toHaveLength(1);
  });

  it("marks the two system columns, so a cell holding a control opts out of truncation", () => {
    // Every other cell truncates with `text-overflow: ellipsis`, which paints a
    // "…" beside a control whose inline box overflows the column by a pixel —
    // and a "…" next to a row's action menu reads as data that was cut off.
    // The stylesheet opts these two out; it can only do that if they are marked.
    const dom = render(
      <DataTable<Row>
        label="Team"
        columns={COLUMNS}
        data={DATA}
        getRowId={(row) => row.id}
        selection="multiple"
        rowActions={[{ id: "edit", label: "Edit", onRun: () => {} }]}
      />,
    );
    const row = dom.querySelector("tbody tr");
    expect(row?.querySelector(".data-table__select-cell")).not.toBeNull();
    expect(row?.querySelector(".data-table__actions-cell")).not.toBeNull();
    // The header cells too: the select-all checkbox sits in one of them.
    const head = dom.querySelector("thead tr");
    expect(head?.querySelector(".data-table__select-cell")).not.toBeNull();
    expect(head?.querySelector(".data-table__actions-cell")).not.toBeNull();
  });

  it("marks a sortable header with aria-sort and never with a lie", () => {
    const dom = render(
      <DataTable<Row> label="Team" columns={COLUMNS} data={DATA} getRowId={(row) => row.id} />,
    );
    const [name] = [...dom.querySelectorAll("thead th")];
    expect(name?.getAttribute("aria-sort")).toBe("none");

    act(() => {
      name?.querySelector("button")?.click();
    });
    expect(dom.querySelector("thead th")?.getAttribute("aria-sort")).toBe("ascending");
    expect([...dom.querySelectorAll("tbody th")].map((cell) => cell.textContent)).toEqual([
      "Ada",
      "Alan",
      "Grace",
    ]);
  });

  it("replaces the body — not the table — when there is nothing to show", () => {
    const dom = render(
      <DataTable<Row>
        label="Team"
        columns={COLUMNS}
        data={[]}
        getRowId={(row) => row.id}
        empty={{ title: "No members yet" }}
      />,
    );
    expect(dom.querySelector("thead")).not.toBeNull();
    expect(dom.querySelector(".data-table__state-title")?.textContent).toBe("No members yet");
  });

  it("announces a load failure rather than leaving an empty table", () => {
    const dom = render(
      <DataTable<Row>
        label="Team"
        columns={COLUMNS}
        data={[]}
        getRowId={(row) => row.id}
        error="Nope"
      />,
    );
    expect(dom.querySelector('[role="alert"]')?.textContent).toContain("Nope");
  });

  it("gives every selectable row a named checkbox", () => {
    const dom = render(
      <DataTable<Row>
        label="Team"
        columns={COLUMNS}
        data={DATA}
        getRowId={(row) => row.id}
        selection="multiple"
      />,
    );
    const boxes = [...dom.querySelectorAll<HTMLInputElement>('tbody input[type="checkbox"]')];
    expect(boxes).toHaveLength(DATA.length);
    // The identifying column is what makes one row's checkbox distinguishable
    // from another's in a screen reader's forms list.
    expect(boxes.map((box) => box.getAttribute("aria-label"))).toEqual([
      "Select Ada",
      "Select Grace",
      "Select Alan",
    ]);
  });

  it("selects with Space and moves the roving cursor with the arrows", () => {
    const dom = render(
      <DataTable<Row>
        label="Team"
        columns={COLUMNS}
        data={DATA}
        getRowId={(row) => row.id}
        selection="multiple"
      />,
    );
    const cell = dom.querySelector<HTMLElement>('[data-cell="0:1"]');

    act(() => {
      press(cell, " ");
    });
    expect(dom.querySelector("tbody tr")?.getAttribute("aria-selected")).toBe("true");
    expect(dom.querySelector(".data-table__selection-count")?.textContent).toBe("1 row selected");

    act(() => {
      press(cell, "ArrowDown");
    });
    expect(focusedCell(dom)).toBe("1:0");

    // ArrowUp out of the first row reaches the header, which is where sorting
    // lives for a keyboard user. One act() per key: the handler closes over the
    // cursor from its own render, so two keys in one batch both act on the
    // pre-batch cursor.
    act(() => press(cell, "ArrowUp"));
    act(() => press(cell, "ArrowUp"));
    expect(focusedCell(dom)).toBe("-1:0");
  });

  it("extends a selection range with Shift+Arrow", () => {
    const dom = render(
      <DataTable<Row>
        label="Team"
        columns={COLUMNS}
        data={DATA}
        getRowId={(row) => row.id}
        selection="multiple"
      />,
    );
    const cell = dom.querySelector<HTMLElement>('[data-cell="0:1"]');
    act(() => press(cell, " "));
    act(() => press(cell, "ArrowDown", { shiftKey: true }));
    expect(dom.querySelector(".data-table__selection-count")?.textContent).toBe("2 rows selected");
  });
});

describe("inline editing", () => {
  function Editable() {
    const [rows, setRows] = useState(DATA);
    const columns: TableColumn<Row>[] = [
      { accessorKey: "name", header: "Name", meta: { primary: true } },
      {
        accessorKey: "seats",
        header: "Seats",
        meta: {
          edit: {
            render: ({ value, setValue }) => (
              <input
                aria-label="Seats"
                value={String(value ?? "")}
                onChange={(event) => setValue(Number(event.target.value))}
              />
            ),
            validate: (value) =>
              typeof value === "number" && value > 0 ? null : "Seats must be at least 1",
          },
        },
      },
    ];
    return (
      <DataTable<Row>
        label="Team"
        columns={columns}
        data={rows}
        getRowId={(row) => row.id}
        onEdit={({ rowId, value }) =>
          setRows((previous) =>
            previous.map((row) => (row.id === rowId ? { ...row, seats: Number(value) } : row)),
          )
        }
      />
    );
  }

  /** React's controlled-input setter, so the change event carries the value. */
  function typeInto(input: HTMLInputElement, value: string) {
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;
    setter?.call(input, value);
    input.dispatchEvent(new Event("input", { bubbles: true }));
  }

  it("opens on Enter, puts focus in the editor, and commits", async () => {
    const dom = render(<Editable />);
    const cell = dom.querySelector<HTMLElement>('[data-cell="0:1"]');

    act(() => cell?.focus());
    act(() => press(cell, "Enter"));

    const input = dom.querySelector<HTMLInputElement>(".data-table__editor input");
    expect(input).not.toBeNull();
    // Focus is the package's job: most library controls do not forward a ref to
    // their inner input, so a consumer cannot reliably do this themselves.
    expect(document.activeElement).toBe(input);

    act(() => typeInto(input!, "42"));
    await act(async () => {
      press(input, "Enter");
      await Promise.resolve();
    });

    expect(dom.querySelectorAll(".data-table__editor")).toHaveLength(0);
    expect(dom.querySelector('[data-cell="0:1"]')?.textContent).toBe("42");
  });

  it("blocks a commit that fails validation and says why", async () => {
    const dom = render(<Editable />);
    const cell = dom.querySelector<HTMLElement>('[data-cell="0:1"]');

    act(() => cell?.focus());
    act(() => press(cell, "Enter"));
    const input = dom.querySelector<HTMLInputElement>(".data-table__editor input");

    act(() => typeInto(input!, "0"));
    await act(async () => {
      press(input, "Enter");
      await Promise.resolve();
    });

    // Still open, marked invalid, and the row is untouched.
    expect(dom.querySelectorAll(".data-table__editor")).toHaveLength(1);
    expect(dom.querySelector('[data-cell="0:1"]')?.getAttribute("aria-invalid")).toBe("true");
  });

  it("discards the draft on Escape", async () => {
    const dom = render(<Editable />);
    const cell = dom.querySelector<HTMLElement>('[data-cell="0:1"]');

    act(() => cell?.focus());
    act(() => press(cell, "Enter"));
    const input = dom.querySelector<HTMLInputElement>(".data-table__editor input");
    act(() => typeInto(input!, "99"));
    act(() => press(input, "Escape"));

    expect(dom.querySelectorAll(".data-table__editor")).toHaveLength(0);
    expect(dom.querySelector('[data-cell="0:1"]')?.textContent).toBe("3");
  });

  it("marks the editable column's header, and only that one", () => {
    const dom = render(<Editable />);
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

  it("opens with one click, and a click inside the editor keeps the draft", () => {
    const dom = render(<Editable />);
    const cell = dom.querySelector<HTMLElement>('[data-cell="0:1"]');

    act(() => cell?.click());
    const input = dom.querySelector<HTMLInputElement>(".data-table__editor input");
    expect(input).not.toBeNull();
    expect(document.activeElement).toBe(input);

    act(() => typeInto(input!, "9"));
    act(() => input?.click());
    expect(dom.querySelector<HTMLInputElement>(".data-table__editor input")?.value).toBe("9");
  });
});

describe("filters", () => {
  const FILTERABLE: TableColumn<Row>[] = [
    { accessorKey: "name", header: "Name", meta: { primary: true, filter: true } },
    { accessorKey: "role", header: "Role", meta: { filter: { type: "enum" } } },
    { accessorKey: "seats", header: "Seats", meta: { align: "end", filter: true } },
    { accessorKey: "email", header: "Email" },
  ];

  const withFilters = (defaultFilters?: TableFilterInput[]) =>
    render(
      <DataTable<Row>
        label="Team"
        columns={FILTERABLE}
        data={DATA}
        getRowId={(row) => row.id}
        defaultFilters={defaultFilters}
      />,
    );

  /**
   * The bar is a summary of applied filters, so with none applied there is
   * nothing to summarise. An always-present, usually-empty row of chrome is
   * what teaches people to stop looking at it.
   */
  it("renders no filter bar until something is filtered", () => {
    const dom = withFilters();
    expect(dom.querySelector(".data-table__filters")).toBeNull();
    // The way in is the header's icon-only funnel, which is always there.
    expect(dom.querySelector('button[aria-label="Add filter"]')).not.toBeNull();
  });

  /**
   * The chip is segmented, and every relation is spelled — the glyphs are gone,
   * so the words are the only thing carrying "is any of" for anyone.
   */
  it("renders field, operator and value as three segments", () => {
    const dom = withFilters([{ columnId: "role", operator: "is-any-of", values: ["Engineer"] }]);
    const chip = dom.querySelector(".data-table__filter-chip");
    const segments = [...(chip?.querySelectorAll(":scope > .chip__segment") ?? [])];
    expect(segments.map((segment) => segment.textContent)).toEqual([
      "Role",
      "is any of",
      "Engineer",
    ]);
    expect(chip?.querySelector("svg")).toBeNull();
    expect(chip?.getAttribute("aria-label")).toBe("Filter: Role is any of Engineer");
  });

  it("spells the per-type label", () => {
    const dom = withFilters([{ columnId: "seats", operator: "gte", values: [2] }]);
    const chip = dom.querySelector(".data-table__filter-chip");
    expect(chip?.querySelector(".chip__segment--operator")?.textContent).toBe("is at least");
  });

  it("drops the value segment for an operator that takes none", () => {
    const dom = withFilters([{ columnId: "name", operator: "is-empty", values: [] }]);
    const chip = dom.querySelector(".data-table__filter-chip");
    expect(chip?.querySelectorAll(".chip__segment")).toHaveLength(2);
    expect(chip?.querySelector(".chip__segment--value")).toBeNull();
  });

  it("applies the condition to the rows", () => {
    const dom = withFilters([{ columnId: "role", operator: "is-any-of", values: ["Engineer"] }]);
    expect([...dom.querySelectorAll("tbody th")].map((cell) => cell.textContent)).toEqual([
      "Ada",
      "Alan",
    ]);
  });

  /**
   * The guard for axe's `nested-interactive`, as a unit test — feedback in
   * milliseconds rather than after a full browser run. Each segment opens its
   * own menu, so the chip is three buttons, and they must be siblings.
   */
  it("never nests a button inside a button", () => {
    const dom = withFilters([{ columnId: "name", operator: "contains", values: ["a"] }]);
    expect(dom.querySelectorAll("button button")).toHaveLength(0);
    const segments = dom.querySelectorAll(".data-table__filter-chip > button.chip__segment");
    expect(segments).toHaveLength(3);
    expect([...segments].every((segment) => segment.getAttribute("aria-haspopup"))).toBe(true);
  });

  it("shows an incomplete condition without letting it filter", () => {
    const dom = withFilters([{ columnId: "name", operator: "contains", values: [] }]);
    expect(dom.querySelector(".data-table__filter-chip.chip--incomplete")).not.toBeNull();
    // Every row survives: adding a filter must never blank the table.
    expect(dom.querySelectorAll("tbody tr")).toHaveLength(DATA.length);
  });

  it("ANDs two conditions on the same column into a window", () => {
    // Ada 3, Grace 1, Alan 7 — only Ada falls inside.
    const dom = withFilters([
      { columnId: "seats", operator: "gte", values: [2] },
      { columnId: "seats", operator: "lte", values: [5] },
    ]);
    expect(dom.querySelectorAll(".data-table__filter-chip")).toHaveLength(2);
    expect([...dom.querySelectorAll("tbody th")].map((cell) => cell.textContent)).toEqual(["Ada"]);
  });
});

/**
 * While rows are selected, the bulk actions take the place of the toolbar's
 * own controls: deciding what to do with the selection comes before sorting or
 * filtering further. Asserted structurally — which element holds what — because
 * that is the part a stylesheet cannot recover from.
 */
describe("the selection's bulk actions", () => {
  const withBulk = (defaultFilters?: TableFilterInput[]) =>
    render(
      <DataTable<Row>
        label="Team"
        columns={COLUMNS}
        data={DATA}
        getRowId={(row) => row.id}
        selection="multiple"
        defaultFilters={defaultFilters}
        bulkActions={[{ id: "export", label: "Export", onRun: () => {} }]}
      />,
    );
  const toolbar = (dom: HTMLElement) => dom.querySelector(".data-table__toolbar");

  it("are absent, and the sub-bar too, while nothing is filtered or selected", () => {
    const dom = withBulk();
    expect(dom.querySelector(".data-table__selection-bar")).toBeNull();
    expect(dom.querySelector(".data-table__subbar")).toBeNull();
    expect(toolbar(dom)?.querySelector('[aria-label="Add filter"]')).not.toBeNull();
  });

  it("replace the sort, filter and table actions in the toolbar row", () => {
    const dom = withBulk();
    act(() => press(dom.querySelector('[data-cell="0:1"]'), " "));

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

  it("keep the export menu, whose selected-rows items act on the selection", () => {
    const dom = render(
      <DataTable<Row>
        label="Team"
        columns={COLUMNS}
        data={DATA}
        getRowId={(row) => row.id}
        selection="multiple"
        exportable
        bulkActions={[{ id: "archive", label: "Archive", onRun: () => {} }]}
      />,
    );
    act(() => press(dom.querySelector('[data-cell="0:1"]'), " "));
    expect(toolbar(dom)?.querySelector(".data-table__selection-bar")).not.toBeNull();
    expect(toolbar(dom)?.querySelector('[aria-label="Export"]')).not.toBeNull();
  });

  it("leave the filter chips on the line below", () => {
    const dom = withBulk([{ columnId: "role", operator: "is-any-of", values: ["Engineer"] }]);
    act(() => press(dom.querySelector('[data-cell="0:1"]'), " "));

    const subbar = dom.querySelector(".data-table__subbar");
    expect(subbar?.querySelector(".data-table__filters")).not.toBeNull();
    expect(subbar?.querySelector(".data-table__selection-bar")).toBeNull();
  });
});

/**
 * Card mode is the phone layout. Sort and filter open sheets from labelled
 * buttons that count what is applied, the chips row goes away, and each card
 * puts its controls in the top-right corner, checkbox last.
 */
describe("row activation", () => {
  const withControls = (onRowClick: (row: Row) => void) =>
    render(
      <DataTable<Row>
        label="Team"
        columns={COLUMNS}
        data={DATA}
        getRowId={(row) => row.id}
        selection="multiple"
        onRowClick={onRowClick}
        rowActions={[{ id: "edit", label: "Edit", onRun: () => {} }]}
      />,
    );
  const click = (el: Element | null | undefined) =>
    act(() => {
      el?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

  it("activates on a click on the row itself", () => {
    const clicked: string[] = [];
    const dom = withControls((row) => clicked.push(row.id));
    click(dom.querySelector('[data-cell="0:2"]'));
    expect(clicked).toEqual(["a"]);
  });

  it("ignores clicks on the selection checkbox and the action menu", () => {
    const clicked: string[] = [];
    const dom = withControls((row) => clicked.push(row.id));
    const row = dom.querySelectorAll("tbody tr")[0];
    const targets = [
      row?.querySelector('.data-table__select-hit input[type="checkbox"]'),
      row?.querySelector(".data-table__select-hit label"),
      row?.querySelector(".data-table__actions-cell button"),
    ];
    for (const target of targets) expect(target).toBeTruthy();
    targets.forEach(click);
    expect(clicked).toEqual([]);
  });
});

describe("card mode", () => {
  const cards = (defaultFilters?: TableFilterInput[]) =>
    render(
      <DataTable<Row>
        label="Team"
        columns={COLUMNS}
        data={DATA}
        getRowId={(row) => row.id}
        selection="multiple"
        responsive={{ mode: "cards" }}
        defaultFilters={defaultFilters}
        defaultSorting={[{ id: "name", desc: false }]}
        rowActions={[{ id: "edit", label: "Edit", onRun: () => {} }]}
      />,
    );
  const button = (dom: HTMLElement, name: RegExp) =>
    [...dom.querySelectorAll<HTMLButtonElement>(".data-table__toolbar button")].find((b) =>
      name.test(b.textContent ?? ""),
    );

  it("swaps the sort and filter menus for sheet buttons, counted by badges", () => {
    const dom = cards([{ columnId: "role", operator: "is-any-of", values: ["Engineer"] }]);
    const filter = button(dom, /^Filter/);
    const sort = button(dom, /^Sort/);
    expect(filter?.querySelector(".data-table__badge")?.textContent).toBe("1");
    expect(filter?.textContent).toContain(", 1 applied");
    expect(sort?.querySelector(".data-table__badge")?.textContent).toBe("1");
    // The desktop funnel is gone.
    expect(dom.querySelector('.data-table__toolbar [aria-label="Add filter"]')).toBeNull();
  });

  it("shows no badge while nothing is applied", () => {
    const dom = render(
      <DataTable<Row>
        label="Team"
        columns={COLUMNS}
        data={DATA}
        getRowId={(row) => row.id}
        responsive={{ mode: "cards" }}
      />,
    );
    expect(button(dom, /^Filter/)?.querySelector(".data-table__badge")).toBeNull();
  });

  it("keeps filters out of the chips row, which the sheet replaces", () => {
    const dom = cards([{ columnId: "role", operator: "is-any-of", values: ["Engineer"] }]);
    expect(dom.querySelector(".data-table__subbar")).toBeNull();
    expect(dom.querySelector(".data-table__filter-chip")).toBeNull();
  });

  it("counts only complete conditions on the badge", () => {
    const dom = cards([
      { columnId: "role", operator: "is-any-of", values: ["Engineer"] },
      { columnId: "role", operator: "is-any-of", values: [] },
    ]);
    expect(button(dom, /^Filter/)?.querySelector(".data-table__badge")?.textContent).toBe("1");
  });

  it("opens with every field as a section, and drops unfilled drafts on close", async () => {
    const dom = cards([{ columnId: "role", operator: "is-any-of", values: ["Engineer"] }]);
    await act(async () => {
      button(dom, /^Filter/)?.click();
      await Promise.resolve();
    });
    // Both sheets are mounted; the filter one is the one titled "Filter".
    const sheet = [...document.querySelectorAll(".data-table__sheet")].find(
      (el) => el.querySelector("h2")?.textContent === "Filter",
    );
    expect(sheet).not.toBeUndefined();
    const titles = [...(sheet?.querySelectorAll(".data-table__sheet-section-title") ?? [])].map(
      (title) => title.firstElementChild?.textContent,
    );
    // One per filterable column, with nothing added first.
    expect(titles).toEqual(["Role"]);
    // Every field has a condition to edit while the sheet is open.
    expect(sheet?.querySelectorAll(".data-table__sheet-filter").length).toBe(titles.length);
    // A section says what it applies, so it reads collapsed.
    expect(sheet?.textContent).toContain("is any of Engineer");

    const done = [...(sheet?.querySelectorAll("button") ?? [])].find(
      (b) => b.textContent === "Done",
    );
    await act(async () => {
      done?.click();
      await Promise.resolve();
    });
    // The drafts are gone; the real filter stays.
    expect(button(dom, /^Filter/)?.querySelector(".data-table__badge")?.textContent).toBe("1");
    await act(async () => {
      button(dom, /^Filter/)?.click();
      await Promise.resolve();
    });
    const filled = [...(sheet?.querySelectorAll(".data-table__sheet-filter") ?? [])].filter((el) =>
      el.querySelector('[aria-label^="Clear filter"]'),
    );
    expect(filled).toHaveLength(1);
  });

  it("seeds an empty draft for an unfiltered field, and never counts or keeps it", async () => {
    const dom = cards();
    const filterSheet = () =>
      [...document.querySelectorAll(".data-table__sheet")].find(
        (el) => el.querySelector("h2")?.textContent === "Filter",
      );
    await act(async () => {
      button(dom, /^Filter/)?.click();
      await Promise.resolve();
    });
    // Role has no filter, yet its section has a condition to edit.
    expect(filterSheet()?.querySelectorAll(".data-table__sheet-filter")).toHaveLength(1);
    expect(button(dom, /^Filter/)?.querySelector(".data-table__badge")).toBeNull();
    await act(async () => {
      [...(filterSheet()?.querySelectorAll("button") ?? [])]
        .find((b) => b.textContent === "Done")
        ?.click();
      await Promise.resolve();
    });
    // Closed, the draft is gone: no condition is left behind to be reported.
    expect(filterSheet()?.querySelectorAll(".data-table__sheet-filter")).toHaveLength(0);
  });

  it("puts the row actions and then the checkbox at the card's top-right", () => {
    const dom = cards();
    const header = dom.querySelector(".data-table__card-header");
    const children = [...(header?.children ?? [])];
    expect(children[0]?.classList.contains("data-table__card-title")).toBe(true);
    const controls = header?.querySelector(".data-table__card-controls");
    expect(controls).toBe(children[children.length - 1]);
    const last = controls?.lastElementChild;
    expect(last?.querySelector('input[type="checkbox"]') ?? last).not.toBeNull();
    expect(controls?.querySelector('[aria-label^="Actions for"]')).not.toBeNull();
  });
});

/**
 * Ark's `Checkbox` does not toggle under a synthetic click in jsdom — its state
 * machine wants real pointer events — so selection is exercised through the
 * keyboard path instead. That is the better test anyway: the keyboard path is
 * ours (core's `gridKeyDown` and the selection model), while the checkbox's own
 * behaviour belongs to the component library's tests.
 */
function press(element: Element | null, key: string, init: KeyboardEventInit = {}) {
  element?.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true, ...init }));
}

function focusedCell(dom: HTMLElement): string | null {
  return dom.querySelector('[data-cell][tabindex="0"]')?.getAttribute("data-cell") ?? null;
}
