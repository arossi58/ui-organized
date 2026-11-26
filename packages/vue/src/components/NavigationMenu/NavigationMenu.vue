<!-- A site's top navigation: triggers that each open a panel of links, and links that go straight to a page. -->
<script setup lang="ts">
import { computed } from "vue";
// A subpath: Ark Vue 5.39 ships the component but leaves it out of its main entry.
import { NavigationMenu as ArkNavigationMenu } from "@ark-ui/vue/navigation-menu";
import {
  NAVIGATION_MENU_CLASS,
  NAVIGATION_MENU_CLOSE_DELAY,
  NAVIGATION_MENU_OPEN_DELAY,
} from "@ui-organized/core";
import { definedOnly } from "../../props.js";
import type { NavigationMenuProps } from "./NavigationMenu.types.js";
import "@ui-organized/core/components/NavigationMenu/NavigationMenu.css";

const props = withDefaults(defineProps<NavigationMenuProps>(), {
  openDelay: NAVIGATION_MENU_OPEN_DELAY,
  closeDelay: NAVIGATION_MENU_CLOSE_DELAY,
});
const emit = defineEmits<{ "update:value": [value: string]; valueChange: [value: string] }>();
const rootProps = computed(() =>
  definedOnly({
    value: props.value,
    defaultValue: props.defaultValue,
    openDelay: props.openDelay,
    closeDelay: props.closeDelay,
  }),
);
</script>

<template>
  <ArkNavigationMenu.Root
    v-bind="rootProps"
    :class="NAVIGATION_MENU_CLASS.root"
    @value-change="
      (details) => {
        emit('update:value', details.value);
        emit('valueChange', details.value);
      }
    "
  >
    <ArkNavigationMenu.List :class="NAVIGATION_MENU_CLASS.list"><slot /></ArkNavigationMenu.List>
  </ArkNavigationMenu.Root>
</template>
