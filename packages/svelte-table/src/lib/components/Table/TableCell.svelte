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
  const editable = $derived(Boolean(meta?.edit));

  const cellProps = $derived(
    getCellProps({
      columnId: column.id,
      index,
      align: alignOf(column.columnDef),
      primary,
      sticky: stickyPositionOf(table.table as unknown as TableInstance<T>, column),
      focused,
      editable,
      editing: Boolean(editing),
      invalid: Boolean(editing?.invalid),
      interactive,
    }),
  );

  const onFocus = () => {
    if (interactive) table.focus.setCursor({ row: rowIndex, col: index });
  };
  // One click opens the editor. The click stops here either way: it must not
  // also activate the row (open its detail sheet), and a click *inside* the
  // open editor must not restart the edit and throw the draft away.
  const onClick = (event: MouseEvent) => {
    if (!editable) return;
    event.stopPropagation();
    if (!editing) table.edit.start(row, column.id);
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
    onclick={editable ? onClick : undefined}
  >
    {@render content()}
  </th>
{:else}
  <td
    {...svelteProps(cellProps)}
    data-cell={`${rowIndex}:${index}`}
    onfocus={onFocus}
    onclick={editable ? onClick : undefined}
  >
    {@render content()}
  </td>
{/if}
