<!--
  The body, and the four states it decides between on its own.

  Explicit content wins: layer-2 composition is the point of these parts.
  Otherwise `<TableBody />` alone is a complete table body — the error, the
  loading skeleton, the empty state and the rows are all its business.
-->
<script setup lang="ts" generic="T extends RowData">
import { computed } from "vue";
import { getSpacerProps, type RowData } from "@ui-organized/table-core";
import { useTableContext } from "../../core/tableContext.js";
import { vueProps } from "../../core/props.js";
import { TableEmpty, TableError, TableLoading } from "../TableStates/index.js";
import TableRow from "./TableRow.vue";

const slots = defineSlots<{ default?: () => unknown }>();
const table = useTableContext<T>();

const spacers = computed(() =>
  table.virtual.enabled.value ? table.virtual.spacers.value : { top: 0, bottom: 0 },
);
const renderRows = computed(() => table.renderRows.value);
const editTarget = computed(() => table.edit.state.value.target);

const state = computed(() => {
  if (slots.default) return "slot";
  if (table.options.error) return "error";
  if (table.loading.value && renderRows.value.length === 0) return "loading";
  if (renderRows.value.length === 0) return "empty";
  return "rows";
});

const spacerProps = (height: number) => getSpacerProps(height, table.chrome.value.colCount);

const focusedColFor = (index: number) =>
  table.focus.cursor.value.row === index ? table.focus.cursor.value.col : null;

const editContextFor = (row: (typeof renderRows.value)[number]["row"]) =>
  editTarget.value?.rowId === row.id ? table.edit.contextFor(row, editTarget.value.columnId) : null;
</script>

<template>
  <tbody class="data-table__body">
    <slot v-if="state === 'slot'" />
    <TableError v-else-if="state === 'error'">
      <component :is="() => table.options.error" />
    </TableError>
    <TableLoading v-else-if="state === 'loading'" />
    <TableEmpty v-else-if="state === 'empty'" />
    <template v-else>
      <tr v-if="spacers.top > 0" v-bind="vueProps(spacerProps(spacers.top).row)">
        <td v-bind="vueProps(spacerProps(spacers.top).cell)" />
      </tr>
      <TableRow
        v-for="entry in renderRows"
        :key="entry.row.id"
        :row="entry.row"
        :index="entry.index"
        :absolute-index="entry.absoluteIndex"
        :focused-col="focusedColFor(entry.index)"
        :edit-context="editContextFor(entry.row)"
      />
      <tr v-if="spacers.bottom > 0" v-bind="vueProps(spacerProps(spacers.bottom).row)">
        <td v-bind="vueProps(spacerProps(spacers.bottom).cell)" />
      </tr>
    </template>
  </tbody>
</template>
