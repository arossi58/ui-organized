<!--
  One condition inside a field's section: its relation, its value, and a way to
  clear it. The field is the section, so there is no field control.
-->
<script setup lang="ts">
import { computed, ref } from "vue";
import { Button, Select } from "@ui-organized/vue";
import type { TableFilterCondition } from "@ui-organized/table-core";
import { useTableContext } from "../../core/tableContext.js";
import { TableFilterValueEditor } from "../TableFilters/index.js";

const props = defineProps<{ condition: TableFilterCondition; fieldLabel: string }>();
const table = useTableContext();
// The sheet is a modal dialog, which hides everything outside itself from
// assistive tech; a Select or Listbox that portals to <body> would be painted
// but unreachable. Portalling into the condition keeps it inside.
const container = ref<HTMLElement | null>(null);
const description = computed(() => table.filters.describe(props.condition));
const operatorOptions = computed(() =>
  table.filters.operatorsFor(props.condition).map((op) => ({ value: op.id, label: op.label })),
);
</script>

<template>
  <div ref="container" class="data-table__sheet-filter" :data-filter-id="condition.id">
    <Select
      :size="table.size.value"
      label="Condition"
      :options="operatorOptions"
      :model-value="condition.operator"
      :portal-container="container"
      @update:model-value="(operator: string) => table.filters.update(condition.id, { operator })"
    />
    <div class="data-table__sheet-filter-value">
      <TableFilterValueEditor
        :condition="condition"
        :arity="table.filters.arityOf(condition)"
        :portal-container="container"
      />
    </div>
    <Button
      v-if="description.complete"
      intent="ghost"
      :size="table.size.value"
      icon="close"
      class="data-table__sheet-remove"
      :aria-label="`Clear filter: ${description.text}`"
      @click="table.filters.remove(condition.id)"
    >
      {{ `Clear ${fieldLabel}` }}
    </Button>
  </div>
</template>
