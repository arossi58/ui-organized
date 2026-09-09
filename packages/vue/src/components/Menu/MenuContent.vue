<!-- Teleported, positioned surface holding the menu items. -->
<script setup lang="ts">
import { watchEffect } from "vue";
import { Menu as ArkMenu } from "@ark-ui/vue";
import { useAnchoredPositioning, toPlacement } from "../Popover/positioning.js";
import type { MenuContentProps } from "./Menu.types.js";

defineOptions({ inheritAttrs: false });
const props = withDefaults(defineProps<MenuContentProps>(), {
  side: "bottom",
  align: "start",
  sideOffset: 4,
});

const positioning = useAnchoredPositioning();
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
    <ArkMenu.Positioner class="menu__positioner">
      <ArkMenu.Content class="menu__popup" v-bind="$attrs"><slot /></ArkMenu.Content>
    </ArkMenu.Positioner>
  </Teleport>
</template>
