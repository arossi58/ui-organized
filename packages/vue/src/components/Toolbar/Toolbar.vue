<!--
  A container grouping a set of design-system controls.

  Ark UI has no Toolbar primitive and this needs none: it is a pure layout
  container that owns `role="toolbar"` and the surface. Compose it with the
  library's own controls — `Button` (use `intent="ghost"`), `Input`, and
  `Divider` (use `orientation="vertical"`). Match the control `size` across the
  children to size the toolbar.

  `data-orientation` as well as `aria-orientation`, because the stylesheet
  selects on the data attribute to switch the flex direction; dropping it leaves
  a vertical toolbar laid out horizontally with correct ARIA.
-->
<script setup lang="ts">
import { computed, useAttrs } from "vue";
import { clsx } from "clsx";
import type { ToolbarProps } from "./Toolbar.types.js";
import "@ui-organized/core/components/Toolbar/Toolbar.css";

defineOptions({ inheritAttrs: false });
withDefaults(defineProps<ToolbarProps>(), { orientation: "horizontal" });
const attrs = useAttrs();
const rootClass = computed(() => clsx("toolbar", attrs.class as string));
</script>

<template>
  <div
    role="toolbar"
    :aria-orientation="orientation"
    :data-orientation="orientation"
    :class="rootClass"
    v-bind="{ ...$attrs, class: undefined }"
  >
    <slot />
  </div>
</template>
