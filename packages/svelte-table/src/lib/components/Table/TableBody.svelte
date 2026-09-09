<!--
  The body, and the four states it decides between on its own.

  Explicit content wins: layer-2 composition is the point of these parts.
  Otherwise `<TableBody />` alone is a complete table body — the error, the
  loading skeleton, the empty state and the rows are all its business.
-->
<script lang="ts" generics="T extends RowData">
  import type { Snippet } from "svelte";
  import { getSpacerProps, type RowData } from "@ui-organized/table-core";
  import { getTable } from "../../core/tableContext.js";
  import { svelteProps } from "../../core/props.js";
  import { TableEmpty, TableError, TableLoading } from "../TableStates/index.js";
  import TableRow from "./TableRow.svelte";

  let { children }: { children?: Snippet } = $props();
  const table = getTable<T>();

  const spacers = $derived(
    table.virtual.enabled ? table.virtual.spacers : { top: 0, bottom: 0 },
  );
  const renderRows = $derived(table.renderRows);
  const editTarget = $derived(table.edit.state.target);

  const state = $derived(
    children
      ? "slot"
      : table.options.error
        ? "error"
        : table.loading && renderRows.length === 0
          ? "loading"
          : renderRows.length === 0
            ? "empty"
            : "rows",
  );

  const spacerProps = (height: number) => getSpacerProps(height, table.chrome.colCount);
  const focusedColFor = (index: number) =>
    table.focus.cursor.row === index ? table.focus.cursor.col : null;
  const editContextFor = (row: (typeof renderRows)[number]["row"]) =>
    editTarget?.rowId === row.id ? table.edit.contextFor(row, editTarget.columnId) : null;
</script>

<tbody class="data-table__body">
  {#if state === "slot"}
    {@render children?.()}
  {:else if state === "error"}
    <TableError>
      {#if typeof table.options.error === "function"}
        {@render table.options.error()}
      {:else}
        {table.options.error}
      {/if}
    </TableError>
  {:else if state === "loading"}
    <TableLoading />
  {:else if state === "empty"}
    <TableEmpty />
  {:else}
    {#if spacers.top > 0}
      {@const props = spacerProps(spacers.top)}
      <tr {...svelteProps(props.row)}><td {...svelteProps(props.cell)}></td></tr>
    {/if}
    {#each renderRows as entry (entry.row.id)}
      <TableRow
        row={entry.row}
        index={entry.index}
        absoluteIndex={entry.absoluteIndex}
        focusedCol={focusedColFor(entry.index)}
        editContext={editContextFor(entry.row)}
      />
    {/each}
    {#if spacers.bottom > 0}
      {@const props = spacerProps(spacers.bottom)}
      <tr {...svelteProps(props.row)}><td {...svelteProps(props.cell)}></td></tr>
    {/if}
  {/if}
</tbody>
