<!-- The header's tri-state checkbox: it governs the rows on screen. -->
<script setup lang="ts">
import { Checkbox } from "@ui-organized/vue";
import { useTableContext } from "./tableContext.js";

const table = useTableContext();
</script>

<template>
  <span class="data-table__select-hit">
    <Checkbox
      :checked="table.selection.header.value.checked"
      :indeterminate="table.selection.header.value.indeterminate"
      :aria-label="`Select the rows shown in ${table.label.value}`"
      @update:checked="(checked: boolean) => table.selection.togglePage(checked)"
    />
  </span>
</template>
