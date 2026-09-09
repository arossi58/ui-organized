import { InjectionToken, inject } from "@angular/core";
import type { RowData } from "@ui-organized/table-core";
import type { DataTableApi } from "./types.js";

/**
 * The styled parts are usable on their own — that is the whole point of layer 2
 * — so they need somewhere to find the table without every one of them taking
 * the api as an input through four levels of markup.
 *
 * An `InjectionToken` on the element injector, which is Angular's spelling of
 * the same arrangement React uses a context object for: the component that owns
 * the table provides it, every part injects it, and a part rendered outside one
 * says so with a message that names the fix.
 */
export const UIO_DATA_TABLE = new InjectionToken<DataTableApi<any>>("ui-organized:data-table");

/** Providers for a component that owns a table. */
export function provideDataTable<T extends RowData>(factory: () => DataTableApi<T>) {
  return { provide: UIO_DATA_TABLE, useFactory: factory };
}

export function injectDataTable<T extends RowData = RowData>(): DataTableApi<T> {
  const api = inject<DataTableApi<T> | null>(UIO_DATA_TABLE, { optional: true });
  if (!api) {
    throw new Error(
      "A table part was rendered outside a table. Provide one with " +
        "`provideDataTable(...)` — or use <uio-data-table>, which does that for you.",
    );
  }
  return api;
}

/** For parts that are legitimately optional inside a table (toolbars reused elsewhere). */
export function injectOptionalDataTable<T extends RowData = RowData>(): DataTableApi<T> | null {
  return inject<DataTableApi<T> | null>(UIO_DATA_TABLE, { optional: true });
}
