<!-- One header cell: the sort control, the roving tab stop, and the resize grip. -->
<script setup lang="ts" generic="T extends RowData">
import { computed } from "vue";
import { FlexRender } from "@tanstack/vue-table";
import { Icon } from "@ui-organized/vue";
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
import { useTableContext } from "../../core/tableContext.js";
import { vueProps } from "../../core/props.js";
import ResizeHandle from "./ResizeHandle.vue";
import MoveButtons from "./MoveButtons.vue";
import { internalGlyph as glyph } from "@ui-organized/vue";

const props = defineProps<{ header: TableHeaderInstance<T>; index: number }>();
const table = useTableContext<T>();

const column = computed(() => props.header.column);
const sortable = computed(() => column.value.getCanSort());
const sorted = computed(() => column.value.getIsSorted());
const interactive = computed(() => table.interactive.value);
const focused = computed(
  () =>
    interactive.value &&
    table.focus.cursor.value.row === -1 &&
    table.focus.cursor.value.col === props.index,
);
const editable = computed(() => Boolean(metaOf<T>(column.value.columnDef)?.edit));

const movable = computed(
  () => table.reorder.active.value && table.reorder.isMovable(column.value.id),
);
const drag = computed(() => table.reorder.drag.value);
const dropSide = computed(() => {
  const current = drag.value;
  return current && current.target === column.value.id && current.source !== column.value.id
    ? current.side
    : undefined;
});
const headerText = computed(() => {
  const header = column.value.columnDef.header;
  return typeof header === "string" ? header : column.value.id;
});

// The drag source is the label area, not the <th>: with the <th> draggable,
// pressing the resize handle started a native drag that took the pointer away
// from the resize. A drag starting on the move buttons is theirs.
function onDragStart(event: DragEvent) {
  if (!movable.value) return;
  const origin = event.target as Element;
  if (origin.closest(".data-table__move")) {
    event.preventDefault();
    return;
  }
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", column.value.id);
  }
  table.reorder.setDrag({ source: column.value.id, target: null, side: "before" });
}

function onDragOver(event: DragEvent) {
  const current = drag.value;
  if (!movable.value || !current) return;
  event.preventDefault();
  if (event.dataTransfer) event.dataTransfer.dropEffect = "move";
  const side = dropSideAt(
    event.clientX,
    (event.currentTarget as HTMLElement).getBoundingClientRect(),
  );
  if (current.target !== column.value.id || current.side !== side) {
    table.reorder.setDrag({ ...current, target: column.value.id, side });
  }
}

function onDrop(event: DragEvent) {
  const current = drag.value;
  if (!movable.value || !current) return;
  event.preventDefault();
  const side = dropSideAt(
    event.clientX,
    (event.currentTarget as HTMLElement).getBoundingClientRect(),
  );
  table.reorder.drop(current.source, column.value.id, side);
  table.reorder.setDrag(null);
}

function onDragEnd() {
  if (movable.value) table.reorder.setDrag(null);
}

const cellProps = computed(() =>
  getHeadCellProps({
    columnId: column.value.id,
    index: props.index,
    align: alignOf(column.value.columnDef),
    sortable: sortable.value,
    sortDirection: sorted.value === false ? false : sorted.value,
    sticky: stickyPositionOf(table.table as unknown as TableInstance<T>, column.value),
    resizing: column.value.getIsResizing(),
    interactive: interactive.value,
    editable: editable.value,
  }),
);
</script>

<template>
  <th
    v-bind="vueProps(cellProps)"
    :data-cell="`-1:${index}`"
    :tabindex="interactive ? (focused ? 0 : -1) : undefined"
    @focus="interactive ? table.focus.setCursor({ row: -1, col: index }) : undefined"
    :data-dragging="drag?.source === column.id || undefined"
    :data-drop="dropSide"
    @dragover="onDragOver"
    @drop="onDrop"
  >
    <div
      class="data-table__head-inner"
      :draggable="movable || undefined"
      @dragstart="onDragStart"
      @dragend="onDragEnd"
    >
      <!--
        The roving tabindex covers the header row too, so ArrowUp out of the
        first body row lands somewhere focusable and Enter sorts from there.
        Inner controls are not their own tab stops in a grid; the cell is.
      -->
      <button
        v-if="sortable"
        type="button"
        class="data-table__sort-button"
        :tabindex="interactive ? -1 : undefined"
        @click="column.getToggleSortingHandler()?.($event)"
      >
        <span class="data-table__head-label">
          <FlexRender v-if="!header.isPlaceholder" :header="header" />
        </span>
        <!--
          The pencil on an editable column's header. The words go with it: as
          part of the column header, ", editable" is announced with every cell
          in the column, which is where a screen-reader user needs to learn that
          Enter opens an editor.
        -->
        <span v-if="editable" class="data-table__edit-icon">
          <Icon :name="glyph('edit')" :size="14" />
          <span class="data-table__sr-only">, editable</span>
        </span>
        <span class="data-table__sort-icon">
          <Icon :name="glyph(sorted === 'desc' ? 'sort-desc' : 'sort-asc')" :size="14" />
        </span>
      </button>
      <template v-else>
        <span class="data-table__head-label">
          <FlexRender v-if="!header.isPlaceholder" :header="header" />
        </span>
        <span v-if="editable" class="data-table__edit-icon">
          <Icon :name="glyph('edit')" :size="14" />
          <span class="data-table__sr-only">, editable</span>
        </span>
      </template>
      <MoveButtons v-if="movable" :column-id="column.id" :name="headerText" />
    </div>
    <ResizeHandle v-if="column.getCanResize()" :header="header" />
  </th>
</template>
