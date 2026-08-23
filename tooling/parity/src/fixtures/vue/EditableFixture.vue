<script setup lang="ts">
import { Editable } from "@ui-organized/vue";

/** `value` in React, `modelValue` in Vue — see NumberFieldFixture for the why. */
defineProps<{ value?: string }>();
</script>

<template>
  <Editable v-bind="$attrs" :model-value="value" />
</template>
