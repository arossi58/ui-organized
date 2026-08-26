<!--
  Loading placeholder. Renders a shimmering block sized to the eventual content.
  For multi-line text, pass `lines` to render a stack with a shortened last row.
-->
<script setup lang="ts">
import { computed, useAttrs } from "vue";
import { clsx } from "clsx";
import { skeletonStyles } from "@ui-organized/core";
import type { SkeletonProps } from "./Skeleton.types.js";
import "@ui-organized/core/components/Skeleton/Skeleton.css";

defineOptions({ inheritAttrs: false });
const props = withDefaults(defineProps<SkeletonProps>(), {
  variant: "text",
  lines: 1,
  animated: true,
});
const attrs = useAttrs();

/** A number is treated as pixels; strings pass through as-is. */
const toCssSize = (value?: number | string): string | undefined =>
  value == null ? undefined : typeof value === "number" ? `${value}px` : value;

const w = computed(() => toCssSize(props.width));
const h = computed(() => toCssSize(props.height));
const isStack = computed(() => props.variant === "text" && props.lines > 1);
const itemClass = computed(() =>
  skeletonStyles({ variant: props.variant, animated: props.animated }),
);
const soloClass = computed(() => clsx(itemClass.value, attrs.class as string));
const stackClass = computed(() => clsx("skeleton-group", attrs.class as string));

const lineStyle = (i: number) => ({
  width: i === props.lines - 1 ? "60%" : (w.value ?? "100%"),
  height: h.value,
});
</script>

<template>
  <div
    v-if="isStack"
    :class="stackClass"
    aria-hidden="true"
    v-bind="{ ...$attrs, class: undefined }"
  >
    <span v-for="i in lines" :key="i" :class="itemClass" :style="lineStyle(i - 1)" />
  </div>
  <span
    v-else
    :class="soloClass"
    :style="{ width: w, height: h }"
    aria-hidden="true"
    v-bind="{ ...$attrs, class: undefined }"
  />
</template>
