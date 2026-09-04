<!--
  Skeleton rows sized to the real row height, so the table does not resize when
  the data lands — which is the entire reason to prefer a skeleton to a spinner.
  (There is no Spinner in the library, which settles it anyway.)
-->
<script lang="ts">
  import { clsx } from "clsx";
  import { Skeleton } from "@ui-organized/svelte";
  import { getTable } from "../../core/tableContext.js";

  let { rows = 8, class: className }: { rows?: number; class?: string } = $props();
  const table = getTable();
  const columns = $derived(table.table.getVisibleLeafColumns());
  const bars = $derived(Array.from({ length: rows }, (_, index) => index));
</script>

{#each bars as index (index)}
  <tr class="data-table__row" aria-hidden="true">
    {#each columns as column (column.id)}
      <td class={clsx("data-table__skeleton-cell", className)}>
        <!--
          Varied but deterministic: identical bars read as a progress bar, and a
          random width changes on every render.
        -->
        <Skeleton
          variant="text"
          width={`${55 + ((column.id.length * 7) % 35)}%`}
          height={table.size === "sm" ? 10 : 12}
        />
      </td>
    {/each}
  </tr>
{/each}
