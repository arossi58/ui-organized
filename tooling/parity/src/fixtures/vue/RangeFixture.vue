<script setup lang="ts">
import { Range } from "@ui-organized/vue";

/**
 * `value` in React, `modelValue` in Vue — see NumberFieldFixture for the why.
 *
 * `aria-label` needs no translation: the package declares it as `ariaLabel`,
 * and Vue camelises an incoming attribute name before matching it to a prop, so
 * the case's own spelling arrives on the right prop through `$attrs`.
 */
defineProps<{ value?: number }>();
</script>

<template>
  <Range v-bind="$attrs" :model-value="value" />
</template>
