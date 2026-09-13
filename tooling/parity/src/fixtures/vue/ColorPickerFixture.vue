<script setup lang="ts">
import { ColorPicker } from "@ui-organized/vue";

/** `value` in React, `modelValue` in Vue — see NumberFieldFixture for the why. */
defineProps<{ value?: string }>();
</script>

<template>
  <ColorPicker v-bind="$attrs" :model-value="value" />
</template>
