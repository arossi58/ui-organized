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
export { default as Table } from "./Table.vue";
export { default as TableViewport } from "./TableViewport.vue";
export { default as TableHeader } from "./TableHeader.vue";
export { default as TableHeadCell } from "./TableHeadCell.vue";
export { default as TableBody } from "./TableBody.vue";
export { default as TableRow } from "./TableRow.vue";
export { default as TableCell } from "./TableCell.vue";
export { default as TableFooter } from "./TableFooter.vue";
