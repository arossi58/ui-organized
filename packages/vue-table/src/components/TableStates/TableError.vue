<script setup lang="ts">
import { clsx } from "clsx";
import { useTableContext } from "../../core/tableContext.js";

withDefaults(defineProps<{ title?: string; class?: string }>(), {
  title: "Could not load this table",
});
const table = useTableContext();
</script>

<template>
  <tr class="data-table__row">
    <td
      :class="clsx('data-table__state-cell', $props.class)"
      :colspan="table.chrome.value.colCount"
    >
      <!--
        `alert` rather than a plain region: the error arrives after the user has
        moved on, so it has to announce itself.
      -->
      <div class="data-table__state data-table__state--error" role="alert">
        <span class="data-table__state-title">{{ title }}</span>
        <span v-if="$slots.default" class="data-table__state-description"><slot /></span>
      </div>
    </td>
  </tr>
</template>
