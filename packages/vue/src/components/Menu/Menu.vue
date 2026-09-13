<!--
  Menu root — controls open state.

  A menu placed inside a `Menubar` needs no special spelling here: the bar
  announces itself on provide/inject and `MenuTrigger` reads it, so the trigger
  becomes one of the bar's menuitems on its own.
-->
<script setup lang="ts">
import { computed } from "vue";
import { Menu as ArkMenu } from "@ark-ui/vue";
import { definedOnly } from "../../props.js";
import { providePositioning } from "../Popover/positioning.js";
import type { MenuProps } from "./Menu.types.js";
import "@ui-organized/core/components/Menu/Menu.css";
// Reuse the design-system Checkbox / Radio control visuals inside menu items.
import "@ui-organized/core/components/Checkbox/Checkbox.css";
import "@ui-organized/core/components/Radio/Radio.css";

// Every boolean forwarded to Ark below must default to `undefined`. Vue casts
// an absent Boolean prop to `false`, and `definedOnly` then forwards that as a
// deliberate choice — see ../../props.ts.
const props = withDefaults(defineProps<MenuProps>(), {
  open: undefined,
  defaultOpen: undefined,
});
const emit = defineEmits<{ "update:open": [open: boolean]; openChange: [open: boolean] }>();

const positioning = providePositioning({ placement: "bottom-start", gutter: 4 });
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
