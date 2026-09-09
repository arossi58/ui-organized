<!--
  One page in a sidebar. Give it children (`NavSubItem`s) to make it expandable.
-->
<script setup lang="ts">
import { computed, ref, useAttrs, useId } from "vue";
import { clsx } from "clsx";
import { navItemStyles } from "@ui-organized/core";
import Icon from "../Icon/Icon.vue";
import { useNavContext } from "./navContext.js";
import type { NavItemProps } from "./Navigation.types.js";
import "@ui-organized/core/components/Navigation/Navigation.css";

const ICON_SIZE = 18;
const CARET_SIZE = 20;

defineOptions({ inheritAttrs: false });
/**
 * `collapsed` and `expanded` are tri-state — `undefined` means "inherit the
 * sidebar's rail" and "uncontrolled" respectively — and Vue casts an *absent*
 * Boolean prop to `false` unless the declaration carries a default. See
 * ../../props.ts. Without these two an item could never inherit the rail, and a
 * caret could never be opened: `false ?? contextCollapsed` is `false`, and an
 * `expanded` pinned to `false` is a disclosure that ignores its own click.
 */
const props = withDefaults(defineProps<NavItemProps>(), {
  selected: false,
  collapsed: undefined,
  disabled: undefined,
  expanded: undefined,
  defaultExpanded: false,
});
const emit = defineEmits<{
  "update:expanded": [expanded: boolean];
  expandedChange: [expanded: boolean];
}>();
const slots = defineSlots<{ default?: () => unknown }>();
const attrs = useAttrs();
const nav = useNavContext();

const isCollapsed = computed(() => props.collapsed ?? nav.value.collapsed);
const expandable = computed(() => Boolean(slots.default));
// An icon-only rail has no room for an inline sub-list, so suppress it.
const showSubList = computed(() => expandable.value && !isCollapsed.value);

const internalExpanded = ref(props.defaultExpanded);
const isExpanded = computed(() => props.expanded ?? internalExpanded.value);
const subListId = useId();

const onClick = () => {
  if (!showSubList.value) return;
  const next = !isExpanded.value;
  if (props.expanded === undefined) internalExpanded.value = next;
  emit("update:expanded", next);
  emit("expandedChange", next);
};

const labelIsString = computed(() => typeof props.label === "string");
const rootClass = computed(() =>
  clsx(
    "nav-item",
    isCollapsed.value && "nav-item--collapsed",
    showSubList.value && isExpanded.value && "nav-item--expanded",
    attrs.class as string,
  ),
);
const triggerClass = computed(() =>
  clsx(
    "text-default-body-medium",
    navItemStyles({ selected: props.selected, expandable: showSubList.value }),
  ),
);
// `class` addresses the wrapper, everything else the trigger — the same split
// React makes, so a caller's `aria-*` lands on the control rather than the box.
const forwarded = computed(() => {
  const { class: _class, ...rest } = attrs;
  return rest;
});
</script>

<template>
  <div :class="rootClass">
    <button
      type="button"
      :class="triggerClass"
      :disabled="disabled"
      :aria-current="selected ? 'page' : undefined"
      :aria-expanded="showSubList ? isExpanded : undefined"
      :aria-controls="showSubList ? subListId : undefined"
      :title="isCollapsed && labelIsString ? (label as string) : undefined"
      @click="onClick"
      v-bind="forwarded"
    >
      <span class="nav-item__content">
        <Icon v-if="icon" :name="icon" :size="ICON_SIZE" class="nav-item__icon" />
        <span class="nav-item__label">
          <template v-if="labelIsString">{{ label }}</template>
          <component :is="label" v-else />
        </span>
      </span>
      <Icon
        v-if="showSubList"
        :name="isExpanded ? 'chevron-up' : 'chevron-down'"
        :size="CARET_SIZE"
        class="nav-item__caret"
      />
    </button>
    <!--
      `role="group"`, not `list`: the sub-items are buttons, and a list may only
      contain listitems — the mismatch is an ARIA error. What the panel actually
      is here is the disclosure the button above expands.
    -->
    <div v-if="showSubList" :id="subListId" class="nav-item__sub-list" role="group">
      <div class="nav-item__sub-list-inner"><slot /></div>
    </div>
  </div>
</template>
