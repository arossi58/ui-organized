import { describe, expect, it } from "vitest";
import { cardFieldOrder, columnId, primaryColumnId } from "./columns.js";
import type { TableColumn } from "./types.js";

interface Row {
  name: string;
  owner: { team: string };
}

describe("columnId", () => {
  /**
   * Must match `createColumn` in @tanstack/table-core exactly. A mismatch is
   * silent and total: the column is never found, so the filter matches nothing
   * and offers no values, and `meta.primary` stops marking a row header.
   */
  it("mirrors TanStack's derivation, dots and all", () => {
    expect(columnId({ accessorKey: "name" } as TableColumn<Row>)).toBe("name");
    // The surprising one: the accessor reaches nested data, the id does not.
    expect(columnId({ accessorKey: "owner.team" } as TableColumn<Row>)).toBe("owner_team");
    expect(columnId({ accessorKey: "a.b.c" } as TableColumn<Row>)).toBe("a_b_c");
    // An explicit id always wins, untouched.
    expect(columnId({ id: "owner.team", accessorKey: "x" } as TableColumn<Row>)).toBe("owner.team");
    // TanStack's last resort.
    expect(columnId({ header: "Team" } as TableColumn<Row>)).toBe("Team");
    expect(columnId({ header: () => null } as unknown as TableColumn<Row>)).toBe("");
  });
});

describe("column meta helpers follow the same ids", () => {
  const columns = [
    { accessorKey: "owner.team", header: "Team", meta: { primary: true } },
    { accessorKey: "name", header: "Name", meta: { priority: 1 } },
  ] as TableColumn<Row>[];

  it("finds a primary column declared with a dot path", () => {
    expect(primaryColumnId(columns)).toBe("owner_team");
  });

  it("orders card fields by the same ids", () => {
    expect(cardFieldOrder(columns)).toEqual(["name"]);
  });
});
