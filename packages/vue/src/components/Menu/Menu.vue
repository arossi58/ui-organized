<!--
  Menu root — controls open state.

  Unlike the React package this does not integrate with Menubar: Menubar is not
  part of the tier-1 set, so the trigger never needs to become one of a bar's
  menuitems. When Menubar lands, the trigger gains the same role and
  data-menubar-item treatment.
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

const props = defineProps<MenuProps>();
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
