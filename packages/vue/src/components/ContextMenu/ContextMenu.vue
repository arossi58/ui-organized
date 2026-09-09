<!--
  ContextMenu root — controls open state.

  Ark has no separate context-menu primitive: it is a Menu with a ContextTrigger
  (right-click) that anchors the positioner at the cursor.
-->
<script setup lang="ts">
import { computed } from "vue";
import { Menu as ArkMenu } from "@ark-ui/vue";
import { definedOnly } from "../../props.js";
import { providePositioning } from "../Popover/positioning.js";
import type { ContextMenuProps } from "./ContextMenu.types.js";
import "@ui-organized/core/components/ContextMenu/ContextMenu.css";
// Reuse the design-system Checkbox / Radio control visuals inside menu items.
import "@ui-organized/core/components/Checkbox/Checkbox.css";
import "@ui-organized/core/components/Radio/Radio.css";

// Every boolean forwarded to Ark below must default to `undefined`. Vue casts
// an absent Boolean prop to `false`, and `definedOnly` then forwards that as a
// deliberate choice — see ../../props.ts.
const props = withDefaults(defineProps<ContextMenuProps>(), {
  open: undefined,
  defaultOpen: undefined,
});
const emit = defineEmits<{ "update:open": [open: boolean]; openChange: [open: boolean] }>();

// No placement: the cursor anchor set by ContextTrigger drives it, and naming a
// side here would pull the popup back to the trigger box instead.
const positioning = providePositioning({ gutter: 4 });
const rootProps = computed(() => definedOnly({ open: props.open, defaultOpen: props.defaultOpen }));
</script>

<template>
  <ArkMenu.Root
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
  </ArkMenu.Root>
</template>
