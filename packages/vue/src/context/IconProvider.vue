<!--
  Sets the icon configuration for everything below it.

  Provided as a computed rather than a snapshot so a provider driven by reactive
  props keeps its consumers current.
-->
<script setup lang="ts">
import { computed } from "vue";
import { DEFAULT_ICON_CONFIG, type IconConfig } from "@ui-organized/core";
import type { IconComponent } from "../icons/registry.js";
import { provideIconConfig } from "./iconContext.js";

const props = withDefaults(defineProps<Partial<IconConfig<IconComponent>>>(), {
  library: DEFAULT_ICON_CONFIG.library,
  style: DEFAULT_ICON_CONFIG.style,
  strokeAdjustment: DEFAULT_ICON_CONFIG.strokeAdjustment,
  baseSize: DEFAULT_ICON_CONFIG.baseSize,
  baseStroke: DEFAULT_ICON_CONFIG.baseStroke,
});

provideIconConfig(
  computed<IconConfig<IconComponent>>(() => ({
    library: props.library,
    style: props.style,
    strokeAdjustment: props.strokeAdjustment,
    baseSize: props.baseSize,
    baseStroke: props.baseStroke,
    icons: props.icons,
  })),
);
</script>

<template>
  <slot />
</template>
