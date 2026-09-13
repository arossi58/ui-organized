<!--
  Empty, loading and error all live *inside* `<tbody>` rather than replacing the
  table.

  Keeping the header on screen keeps the column widths, the scroll position and
  the filter controls exactly where they were — so clearing a filter that emptied
  the table does not also move every control the user was about to click.
-->
<script setup lang="ts">
import { computed } from "vue";
import { clsx } from "clsx";
import { useTableContext } from "../../core/tableContext.js";

const props = defineProps<{ title?: string; description?: string; class?: string }>();
const table = useTableContext();
const empty = computed(() => table.options.empty);
const title = computed(() => props.title ?? empty.value?.title ?? "Nothing to show");
const description = computed(() => props.description ?? empty.value?.description);
</script>

<template>
  <tr class="data-table__row">
    <td
      :class="clsx('data-table__state-cell', $props.class)"
      :colspan="table.chrome.value.colCount"
    >
      <div class="data-table__state">
        <span class="data-table__state-title">{{ title }}</span>
        <span v-if="description" class="data-table__state-description">{{ description }}</span>
        <div v-if="$slots.action || empty?.action" class="data-table__state-actions">
          <slot name="action">
            <component :is="() => empty?.action" />
          </slot>
        </div>
      </div>
    </td>
  </tr>
</template>
