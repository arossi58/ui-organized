<!--
  The applied filters, on their own line under the header (Figma 2298:362).

  A *summary*, not a control panel: the filter button lives in the header above,
  and this line does not exist until the user has actually filtered something. A
  bar that is always present and usually empty is chrome that teaches people to
  stop looking at it.
-->
<script setup lang="ts">
import { computed } from "vue";
import { clsx } from "clsx";
import { Button } from "@ui-organized/vue";
import { useTableContext } from "../../core/tableContext.js";
import TableFilterAdd from "./TableFilterAdd.vue";
import TableFilterChip from "./TableFilterChip.vue";

defineProps<{ class?: string }>();
const table = useTableContext();
const conditions = computed(() => table.filters.conditions.value);
const render = computed(() => table.options.filterable !== false && conditions.value.length > 0);
</script>

<template>
  <!--
    `role="group"`, not `role="toolbar"`: toolbar promises arrow-key navigation
    between its controls, and until that lands the promise would be a lie to
    assistive tech.
  -->
  <div
    v-if="render"
    :class="clsx('data-table__filters', $props.class)"
    role="group"
    aria-label="Filters"
  >
    <span class="data-table__filters-label">Filters</span>

    <TableFilterChip v-for="condition in conditions" :key="condition.id" :condition="condition" />

    <TableFilterAdd label="Add" />

    <Button intent="ghost" size="sm" icon="rotate-ccw" @click="table.filters.clear()">
      Reset
    </Button>

    <!--
      One polite region for add / remove / change / clear. Deliberately not a
      visible count: that changes on every keystroke elsewhere, and a live region
      that re-announces per keystroke is a firehose.
    -->
    <span class="data-table__sr-only" role="status" aria-live="polite">
      {{ table.filters.announcement.value }}
    </span>
  </div>
</template>
