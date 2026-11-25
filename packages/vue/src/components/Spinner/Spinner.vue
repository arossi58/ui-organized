<!--
  An indeterminate loading indicator: a turning ring in the current text
  colour. For work whose progress can be measured, use Progress; for content
  whose shape is known before it arrives, use Skeleton.
-->
<script setup lang="ts">
import { computed, useAttrs } from "vue";
import { clsx } from "clsx";
import { spinnerStyles } from "@ui-organized/core";
import type { SpinnerProps } from "./Spinner.types.js";
import "@ui-organized/core/components/Spinner/Spinner.css";

defineOptions({ inheritAttrs: false });
const props = withDefaults(defineProps<SpinnerProps>(), {
  size: "md",
  label: "Loading",
  decorative: false,
});
const attrs = useAttrs();

const spinnerClass = computed(() => clsx(spinnerStyles({ size: props.size }), attrs.class as string));
</script>

<template>
  <span
    :class="spinnerClass"
    :role="decorative ? undefined : 'status'"
    :aria-label="decorative ? undefined : label"
    :aria-hidden="decorative ? 'true' : undefined"
    v-bind="{ ...$attrs, class: undefined }"
  />
</template>
