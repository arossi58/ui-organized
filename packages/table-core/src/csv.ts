/**
 * CSV / TSV serialization.
 *
 * Export respects what the user is actually looking at — filters, sort order and
 * column visibility — because an export that silently returns the unfiltered
 * dataset is worse than no export: it looks like it worked.
 */
import type { Table } from "@tanstack/table-core";
import { isReservedColumn, metaOf } from "./columns.js";
import type { TableRowScope } from "./types.js";

export interface SerializeOptions {
  /** Which rows: what is on screen, what is ticked, or the whole dataset. */
  scope?: TableRowScope;
  /** `,` for CSV, `\t` for the clipboard. */
  delimiter?: string;
  /** Emit the column headers as the first line. Defaults to true. */
  header?: boolean;
}

function rowsFor<T>(table: Table<T>, scope: TableRowScope) {
  switch (scope) {
    case "selected":
      return table.getSelectedRowModel().rows;
    case "all":
      // Pre-pagination, post-filter: "all" means the whole result set, not the
      // whole database — the rows the client actually has.
      return table.getPrePaginationRowModel().rows;
    default:
      return table.getRowModel().rows;
  }
}

/**
 * RFC 4180 quoting: quote a field that contains the delimiter, a quote or a
 * newline, and double any quote inside it.
 *
 * The leading-formula guard is deliberate. A cell beginning `=`, `+`, `-` or `@`
 * is executed as a formula when the file is opened in Excel or Sheets, which is
 * a live CSV-injection vector out of any table whose data is user-supplied.
 */
export function escapeField(value: unknown, delimiter: string): string {
  if (value === null || value === undefined) return "";
  let text = String(value);
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  if (text.includes(delimiter) || text.includes('"') || /[\r\n]/.test(text)) {
    return `"${text.replaceAll('"', '""')}"`;
  }
  return text;
}

export function serializeRows<T>(table: Table<T>, options: SerializeOptions = {}): string {
  const delimiter = options.delimiter ?? ",";
  const scope = options.scope ?? "view";
  const columns = table.getVisibleLeafColumns().filter((column) => !isReservedColumn(column.id));

  const lines: string[] = [];

  if (options.header !== false) {
    lines.push(
      columns
        .map((column) => {
          const header = column.columnDef.header;
          // A function header renders a framework element; its plain-text name
          // is not available here, so the column id is the honest fallback.
          return escapeField(typeof header === "string" ? header : column.id, delimiter);
        })
        .join(delimiter),
    );
  }

  for (const row of rowsFor(table, scope)) {
    lines.push(
      columns
        .map((column) => {
          const exportValue = metaOf<T>(column.columnDef)?.exportValue;
          const value = exportValue ? exportValue(row.original) : row.getValue(column.id);
          return escapeField(value, delimiter);
        })
        .join(delimiter),
    );
  }

  return lines.join("\r\n");
}

export interface ExportOptions extends SerializeOptions {
  /** Defaults to `export.csv`. */
  filename?: string;
}

/**
 * Serializes and hands the browser a download.
 *
 * SSR-guarded: on a server this returns the content and does nothing else, so a
 * component that wires the handler unconditionally still renders.
 */
export function exportRowsToCsv<T>(table: Table<T>, options: ExportOptions = {}): string {
  const content = serializeRows(table, { delimiter: ",", ...options });
  if (typeof document === "undefined" || typeof URL.createObjectURL !== "function") return content;

  // The BOM is what makes Excel read the file as UTF-8 rather than as the
  // system codepage, which is the difference between "Ana" and "AnÃ¡".
  const blob = new Blob([`﻿${content}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = options.filename ?? "export.csv";
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
  return content;
}
