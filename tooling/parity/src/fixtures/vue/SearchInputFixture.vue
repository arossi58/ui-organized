<script setup lang="ts">
import { SearchInput } from "@ui-organized/vue";

/** `value` in React, `modelValue` in Vue — see NumberFieldFixture for the why. */
defineProps<{ value?: string }>();
</script>

<template>
  <SearchInput v-bind="$attrs" :model-value="value" />
</template>
