<!--
  Empty, loading and error all live *inside* `<tbody>` rather than replacing the
  table.

  Keeping the header on screen keeps the column widths, the scroll position and
  the filter controls exactly where they were — so clearing a filter that emptied
  the table does not also move every control the user was about to click.
-->
<script lang="ts">
  import type { Snippet } from "svelte";
  import { clsx } from "clsx";
  import { getTable } from "../../core/tableContext.js";

  let {
    title,
    description,
    class: className,
    action,
  }: { title?: string; description?: string; class?: string; action?: Snippet } = $props();

  const table = getTable();
  const empty = $derived(table.options.empty);
  const heading = $derived(title ?? empty?.title ?? "Nothing to show");
  const detail = $derived(description ?? empty?.description);
</script>

<tr class="data-table__row">
  <td class={clsx("data-table__state-cell", className)} colspan={table.chrome.colCount}>
    <div class="data-table__state">
      <span class="data-table__state-title">{heading}</span>
      {#if detail}<span class="data-table__state-description">{detail}</span>{/if}
      {#if action}<div class="data-table__state-actions">{@render action()}</div>{/if}
    </div>
  </td>
</tr>
