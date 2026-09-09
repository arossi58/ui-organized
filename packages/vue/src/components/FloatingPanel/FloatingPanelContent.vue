<!--
  The panel surface itself, teleported and positioned.

  Unlike every other overlay in this package, FloatingPanel is **not**
  popper-backed — its positioner carries only the drag position and no inline
  `z-index`. It still declares stacking on the content rather than the
  positioner, and is still registered in `POPPER_LAYERS`, so the same "style the
  popup" rule and the same tier assertion cover it.
-->
<script setup lang="ts">
import { computed } from "vue";
import { FloatingPanel as ArkFloatingPanel } from "@ark-ui/vue";
import { floatingPanelStyles } from "@ui-organized/core";
import type { FloatingPanelContentProps } from "./FloatingPanel.types.js";

defineOptions({ inheritAttrs: false });
const props = defineProps<FloatingPanelContentProps>();

const contentClass = computed(() =>
  floatingPanelStyles({ size: props.size, variant: props.variant }),
);

/* Resize handles on all four edges and corners. zag positions each from its
   `axis`; only the hit area is styled. */
const AXES = ["n", "e", "s", "w", "ne", "se", "sw", "nw"] as const;
</script>

<template>
  <Teleport :to="container ?? 'body'">
    <!--
      The positioner class must stay a plain string literal — the
      overlay-stacking test scans for it.
    -->
    <ArkFloatingPanel.Positioner class="floating-panel__positioner">
      <ArkFloatingPanel.Content :class="contentClass" v-bind="$attrs">
        <slot />
        <ArkFloatingPanel.ResizeTrigger
          v-for="axis in AXES"
          :key="axis"
          :axis="axis"
          :class="`floating-panel__resize floating-panel__resize--${axis}`"
        />
      </ArkFloatingPanel.Content>
    </ArkFloatingPanel.Positioner>
  </Teleport>
</template>
