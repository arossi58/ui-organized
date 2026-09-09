<script lang="ts">
  import type { Snippet } from "svelte";
  import { clsx } from "clsx";
  import { FlexRender } from "@tanstack/svelte-table";
  import { getTable } from "../../core/tableContext.js";

  let { class: className, children }: { class?: string; children?: Snippet } = $props();
  const table = getTable();

  const groups = $derived(table.table.getFooterGroups());
  const hasFooter = $derived(
    groups.some((group) =>
      group.headers.some((header) => header.column.columnDef.footer !== undefined),
    ),
  );
</script>

{#if children || hasFooter}
  <tfoot class={clsx("data-table__foot", className)}>
    {#if children}
      {@render children()}
    {:else}
      {#each groups as group (group.id)}
        <tr class="data-table__row">
          {#each group.headers as header (header.id)}
            <td class="data-table__cell">
              {#if !header.isPlaceholder}<FlexRender footer={header} />{/if}
            </td>
          {/each}
        </tr>
      {/each}
    {/if}
  </tfoot>
{/if}
