<!--
  A thin visual rule for separating content or controls. Renders in
  `surface/overlay-tertiary` to match the design-system Divider used inside
  toolbars and dense layouts. A vertical rule stretches to its flex row via
  `align-self: stretch`.
-->
<script setup lang="ts">
import { computed, useAttrs, useSlots } from "vue";
import { clsx } from "clsx";
import { dividerStyles } from "@ui-organized/core";
import type { DividerProps } from "./Divider.types.js";
import "@ui-organized/core/components/Divider/Divider.css";

defineOptions({ inheritAttrs: false });
const props = withDefaults(defineProps<DividerProps>(), {
  orientation: "horizontal",
  spacing: "none",
  labelPosition: "center",
});
const attrs = useAttrs();
const slots = useSlots();
const rootClass = computed(() =>
  clsx(dividerStyles({ orientation: props.orientation, spacing: props.spacing }), attrs.class as string),
);
// With a label it is not a separator: a separator's children are
// presentational, so "or" would never be read. It is horizontal, and the rules
// are drawn either side of the label by CSS.
const labelledClass = computed(() =>
  clsx(
    dividerStyles({
      orientation: "horizontal",
      spacing: props.spacing,
      labelled: true,
      labelPosition: props.labelPosition,
    }),
    attrs.class as string,
  ),
);
</script>

<template>
  <div v-if="slots.default" :class="labelledClass" v-bind="{ ...$attrs, class: undefined }">
    <slot />
  </div>
  <div
    v-else
    role="separator"
    :aria-orientation="orientation"
    :class="rootClass"
    v-bind="{ ...$attrs, class: undefined }"
  />
</template>
