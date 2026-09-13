/**
 * Clipboard writes, TSV-shaped.
 *
 * Tab-separated rather than comma-separated on purpose: a TSV payload pastes
 * into Excel, Sheets and Numbers as cells, while a CSV payload pastes as one
 * column of text.
 */
import type { RowData } from "@tanstack/table-core";
import type { TableInstance } from "./types.js";
import { serializeRows, type SerializeOptions } from "./csv.js";

/**
 * Writes text to the clipboard, falling back to the `execCommand` path for
 * browsers and contexts where the async API is unavailable (it requires a
 * secure context, which rules out plain-HTTP intranets).
 *
 * Resolves false rather than throwing: a failed copy is a toast, not a crash.
 */
export async function writeClipboard(text: string): Promise<boolean> {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      /* Fall through to the legacy path. */
    }
  }
  if (typeof document === "undefined") return false;
  try {
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    // Off-screen rather than `display: none`: a hidden element cannot be
    // selected, and selection is what the legacy copy path acts on.
    area.style.position = "fixed";
    area.style.left = "-9999px";
    document.body.append(area);
    area.select();
    const ok = document.execCommand("copy");
    area.remove();
    return ok;
  } catch {
    return false;
  }
}

export async function copyRowsToClipboard<T extends RowData>(
  table: TableInstance<T>,
  options: SerializeOptions = {},
): Promise<boolean> {
  return writeClipboard(serializeRows(table, { delimiter: "\t", ...options }));
}
