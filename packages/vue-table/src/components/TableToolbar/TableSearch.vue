<script setup lang="ts">
import { computed } from "vue";
import { clsx } from "clsx";
import { SearchInput } from "@ui-organized/vue";
import { useTableContext } from "../../core/tableContext.js";

const props = withDefaults(
  defineProps<{ placeholder?: string; label?: string; class?: string }>(),
  {
    placeholder: "Search",
  },
);
const table = useTableContext();
const name = computed(() => props.label ?? `Search ${table.label.value}`);
</script>

<template>
  <SearchInput
    :class="clsx('data-table__search', $props.class)"
    :size="table.size.value"
    :model-value="table.search.value"
    :placeholder="placeholder"
    :aria-label="name"
    @update:model-value="(value: string) => table.setSearch(value)"
  />
</template>
