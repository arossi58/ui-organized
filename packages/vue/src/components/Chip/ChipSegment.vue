<!--
  One part of a chip's sentence. A `<button>` once it has something to do, a
  `<span>` until then.

  A segment that opens nothing must not be a button, or every static token in a
  list puts empty stops in the tab order. `disabled` counts as something to do:
  a real disabled control is what exempts the dimmed text from axe's contrast
  rule. Every attribute lands on the element, so an Ark `as-child` trigger
  projects its `id`, click handler and `aria-expanded` onto this one segment.
-->
<script setup lang="ts">
import { computed, inject, useAttrs } from "vue";
import { chipSegmentStyles } from "@ui-organized/core";
import { CHIP_DISABLED } from "./chipContext.js";
import type { ChipSegmentProps } from "./Chip.types.js";

defineOptions({ inheritAttrs: false });
const props = defineProps<ChipSegmentProps>();
const attrs = useAttrs();
const chipDisabled = inject(CHIP_DISABLED, undefined);

const disabled = computed(
  () => chipDisabled?.value === true || attrs.disabled === true || attrs.disabled === "",
);
const interactive = computed(() => attrs.onClick !== undefined || disabled.value);
const segmentClass = computed(() => chipSegmentStyles({ part: props.part }));
</script>

<template>
  <button
    v-if="interactive"
    v-bind="$attrs"
    type="button"
    :class="segmentClass"
    :disabled="disabled"
  >
    <slot />
  </button>
  <span v-else :class="[segmentClass, $attrs.class]"><slot /></span>
</template>
