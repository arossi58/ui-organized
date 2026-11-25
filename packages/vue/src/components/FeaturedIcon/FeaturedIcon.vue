<!--
  An icon in a tinted shape, the piece empty states, modal headers, feature
  grids and metric cards are built around. Decorative unless given a `label`.
-->
<script setup lang="ts">
import { computed, useAttrs } from "vue";
import { clsx } from "clsx";
import { FEATURED_ICON_GLYPH_SIZE, featuredIconStyles } from "@ui-organized/core";
import Icon from "../Icon/Icon.vue";
import type { FeaturedIconProps } from "./FeaturedIcon.types.js";
import "@ui-organized/core/components/FeaturedIcon/FeaturedIcon.css";

defineOptions({ inheritAttrs: false });
const props = withDefaults(defineProps<FeaturedIconProps>(), {
  variant: "brand",
  appearance: "subtle",
  shape: "circle",
  size: "md",
});
const attrs = useAttrs();

const rootClass = computed(() =>
  clsx(
    featuredIconStyles({
      variant: props.variant,
      appearance: props.appearance,
      shape: props.shape,
      size: props.size,
    }),
    attrs.class as string | undefined,
  ),
);
</script>

<template>
  <span
    :class="rootClass"
    :role="label ? 'img' : undefined"
    :aria-label="label || undefined"
    :aria-hidden="label ? undefined : 'true'"
    v-bind="{ ...$attrs, class: undefined }"
  >
    <Icon :name="icon" :size="FEATURED_ICON_GLYPH_SIZE[size]" />
  </span>
</template>
