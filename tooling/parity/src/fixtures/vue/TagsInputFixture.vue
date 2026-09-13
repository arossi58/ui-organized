<script setup lang="ts">
import { TagsInput } from "@ui-organized/vue";

/** `value` in React, `modelValue` in Vue — see NumberFieldFixture for the why. */
defineProps<{ value?: string[] }>();
</script>

<template>
  <TagsInput v-bind="$attrs" :model-value="value" />
</template>
