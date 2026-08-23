<!-- Teleported surface, positioned at the cursor, holding the menu items. -->
<script setup lang="ts">
import { watchEffect } from "vue";
import { Menu as ArkMenu } from "@ark-ui/vue";
import { useAnchoredPositioning } from "../Popover/positioning.js";
import type { ContextMenuContentProps } from "./ContextMenu.types.js";

defineOptions({ inheritAttrs: false });
const props = withDefaults(defineProps<ContextMenuContentProps>(), { sideOffset: 4 });

const positioning = useAnchoredPositioning();
watchEffect(() => {
  if (!positioning) return;
  // No placement — the cursor anchor set by ContextTrigger drives it.
  positioning.value = {
    gutter: props.sideOffset,
    offset: props.alignOffset != null ? { crossAxis: props.alignOffset } : undefined,
  };
});
</script>

<template>
  <Teleport :to="container ?? 'body'">
    <ArkMenu.Positioner class="context-menu__positioner">
      <ArkMenu.Content class="context-menu__popup" v-bind="$attrs"><slot /></ArkMenu.Content>
    </ArkMenu.Positioner>
  </Teleport>
</template>
