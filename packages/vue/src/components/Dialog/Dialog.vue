<!-- Dialog root — controls open state. -->
<script setup lang="ts">
import { computed } from "vue";
import { Dialog as ArkDialog } from "@ark-ui/vue";
import { definedOnly } from "../../props.js";
import type { DialogProps } from "./Dialog.types.js";
import "@ui-organized/core/components/Dialog/Dialog.css";

// Every boolean forwarded to Ark below must default to `undefined`. Vue casts
// an absent Boolean prop to `false`, and `definedOnly` then forwards that as a
// deliberate choice — see ../../props.ts.
const props = withDefaults(defineProps<DialogProps>(), {
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
