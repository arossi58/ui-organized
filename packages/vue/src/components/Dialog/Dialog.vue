<!-- Dialog root — controls open state. -->
<script setup lang="ts">
import { computed } from "vue";
import { Dialog as ArkDialog } from "@ark-ui/vue";
import { definedOnly } from "../../props.js";
import type { DialogProps } from "./Dialog.types.js";
import "@ui-organized/core/components/Dialog/Dialog.css";

const props = defineProps<DialogProps>();
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
