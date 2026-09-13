<!--
  The row under the toolbar: what is filtered, and what is selected.

  Both halves are summaries of applied state, so they share a line rather than
  stacking. The earlier arrangement put the bulk actions on a third row, which
  meant ticking a checkbox pushed the chips up and left the actions two rows
  away from the sort and filter buttons they belong beside.

  It renders nothing at all until one of the halves has something to say — the
  same rule each half already applies to itself, restated here so an empty row
  never takes a slice of the table's `gap`.
-->
<script lang="ts">
  import { clsx } from "clsx";
  import { getTable } from "../../core/tableContext.js";
  import { TableFilters } from "../TableFilters/index.js";
  import { TableSelectionBar } from "../TableSelectionBar/index.js";

  let { class: className }: { class?: string } = $props();
  const table = getTable();

  const hasFilters = $derived(
    table.options.filterable !== false && table.filters.conditions.length > 0,
  );
  const render = $derived(hasFilters || table.selection.count > 0);
</script>

{#if render}
  <div class={clsx("data-table__subbar", className)}>
    <TableFilters />
    <TableSelectionBar />
  </div>
{/if}
