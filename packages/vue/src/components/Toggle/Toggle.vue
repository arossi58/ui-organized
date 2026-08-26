<!-- A two-state button that can be on or off. -->
<script setup lang="ts">
import { computed, useAttrs } from "vue";
import { Toggle as ArkToggle, ToggleGroup as ArkToggleGroup } from "@ark-ui/vue";
import { clsx } from "clsx";
import { CONTROL_ICON_SIZE, CONTROL_TEXT_CLASS, toggleStyles } from "@ui-organized/core";
import { definedOnly } from "../../props.js";
import Icon from "../Icon/Icon.vue";
import type { ToggleProps } from "./Toggle.types.js";
import "@ui-organized/core/components/Toggle/Toggle.css";

defineOptions({ inheritAttrs: false });
// Every boolean forwarded to Ark below must default to `undefined`. Vue casts
// an absent Boolean prop to `false`, and `definedOnly` then forwards that as a
// deliberate choice — `pressed: false` is "controlled and off", which stops an
// uncontrolled toggle ever turning on. See ../../props.ts.
const props = withDefaults(defineProps<ToggleProps>(), {
  size: "md",
  pressed: undefined,
  defaultPressed: undefined,
  disabled: undefined,
});
const emit = defineEmits<{
  "update:pressed": [pressed: boolean];
  pressedChange: [pressed: boolean];
}>();

const attrs = useAttrs();
const slots = defineSlots<{ default?: () => unknown }>();

// An icon with no label collapses to a square (see `.toggle--icon-only`) whose
// side matches the labelled height for the size, mirroring the Button so icon
// toggles line up with text toggles instead of rendering short and wide.
//
// React can inspect its children and treat `""` or `false` as absent; a Vue slot
// is opaque the way a Svelte snippet is, so "no label" is spelled the only way it
// can be — the slot was never passed. Same rule the Button uses.
const isIconOnly = computed(() => props.icon != null && !slots.default);

const toggleClass = computed(() =>
  clsx(
    CONTROL_TEXT_CLASS[props.size],
    toggleStyles({ size: props.size }),
    isIconOnly.value && "toggle--icon-only",
    attrs.class as string,
  ),
);

const forwarded = computed(() => ({ ...attrs, class: undefined }));
const rootProps = computed(() =>
  definedOnly({
    pressed: props.pressed,
    defaultPressed: props.defaultPressed,
    disabled: props.disabled,
  }),
);
const itemProps = computed(() => definedOnly({ disabled: props.disabled }));
</script>

<!--
  Ark splits the standalone toggle (Toggle.Root) from the group item
  (ToggleGroup.Item). A `value` marks a group item — it derives its pressed state
  from the parent group rather than holding its own.
-->
<template>
  <ArkToggleGroup.Item
    v-if="value !== undefined"
    :value="value"
    :class="toggleClass"
    v-bind="{ ...itemProps, ...forwarded }"
  >
    <Icon v-if="icon" :name="icon" :size="CONTROL_ICON_SIZE[size]" />
    <slot />
  </ArkToggleGroup.Item>
  <ArkToggle.Root
    v-else
    :class="toggleClass"
    v-bind="{ ...rootProps, ...forwarded }"
    @pressed-change="
      (next) => {
        emit('update:pressed', next);
        emit('pressedChange', next);
      }
    "
  >
    <Icon v-if="icon" :name="icon" :size="CONTROL_ICON_SIZE[size]" />
    <slot />
  </ArkToggle.Root>
</template>
