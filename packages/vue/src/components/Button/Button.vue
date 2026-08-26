<script setup lang="ts">
import { computed, useAttrs } from "vue";
import { ark } from "@ark-ui/vue/factory";
import { clsx } from "clsx";
import { CONTROL_ICON_SIZE, CONTROL_TEXT_CLASS, buttonStyles } from "@ui-organized/core";
import Icon from "../Icon/Icon.vue";
import type { ButtonProps } from "./Button.types.js";
import "@ui-organized/core/components/Button/Button.css";

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<ButtonProps>(), {
  size: "md",
  iconPosition: "left",
  type: "button",
});

const attrs = useAttrs();
const slots = defineSlots<{ default?: () => unknown }>();

/**
 * Rendered through Ark's own polymorphic factory rather than a hand-rolled
 * `cloneVNode`.
 *
 * Ark UI has no Button primitive, so the polymorphism has to come from
 * somewhere — and `ark.button` is exactly the mechanism every Ark part already
 * uses for `asChild`. Reusing it means this Button's `asChild` behaves
 * identically to an Ark trigger's, including how attributes merge onto the
 * slot's root element, instead of being a lookalike that drifts.
 */
const ArkButton = ark.button;

// An icon with no label collapses to a square (see `.btn--icon-only`) whose side
// matches the labelled-button height for the size, so icon buttons line up with
// text buttons instead of rendering short and wide.
const isIconOnly = computed(() => props.icon != null && !slots.default);

const buttonClass = computed(() =>
  clsx(
    CONTROL_TEXT_CLASS[props.size],
    buttonStyles({ intent: props.intent, size: props.size }),
    isIconOnly.value && "btn--icon-only",
    attrs.class as string | undefined,
  ),
);

const forwarded = computed(() => {
  const { class: _class, ...rest } = attrs;
  return rest;
});
</script>

<template>
  <ArkButton
    :as-child="asChild"
    :type="asChild ? undefined : type"
    :class="buttonClass"
    v-bind="forwarded"
  >
    <Icon v-if="icon && iconPosition === 'left'" :name="icon" :size="CONTROL_ICON_SIZE[size]" />
    <slot />
    <Icon v-if="icon && iconPosition === 'right'" :name="icon" :size="CONTROL_ICON_SIZE[size]" />
  </ArkButton>
</template>
