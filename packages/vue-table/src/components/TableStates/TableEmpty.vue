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
import { EmptyState, type IconComponent, type IconName } from "@ui-organized/vue";
import { useTableContext } from "../../core/tableContext.js";

const props = defineProps<{
  title?: string;
  description?: string;
  /** A topic icon above the title, drawn as a neutral FeaturedIcon. */
  icon?: IconName | IconComponent;
  class?: string;
}>();
const table = useTableContext();
const empty = computed(() => table.options.empty);
const title = computed(() => props.title ?? empty.value?.title ?? "Nothing to show");
const description = computed(() => props.description ?? empty.value?.description);
const icon = computed(() => props.icon ?? empty.value?.icon);
</script>

<template>
  <tr class="data-table__row">
    <td
      :class="clsx('data-table__state-cell', $props.class)"
      :colspan="table.chrome.value.colCount"
    >
      <EmptyState size="sm" :icon="icon" :title="title" :description="description">
        <template v-if="$slots.action || empty?.action" #actions>
          <slot name="action">
            <component :is="() => empty?.action" />
          </slot>
        </template>
      </EmptyState>
    </td>
  </tr>
</template>
