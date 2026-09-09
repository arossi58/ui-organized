import { describe, it, expect } from "vitest";
import { mount, unmount, flushSync } from "svelte";
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
  const app = mount(DataTable as never, {
    target,
    props: { data: DATA, columns: COLUMNS, label: "Members", getRowId: (r: M) => r.id, ...props },
  } as never);
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
