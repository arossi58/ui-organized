<script setup lang="ts">
import { PinInput } from "@ui-organized/vue";

/**
 * `value` is the React library's spelling; Ark Vue renames the pin-input
 * machine's controlled value to `modelValue`, and this package follows Ark. See
 * NumberFieldFixture for the longer note.
 */
defineProps<{ value?: string }>();
</script>

<template>
  <PinInput v-bind="$attrs" :model-value="value" />
</template>
