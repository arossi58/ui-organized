<!-- Teleported, positioned surface holding the popover body. -->
<script setup lang="ts">
import { computed, watchEffect } from "vue";
import { Popover as ArkPopover } from "@ark-ui/vue";
import { clsx } from "clsx";
import { useAnchoredPositioning, toPlacement } from "./positioning.js";
import type { PopoverContentProps } from "./Popover.types.js";

defineOptions({ inheritAttrs: false });
const props = withDefaults(defineProps<PopoverContentProps>(), {
  side: "bottom",
  align: "center",
  sideOffset: 8,
});

const positioning = useAnchoredPositioning();
// Kept in a watchEffect rather than written once, so a later change to
// side/align/sideOffset reaches the Root — see ./positioning.ts.
watchEffect(() => {
  if (!positioning) return;
  positioning.value = {
    placement: toPlacement(props.side, props.align),
    gutter: props.sideOffset,
    offset: props.alignOffset != null ? { crossAxis: props.alignOffset } : undefined,
  };
});

const popupClass = computed(() => clsx("popover__popup", "text-default-body-medium"));
</script>

<template>
  <Teleport :to="container ?? 'body'">
    <!--
      The positioner class must stay a plain string literal: the overlay-stacking
      test scans for it, and stacking is declared on the popup rather than here
      because zag writes an inline z-index onto the positioner and reads it from
      the popup's rule.
    -->
    <ArkPopover.Positioner class="popover__positioner">
      <ArkPopover.Content :class="popupClass" v-bind="$attrs"><slot /></ArkPopover.Content>
    </ArkPopover.Positioner>
  </Teleport>
</template>
