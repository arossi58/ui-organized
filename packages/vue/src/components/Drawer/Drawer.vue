<!-- Drawer root: a panel along the bottom edge, dismissed by swiping it down. -->
<script setup lang="ts">
import { computed } from "vue";
import { Drawer as ArkDrawer } from "@ark-ui/vue";
import { definedOnly } from "../../props.js";
import type { DrawerProps } from "./Drawer.types.js";
// Reuses the Dialog chrome (title, description, footer, close).
import "@ui-organized/core/components/Dialog/Dialog.css";
import "@ui-organized/core/components/Drawer/Drawer.css";

// Every boolean forwarded to Ark must default to `undefined`: Vue casts an
// absent Boolean prop to `false`, and `modal: false` would take the focus trap
// and the scroll lock off every drawer that never mentioned it. See ../../props.ts.
const props = withDefaults(defineProps<DrawerProps>(), {
  open: undefined,
  defaultOpen: undefined,
  modal: undefined,
});
const emit = defineEmits<{ "update:open": [open: boolean]; openChange: [open: boolean] }>();
const rootProps = computed(() =>
  definedOnly({ open: props.open, defaultOpen: props.defaultOpen, modal: props.modal }),
);
</script>

<template>
  <ArkDrawer.Root
    v-bind="rootProps"
    @open-change="
      (details) => {
        emit('update:open', details.open);
        emit('openChange', details.open);
      }
    "
  >
    <slot />
  </ArkDrawer.Root>
</template>
