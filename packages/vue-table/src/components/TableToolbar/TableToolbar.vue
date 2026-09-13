<!--
  The row above the table: search, filters, and the controls that change what the
  table shows rather than what it contains.

  Not a `Toolbar` — that component is a `role="toolbar"` with roving focus, which
  is right for a cluster of icon buttons and wrong for a row containing a text
  input. The selection bar, which *is* a button cluster, does use it.
-->
<script setup lang="ts">
import { computed, useSlots } from "vue";
import { clsx } from "clsx";
import { Divider } from "@ui-organized/vue";
import { useTableContext } from "../../core/tableContext.js";
import { TableFilterAdd, TableFilters } from "../TableFilters/index.js";
import TableActions from "./TableActions.vue";
import TableExportMenu from "./TableExportMenu.vue";
import TableScrollButtons from "./TableScrollButtons.vue";
import TableSearch from "./TableSearch.vue";
import TableSortMenu from "./TableSortMenu.vue";
import TableViewOptions from "./TableViewOptions.vue";

defineProps<{ class?: string }>();
const slots = useSlots();
const table = useTableContext();

const searchable = computed(() => table.options.searchable ?? true);
const hideable = computed(() => table.options.hideableColumns ?? false);
const exportable = computed(() => table.options.exportable ?? false);
const filterable = computed(() => table.options.filterable ?? true);
const actions = computed(() => table.options.actions ?? []);
const sortMenu = computed(
  () =>
    (table.options.sortMenu ?? true) &&
    (table.options.sortable ?? true) &&
    table.table.getAllLeafColumns().some((column) => column.getCanSort()),
);

/**
 * `scroll.overflowing` counts: a table whose only chrome is the two scroll
 * buttons still needs the row to put them in — columns off the right edge are no
 * less hidden for the table having no search box.
 */
const render = computed(
  () =>
    searchable.value ||
    hideable.value ||
    exportable.value ||
    filterable.value ||
    sortMenu.value ||
    table.scroll.state.value.overflowing ||
    actions.value.length > 0,
);
</script>

<template>
  <div v-if="slots.default" :class="clsx('data-table__toolbar', $props.class)">
    <slot />
  </div>
  <!--
    Two rows, deliberately. Chips wrap — often onto a second and third line — and
    sharing a row with the controls would shunt those around every time a filter
    is added. Keeping the applied filters on their own line below is also what
    makes them read as a summary rather than as more chrome.
  -->
  <template v-else-if="render">
    <div :class="clsx('data-table__toolbar', $props.class)">
      <TableSearch v-if="searchable" />
      <div class="data-table__toolbar-spacer" />

      <TableActions />
      <!--
        Only when there is something on both sides of it. A rule with nothing to
        its left is a rule separating the toolbar from its own edge, which says
        nothing.
      -->
      <Divider
        v-if="actions.length > 0"
        orientation="vertical"
        class="data-table__toolbar-divider"
      />

      <TableSortMenu v-if="sortMenu" />
      <TableFilterAdd v-if="filterable" icon-only />
      <TableExportMenu v-if="exportable" />
      <TableViewOptions v-if="hideable" />
      <!-- Last, and only while the viewport is actually hiding columns. -->
      <TableScrollButtons />
    </div>
    <TableFilters />
  </template>
</template>
