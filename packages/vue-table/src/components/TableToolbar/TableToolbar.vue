<!--
  The row above the table: search, filters, and the controls that change what the
  table shows rather than what it contains.

  Not a `Toolbar` — that component is a `role="toolbar"` with roving focus, which
  is right for a cluster of icon buttons and wrong for a row containing a text
  input.
-->
<script setup lang="ts">
import { computed, useSlots } from "vue";
import { clsx } from "clsx";
import { Divider } from "@ui-organized/vue";
import { useTableContext } from "../../core/tableContext.js";
import { TableFilterAdd } from "../TableFilters/index.js";
import { TableSelectionBar } from "../TableSelectionBar/index.js";
import { TableFilterSheet, TableSortSheet } from "../TableSheets/index.js";
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

const selecting = computed(() => table.selection.count.value > 0);
const cards = computed(() => table.mode.value === "cards");

/**
 * `scroll.overflowing` counts: a table whose only chrome is the two scroll
 * buttons still needs the row to put them in — columns off the right edge are no
 * less hidden for the table having no search box. So does a selection: its bulk
 * actions live in this row.
 */
const render = computed(
  () =>
    selecting.value ||
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
    One row. The filter chips sit on the line below, in `TableSubBar`: they wrap,
    often onto a second and third line, and sharing this row with them would
    shunt the controls around every time a filter is added.

    While rows are selected, the bulk actions take the place of the table's own
    controls. What to do with the selection is the decision in front of the
    user, and sorting or adding a filter underneath it would change which rows
    it means. Clearing the selection brings the controls back.
  -->
  <div v-else-if="render" :class="clsx('data-table__toolbar', $props.class)">
    <TableSearch v-if="searchable" />
    <div class="data-table__toolbar-spacer" />

    <template v-if="selecting">
      <TableSelectionBar />
      <!-- Stays: "Download selected rows" and "Copy selection" are actions on
           the selection, and live nowhere else. -->
      <TableExportMenu v-if="exportable" />
    </template>
    <template v-else>
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

      <!--
        Card mode trades the two menus for labelled buttons that open a bottom
        sheet each, with what is applied counted on the button: there are no
        column headers to sort from and no room for a row of chips above the
        cards.
      -->
      <template v-if="cards">
        <TableSortSheet v-if="sortMenu" />
        <TableFilterSheet v-if="filterable" />
      </template>
      <template v-else>
        <TableSortMenu v-if="sortMenu" />
        <TableFilterAdd v-if="filterable" icon-only />
      </template>
      <TableExportMenu v-if="exportable" />
      <TableViewOptions v-if="hideable" />
    </template>
    <!-- Last, and only while the viewport is actually hiding columns. -->
    <TableScrollButtons />
  </div>
</template>
