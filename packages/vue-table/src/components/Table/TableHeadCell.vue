<!-- One header cell: the sort control, the roving tab stop, and the resize grip. -->
<script setup lang="ts" generic="T extends RowData">
import { computed } from "vue";
import { FlexRender } from "@tanstack/vue-table";
import { Icon } from "@ui-organized/vue";
import {
  alignOf,
  getHeadCellProps,
  stickyPositionOf,
  type RowData,
  type TableHeaderInstance,
  type TableInstance,
} from "@ui-organized/table-core";
import { useTableContext } from "../../core/tableContext.js";
import { vueProps } from "../../core/props.js";
import ResizeHandle from "./ResizeHandle.vue";

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
  }),
);
</script>

<template>
  <th
    v-bind="vueProps(cellProps)"
    :data-cell="`-1:${index}`"
    :tabindex="interactive ? (focused ? 0 : -1) : undefined"
    @focus="interactive ? table.focus.setCursor({ row: -1, col: index }) : undefined"
  >
    <div class="data-table__head-inner">
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
        <span class="data-table__sort-icon">
          <Icon :name="sorted === 'desc' ? 'sort-desc' : 'sort-asc'" :size="14" />
        </span>
      </button>
      <span v-else class="data-table__head-label">
        <FlexRender v-if="!header.isPlaceholder" :header="header" />
      </span>
    </div>
    <ResizeHandle v-if="column.getCanResize()" :header="header" />
  </th>
</template>
