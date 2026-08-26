<!-- Teleported, positioned surface holding the preview content. -->
<script setup lang="ts">
import { watchEffect } from "vue";
import { HoverCard as ArkHoverCard } from "@ark-ui/vue";
import { useAnchoredPositioning, toPlacement } from "../Popover/positioning.js";
import type { HoverCardContentProps } from "./HoverCard.types.js";

defineOptions({ inheritAttrs: false });
const props = withDefaults(defineProps<HoverCardContentProps>(), {
  side: "bottom",
  align: "center",
  sideOffset: 8,
});

const positioning = useAnchoredPositioning();
// Kept in a watchEffect rather than written once, so a later change to
// side/align/sideOffset reaches the Root — see ../Popover/positioning.ts.
watchEffect(() => {
  if (!positioning) return;
  positioning.value = {
    placement: toPlacement(props.side, props.align),
    gutter: props.sideOffset,
    offset: props.alignOffset != null ? { crossAxis: props.alignOffset } : undefined,
  };
});
</script>

<template>
  <Teleport :to="container ?? 'body'">
    <ArkHoverCard.Positioner class="hover-card__positioner">
      <ArkHoverCard.Content class="hover-card__popup text-default-body-medium" v-bind="$attrs">
        <slot />
      </ArkHoverCard.Content>
    </ArkHoverCard.Positioner>
  </Teleport>
</template>
