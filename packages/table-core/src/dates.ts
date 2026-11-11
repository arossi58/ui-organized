/**
 * Date columns in any format the data arrives in, shown in any format the
 * product wants — with one representation in between.
 *
 * Inside the table a date is always an ISO day, `YYYY-MM-DD`. Those strings
 * sort and compare lexicographically, which is what lets filtering and sorting
 * a 100,000-row table never construct a `Date` per row. `meta.date` is the
 * bridge on both sides of that: `parse` turns whatever the data holds into an
 * ISO day on the way in, and `format` turns the ISO day back into text on the
 * way out — the cell, the filter chip and the CSV export alike, so the three
 * never disagree.
 *
 * Core still never calls `Intl` on its own: its output varies by ICU version,
 * which would make visual baselines differ between machines. `format` is the
 * opt-in, and a column without one shows the ISO day it always has.
 */
import { columnId, metaOf } from "./columns.js";
import { VALUE_PLACEHOLDER } from "./filters/describe.js";
import { toIsoDay } from "./filters/operators.js";
import { normalizeFilterDef, type TableFilterDef } from "./filters/types.js";
import type { TableColumn, TableColumnMeta } from "./types.js";
import type { RowData } from "@tanstack/table-core";

export interface TableDateDef {
  /**
   * How the date reads in the cell, the filter chip and the CSV export.
   * `Intl.DateTimeFormat` options (with `locale`), or a function for anything
   * `Intl` cannot say. Omitted, the ISO day is shown as-is.
   */
  format?: Intl.DateTimeFormatOptions | ((date: Date) => string);
  /** Locale for `format` options. Defaults to the runtime's. */
  locale?: string | string[];
  /**
   * Reads the raw cell value. Return a `Date`, or a string that starts with an
   * ISO day; `null` for "no date". Needed only when the data is in some other
   * shape — `"11/10/2026"`, a Unix timestamp, `{ y, m, d }`. Omitted, the
   * value must already be a `Date` or an ISO string.
   */
  parse?: (value: unknown) => Date | string | null | undefined;
}

/** `true` marks a column as dates without changing how they read. */
export type TableDateSetting = TableDateDef | boolean;

/**
 * The ISO day as a `Date` at **local** midnight. `new Date("2026-11-10")` is
 * UTC midnight, which every timezone west of Greenwich formats as the 9th.
 */
export function isoDayToDate(iso: string): Date {
  const [year, month, day] = iso.slice(0, 10).split("-").map(Number);
  return new Date(year!, month! - 1, day!);
}

/** Builds the column's formatter once, rather than an `Intl` object per cell. */
export function dateFormatter(def: TableDateDef): (iso: string) => string {
  const { format, locale } = def;
  if (!format) return (iso) => iso;
  if (typeof format === "function") return (iso) => format(isoDayToDate(iso));
  const intl = new Intl.DateTimeFormat(locale, format);
  return (iso) => intl.format(isoDayToDate(iso));
}

/** Reads `accessorKey` the way TanStack does, dots included. */
function readKey(row: unknown, key: string): unknown {
  let value: unknown = row;
  for (const part of key.split(".")) {
    if (value === null || value === undefined) return undefined;
    value = (value as Record<string, unknown>)[part];
  }
  return value;
}

/**
 * Rewrites the columns that declare `meta.date`. Every other column, and the
 * array itself when none do, comes back untouched — TanStack memoizes on the
 * columns' identity, so a no-op must not be a new array.
 *
 * A date column gains:
 *
 * - an accessor that yields the ISO day (or `null`), so sorting, filtering,
 *   facets and type inference all see one comparable shape;
 * - a default `cell` that shows it through `format` — a string, which every
 *   adapter's renderer already handles; a column's own `cell` still wins, and
 *   receives the ISO day from `getValue()`;
 * - `filter.type: "date"` and a chip `formatValue`, unless declared;
 * - an `exportValue` that writes what the cell shows, unless declared.
 */
export function withDateColumns<T extends RowData>(
  columns: readonly TableColumn<T>[],
): readonly TableColumn<T>[] {
  if (!columns.some((def) => metaOf<T>(def)?.date)) return columns;

  return columns.map((def) => {
    const meta = metaOf<T>(def);
    const setting = meta?.date;
    if (!meta || !setting) return def;

    const dateDef: TableDateDef = setting === true ? {} : setting;
    const format = dateFormatter(dateDef);
    const source = def as TableColumn<T> & {
      accessorKey?: string | number;
      accessorFn?: (row: T, index: number) => unknown;
    };
    const raw: (row: T, index: number) => unknown = source.accessorFn
      ? source.accessorFn
      : source.accessorKey !== undefined
        ? (row) => readKey(row, String(source.accessorKey))
        : () => undefined;
    const isoOf = (row: T, index: number): string | null => {
      const value = raw(row, index);
      const parsed = dateDef.parse ? dateDef.parse(value) : value;
      return parsed === null || parsed === undefined ? null : toIsoDay(parsed);
    };
    const show = (iso: unknown) => (typeof iso === "string" && iso ? format(iso) : "");

    const filter = normalizeFilterDef(meta.filter);
    const nextFilter: TableFilterDef | undefined = filter && {
      ...filter,
      type: filter.type ?? "date",
      formatValue:
        filter.formatValue ??
        ((value) =>
          value === null || value === undefined || value === ""
            ? VALUE_PLACEHOLDER
            : typeof value === "string" && toIsoDay(value)
              ? format(value)
              : String(value)),
    };

    const nextMeta: TableColumnMeta<T> = {
      ...meta,
      ...(nextFilter ? { filter: nextFilter } : {}),
      exportValue: meta.exportValue ?? ((row) => show(isoOf(row, 0)) || null),
    };

    // `accessorKey` goes: TanStack would read it in preference to the new
    // accessor. The id it implied is kept explicitly, so state keyed on it —
    // sorting, filters, widths, a saved view — still finds the column.
    const { accessorKey: _key, ...rest } = source;
    return {
      ...rest,
      id: columnId(def),
      accessorFn: isoOf,
      cell: def.cell ?? (({ getValue }: { getValue: () => unknown }) => show(getValue())),
      meta: nextMeta,
    } as TableColumn<T>;
  });
}
