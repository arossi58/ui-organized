<script lang="ts">
  import { clsx } from "clsx";
  import { getHeaderRowProps } from "@ui-organized/table-core";
  import { getTable } from "../../core/tableContext.js";
  import { svelteProps } from "../../core/props.js";
  import TableHeadCell from "./TableHeadCell.svelte";

  let { class: className }: { class?: string } = $props();
  const table = getTable();
  const groups = $derived(table.table.getHeaderGroups());
  const rowProps = getHeaderRowProps();
</script>

<thead class={clsx("data-table__head", className)}>
  {#each groups as group (group.id)}
    <tr {...svelteProps(rowProps)}>
      {#each group.headers as header, index (header.id)}
        <TableHeadCell {header} {index} />
      {/each}
    </tr>
  {/each}
</thead>
