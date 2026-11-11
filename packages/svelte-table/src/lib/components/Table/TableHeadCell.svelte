<!-- One header cell: the sort control, the roving tab stop, and the resize grip. -->
<script lang="ts" generics="T extends RowData">
  import { FlexRender } from "@tanstack/svelte-table";
  import { Icon } from "@ui-organized/svelte";
  import {
    alignOf,
    dropSideAt,
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
  import MoveButtons from "./MoveButtons.svelte";
  import { internalGlyph as glyph } from "@ui-organized/svelte";

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

  const movable = $derived(table.reorder.active && table.reorder.isMovable(column.id));
  const drag = $derived(table.reorder.drag);
  const dropSide = $derived(
    drag && drag.target === column.id && drag.source !== column.id ? drag.side : undefined,
  );
  const headerText = $derived(
    typeof column.columnDef.header === "string" ? column.columnDef.header : column.id,
  );

  // The drag source is the label area, not the <th>: with the <th>
  // draggable, pressing the resize handle started a native drag that took the
  // pointer away from the resize. A drag starting on the move buttons is theirs.
  const onDragStart = (event: DragEvent) => {
    if (!movable) return;
    const origin = event.target as Element;
    if (origin.closest(".data-table__move")) {
      event.preventDefault();
      return;
    }
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", column.id);
    }
    table.reorder.setDrag({ source: column.id, target: null, side: "before" });
  };
  const onDragOver = (event: DragEvent) => {
    if (!movable || !drag) return;
    event.preventDefault();
    if (event.dataTransfer) event.dataTransfer.dropEffect = "move";
    const side = dropSideAt(
      event.clientX,
      (event.currentTarget as HTMLElement).getBoundingClientRect(),
    );
    if (drag.target !== column.id || drag.side !== side) {
      table.reorder.setDrag({ ...drag, target: column.id, side });
    }
  };
  const onDrop = (event: DragEvent) => {
    if (!movable || !drag) return;
    event.preventDefault();
    const side = dropSideAt(
      event.clientX,
      (event.currentTarget as HTMLElement).getBoundingClientRect(),
    );
    table.reorder.drop(drag.source, column.id, side);
    table.reorder.setDrag(null);
  };
  const onDragEnd = () => {
    if (movable) table.reorder.setDrag(null);
  };

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
    <Icon name={glyph("edit")} size={14} />
    <span class="data-table__sr-only">, editable</span>
  </span>
{/snippet}

<th
  {...svelteProps(cellProps)}
  data-cell={`-1:${index}`}
  tabindex={interactive ? (focused ? 0 : -1) : undefined}
  onfocus={() => (interactive ? table.focus.setCursor({ row: -1, col: index }) : undefined)}
  data-dragging={drag?.source === column.id ? "" : undefined}
  data-drop={dropSide}
  ondragover={onDragOver}
  ondrop={onDrop}
>
  <div
    class="data-table__head-inner"
    draggable={movable ? "true" : undefined}
    ondragstart={onDragStart}
    ondragend={onDragEnd}
  >
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
          <Icon name={glyph(sorted === "desc" ? "sort-desc" : "sort-asc")} size={14} />
        </span>
      </button>
    {:else}
      <span class="data-table__head-label">
        {#if !header.isPlaceholder}<FlexRender {header} />{/if}
      </span>
      {#if editable}{@render editMark()}{/if}
    {/if}
    {#if movable}<MoveButtons columnId={column.id} name={headerText} />{/if}
  </div>
  {#if column.getCanResize()}<ResizeHandle {header} />{/if}
</th>
