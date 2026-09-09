<!-- Popover root — controls open state. Wrap a trigger and content. -->
<script setup lang="ts">
import { Popover as ArkPopover } from "@ark-ui/vue";
import { definedOnly } from "../../props.js";
import { providePositioning } from "./positioning.js";
import type { PopoverProps } from "./Popover.types.js";
import { computed } from "vue";
import "@ui-organized/core/components/Popover/Popover.css";

// Every boolean forwarded to Ark below must default to `undefined`. Vue casts
// an absent Boolean prop to `false`, and `definedOnly` then forwards that as a
// deliberate choice — see ../../props.ts.
const props = withDefaults(defineProps<PopoverProps>(), {
  open: undefined,
  defaultOpen: undefined,
  modal: undefined,
});
const emit = defineEmits<{ "update:open": [open: boolean]; openChange: [open: boolean] }>();

// The Content writes its side/align into this.
const positioning = providePositioning({ placement: "bottom", gutter: 8 });

const rootProps = computed(() =>
  definedOnly({ open: props.open, defaultOpen: props.defaultOpen, modal: props.modal }),
);
</script>

<template>
  <ArkPopover.Root
    v-bind="rootProps"
    :positioning="positioning"
    @open-change="
      (details) => {
        emit('update:open', details.open);
        emit('openChange', details.open);
      }
    "
  >
    <slot />
  </ArkPopover.Root>
</template>
