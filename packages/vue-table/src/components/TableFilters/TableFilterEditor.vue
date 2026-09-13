<!--
  One condition's editor (Figma 2298:726): the field name, the operator, the
  value, then a rule and a remove.

  The operator and value controls carry no visible labels — the title above names
  the field and each control's own content says the rest — but they keep real
  `<label>`s for assistive tech, hidden in CSS rather than omitted.
-->
<script setup lang="ts">
import { computed } from "vue";
import { Button, Divider, Select } from "@ui-organized/vue";
import type { TableFilterCondition } from "@ui-organized/table-core";
import { useTableContext } from "../../core/tableContext.js";
import { focusAfterRemoval } from "./useAutoFocusField.js";
import TableFilterValueEditor from "./TableFilterValueEditor.vue";

const props = defineProps<{
  condition: TableFilterCondition;
  portalContainer?: HTMLElement | null;
}>();

const table = useTableContext();
const operators = computed(() => table.filters.operatorsFor(props.condition));
const arity = computed(() => table.filters.arityOf(props.condition));

const remove = () => {
  table.filters.remove(props.condition.id);
  focusAfterRemoval(props.condition.id);
};
</script>

<template>
  <!--
    Portalled into the editor rather than to <body>: the popover is non-modal, so
    a popup outside its subtree reads as an outside click and dismisses the
    editor. Same escape Calendar uses for its year picker inside a date popover.
  -->
  <Select
    :size="table.size.value"
    label="Condition"
    class="data-table__filter-field data-table__filter-field--unlabelled"
    :portal-container="portalContainer"
    :model-value="condition.operator"
    :options="operators.map((operator) => ({ value: operator.id, label: operator.label }))"
    @update:model-value="(operator: string) => table.filters.update(condition.id, { operator })"
  />

  <TableFilterValueEditor
    :condition="condition"
    :arity="arity"
    :portal-container="portalContainer"
  />

  <Divider class="data-table__filter-editor-rule" />

  <Button
    intent="ghost"
    :size="table.size.value"
    icon="trash"
    class="data-table__filter-editor-remove"
    @click="remove"
  >
    Remove
  </Button>
</template>
