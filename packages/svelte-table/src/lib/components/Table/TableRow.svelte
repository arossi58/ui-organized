<!--
  One row.

  React memoizes this on a hand-written nine-field comparator, and threads every
  value it needs through props so the comparator can see them. Svelte needs
  neither: a component re-renders only what its own reads touch, so the row takes
  what genuinely *varies per row* as props and reads the rest — the table, the
  handlers, `interactive` — from context. That is the first of the two places the
  plan predicted this port would get simpler.
-->
<script lang="ts" generics="T extends RowData">
  import {
    getRowProps,
    type RowData,
    type TableEditContext,
    type TableRowModel,
  } from "@ui-organized/table-core";
  import { getTable } from "../../core/tableContext.js";
  import { elementRef } from "../../core/elementRef.js";
  import { svelteProps } from "../../core/props.js";
  import TableCell from "./TableCell.svelte";

  let {
    row,
    index,
    absoluteIndex,
    focusedCol,
    editContext,
  }: {
    row: TableRowModel<T>;
    index: number;
    absoluteIndex: number;
    focusedCol: number | null;
    editContext: TableEditContext<T> | null;
  } = $props();

  const table = getTable<T>();
  const clickable = $derived(
    Boolean(table.options.onRowClick) || Boolean(table.options.detail),
  );
  const selected = $derived(table.selection.isSelected(row.id));
  const editing = $derived(table.edit.state.target?.rowId === row.id);

  const rowProps = $derived(
    getRowProps({
      rowId: row.id,
      index: absoluteIndex,
      selected,
      editing,
      selectable: table.selection.mode !== "none",
      interactive: table.interactive,
      clickable,
    }),
  );

  const cells = $derived(row.getVisibleCells());

  /**
   * The virtualizer measures the real row rather than trusting the estimate, so
   * a re-themed row height corrects itself on the first frame.
   */
  const measure = (element: HTMLElement | null) => {
    if (table.virtual.enabled && element) table.virtual.virtualizer.measureElement(element);
  };
</script>

<tr
  {...svelteProps(rowProps)}
  data-index={index}
  use:elementRef={measure}
  onclick={() => table.activate(row)}
>
  {#each cells as cell, colIndex (cell.id)}
    <TableCell
      {cell}
      {row}
      index={colIndex}
      rowIndex={index}
      primary={cell.column.id === table.primaryColumnId}
      focused={focusedCol === colIndex}
      {editContext}
    />
  {/each}
</tr>
