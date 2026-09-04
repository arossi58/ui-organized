<!--
  Skeleton rows sized to the real row height, so the table does not resize when
  the data lands — which is the entire reason to prefer a skeleton to a spinner.
  (There is no Spinner in the library, which settles it anyway.)
-->
<script setup lang="ts">
import { computed } from "vue";
import { clsx } from "clsx";
import { Skeleton } from "@ui-organized/vue";
import { useTableContext } from "../../core/tableContext.js";

const props = withDefaults(defineProps<{ rows?: number; class?: string }>(), { rows: 8 });
const table = useTableContext();
const columns = computed(() => table.table.getVisibleLeafColumns());
const bars = computed(() => Array.from({ length: props.rows }, (_, index) => index));
</script>

<template>
  <tr v-for="index in bars" :key="index" class="data-table__row" aria-hidden="true">
    <td
      v-for="column in columns"
      :key="column.id"
      :class="clsx('data-table__skeleton-cell', $props.class)"
    >
      <!--
        Varied but deterministic: identical bars read as a progress bar, and a
        random width changes on every render.
      -->
      <Skeleton
        variant="text"
        :width="`${55 + ((column.id.length * 7) % 35)}%`"
        :height="table.size.value === 'sm' ? 10 : 12"
      />
    </td>
  </tr>
</template>
