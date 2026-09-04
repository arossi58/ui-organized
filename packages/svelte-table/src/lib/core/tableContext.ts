import { getContext, setContext } from "svelte";
import type { RowData } from "@ui-organized/table-core";
import type { DataTableApi } from "./types.js";

/**
 * The styled parts are usable on their own — that is the whole point of layer 2
 * — so they need somewhere to find the table without every one of them taking
 * the api as a prop through four levels of markup.
 *
 * `setContext`/`getContext` rather than React's context object, but the
 * arrangement is the same: `<DataTable>` sets, every part gets, and a part
 * rendered outside one says so with a message that names the fix.
 *
 * The api is a bag of getters over runes, so it can be put in context directly:
 * context is read once at construction and the reactivity travels with the
 * object rather than with the read.
 */
const TABLE_KEY = Symbol("ui-organized:data-table");

export function setTable<T extends RowData>(api: DataTableApi<T>): void {
  setContext(TABLE_KEY, api);
}

export function getTable<T extends RowData = RowData>(): DataTableApi<T> {
  const api = getContext<DataTableApi<T> | undefined>(TABLE_KEY);
  if (!api) {
    throw new Error(
      "A table part was rendered outside a table. Provide one with " +
        "`setTable(createDataTable(() => options))` — or use <DataTable>, which does that for you.",
    );
  }
  return api;
}

/** For parts that are legitimately optional inside a table (toolbars reused elsewhere). */
export function getOptionalTable<T extends RowData = RowData>(): DataTableApi<T> | null {
  return getContext<DataTableApi<T> | undefined>(TABLE_KEY) ?? null;
}
