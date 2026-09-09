<script setup lang="ts">
import { computed } from "vue";
import { DataTable, type TableColumn } from "@ui-organized/vue-table";
import { MEMBERS, columnsFor, memberRowId, type ColumnSet, type Member } from "../tableFixture.js";

/**
 * The same table the React builder composes, from the same data and the same
 * columns — see `../tableFixture.ts` for why the shape is shared and only the
 * switches travel in the case.
 */
const props = defineProps<{
  columnSet?: ColumnSet;
  rowActions?: boolean;
  noData?: boolean;
}>();

const columns = computed(() => columnsFor(props.columnSet) as unknown as TableColumn<Member>[]);
const data = computed(() => (props.noData ? [] : MEMBERS));
// The functions the case cannot carry, built here — the one place a fixture
// writes framework-specific code, and exactly what a consumer writes.
const rowActions = computed(() =>
  props.rowActions
    ? [
        { id: "edit", label: "Edit", onRun: () => {} },
        { id: "remove", label: "Remove", destructive: true, onRun: () => {} },
      ]
    : undefined,
);
</script>

<template>
  <DataTable
    v-bind="$attrs"
    :data="data"
    :columns="columns"
    :get-row-id="memberRowId"
    label="Members"
    :row-actions="rowActions"
  />
</template>
