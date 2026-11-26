<!-- A link: a row with an icon and a description in a panel, or a trigger's twin in the bar. Pass `as` for a router link. -->
<script setup lang="ts">
import { computed, inject } from "vue";
import { NavigationMenu as ArkNavigationMenu } from "@ark-ui/vue/navigation-menu";
import { NAVIGATION_MENU_CLASS, NAVIGATION_MENU_LINK_ICON_SIZE } from "@ui-organized/core";
import Icon from "../Icon/Icon.vue";
import { definedOnly } from "../../props.js";
import { NAVIGATION_MENU_PANEL_KEY } from "./context.js";
import type { NavigationMenuLinkProps } from "./NavigationMenu.types.js";

const props = withDefaults(defineProps<NavigationMenuLinkProps>(), {
  current: undefined,
  closeOnClick: undefined,
});
const inPanel = inject(NAVIGATION_MENU_PANEL_KEY, undefined);
const panel = computed(() => inPanel?.value ?? false);
const linkClass = computed(() =>
  panel.value ? NAVIGATION_MENU_CLASS.link : NAVIGATION_MENU_CLASS.trigger,
);
const linkProps = computed(() =>
  definedOnly({ href: props.href, current: props.current, closeOnClick: props.closeOnClick }),
);
</script>

<template>
  <ArkNavigationMenu.Link v-if="as" as-child v-bind="linkProps" :class="linkClass">
    <component :is="as">
      <template v-if="panel">
        <span v-if="icon != null" :class="NAVIGATION_MENU_CLASS.linkIcon"
          ><Icon :name="icon" :size="NAVIGATION_MENU_LINK_ICON_SIZE"
        /></span>
        <span :class="NAVIGATION_MENU_CLASS.linkBody"
          ><span :class="NAVIGATION_MENU_CLASS.linkTitle"><slot /></span
          ><span v-if="description != null" :class="NAVIGATION_MENU_CLASS.linkDescription">{{
            description
          }}</span></span
        >
      </template>
      <slot v-else />
    </component>
  </ArkNavigationMenu.Link>
  <ArkNavigationMenu.Link v-else v-bind="linkProps" :class="linkClass">
    <template v-if="panel">
      <span v-if="icon != null" :class="NAVIGATION_MENU_CLASS.linkIcon"
        ><Icon :name="icon" :size="NAVIGATION_MENU_LINK_ICON_SIZE"
      /></span>
      <span :class="NAVIGATION_MENU_CLASS.linkBody"
        ><span :class="NAVIGATION_MENU_CLASS.linkTitle"><slot /></span
        ><span v-if="description != null" :class="NAVIGATION_MENU_CLASS.linkDescription">{{
          description
        }}</span></span
      >
    </template>
    <slot v-else />
  </ArkNavigationMenu.Link>
</template>
