<!--
  Teleported backdrop + edge-anchored panel holding the sheet body. The panel
  self-positions at the edge, so the positioner is just the Ark wrapper.
-->
<script setup lang="ts">
import { computed, useAttrs } from "vue";
import { Dialog as ArkDialog } from "@ark-ui/vue";
import { clsx } from "clsx";
import { sheetStyles } from "@ui-organized/core";
import Icon from "../Icon/Icon.vue";
import type { SheetContentProps } from "./Sheet.types.js";

defineOptions({ inheritAttrs: false });
// `side` and `size` are left undefined rather than given defaults here: the
// recipe already declares 'right' and 'md', and repeating them would be a second
// copy of the default to keep in step.
const props = withDefaults(defineProps<SheetContentProps>(), { showClose: true });
const attrs = useAttrs();
const contentClass = computed(() =>
  clsx(sheetStyles({ side: props.side, size: props.size }), attrs.class as string),
);
</script>

<template>
  <Teleport :to="container ?? 'body'">
    <ArkDialog.Backdrop class="dialog__backdrop" />
    <ArkDialog.Positioner class="dialog__positioner sheet__positioner">
      <ArkDialog.Content :class="contentClass" v-bind="{ ...$attrs, class: undefined }">
        <ArkDialog.CloseTrigger v-if="showClose" class="dialog__close" aria-label="Close">
          <Icon name="close" :size="20" />
        </ArkDialog.CloseTrigger>
        <slot />
      </ArkDialog.Content>
    </ArkDialog.Positioner>
  </Teleport>
</template>
