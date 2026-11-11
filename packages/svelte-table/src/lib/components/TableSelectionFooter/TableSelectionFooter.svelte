<!--
  Under the rows: how many are selected, and the offer to select the matching
  rows that are not on screen.

  At the bottom rather than in the toolbar, because that is where the user's
  eye is once they have ticked down a page — and where the visible rows run out
  is where "there are more of these" belongs. The bulk actions stay in the
  toolbar (see `TableSelectionBar`).

  The offer is a real button, and counts the rows it would *add*: "Select
  99,981 hidden rows" says plainly that the ticks so far only reached what was
  visible.
-->
<script lang="ts">
  import { clsx } from "clsx";
  import { Button } from "@ui-organized/svelte";
  import { selectHiddenLabel, selectionCountLabel } from "@ui-organized/table-core";
  import { getTable } from "../../core/tableContext.js";

  let { class: className }: { class?: string } = $props();
  const table = getTable();
</script>

{#if table.selection.count > 0}
  <div class={clsx("data-table__selection-footer", className)}>
    <!-- Announced on change: ticking a row changes nothing else a screen
         reader user would hear. -->
    <span class="data-table__selection-count" aria-live="polite">
      {selectionCountLabel(table.selection.count)}
    </span>

    {#if table.selection.canSelectAllMatching}
      <Button size={table.size} intent="secondary" onclick={() => table.selection.selectAllMatching()}>
        {selectHiddenLabel(table.selection.totalMatching, table.selection.count)}
      </Button>
    {/if}
  </div>
{/if}
