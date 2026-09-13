<script setup lang="ts">
import { Listbox } from "@ui-organized/vue";

/**
 * `value` is the React library's spelling; Ark Vue renames the Listbox
 * machine's controlled value to `modelValue`, and this package follows Ark. The
 * rename happens here, the same way the gate itself renames `className` to
 * `class` — each side receives only its own dialect.
 */
defineProps<{ value?: string[] }>();
</script>

<template>
  <Listbox v-bind="$attrs" :model-value="value" />
</template>
