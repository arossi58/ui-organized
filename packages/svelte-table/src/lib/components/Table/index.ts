/**
 * The parts, flat-exported — `TableHeader`, not `Table.Header`. That is the
 * repo's convention everywhere else (`DialogContent`, `MenuItem`) and there is
 * no reason for the table to be the exception.
 *
 * The DOM they compose to:
 *
 *   <Table>              <div class="data-table">        root, size + variant
 *     <TableToolbar>     …
 *     <TableViewport>    <div class="data-table__viewport"><table>
 *       <TableHeader>    <thead>
 *       <TableBody>      <tbody>   spacer / rows / spacer
 *     <TablePagination>
 */
export { default as Table } from "./Table.svelte";
export { default as TableViewport } from "./TableViewport.svelte";
export { default as TableHeader } from "./TableHeader.svelte";
export { default as TableHeadCell } from "./TableHeadCell.svelte";
export { default as TableBody } from "./TableBody.svelte";
export { default as TableRow } from "./TableRow.svelte";
export { default as TableCell } from "./TableCell.svelte";
export { default as TableFooter } from "./TableFooter.svelte";
