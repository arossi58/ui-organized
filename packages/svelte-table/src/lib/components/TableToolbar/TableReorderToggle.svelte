<!--
  Enters and leaves reorder mode, for `reorderable: "toggle"`. Absent for any
  other setting, and in card mode, which has no headers to move.

  The label says what a press does next — "Reorder", then "Done" — rather than
  carrying a pressed state, so the button reads the same to a screen reader as
  it does on screen, and "Done" is the obvious way out.
-->
<script lang="ts">
  import { Button } from "@ui-organized/svelte";
  import { getTable } from "../../core/tableContext.js";

  let { class: className }: { class?: string } = $props();
  const table = getTable();
</script>

{#if table.reorder.mode === "toggle" && table.mode !== "cards"}
  <Button
    intent={table.reorder.active ? "primary" : "secondary"}
    size={table.size}
    class={className}
    aria-label={table.reorder.active ? "Done reordering columns" : "Reorder columns"}
    onclick={() => table.reorder.setActive(!table.reorder.active)}
  >
    {table.reorder.active ? "Done" : "Reorder"}
  </Button>
{/if}
