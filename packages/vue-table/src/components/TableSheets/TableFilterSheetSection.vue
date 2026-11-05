<!--
  One field's accordion section: either its title (the field, plus a summary of
  what is applied, readable with the section collapsed) or its content (one
  editor per condition on the field).

  One component for both halves so `Accordion`, which takes components rather
  than slots, can be handed a stable component per field. It reads the table
  state itself, so it updates in place instead of being rebuilt — rebuilding
  would remount every Select and Listbox in the section on each change.
-->
<script setup lang="ts">
import { computed } from "vue";
import { useTableContext } from "../../core/tableContext.js";
import TableFilterSheetCondition from "./TableFilterSheetCondition.vue";

const props = defineProps<{ columnId: string; part: "title" | "content" }>();
const table = useTableContext();

const field = computed(() =>
  table.filters.fields.value.find((candidate) => candidate.columnId === props.columnId),
);
const conditions = computed(() =>
  table.filters.conditions.value.filter((condition) => condition.columnId === props.columnId),
);
const summary = computed(() =>
  conditions.value
    .map((condition) => table.filters.describe(condition))
    .filter((description) => description.complete)
    .map((description) => `${description.relative} ${description.value}`)
    .join("; "),
);
</script>

<template>
  <span v-if="part === 'title'" class="data-table__sheet-section-title">
    <span>{{ field?.label ?? columnId }}</span>
    <span v-if="summary" class="data-table__sheet-section-summary">{{ summary }}</span>
  </span>
  <div v-else class="data-table__sheet-section">
    <TableFilterSheetCondition
      v-for="condition in conditions"
      :key="condition.id"
      :condition="condition"
      :field-label="field?.label ?? columnId"
    />
  </div>
</template>
