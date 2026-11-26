<!-- One entry in the bar: a trigger and the panel it opens (the default slot), or with `href` a link straight to that page. -->
<script setup lang="ts">
import { computed, provide } from "vue";
import { NavigationMenu as ArkNavigationMenu } from "@ark-ui/vue/navigation-menu";
import {
  NAVIGATION_MENU_CHEVRON_SIZE,
  NAVIGATION_MENU_CLASS,
  navigationMenuContentStyles,
} from "@ui-organized/core";
import Icon from "../Icon/Icon.vue";
import { glyph } from "../../icons/glyph.js";
import { NAVIGATION_MENU_PANEL_KEY } from "./context.js";
import type { NavigationMenuItemProps } from "./NavigationMenu.types.js";

// `current` and `disabled` default to `undefined`, not Vue's cast `false`: see ../../props.ts.
const props = withDefaults(defineProps<NavigationMenuItemProps>(), {
  current: undefined,
  disabled: undefined,
  columns: 1,
});

// The slot renders only in the panel when there is one, so the item can answer for it.
provide(
  NAVIGATION_MENU_PANEL_KEY,
  computed(() => props.href == null && props.label != null),
);
const contentClass = computed(() => navigationMenuContentStyles({ columns: props.columns }));
</script>

<template>
  <ArkNavigationMenu.Item :value="value" :disabled="disabled" :class="NAVIGATION_MENU_CLASS.item">
    <ArkNavigationMenu.Link
      v-if="href != null"
      :href="href"
      :current="current"
      :class="NAVIGATION_MENU_CLASS.trigger"
      >{{ label }}</ArkNavigationMenu.Link
    >
    <template v-else-if="label != null">
      <!-- Passed again here: Ark Vue's Trigger casts an absent `disabled` to false, which outranks the item's. -->
      <ArkNavigationMenu.Trigger :disabled="disabled" :class="NAVIGATION_MENU_CLASS.trigger"
        >{{ label
        }}<Icon
          :name="glyph('chevron-down')"
          :size="NAVIGATION_MENU_CHEVRON_SIZE"
          :class="NAVIGATION_MENU_CLASS.chevron"
      /></ArkNavigationMenu.Trigger>
      <ArkNavigationMenu.Content :class="contentClass"><slot /></ArkNavigationMenu.Content>
    </template>
    <slot v-else />
  </ArkNavigationMenu.Item>
</template>
