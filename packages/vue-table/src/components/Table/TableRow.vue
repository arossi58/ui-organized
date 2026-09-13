<!--
  One row.

  React memoizes this on a hand-written nine-field comparator, and threads every
  value it needs through props so the comparator can see them. Vue needs neither:
  a component re-renders only when its own reactive reads change, so the row
  takes what genuinely *varies per row* as props and reads the rest — the table,
  the handlers, `interactive` — from the injected context. That is the first of
  the two places the plan predicted this port would get simpler.
-->
<script setup lang="ts" generic="T extends RowData">
import { computed } from "vue";
import {
  getRowProps,
  type RowData,
  type TableEditContext,
  type TableRowModel,
} from "@ui-organized/table-core";
import { useTableContext } from "../../core/tableContext.js";
import { vueProps } from "../../core/props.js";
import TableCell from "./TableCell.vue";

const props = defineProps<{
  row: TableRowModel<T>;
  index: number;
  absoluteIndex: number;
  focusedCol: number | null;
  editContext: TableEditContext<T> | null;
}>();

const table = useTableContext<T>();
const clickable = computed(
  () => Boolean(table.options.onRowClick) || Boolean(table.options.detail),
);
const selected = computed(() => table.selection.isSelected(props.row.id));
const editing = computed(() => table.edit.state.value.target?.rowId === props.row.id);

const rowProps = computed(() =>
  getRowProps({
    rowId: props.row.id,
    index: props.absoluteIndex,
    selected: selected.value,
    editing: editing.value,
    selectable: table.selection.mode.value !== "none",
    interactive: table.interactive.value,
    clickable: clickable.value,
  }),
);

const cells = computed(() => props.row.getVisibleCells());

/**
 * The virtualizer measures the real row rather than trusting the estimate, so a
 * re-themed row height corrects itself on the first frame. Vue calls a function
 * ref with `null` on unmount, which `measureElement` handles.
 */
const measure = (el: Element | null) => {
  if (table.virtual.enabled.value && el) {
    table.virtual.virtualizer.value.measureElement(el as HTMLElement);
  }
};
</script>

<template>
  <tr
    :ref="(el) => measure(el as Element | null)"
    v-bind="vueProps(rowProps)"
    :data-index="index"
    @click="table.activate(row)"
  >
    <TableCell
      v-for="(cell, colIndex) in cells"
      :key="cell.id"
      :cell="cell"
      :row="row"
      :index="colIndex"
      :row-index="index"
      :primary="cell.column.id === table.primaryColumnId.value"
      :focused="focusedCol === colIndex"
      :edit-context="editContext"
    />
  </tr>
</template>
