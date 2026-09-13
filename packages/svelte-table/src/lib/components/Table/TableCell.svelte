<script lang="ts" generics="T extends RowData">
  import { FlexRender } from "@tanstack/svelte-table";
  import {
    alignOf,
    getCellProps,
    metaOf,
    stickyPositionOf,
    type RowData,
    type TableCellInstance,
    type TableEditContext,
    type TableInstance,
    type TableRowModel,
  } from "@ui-organized/table-core";
  import { getTable } from "../../core/tableContext.js";
  import { svelteProps } from "../../core/props.js";
  import CellEditor from "./CellEditor.svelte";

  let {
    cell,
    row,
    index,
    rowIndex,
    primary,
    focused,
    editContext,
  }: {
    cell: TableCellInstance<T>;
    row: TableRowModel<T>;
    index: number;
    rowIndex: number;
    primary: boolean;
    focused: boolean;
    editContext: TableEditContext<T> | null;
  } = $props();

  const table = getTable<T>();
  const column = $derived(cell.column);
  const meta = $derived(metaOf<T>(column.columnDef));
  const editing = $derived(editContext?.columnId === column.id ? editContext : null);
  const interactive = $derived(table.interactive);

  const cellProps = $derived(
    getCellProps({
      columnId: column.id,
      index,
      align: alignOf(column.columnDef),
      primary,
      sticky: stickyPositionOf(table.table as unknown as TableInstance<T>, column),
      focused,
      editing: Boolean(editing),
      invalid: Boolean(editing?.invalid),
      interactive,
    }),
  );

  const onFocus = () => {
    if (interactive) table.focus.setCursor({ row: rowIndex, col: index });
  };
  const onDoubleClick = () => {
    if (meta?.edit) table.edit.start(row, column.id);
  };
</script>

<!--
  The identifying column is a real row header, which is what makes a screen
  reader announce "Ada Lovelace, Role, Engineer" instead of just "Engineer".
  Svelte has no dynamic element by name, so the two tags are written out; the
  props and the content are shared.
-->
{#snippet content()}
  {#if editing}
    <CellEditor>
      {@const rendered = meta?.edit?.render(editing)}
      {#if typeof rendered === "function"}{@render rendered()}{:else}{rendered}{/if}
    </CellEditor>
  {:else}
    <FlexRender {cell} />
  {/if}
{/snippet}

{#if primary}
  <th
    {...svelteProps(cellProps)}
    data-cell={`${rowIndex}:${index}`}
    onfocus={onFocus}
    ondblclick={onDoubleClick}
  >
    {@render content()}
  </th>
{:else}
  <td
    {...svelteProps(cellProps)}
    data-cell={`${rowIndex}:${index}`}
    onfocus={onFocus}
    ondblclick={onDoubleClick}
  >
    {@render content()}
  </td>
{/if}
