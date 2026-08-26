<!--
  Sets the icon configuration for everything below it.

  Provided as a computed rather than a snapshot so a provider driven by reactive
  props keeps its consumers current.

  ── One prop is spelled differently here, and it is not a choice ─────────────

  The React and Svelte libraries call the outline/solid prop `style`. Vue cannot:
  `style` is reserved for the attribute-fallthrough mechanism at every layer that
  could carry it. The template compiler rewrites a static `style="solid"` into a
  parsed style *object* before props are resolved, and `mergeProps` runs
  `normalizeStyle` over anything a `v-bind` spread contributes — so the value
  arrives as `{}` however it is written. That is not a difference a type can
  catch: `{}` is a truthy value that simply is not `"solid"`, and the only
  symptom is that solid icons quietly render outline.

  So the prop is `iconStyle` (`icon-style` in a template), and `style` is
  declared purely so it can be intercepted and explained rather than silently
  producing the wrong icons.
-->
<script lang="ts">
// Module scope, so the warning is once per app rather than once per render.
let warnedAboutStyle = false;
</script>

<script setup lang="ts">
import { computed } from "vue";
import { DEFAULT_ICON_CONFIG, type IconConfig } from "@ui-organized/core";
import type { IconComponent } from "../icons/registry.js";
import { provideIconConfig } from "./iconContext.js";
import type { IconProviderProps } from "./IconProvider.types.js";

const props = withDefaults(defineProps<IconProviderProps>(), {
  library: DEFAULT_ICON_CONFIG.library,
  iconStyle: DEFAULT_ICON_CONFIG.style,
  strokeAdjustment: DEFAULT_ICON_CONFIG.strokeAdjustment,
  baseSize: DEFAULT_ICON_CONFIG.baseSize,
  baseStroke: DEFAULT_ICON_CONFIG.baseStroke,
});

if (props.style !== undefined && !warnedAboutStyle) {
  warnedAboutStyle = true;
  console.warn(
    '[@ui-organized/vue] <IconProvider> got a `style` prop. Vue reserves `style`, ' +
      'so its value never arrives intact — use `icon-style="outline"` / ' +
      '`icon-style="solid"` instead. (The React and Svelte libraries spell it `style`.)',
  );
}

provideIconConfig(
  computed<IconConfig<IconComponent>>(() => ({
    library: props.library,
    style: props.iconStyle,
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
