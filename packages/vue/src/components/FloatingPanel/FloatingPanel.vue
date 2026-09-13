<!-- Root — owns open state, drag and resize. Wrap a trigger and content. -->
<script setup lang="ts">
import { computed } from "vue";
import { FloatingPanel as ArkFloatingPanel } from "@ark-ui/vue";
import { definedOnly } from "../../props.js";
import type { FloatingPanelProps } from "./FloatingPanel.types.js";
import "@ui-organized/core/components/FloatingPanel/FloatingPanel.css";

// Every boolean forwarded to Ark below must default to `undefined`. Vue casts an
// absent Boolean prop to `false`, and `definedOnly` then forwards that as a
// deliberate choice — `draggable` and `resizable` both default to *true* in the
// machine, so a cast `false` silently pins the panel in place. See ../../props.ts.
const props = withDefaults(defineProps<FloatingPanelProps>(), {
  open: undefined,
  defaultOpen: undefined,
  draggable: undefined,
  resizable: undefined,
});
const emit = defineEmits<{ "update:open": [open: boolean]; openChange: [open: boolean] }>();

const rootProps = computed(() =>
  definedOnly({
    open: props.open,
    defaultOpen: props.defaultOpen,
    draggable: props.draggable,
    resizable: props.resizable,
    defaultSize: props.defaultSize,
    minSize: props.minSize,
    maxSize: props.maxSize,
    defaultPosition: props.defaultPosition,
    strategy: props.strategy,
  }),
);
</script>

<template>
  <ArkFloatingPanel.Root
    v-bind="rootProps"
    @open-change="
      (details) => {
        emit('update:open', details.open);
        emit('openChange', details.open);
      }
    "
  >
    <slot />
  </ArkFloatingPanel.Root>
</template>
