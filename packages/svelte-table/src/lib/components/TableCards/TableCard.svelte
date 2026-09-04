<script lang="ts" generics="T extends RowData">
  import { clsx } from "clsx";
  import { FlexRender } from "@tanstack/svelte-table";
  import { Checkbox } from "@ui-organized/svelte";
  import type { RowData, TableRowModel } from "@ui-organized/table-core";
  import { getTable } from "../../core/tableContext.js";
  import { elementRef } from "../../core/elementRef.js";
  import { TableRowActions } from "../TableRowActions/index.js";

  let {
    row,
    index,
    fields,
    class: className,
  }: { row: TableRowModel<T>; index: number; fields: string[]; class?: string } = $props();

  const table = getTable<T>();
  const selected = $derived(table.selection.isSelected(row.id));
  const cells = $derived(row.getVisibleCells());
  const primaryCell = $derived(
    table.primaryColumnId
      ? cells.find((cell) => cell.column.id === table.primaryColumnId)
      : undefined,
  );
  const clickable = $derived(
    Boolean(table.options.detail) || Boolean(table.options.onRowClick),
  );
  const titleText = $derived(
    primaryCell ? String(primaryCell.getValue() ?? row.id) : row.id,
  );
  const cellFor = (columnId: string) => cells.find((cell) => cell.column.id === columnId);
  const headerFor = (columnId: string) => {
    const header = table.table.getColumn(columnId)?.columnDef.header;
    return typeof header === "string" ? header : columnId;
  };

  const measure = (element: HTMLElement | null) => {
    if (table.virtual.enabled && element) table.virtual.virtualizer.measureElement(element);
  };
</script>

<li
  class={clsx("data-table__card", selected && "data-table__card--selected", className)}
  data-index={index}
  data-row-id={row.id}
  use:elementRef={measure}
>
  <div class="data-table__card-header">
    {#if table.selection.mode !== "none"}
      <Checkbox
        checked={selected}
        aria-label={`Select ${titleText}`}
        onCheckedChange={(checked) => table.selection.toggle(row.id, checked)}
      />
    {/if}
    <!--
      A button rather than a clickable card: a card is not an interactive
      element, and making one is how a keyboard user loses the row.
    -->
    {#if clickable}
      <button
        type="button"
        class="data-table__card-title data-table__sort-button"
        onclick={() => table.activate(row)}
      >
        {#if primaryCell}<FlexRender cell={primaryCell} />{:else}{row.id}{/if}
      </button>
    {:else}
      <span class="data-table__card-title">
        {#if primaryCell}<FlexRender cell={primaryCell} />{:else}{row.id}{/if}
      </span>
    {/if}
    {#if table.options.rowActions?.length}
      <TableRowActions row={row.original} />
    {/if}
  </div>

  <dl class="data-table__card-fields">
    {#each fields as columnId (columnId)}
      {@const cell = cellFor(columnId)}
      {#if cell}
        <dt class="data-table__card-label">{headerFor(columnId)}</dt>
        <dd class="data-table__card-value"><FlexRender {cell} /></dd>
      {/if}
    {/each}
  </dl>
</li>
