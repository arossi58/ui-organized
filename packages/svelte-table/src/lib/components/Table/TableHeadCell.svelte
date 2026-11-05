<!-- One header cell: the sort control, the roving tab stop, and the resize grip. -->
<script lang="ts" generics="T extends RowData">
  import { FlexRender } from "@tanstack/svelte-table";
  import { Icon } from "@ui-organized/svelte";
  import {
    alignOf,
    getHeadCellProps,
    metaOf,
    stickyPositionOf,
    type RowData,
    type TableHeaderInstance,
    type TableInstance,
  } from "@ui-organized/table-core";
  import { getTable } from "../../core/tableContext.js";
  import { svelteProps } from "../../core/props.js";
  import ResizeHandle from "./ResizeHandle.svelte";

  let { header, index }: { header: TableHeaderInstance<T>; index: number } = $props();
  const table = getTable<T>();

  const column = $derived(header.column);
  const sortable = $derived(column.getCanSort());
  const sorted = $derived(column.getIsSorted());
  const interactive = $derived(table.interactive);
  const focused = $derived(
    interactive && table.focus.cursor.row === -1 && table.focus.cursor.col === index,
  );

  const editable = $derived(Boolean(metaOf<T>(column.columnDef)?.edit));

  const cellProps = $derived(
    getHeadCellProps({
      columnId: column.id,
      index,
      align: alignOf(column.columnDef),
      sortable,
      sortDirection: sorted === false ? false : sorted,
      sticky: stickyPositionOf(table.table as unknown as TableInstance<T>, column),
      resizing: column.getIsResizing(),
      interactive,
      editable,
    }),
  );
</script>

<!--
  The pencil on an editable column's header. The words go with it: as part of
  the column header, ", editable" is announced with every cell in the column,
  which is where a screen-reader user needs to learn that Enter opens an editor.
-->
{#snippet editMark()}
  <span class="data-table__edit-icon">
    <Icon name="edit" size={14} />
    <span class="data-table__sr-only">, editable</span>
  </span>
{/snippet}

<th
  {...svelteProps(cellProps)}
  data-cell={`-1:${index}`}
  tabindex={interactive ? (focused ? 0 : -1) : undefined}
  onfocus={() => (interactive ? table.focus.setCursor({ row: -1, col: index }) : undefined)}
>
  <div class="data-table__head-inner">
    <!--
      The roving tabindex covers the header row too, so ArrowUp out of the first
      body row lands somewhere focusable and Enter sorts from there. Inner
      controls are not their own tab stops in a grid; the cell is.
    -->
    {#if sortable}
      <button
        type="button"
        class="data-table__sort-button"
        tabindex={interactive ? -1 : undefined}
        onclick={(event) => column.getToggleSortingHandler()?.(event)}
      >
        <span class="data-table__head-label">
          {#if !header.isPlaceholder}<FlexRender {header} />{/if}
        </span>
        {#if editable}{@render editMark()}{/if}
        <span class="data-table__sort-icon">
          <Icon name={sorted === "desc" ? "sort-desc" : "sort-asc"} size={14} />
        </span>
      </button>
    {:else}
      <span class="data-table__head-label">
        {#if !header.isPlaceholder}<FlexRender {header} />{/if}
      </span>
      {#if editable}{@render editMark()}{/if}
    {/if}
  </div>
  {#if column.getCanResize()}<ResizeHandle {header} />{/if}
</th>
