<script setup lang="ts">
import { computed, useSlots } from "vue";
import { clsx } from "clsx";
import { FlexRender } from "@tanstack/vue-table";
import { useTableContext } from "../../core/tableContext.js";

defineProps<{ class?: string }>();
const slots = useSlots();
const table = useTableContext();

const groups = computed(() => table.table.getFooterGroups());
const hasFooter = computed(() =>
  groups.value.some((group) =>
    group.headers.some((header) => header.column.columnDef.footer !== undefined),
  ),
);
const render = computed(() => Boolean(slots.default) || hasFooter.value);
</script>

<template>
  <tfoot v-if="render" :class="clsx('data-table__foot', $props.class)">
    <slot>
      <tr v-for="group in groups" :key="group.id" class="data-table__row">
        <td v-for="header in group.headers" :key="header.id" class="data-table__cell">
          <FlexRender v-if="!header.isPlaceholder" :footer="header" />
        </td>
      </tr>
    </slot>
  </tfoot>
</template>
