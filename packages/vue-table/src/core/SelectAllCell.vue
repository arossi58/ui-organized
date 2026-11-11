<!--
  The header's tri-state checkbox: from empty it selects the rows on screen;
  from checked or mixed it clears the selection. What the box shows decides the
  click, not the box's own next state — see `headerToggleTarget`.
-->
<script setup lang="ts">
import { Checkbox } from "@ui-organized/vue";
import { headerToggleTarget } from "@ui-organized/table-core";
import { useTableContext } from "./tableContext.js";

const table = useTableContext();
</script>

<template>
  <span class="data-table__select-hit">
    <Checkbox
      :checked="table.selection.header.value.checked"
      :indeterminate="table.selection.header.value.indeterminate"
      :aria-label="`Select the rows shown in ${table.label.value}`"
      @update:checked="() => table.selection.togglePage(headerToggleTarget(table.selection.header.value))"
    />
  </span>
</template>
