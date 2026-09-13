<!--
  A thin visual rule for separating content or controls. Renders in
  `surface/overlay-tertiary` to match the design-system Divider used inside
  toolbars and dense layouts. A vertical rule stretches to its flex row via
  `align-self: stretch`.
-->
<script setup lang="ts">
import { computed, useAttrs } from "vue";
import { clsx } from "clsx";
import { dividerStyles } from "@ui-organized/core";
import type { DividerProps } from "./Divider.types.js";
import "@ui-organized/core/components/Divider/Divider.css";

defineOptions({ inheritAttrs: false });
const props = withDefaults(defineProps<DividerProps>(), {
  orientation: "horizontal",
  spacing: "none",
});
const attrs = useAttrs();
const rootClass = computed(() =>
  clsx(dividerStyles({ orientation: props.orientation, spacing: props.spacing }), attrs.class as string),
);
</script>

<template>
  <div
    role="separator"
    :aria-orientation="orientation"
    :class="rootClass"
    v-bind="{ ...$attrs, class: undefined }"
  />
</template>
