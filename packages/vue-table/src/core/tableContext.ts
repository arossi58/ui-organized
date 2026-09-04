import { inject, provide, type InjectionKey } from "vue";
import type { RowData } from "@ui-organized/table-core";
import type { DataTableApi } from "./types.js";

/**
 * The styled parts are usable on their own — that is the whole point of layer 2
 * — so they need somewhere to find the table without every one of them taking
 * the api as a prop through four levels of markup.
 *
 * `provide`/`inject` rather than React's context object, but the arrangement is
 * the same one: `<DataTable>` provides, every part injects, and a part rendered
 * outside one says so with a message that names the fix.
 */
const TABLE_KEY = Symbol("ui-organized:data-table") as InjectionKey<DataTableApi<any>>;

export function provideTable<T extends RowData>(api: DataTableApi<T>): void {
  provide(TABLE_KEY, api);
}

export function useTableContext<T extends RowData = RowData>(): DataTableApi<T> {
  const api = inject(TABLE_KEY, null);
  if (!api) {
    throw new Error(
      "A table part was rendered outside a table. Provide one with " +
        "`provideTable(useDataTable(...))` — or use <DataTable>, which does that for you.",
    );
  }
  return api as DataTableApi<T>;
}

/** For parts that are legitimately optional inside a table (toolbars reused elsewhere). */
export function useOptionalTableContext<T extends RowData = RowData>(): DataTableApi<T> | null {
  return inject(TABLE_KEY, null) as DataTableApi<T> | null;
}
