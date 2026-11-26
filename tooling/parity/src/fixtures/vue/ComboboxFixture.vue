<script setup lang="ts">
import { computed, useAttrs } from "vue";
import { Combobox } from "@ui-organized/vue";

// Vue carries a multiple combobox's values on `v-model:values`, so the shared
// cases' `defaultValue` is routed to `defaultValues` when `multiple` is set.
defineOptions({ inheritAttrs: false });
const attrs = useAttrs();
const bound = computed(() => {
  const { defaultValue, ...rest } = attrs as Record<string, unknown>;
  return attrs.multiple ? { ...rest, defaultValues: defaultValue } : attrs;
});
</script>

<template>
  <Combobox v-bind="bound" />
</template>
