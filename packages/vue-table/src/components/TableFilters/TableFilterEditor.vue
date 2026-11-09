<!--
  One condition's value editor (Figma 2298:726): the value, then a rule and a
  remove. The field and the operator have segments of their own on the chip, so
  the editor carries only what the value segment opens.
-->
<script setup lang="ts">
import { computed } from "vue";
import { Button, Divider } from "@ui-organized/vue";
import type { TableFilterCondition } from "@ui-organized/table-core";
import { useTableContext } from "../../core/tableContext.js";
import { focusAfterRemoval } from "./useAutoFocusField.js";
import TableFilterValueEditor from "./TableFilterValueEditor.vue";
import { internalGlyph as glyph } from "@ui-organized/vue";

const props = defineProps<{
  condition: TableFilterCondition;
  portalContainer?: HTMLElement | null;
}>();

const table = useTableContext();
const arity = computed(() => table.filters.arityOf(props.condition));

const remove = () => {
  table.filters.remove(props.condition.id);
  focusAfterRemoval(props.condition.id);
};
</script>

<template>
  <TableFilterValueEditor
    :condition="condition"
    :arity="arity"
    :portal-container="portalContainer"
  />

  <Divider class="data-table__filter-editor-rule" />

  <Button
    intent="ghost"
    :size="table.size.value"
    :icon="glyph('trash')"
    class="data-table__filter-editor-remove"
    @click="remove"
  >
    Remove
  </Button>
</template>
