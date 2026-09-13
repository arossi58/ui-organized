<!--
  The row under the toolbar: what is filtered, and what is selected.

  Both halves are summaries of applied state, so they share a line rather than
  stacking. The earlier arrangement put the bulk actions on a third row, which
  meant ticking a checkbox pushed the chips up and left the actions two rows
  away from the sort and filter buttons they belong beside.

  It renders nothing at all until one of the halves has something to say — the
  same rule each half already applies to itself, restated here so an empty row
  never takes a slice of the table's `gap`.
-->
<script setup lang="ts">
import { computed } from "vue";
import { clsx } from "clsx";
import { useTableContext } from "../../core/tableContext.js";
import { TableFilters } from "../TableFilters/index.js";
import { TableSelectionBar } from "../TableSelectionBar/index.js";

defineProps<{ class?: string }>();
const table = useTableContext();

const hasFilters = computed(
  () => table.options.filterable !== false && table.filters.conditions.value.length > 0,
);
const render = computed(() => hasFilters.value || table.selection.count.value > 0);
</script>

<template>
  <div v-if="render" :class="clsx('data-table__subbar', $props.class)">
    <TableFilters />
    <TableSelectionBar />
  </div>
</template>
