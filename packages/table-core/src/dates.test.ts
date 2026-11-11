import { describe, expect, it } from "vitest";
import { dateFormatter, isoDayToDate, withDateColumns } from "./dates.js";
import { normalizeFilterDef } from "./filters/types.js";
import type { TableColumn } from "./types.js";

interface Row {
  id: string;
  joined: unknown;
  nested?: { at: string };
}

type Rewritten = TableColumn<Row> & {
  id: string;
  accessorKey?: string;
  accessorFn: (row: Row, index: number) => unknown;
  cell: (ctx: { getValue: () => unknown }) => unknown;
};

const one = (def: TableColumn<Row>) => withDateColumns<Row>([def])[0] as Rewritten;

/** "11/10/2026" → a local Date. The shape a US-formatted export arrives in. */
const parseUs = (value: unknown) => {
  const match = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(String(value));
  return match ? new Date(Number(match[3]), Number(match[1]) - 1, Number(match[2])) : null;
};

describe("withDateColumns", () => {
  it("returns the very same array when no column declares dates", () => {
    const columns: TableColumn<Row>[] = [{ accessorKey: "id", header: "Id" }];
    expect(withDateColumns(columns)).toBe(columns);
  });

  it("holds the value as an ISO day, whatever shape it arrived in", () => {
    const col = one({ accessorKey: "joined", header: "Joined", meta: { date: { parse: parseUs } } });
    expect(col.accessorFn({ id: "a", joined: "11/10/2026" }, 0)).toBe("2026-11-10");
    expect(col.accessorFn({ id: "a", joined: "not a date" }, 0)).toBeNull();
    // `accessorKey` is replaced, so TanStack reads the new accessor — under the same id.
    expect(col.accessorKey).toBeUndefined();
    expect(col.id).toBe("joined");
  });

  it("accepts Dates and ISO strings with no parse at all", () => {
    const col = one({ accessorKey: "joined", header: "Joined", meta: { date: true } });
    expect(col.accessorFn({ id: "a", joined: new Date(2026, 10, 10) }, 0)).toBe("2026-11-10");
    expect(col.accessorFn({ id: "a", joined: "2026-11-10T08:30:00Z" }, 0)).toBe("2026-11-10");
  });

  it("reads dotted accessor keys and keeps TanStack's id for them", () => {
    const col = one({ accessorKey: "nested.at", header: "At", meta: { date: true } });
    expect(col.accessorFn({ id: "a", joined: null, nested: { at: "2026-01-02" } }, 0)).toBe(
      "2026-01-02",
    );
    expect(col.id).toBe("nested_at");
  });

  it("sorts correctly as plain strings once parsed", () => {
    const col = one({ accessorKey: "joined", header: "Joined", meta: { date: { parse: parseUs } } });
    // As raw strings "2/1/2026" sorts after "11/10/2025"; as ISO days it does not.
    const values = ["2/1/2026", "11/10/2025", "12/31/2025"].map((joined) =>
      col.accessorFn({ id: "a", joined }, 0),
    ) as string[];
    expect([...values].sort()).toEqual(["2025-11-10", "2025-12-31", "2026-02-01"]);
  });

  it("shows the cell through format, and an empty cell as nothing", () => {
    const col = one({
      accessorKey: "joined",
      header: "Joined",
      meta: { date: { format: (date) => `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}` } },
    });
    expect(col.cell({ getValue: () => "2026-11-10" })).toBe("10.11.2026");
    expect(col.cell({ getValue: () => null })).toBe("");
  });

  it("leaves a column's own cell renderer alone", () => {
    const cell = () => "custom";
    const col = one({ accessorKey: "joined", header: "Joined", cell, meta: { date: true } });
    expect(col.cell).toBe(cell);
  });

  it("makes the filter a date filter and words its chip the same way", () => {
    const col = one({
      accessorKey: "joined",
      header: "Joined",
      meta: { filter: true, date: { format: { year: "numeric", month: "short", day: "numeric" }, locale: "en-US" } },
    });
    const filter = normalizeFilterDef(col.meta?.filter)!;
    expect(filter.type).toBe("date");
    const condition = { id: "c", columnId: "joined", operator: "is" as const, values: [] };
    expect(filter.formatValue?.("2026-11-10", condition)).toBe("Nov 10, 2026");
    expect(filter.formatValue?.(null, condition)).toBe("…");
  });

  it("keeps a declared filter type and formatValue", () => {
    const formatValue = () => "mine";
    const col = one({
      accessorKey: "joined",
      header: "Joined",
      meta: { filter: { type: "text", formatValue }, date: true },
    });
    const filter = normalizeFilterDef(col.meta?.filter)!;
    expect(filter.type).toBe("text");
    expect(filter.formatValue).toBe(formatValue);
  });

  it("exports what the cell shows, unless the column says otherwise", () => {
    const format = (date: Date) => `${date.getFullYear()}/${date.getMonth() + 1}`;
    const col = one({ accessorKey: "joined", header: "Joined", meta: { date: { format, parse: parseUs } } });
    expect(col.meta?.exportValue?.({ id: "a", joined: "11/10/2026" })).toBe("2026/11");
    expect(col.meta?.exportValue?.({ id: "a", joined: "" })).toBeNull();

    const exportValue = () => "raw";
    const own = one({ accessorKey: "joined", header: "Joined", meta: { exportValue, date: true } });
    expect(own.meta?.exportValue).toBe(exportValue);
  });
});

describe("isoDayToDate", () => {
  it("is local midnight, so no timezone formats it as the day before", () => {
    const date = isoDayToDate("2026-11-10");
    expect([date.getFullYear(), date.getMonth(), date.getDate(), date.getHours()]).toEqual([
      2026, 10, 10, 0,
    ]);
  });
});

describe("dateFormatter", () => {
  it("shows the ISO day unchanged when no format is given", () => {
    expect(dateFormatter({})("2026-11-10")).toBe("2026-11-10");
  });

  it("uses Intl options with the given locale", () => {
    expect(dateFormatter({ format: { dateStyle: "short" }, locale: "en-GB" })("2026-11-10")).toBe(
      "10/11/2026",
    );
  });
});
