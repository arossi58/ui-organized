<!-- HoverCard root — opens a rich preview when the trigger is hovered or focused. -->
<script setup lang="ts">
import { computed } from "vue";
import { HoverCard as ArkHoverCard } from "@ark-ui/vue";
import { definedOnly } from "../../props.js";
import { providePositioning } from "../Popover/positioning.js";
import type { HoverCardProps } from "./HoverCard.types.js";
import "@ui-organized/core/components/HoverCard/HoverCard.css";

// Every boolean forwarded to Ark below must default to `undefined`. Vue casts
// an absent Boolean prop to `false`, and `definedOnly` then forwards that as a
// deliberate choice — see ../../props.ts.
const props = withDefaults(defineProps<HoverCardProps>(), {
  open: undefined,
  defaultOpen: undefined,
});
const emit = defineEmits<{ "update:open": [open: boolean]; openChange: [open: boolean] }>();

// The Content writes its side/align into this.
const positioning = providePositioning({ placement: "bottom", gutter: 8 });

const rootProps = computed(() =>
  definedOnly({
    open: props.open,
    defaultOpen: props.defaultOpen,
    openDelay: props.openDelay,
    closeDelay: props.closeDelay,
  }),
);
</script>

<template>
  <ArkHoverCard.Root
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
  </ArkHoverCard.Root>
</template>
