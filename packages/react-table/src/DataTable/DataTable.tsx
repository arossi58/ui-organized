import { TableProvider } from "../core/TableContext.js";
import { useDataTable } from "../core/useDataTable.js";
import {
  Table,
  TableBody,
  TableFooter,
  TableHeader,
  TableViewport,
} from "../components/Table/index.js";
import { TableCards } from "../components/TableCards/index.js";
import { TableDetailSheet } from "../components/TableDetailSheet/index.js";
import { TablePagination } from "../components/TablePagination/index.js";
import { TableSelectionBar } from "../components/TableSelectionBar/index.js";
import { TableToolbar } from "../components/TableToolbar/index.js";
import type { DataTableProps } from "./DataTable.types.js";

/**
 * Layer 3: the whole table from a props object.
 *
 * It composes exactly the parts a consumer would compose by hand — which is the
 * test of whether layer 2 is real. Anything this does that the parts cannot is a
 * gap in the parts, not a feature of the wrapper.
 */
export function DataTable<T>({ className, ...options }: DataTableProps<T>) {
  const api = useDataTable<T>(options);

  return (
    <TableProvider value={api}>
      <Table className={className}>
        <TableToolbar />
        <TableSelectionBar />

        {api.mode === "cards" ? (
          <TableCards />
        ) : (
          <TableViewport>
            <TableHeader />
            <TableBody />
            <TableFooter />
          </TableViewport>
        )}

        {(options.paginated ?? false) && <TablePagination />}
        {options.detail && <TableDetailSheet />}
      </Table>
    </TableProvider>
  );
}
