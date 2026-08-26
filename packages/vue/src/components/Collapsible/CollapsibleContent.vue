<!--
  The region revealed when open. Zag animates its height off `--height`, which it
  writes inline on this element — see Collapsible.css for why that has to be a
  keyframe animation rather than a transition.
-->
<script setup lang="ts">
import { computed, useAttrs } from "vue";
import { Collapsible as ArkCollapsible } from "@ark-ui/vue";
import { clsx } from "clsx";
import type { CollapsibleContentProps } from "./Collapsible.types.js";

defineOptions({ inheritAttrs: false });
defineProps<CollapsibleContentProps>();

const attrs = useAttrs();
const panelClass = computed(() => clsx("collapsible__panel", attrs.class as string));
const forwarded = computed(() => ({ ...attrs, class: undefined }));
</script>

<template>
  <ArkCollapsible.Content v-if="asChild" as-child :class="panelClass" v-bind="forwarded">
    <slot />
  </ArkCollapsible.Content>
  <!--
    The panel itself is the animating box, so it has to keep `overflow: hidden`
    and no padding of its own; the inner element is what carries the spacing.
  -->
  <ArkCollapsible.Content v-else :class="panelClass" v-bind="forwarded">
    <div class="collapsible__content"><slot /></div>
  </ArkCollapsible.Content>
</template>
