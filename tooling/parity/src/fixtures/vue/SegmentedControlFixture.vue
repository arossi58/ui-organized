<script setup lang="ts">
import { SegmentedControl } from "@ui-organized/vue";

/**
 * `value` in React, `modelValue` in Vue — Ark Vue renames the segment-group
 * machine's controlled value. See NumberFieldFixture for the longer note.
 */
defineProps<{ value?: string }>();
</script>

<template>
  <SegmentedControl v-bind="$attrs" :model-value="value" />
</template>
