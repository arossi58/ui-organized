<!-- Teleported backdrop and the panel along the bottom edge, with its grabber and close button. -->
<script setup lang="ts">
import { computed, useAttrs } from "vue";
import { Drawer as ArkDrawer } from "@ark-ui/vue";
import { clsx } from "clsx";
import { DRAWER_CLASS, DRAWER_CLOSE_ICON_SIZE } from "@ui-organized/core";
import Icon from "../Icon/Icon.vue";
import type { DrawerContentProps } from "./Drawer.types.js";
import { glyph } from "../../icons/glyph.js";

defineOptions({ inheritAttrs: false });
// `draggable` defaults to true, not to Vue's cast `false`, which would stop
// every drawer dragging from its content.
const props = withDefaults(defineProps<DrawerContentProps>(), {
  draggable: true,
  showGrabber: true,
  showClose: true,
});
const attrs = useAttrs();
const contentClass = computed(() => clsx(DRAWER_CLASS.popup, attrs.class as string));
</script>

<template>
  <Teleport :to="container ?? 'body'">
    <ArkDrawer.Backdrop :class="DRAWER_CLASS.backdrop" />
    <ArkDrawer.Positioner :class="DRAWER_CLASS.positioner">
      <ArkDrawer.Content :class="contentClass" :draggable="props.draggable" v-bind="{ ...$attrs, class: undefined }">
        <ArkDrawer.Grabber v-if="showGrabber" :class="DRAWER_CLASS.grabber">
          <ArkDrawer.GrabberIndicator :class="DRAWER_CLASS.grabberIndicator" />
        </ArkDrawer.Grabber>
        <ArkDrawer.CloseTrigger v-if="showClose" :class="DRAWER_CLASS.close" aria-label="Close">
          <Icon :name="glyph('close')" :size="DRAWER_CLOSE_ICON_SIZE" />
        </ArkDrawer.CloseTrigger>
        <slot />
      </ArkDrawer.Content>
    </ArkDrawer.Positioner>
  </Teleport>
</template>
