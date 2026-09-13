<script setup lang="ts" generic="T extends RowData">
import { computed } from "vue";
import { clsx } from "clsx";
import { FlexRender } from "@tanstack/vue-table";
import { Checkbox } from "@ui-organized/vue";
import type { RowData, TableRowModel } from "@ui-organized/table-core";
import { useTableContext } from "../../core/tableContext.js";
import { TableRowActions } from "../TableRowActions/index.js";

const props = defineProps<{
  row: TableRowModel<T>;
  index: number;
  fields: string[];
  class?: string;
}>();

const table = useTableContext<T>();
const selected = computed(() => table.selection.isSelected(props.row.id));
const cells = computed(() => props.row.getVisibleCells());
const primaryCell = computed(() =>
  table.primaryColumnId.value
    ? cells.value.find((cell) => cell.column.id === table.primaryColumnId.value)
    : undefined,
);
const clickable = computed(
  () => Boolean(table.options.detail) || Boolean(table.options.onRowClick),
);
const titleText = computed(() => {
  const cell = primaryCell.value;
  return cell ? String(cell.getValue() ?? props.row.id) : props.row.id;
});
const cellFor = (columnId: string) => cells.value.find((cell) => cell.column.id === columnId);
const headerFor = (columnId: string) => {
  const header = table.table.getColumn(columnId)?.columnDef.header;
  return typeof header === "string" ? header : columnId;
};

const measure = (el: Element | null) => {
  if (table.virtual.enabled.value && el) {
    table.virtual.virtualizer.value.measureElement(el as HTMLElement);
  }
};
</script>

<template>
  <li
    :ref="(el) => measure(el as Element | null)"
    :class="clsx('data-table__card', selected && 'data-table__card--selected', $props.class)"
    :data-index="index"
    :data-row-id="row.id"
  >
    <div class="data-table__card-header">
      <Checkbox
        v-if="table.selection.mode.value !== 'none'"
        :checked="selected"
        :aria-label="`Select ${titleText}`"
        @update:checked="(checked: boolean) => table.selection.toggle(row.id, checked)"
      />
      <!--
        A button rather than a clickable card: a card is not an interactive
        element, and making one is how a keyboard user loses the row.
      -->
      <button
        v-if="clickable"
        type="button"
        class="data-table__card-title data-table__sort-button"
        @click="table.activate(row)"
      >
        <FlexRender v-if="primaryCell" :cell="primaryCell" />
        <template v-else>{{ row.id }}</template>
      </button>
      <span v-else class="data-table__card-title">
        <FlexRender v-if="primaryCell" :cell="primaryCell" />
        <template v-else>{{ row.id }}</template>
      </span>
      <TableRowActions v-if="table.options.rowActions?.length" :row="row.original" />
    </div>

    <dl class="data-table__card-fields">
      <template v-for="columnId in fields" :key="columnId">
        <template v-if="cellFor(columnId)">
          <dt class="data-table__card-label">{{ headerFor(columnId) }}</dt>
          <dd class="data-table__card-value">
            <FlexRender :cell="cellFor(columnId)!" />
          </dd>
        </template>
      </template>
    </dl>
  </li>
</template>
