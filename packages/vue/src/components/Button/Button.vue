<script setup lang="ts">
import { computed, useAttrs } from "vue";
import { ark } from "@ark-ui/vue/factory";
import { clsx } from "clsx";
import { CONTROL_ICON_SIZE, CONTROL_TEXT_CLASS, buttonStyles } from "@ui-organized/core";
import Icon from "../Icon/Icon.vue";
import Spinner from "../Spinner/Spinner.vue";
import type { ButtonProps } from "./Button.types.js";
import "@ui-organized/core/components/Button/Button.css";

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<ButtonProps>(), {
  size: "md",
  iconPosition: "left",
  type: "button",
  loading: false,
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

// While loading, the spinner takes the icon's slot, or the leading one when
// there is no icon. It is decorative: the button itself is marked busy.
const spinnerSide = computed(() => (props.icon ? props.iconPosition : "left"));

/** `disabled` is not a declared prop; it arrives as an attribute (`""` when bare). */
const isDisabled = computed(() => attrs.disabled !== undefined && attrs.disabled !== false);

// A real anchor, unless `asChild` hands rendering to the slot.
const isLink = computed(() => props.href !== undefined && !props.asChild);

const swallow = (event: Event) => event.preventDefault();

const rootAttrs = computed(() => {
  const { class: _class, onClick, disabled, ...rest } = attrs;
  // Busy, not disabled: `disabled` would drop focus to the document the moment
  // the request starts. The click is swallowed instead, which also stops a
  // submit button submitting its form a second time.
  const busy = props.loading
    ? { "aria-busy": "true", "aria-disabled": "true", "data-loading": "", onClick: swallow }
    : { onClick };

  if (isLink.value) {
    // Inert (disabled or loading), the anchor keeps the link role but loses its
    // `href`, so it can't be followed, opened in a new tab or reached with Tab.
    const inert = props.loading || isDisabled.value;
    return {
      ...rest,
      href: inert ? undefined : props.href,
      target: props.target,
      rel: props.rel,
      download: props.download,
      role: inert ? "link" : undefined,
      "aria-disabled": inert ? "true" : undefined,
      "data-disabled": isDisabled.value ? "" : undefined,
      ...busy,
    };
  }

  return {
    ...rest,
    asChild: props.asChild,
    type: props.asChild ? undefined : props.type,
    disabled,
    ...(props.asChild
      ? { href: props.href, target: props.target, rel: props.rel, download: props.download }
      : {}),
    ...busy,
  };
});
</script>

<template>
  <component :is="isLink ? 'a' : ArkButton" :class="buttonClass" v-bind="rootAttrs">
    <template v-if="loading">
      <Spinner v-if="spinnerSide === 'left'" :size="size" decorative />
    </template>
    <Icon v-else-if="icon && iconPosition === 'left'" :name="icon" :size="CONTROL_ICON_SIZE[size]" />
    <slot />
    <template v-if="loading">
      <Spinner v-if="spinnerSide === 'right'" :size="size" decorative />
    </template>
    <Icon v-else-if="icon && iconPosition === 'right'" :name="icon" :size="CONTROL_ICON_SIZE[size]" />
  </component>
</template>
