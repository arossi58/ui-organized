<!--
  The row under the toolbar: what is filtered.

  The selection's bulk actions used to share this line. They now replace the
  toolbar's own controls while anything is selected (see `TableToolbar`), so
  acting on the selection happens in the row the user was already reading.

  It renders nothing at all until there is a filter to show, so an empty row
  never takes a slice of the table's `gap` — and nothing in card mode, where the
  filter sheet holds them and the toolbar's Filter button counts them.
-->
<script setup lang="ts">
import { computed } from "vue";
import { clsx } from "clsx";
import { useTableContext } from "../../core/tableContext.js";
import { TableFilters } from "../TableFilters/index.js";

defineProps<{ class?: string }>();
const table = useTableContext();

const hasFilters = computed(
  () =>
    table.options.filterable !== false &&
    table.filters.conditions.value.length > 0 &&
    table.mode.value !== "cards",
);
</script>

<template>
  <div v-if="hasFilters" :class="clsx('data-table__subbar', $props.class)">
    <TableFilters />
  </div>
</template>
