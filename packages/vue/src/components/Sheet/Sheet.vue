<!-- Sheet root — an edge-anchored panel built on the Dialog primitive. -->
<script setup lang="ts">
import { computed } from "vue";
import { Dialog as ArkDialog } from "@ark-ui/vue";
import { definedOnly } from "../../props.js";
import type { SheetProps } from "./Sheet.types.js";
// Reuses the Dialog chrome (backdrop, title/description/footer/close).
import "@ui-organized/core/components/Dialog/Dialog.css";
import "@ui-organized/core/components/Sheet/Sheet.css";

// Every boolean forwarded to Ark below must default to `undefined`. Vue casts
// an absent Boolean prop to `false`, and `definedOnly` then forwards that as a
// deliberate choice — `modal: false` in particular would take the focus trap and
// the scroll lock off every sheet that never mentioned modality. See
// ../../props.ts.
const props = withDefaults(defineProps<SheetProps>(), {
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
  <ArkDialog.Root
    v-bind="rootProps"
    @open-change="
      (details) => {
        emit('update:open', details.open);
        emit('openChange', details.open);
      }
    "
  >
    <slot />
  </ArkDialog.Root>
</template>
