<!-- Teleported backdrop + centered popup holding the dialog body. -->
<script setup lang="ts">
import { computed, useAttrs } from "vue";
import { Dialog as ArkDialog } from "@ark-ui/vue";
import { clsx } from "clsx";
import { dialogStyles } from "@ui-organized/core";
import Icon from "../Icon/Icon.vue";
import type { DialogContentProps } from "./Dialog.types.js";

defineOptions({ inheritAttrs: false });
const props = withDefaults(defineProps<DialogContentProps>(), { showClose: true });
const attrs = useAttrs();
const contentClass = computed(() =>
  clsx(dialogStyles({ size: props.size }), attrs.class as string),
);
</script>

<!-- Ark centres the content with a Positioner rather than the popup centring itself. -->
<template>
  <Teleport :to="container ?? 'body'">
    <ArkDialog.Backdrop class="dialog__backdrop" />
    <ArkDialog.Positioner class="dialog__positioner">
      <ArkDialog.Content :class="contentClass" v-bind="{ ...$attrs, class: undefined }">
        <ArkDialog.CloseTrigger v-if="showClose" class="dialog__close" aria-label="Close">
          <Icon name="close" :size="20" />
        </ArkDialog.CloseTrigger>
        <slot />
      </ArkDialog.Content>
    </ArkDialog.Positioner>
  </Teleport>
</template>
