<!--
  The row above the table: search, filters, and the controls that change what the
  table shows rather than what it contains.

  Not a `Toolbar` — that component is a `role="toolbar"` with roving focus, which
  is right for a cluster of icon buttons and wrong for a row containing a text
  input. The selection bar, which *is* a button cluster, does use it.
-->
<script lang="ts">
  import type { Snippet } from "svelte";
  import { clsx } from "clsx";
  import { Divider } from "@ui-organized/svelte";
  import { getTable } from "../../core/tableContext.js";
  import { TableFilterAdd } from "../TableFilters/index.js";
  import TableActions from "./TableActions.svelte";
  import TableExportMenu from "./TableExportMenu.svelte";
  import TableScrollButtons from "./TableScrollButtons.svelte";
  import TableSearch from "./TableSearch.svelte";
  import TableSortMenu from "./TableSortMenu.svelte";
  import TableViewOptions from "./TableViewOptions.svelte";

  let { class: className, children }: { class?: string; children?: Snippet } = $props();
  const table = getTable();

  const searchable = $derived(table.options.searchable ?? true);
  const hideable = $derived(table.options.hideableColumns ?? false);
  const exportable = $derived(table.options.exportable ?? false);
  const filterable = $derived(table.options.filterable ?? true);
  const actions = $derived(table.options.actions ?? []);
  const sortMenu = $derived(
    (table.options.sortMenu ?? true) &&
      (table.options.sortable ?? true) &&
      table.table.getAllLeafColumns().some((column) => column.getCanSort()),
  );

  /**
   * `scroll.overflowing` counts: a table whose only chrome is the two scroll
   * buttons still needs the row to put them in — columns off the right edge are
   * no less hidden for the table having no search box.
   */
  const render = $derived(
    searchable ||
      hideable ||
      exportable ||
      filterable ||
      sortMenu ||
      table.scroll.state.overflowing ||
      actions.length > 0,
  );
</script>

{#if children}
  <div class={clsx("data-table__toolbar", className)}>{@render children()}</div>
{:else if render}
  <!--
    One row. What is *applied* — the filter chips and the selection's bulk
    actions — sits on the line below, in `TableSubBar`: chips wrap, often onto a
    second and third line, and sharing this row with them would shunt the
    controls around every time a filter is added.
  -->
  <div class={clsx("data-table__toolbar", className)}>
    {#if searchable}<TableSearch />{/if}
    <div class="data-table__toolbar-spacer"></div>

    <TableActions />
    <!--
      Only when there is something on both sides of it. A rule with nothing to
      its left is a rule separating the toolbar from its own edge, which says
      nothing.
    -->
    {#if actions.length > 0}
      <Divider orientation="vertical" class="data-table__toolbar-divider" />
    {/if}

    {#if sortMenu}<TableSortMenu />{/if}
    {#if filterable}<TableFilterAdd iconOnly />{/if}
    {#if exportable}<TableExportMenu />{/if}
    {#if hideable}<TableViewOptions />{/if}
    <!-- Last, and only while the viewport is actually hiding columns. -->
    <TableScrollButtons />
  </div>
{/if}
