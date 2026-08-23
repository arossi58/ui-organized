<script setup lang="ts">
import { RatingGroup } from "@ui-organized/vue";

/** `value` in React, `modelValue` in Vue — see NumberFieldFixture for the why. */
defineProps<{ value?: number }>();
</script>

<template>
  <RatingGroup v-bind="$attrs" :model-value="value" />
</template>
