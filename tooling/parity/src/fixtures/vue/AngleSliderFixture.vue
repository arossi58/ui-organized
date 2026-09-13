<script setup lang="ts">
import { AngleSlider } from "@ui-organized/vue";

/** `value` in React, `modelValue` in Vue — see NumberFieldFixture for the why. */
defineProps<{ value?: number }>();
</script>

<template>
  <AngleSlider v-bind="$attrs" :model-value="value" />
</template>
