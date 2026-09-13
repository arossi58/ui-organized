<script setup lang="ts">
import { computed, useAttrs } from "vue";
import { clsx } from "clsx";
import { COMPARISON_ICONS, chipStyles } from "@ui-organized/core";
import Icon from "../Icon/Icon.vue";
import type { ChipProps } from "./Chip.types.js";
import "@ui-organized/core/components/Chip/Chip.css";

/** Icons render at 16px across every chip size, exactly as `Tag`'s do. */
const ICON_SIZE = 16;

defineOptions({ inheritAttrs: false });
const props = withDefaults(defineProps<ChipProps>(), {
  size: "md",
  dropdown: false,
  selected: false,
  incomplete: false,
  disabled: false,
  removable: false,
});
const emit = defineEmits<{ remove: [event: MouseEvent] }>();
const attrs = useAttrs();

const rootClass = computed(() =>
  clsx(
    chipStyles({ variant: props.variant, size: props.size }),
    props.selected && "chip--selected",
    props.incomplete && "chip--incomplete",
    props.disabled && "chip--disabled",
    attrs.class as string,
  ),
);

// A chip that opens something is a button; a static token with only a dismiss
// control is not. `disabled` counts — there is nothing to disable on a token,
// and a real disabled control is what exempts the dimmed label from axe's
// contrast rule.
const interactive = computed(() => attrs.onClick !== undefined || props.dropdown || props.disabled);
</script>

<template>
  <!-- Two SIBLING controls in a plain wrapper. A dismiss button inside the body
       would be a button inside a button: invalid HTML, and an axe
       `nested-interactive` violation. -->
  <span :class="rootClass">
    <component
      :is="interactive ? 'button' : 'span'"
      class="chip__body"
      :type="interactive ? 'button' : undefined"
      :disabled="interactive && disabled ? true : undefined"
      v-bind="{ ...$attrs, class: undefined }"
    >
      <Icon v-if="icon" :name="icon" :size="ICON_SIZE" class="chip__icon" />
      <span v-if="label" class="chip__label">{{ label }}</span>
      <!-- Drawn or spelled, never both. The markup is in-repo and generated
           from the designer's SVGs; nothing here is user-supplied. -->
      <span
        v-if="operator"
        class="icon chip__operator"
        :role="operatorLabel ? 'img' : undefined"
        :aria-label="operatorLabel"
        :aria-hidden="operatorLabel ? undefined : true"
        v-html="COMPARISON_ICONS[operator]"
      />
      <span v-else-if="detail" class="chip__detail">{{ detail }}</span>
      <span v-if="$slots.default" class="chip__value"><slot /></span>
      <Icon v-if="dropdown" name="chevron-down" :size="ICON_SIZE" class="chip__caret" />
    </component>

    <button
      v-if="removable"
      type="button"
      class="chip__remove"
      :aria-label="removeLabel"
      :disabled="disabled"
      @click="emit('remove', $event)"
    >
      <Icon name="close" :size="ICON_SIZE" />
    </button>
  </span>
</template>
