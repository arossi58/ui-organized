<!--
  Layer 3: the whole table from a props object.

  It composes exactly the parts a consumer would compose by hand — which is the
  test of whether layer 2 is real. Anything this does that the parts cannot is a
  gap in the parts, not a feature of the wrapper.
-->
<script lang="ts" generics="T extends RowData">
  import type { RowData } from "@ui-organized/table-core";
  import { createDataTable } from "../core/createDataTable.svelte.js";
  import { setTable } from "../core/tableContext.js";
  import type { UseDataTableOptions } from "../core/types.js";
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
  import { TableSelectionFooter } from "../components/TableSelectionFooter/index.js";
  import { TableSubBar } from "../components/TableSubBar/index.js";
  import { TableToolbar } from "../components/TableToolbar/index.js";

  /**
   * `$props()` is reactive, so the whole object is handed to the composable as a
   * **getter** and every option read inside a `$derived` follows it.
   *
   * Svelte needs no equivalent of Vue's `withDefaults(..., { sortable: undefined })`
   * dance: `$props()` leaves an absent prop absent rather than casting a Boolean
   * to `false`, so `?? true` in the composable means what it says. That bug cost
   * the Vue port a table with no toolbar, no sorting, no search and no filters
   * — silently, because the first frame looked correct.
   */
  let props: UseDataTableOptions<T> & { class?: string } = $props();

  const table = createDataTable<T>(() => props);
  setTable(table);
</script>

<Table class={props.class}>
  <TableToolbar />
  <TableSubBar />

  {#if table.mode === "cards"}
    <TableCards />
    <!-- No viewport to ride in: the table view's footer lives inside
         TableViewport, so only card mode places one here. -->
    <TableSelectionFooter />
  {:else}
    <TableViewport>
      <TableHeader />
      <TableBody />
      <TableFooter />
    </TableViewport>
  {/if}

  {#if props.paginated}<TablePagination />{/if}
  {#if props.detail}<TableDetailSheet />{/if}
</Table>
