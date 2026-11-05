<script setup lang="ts">
import { Chip, ChipSegment } from "@ui-organized/vue";

/**
 * `segmented` is translated exactly as the React builder in `cases/Chip.tsx`
 * translates it: three segments, each with a handler, which a props object
 * crossing the harness cannot carry. `removable` is Vue's own prop, so it passes
 * straight through.
 */
defineOptions({ inheritAttrs: false });
defineProps<{ segmented?: boolean }>();
const noop = () => {};
</script>

<template>
  <Chip v-bind="$attrs">
    <template v-if="segmented">
      <ChipSegment part="label" @click="noop">Name</ChipSegment>
      <ChipSegment part="operator" @click="noop">is greater than</ChipSegment>
      <ChipSegment part="value" @click="noop">30</ChipSegment>
    </template>
  </Chip>
</template>
