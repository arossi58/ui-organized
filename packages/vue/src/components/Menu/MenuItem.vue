<script setup lang="ts">
import { computed, useId } from "vue";
import { Menu as ArkMenu } from "@ark-ui/vue";
import { clsx } from "clsx";
import Icon from "../Icon/Icon.vue";
import type { MenuItemProps } from "./Menu.types.js";

const props = defineProps<MenuItemProps>();
// Ark requires a stable value per item; fall back to a generated id. Typeahead
// still uses the item's text content.
const generatedId = useId();
const itemClass = computed(() =>
  clsx("menu__item", props.destructive && "menu__item--destructive"),
);
</script>

<template>
  <ArkMenu.Item :value="value ?? generatedId" :class="itemClass">
    <Icon v-if="icon" :name="icon" :size="20" class="menu__item-icon" />
    <span class="menu__item-label"><slot /></span>
  </ArkMenu.Item>
</template>
