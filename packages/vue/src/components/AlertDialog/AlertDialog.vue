<!--
  AlertDialog root — a focus-trapping confirm dialog dismissed via its actions.

  There is no `modal` prop, unlike Dialog: an alert dialog that could be
  dismissed by clicking past it would defeat the point of asking.
-->
<script setup lang="ts">
import { computed } from "vue";
import { Dialog as ArkDialog } from "@ark-ui/vue";
import { definedOnly } from "../../props.js";
import type { AlertDialogProps } from "./AlertDialog.types.js";
// Reuses the Dialog chrome (backdrop, popup sizing, title/description/footer/close).
import "@ui-organized/core/components/Dialog/Dialog.css";
// The Cancel/Confirm actions render the design-system button, so its rules have
// to come with the component rather than being left to the app to remember.
import "@ui-organized/core/components/Button/Button.css";

// Every boolean forwarded to Ark below must default to `undefined`. Vue casts
// an absent Boolean prop to `false`, and `definedOnly` then forwards that as a
// deliberate choice — see ../../props.ts.
const props = withDefaults(defineProps<AlertDialogProps>(), {
  open: undefined,
  defaultOpen: undefined,
});
const emit = defineEmits<{ "update:open": [open: boolean]; openChange: [open: boolean] }>();
const rootProps = computed(() => definedOnly({ open: props.open, defaultOpen: props.defaultOpen }));
</script>

<template>
  <!-- role="alertdialog" gives it the alert semantics + no outside-click dismiss. -->
  <ArkDialog.Root
    role="alertdialog"
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
