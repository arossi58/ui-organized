<!--
  One condition inside a field's section: its relation, its value, and a way to
  clear it. The field is the section, so there is no field control.
-->
<script lang="ts">
  import { Button, Select } from "@ui-organized/svelte";
  import type { TableFilterCondition } from "@ui-organized/table-core";
  import { getTable } from "../../core/tableContext.js";
  import TableFilterValueEditor from "../TableFilters/TableFilterValueEditor.svelte";

  let { condition, fieldLabel }: { condition: TableFilterCondition; fieldLabel: string } =
    $props();
  const table = getTable();

  // The sheet is a modal dialog, which hides everything outside itself from
  // assistive tech; a Select or Listbox that portals to <body> would be painted
  // but unreachable. Portalling into the condition keeps it inside.
  let container = $state<HTMLElement | null>(null);
  const description = $derived(table.filters.describe(condition));
</script>

<div class="data-table__sheet-filter" bind:this={container} data-filter-id={condition.id}>
  <Select
    size={table.size}
    label="Condition"
    options={table.filters
      .operatorsFor(condition)
      .map((op) => ({ value: op.id, label: op.label }))}
    value={condition.operator}
    onValueChange={(operator) => table.filters.update(condition.id, { operator })}
    portalContainer={container}
  />
  <div class="data-table__sheet-filter-value">
    <TableFilterValueEditor
      {condition}
      arity={table.filters.arityOf(condition)}
      portalContainer={container}
    />
  </div>
  {#if description.complete}
    <Button
      intent="ghost"
      size={table.size}
      icon="close"
      class="data-table__sheet-remove"
      aria-label={`Clear filter: ${description.text}`}
      onclick={() => table.filters.remove(condition.id)}
    >
      {`Clear ${fieldLabel}`}
    </Button>
  {/if}
</div>
