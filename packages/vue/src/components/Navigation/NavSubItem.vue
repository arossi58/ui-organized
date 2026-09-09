<!-- A sub-page beneath an expandable `NavItem`. -->
<script setup lang="ts">
import { computed, useAttrs } from "vue";
import { clsx } from "clsx";
import { navSubItemStyles } from "@ui-organized/core";
import Icon from "../Icon/Icon.vue";
import { useNavContext } from "./navContext.js";
import type { NavSubItemProps } from "./Navigation.types.js";
import "@ui-organized/core/components/Navigation/Navigation.css";

const ICON_SIZE = 20;

defineOptions({ inheritAttrs: false });
// `collapsed` stays tri-state so it can inherit the sidebar's rail — see the
// note in NavItem.vue and ../../props.ts.
const props = withDefaults(defineProps<NavSubItemProps>(), {
  selected: false,
  collapsed: undefined,
  disabled: undefined,
});
const attrs = useAttrs();
const nav = useNavContext();

const isCollapsed = computed(() => props.collapsed ?? nav.value.collapsed);
const labelIsString = computed(() => typeof props.label === "string");
const rootClass = computed(() =>
  clsx(
    "text-default-body-medium",
    navSubItemStyles({ selected: props.selected }),
    isCollapsed.value && "nav-sub-item--collapsed",
    attrs.class as string,
  ),
);
</script>

<template>
  <button
    type="button"
    :class="rootClass"
    :disabled="disabled"
    :aria-current="selected ? 'page' : undefined"
    :title="isCollapsed && labelIsString ? (label as string) : undefined"
    v-bind="{ ...$attrs, class: undefined }"
  >
    <Icon v-if="icon" :name="icon" :size="ICON_SIZE" class="nav-sub-item__icon" />
    <span class="nav-sub-item__label">
      <template v-if="labelIsString">{{ label }}</template>
      <component :is="label" v-else />
    </span>
  </button>
</template>
