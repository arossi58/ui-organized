<!-- The bar across the top of an AppShell, led by the menu button in the sheet layout. Slots: `logo`, `nav`, `actions`. -->
<script setup lang="ts">
import { computed, inject } from "vue";
import { APP_HEADER_CLASS, APP_HEADER_MENU_ICON_SIZE } from "@ui-organized/core";
import Icon from "../Icon/Icon.vue";
import SheetTrigger from "../Sheet/SheetTrigger.vue";
import { glyph } from "../../icons/glyph.js";
import { APP_SHELL_KEY } from "./context.js";
import type { AppHeaderProps } from "./AppShell.types.js";
import "@ui-organized/core/components/Button/Button.css";
import "@ui-organized/core/components/AppShell/AppShell.css";

withDefaults(defineProps<AppHeaderProps>(), { menuLabel: "Open navigation" });
const slots = defineSlots<{
  /** The product's mark, at the start. */
  logo?: () => unknown;
  /** Navigation across the header, such as a `NavigationMenu`. Shown in the rail layout only. */
  nav?: () => unknown;
  /** Controls at the end. */
  actions?: () => unknown;
}>();
const shell = inject(APP_SHELL_KEY, undefined);
const inSheet = computed(() => shell?.layout === "sheet");
const showMenu = computed(() => inSheet.value && Boolean(shell?.hasSidebar));
</script>

<template>
  <header :class="APP_HEADER_CLASS.root">
    <div v-if="showMenu || slots.logo" :class="APP_HEADER_CLASS.start">
      <SheetTrigger v-if="showMenu" :class="APP_HEADER_CLASS.menu" :aria-label="menuLabel"
        ><Icon :name="glyph('menu')" :size="APP_HEADER_MENU_ICON_SIZE"
      /></SheetTrigger>
      <div v-if="slots.logo" :class="APP_HEADER_CLASS.logo"><slot name="logo" /></div>
    </div>
    <div v-if="slots.nav && !inSheet" :class="APP_HEADER_CLASS.nav"><slot name="nav" /></div>
    <div v-if="slots.actions" :class="APP_HEADER_CLASS.actions"><slot name="actions" /></div>
  </header>
</template>
