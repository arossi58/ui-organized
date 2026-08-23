<script setup lang="ts">
import { NumberField } from "@ui-organized/vue";

/**
 * `value` is the React library's spelling; Ark Vue renames the number-input
 * machine's controlled value to `modelValue`, and this package follows Ark. The
 * rename happens here, the same way the gate itself renames `className` to
 * `class` — each side receives only its own dialect.
 */
defineProps<{ value?: number | null }>();
</script>

<template>
  <NumberField v-bind="$attrs" :model-value="value" />
</template>
