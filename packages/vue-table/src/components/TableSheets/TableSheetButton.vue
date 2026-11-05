<!--
  The button both card-mode sheets open from. The count is a badge inside the
  label, and is spoken as words — "Filter, 2 applied" — because a bare "2"
  announced after "Filter" says nothing about what it counts.
-->
<script setup lang="ts">
import { Button } from "@ui-organized/vue";
import type { CanonicalIconName } from "@ui-organized/utils";
import { useTableContext } from "../../core/tableContext.js";

defineProps<{
  /** A canonical icon name. */
  icon: string;
  label: string;
  /** What is applied. Drawn as a badge from 1 up, and spoken as words. */
  count: number;
  /** The word the count is read with: "2 applied". */
  unit: string;
}>();
const table = useTableContext();
</script>

<template>
  <Button intent="secondary" :size="table.size.value" :icon="icon as CanonicalIconName">
    {{ label }}
    <template v-if="count > 0">
      <span class="data-table__badge" aria-hidden="true">{{ count }}</span>
      <span class="data-table__sr-only">{{ `, ${count} ${unit}` }}</span>
    </template>
  </Button>
</template>
