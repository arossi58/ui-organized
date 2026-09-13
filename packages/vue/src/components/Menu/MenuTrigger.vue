<!-- Element that opens the menu. Pass `asChild` to project a custom element. -->
<script setup lang="ts">
import { computed } from "vue";
import { Menu as ArkMenu, useMenuContext } from "@ark-ui/vue";
import { popupControls } from "@ui-organized/core";
import { definedOnly } from "../../props.js";
import { useInMenubar } from "../Menubar/menubarContext.js";

defineProps<{ asChild?: boolean }>();
const menu = useMenuContext();
const controls = computed(() => definedOnly(popupControls(menu.value.open)));

// Inside a menubar the trigger is one of the bar's menuitems, not a button —
// `role="menubar"` admits no other children. The data attribute is how the bar
// finds its own triggers for roving focus: a menu that teleports its content
// into the bar (as a docs preview does) would otherwise put that menu's *items*
// in reach of a `[role="menuitem"]` query. See ../Menubar/Menubar.vue.
const inMenubar = useInMenubar();
const menubarProps = inMenubar ? ({ role: "menuitem", "data-menubar-item": "" } as const) : {};
</script>

<template>
  <ArkMenu.Trigger :as-child="asChild" v-bind="{ ...controls, ...menubarProps }"
    ><slot
  /></ArkMenu.Trigger>
</template>
