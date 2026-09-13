<script setup lang="ts">
import { computed, useId } from "vue";
import { Menu as ArkMenu } from "@ark-ui/vue";
import { clsx } from "clsx";
import { definedOnly } from "../../props.js";
import Icon from "../Icon/Icon.vue";
import type { MenuItemProps } from "./Menu.types.js";

// `disabled` defaults to `undefined` rather than `false` so an absent prop is
// left to Ark's own default — see ../../props.ts.
const props = withDefaults(defineProps<MenuItemProps>(), { disabled: undefined });
/**
 * Selection is an event here where React and Svelte take an `onSelect` prop.
 *
 * Ark Vue's `Menu.Item` emits `select`; forwarding it is what makes a menu item
 * do anything at all, and its absence was invisible to the parity gate — that
 * gate compares rendered DOM, and a handler that is never wired renders exactly
 * like one that is. It surfaced building the data table's row-actions menu.
 */
const emit = defineEmits<{ select: [] }>();

// Ark requires a stable value per item; fall back to a generated id. Typeahead
// still uses the item's text content.
const generatedId = useId();
const itemClass = computed(() =>
  clsx("menu__item", props.destructive && "menu__item--destructive"),
);
const itemProps = computed(() => definedOnly({ disabled: props.disabled }));
</script>

<template>
  <ArkMenu.Item
    :value="value ?? generatedId"
    :class="itemClass"
    v-bind="itemProps"
    @select="emit('select')"
  >
    <Icon v-if="icon" :name="icon" :size="20" class="menu__item-icon" />
    <span class="menu__item-label"><slot /></span>
  </ArkMenu.Item>
</template>
