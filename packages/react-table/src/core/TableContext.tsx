import { createContext, useContext, type ReactNode } from "react";
import type { DataTableApi } from "./types.js";
import type { RowData } from "@ui-organized/table-core";

/**
 * The styled parts are usable on their own — that is the whole point of layer 2
 * — so they need somewhere to find the table without every one of them taking
 * the api as a prop through four levels of markup.
 *
 * Typed as `DataTableApi<any>`: the provider is written once and the parts are
 * generic over whatever row type the consumer used. `useTableContext<Row>()`
 * narrows it back at the point of use, which is where the row type is actually
 * known.
 */
const TableContext = createContext<DataTableApi<any> | null>(null);

export interface TableProviderProps<T extends RowData> {
  value: DataTableApi<T>;
  children?: ReactNode;
}

export function TableProvider<T extends RowData>({ value, children }: TableProviderProps<T>) {
  return <TableContext.Provider value={value}>{children}</TableContext.Provider>;
}

export function useTableContext<T extends RowData = RowData>(): DataTableApi<T> {
  const context = useContext(TableContext);
  if (!context) {
    throw new Error(
      "A table part was rendered outside <TableProvider>. Wrap it in <TableProvider value={useDataTable(...)}> — or use <DataTable>, which does that for you.",
    );
  }
  return context as DataTableApi<T>;
}

/** For parts that are legitimately optional inside a table (toolbars reused elsewhere). */
export function useOptionalTableContext<T extends RowData = RowData>(): DataTableApi<T> | null {
  return useContext(TableContext) as DataTableApi<T> | null;
}
