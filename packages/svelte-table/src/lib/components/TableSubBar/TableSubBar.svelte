<!--
  The row under the toolbar: what is filtered.

  The selection's bulk actions used to share this line. They now replace the
  toolbar's own controls while anything is selected (see `TableToolbar`), so
  acting on the selection happens in the row the user was already reading.

  It renders nothing at all until there is a filter to show, so an empty row
  never takes a slice of the table's `gap` — and nothing in card mode, where
  the filter sheet holds them.
-->
<script lang="ts">
  import { clsx } from "clsx";
  import { getTable } from "../../core/tableContext.js";
  import { TableFilters } from "../TableFilters/index.js";

  let { class: className }: { class?: string } = $props();
  const table = getTable();

  // In card mode every filter lives in the filter sheet, and the toolbar's
  // Filter button counts them; a chips row would repeat it above a list that is
  // already short of room.
  const hasFilters = $derived(
    table.options.filterable !== false &&
      table.filters.conditions.length > 0 &&
      table.mode !== "cards",
  );
</script>

{#if hasFilters}
  <div class={clsx("data-table__subbar", className)}>
    <TableFilters />
  </div>
{/if}
