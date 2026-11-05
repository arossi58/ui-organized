<!--
  The row above the table: search, filters, and the controls that change what the
  table shows rather than what it contains.

  Not a `Toolbar` — that component is a `role="toolbar"` with roving focus, which
  is right for a cluster of icon buttons and wrong for a row containing a text
  input.
-->
<script lang="ts">
  import type { Snippet } from "svelte";
  import { clsx } from "clsx";
  import { Divider } from "@ui-organized/svelte";
  import { getTable } from "../../core/tableContext.js";
  import { TableFilterAdd } from "../TableFilters/index.js";
  import { TableSelectionBar } from "../TableSelectionBar/index.js";
  import { TableFilterSheet, TableSortSheet } from "../TableSheets/index.js";
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

  const selecting = $derived(table.selection.count > 0);

  /**
   * `scroll.overflowing` counts: a table whose only chrome is the two scroll
   * buttons still needs the row to put them in — columns off the right edge are
   * no less hidden for the table having no search box. So does a selection: its
   * bulk actions live in this row.
   */
  const render = $derived(
    selecting ||
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
    One row. The filter chips sit on the line below, in `TableSubBar`: they
    wrap, often onto a second and third line, and sharing this row with them
    would shunt the controls around every time a filter is added.

    While rows are selected, the bulk actions take the place of the table's own
    controls. What to do with the selection is the decision in front of the
    user, and sorting or adding a filter underneath it would change which rows
    it means. Clearing the selection brings the controls back.
  -->
  <div class={clsx("data-table__toolbar", className)}>
    {#if searchable}<TableSearch />{/if}
    <div class="data-table__toolbar-spacer"></div>

    {#if selecting}
      <TableSelectionBar />
      <!-- Stays: "Download selected rows" and "Copy selection" are actions on
           the selection, and live nowhere else. -->
      {#if exportable}<TableExportMenu />{/if}
    {:else}
      <TableActions />
      <!--
        Only when there is something on both sides of it. A rule with nothing to
        its left is a rule separating the toolbar from its own edge, which says
        nothing.
      -->
      {#if actions.length > 0}
        <Divider orientation="vertical" class="data-table__toolbar-divider" />
      {/if}

      <!--
        Card mode trades the two menus for labelled buttons that open a bottom
        sheet each, with what is applied counted on the button: there are no
        column headers to sort from and no room for a row of chips above the
        cards.
      -->
      {#if table.mode === "cards"}
        {#if sortMenu}<TableSortSheet />{/if}
        {#if filterable}<TableFilterSheet />{/if}
      {:else}
        {#if sortMenu}<TableSortMenu />{/if}
        {#if filterable}<TableFilterAdd iconOnly />{/if}
      {/if}
      {#if exportable}<TableExportMenu />{/if}
      {#if hideable}<TableViewOptions />{/if}
    {/if}
    <!-- Last, and only while the viewport is actually hiding columns. -->
    <TableScrollButtons />
  </div>
{/if}
