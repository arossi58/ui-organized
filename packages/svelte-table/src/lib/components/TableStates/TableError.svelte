<script lang="ts">
  import type { Snippet } from "svelte";
  import { clsx } from "clsx";
  import { getTable } from "../../core/tableContext.js";

  let {
    title = "Could not load this table",
    class: className,
    children,
  }: { title?: string; class?: string; children?: Snippet } = $props();

  const table = getTable();
</script>

<tr class="data-table__row">
  <td class={clsx("data-table__state-cell", className)} colspan={table.chrome.colCount}>
    <!--
      `alert` rather than a plain region: the error arrives after the user has
      moved on, so it has to announce itself.
    -->
    <div class="data-table__state data-table__state--error" role="alert">
      <span class="data-table__state-title">{title}</span>
      {#if children}<span class="data-table__state-description">{@render children()}</span>{/if}
    </div>
  </td>
</tr>
