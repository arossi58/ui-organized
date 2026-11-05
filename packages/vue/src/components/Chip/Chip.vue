<!--
  A compact token standing for something the user added — a filter, a facet, a
  recipient — which they can then edit or remove.

  Segmented (Figma 2462:2636): "Name | is greater than | Value" is three
  controls, each opening the menu for the one parameter it shows. Every segment,
  and the dismiss control, is a SIBLING inside a plain `role="group"` wrapper: a
  button nested in a button is invalid HTML and an axe `nested-interactive`
  violation.
-->
<script setup lang="ts">
import { computed, provide } from "vue";
import { clsx } from "clsx";
import { chipStyles } from "@ui-organized/core";
import Icon from "../Icon/Icon.vue";
import ChipSegment from "./ChipSegment.vue";
import { CHIP_DISABLED } from "./chipContext.js";
import type { ChipProps } from "./Chip.types.js";
import "@ui-organized/core/components/Chip/Chip.css";

/** The dismiss icon, at the size `Tag`'s icons render. */
const ICON_SIZE = 16;

const props = withDefaults(defineProps<ChipProps>(), {
  selected: false,
  incomplete: false,
  disabled: false,
  removable: false,
});
const emit = defineEmits<{ remove: [event: MouseEvent] }>();

provide(
  CHIP_DISABLED,
  computed(() => props.disabled),
);

const rootClass = computed(() =>
  clsx(
    chipStyles(),
    props.selected && "chip--selected",
    props.incomplete && "chip--incomplete",
    props.disabled && "chip--disabled",
  ),
);
</script>

<template>
  <span role="group" :class="rootClass">
    <ChipSegment v-if="label != null" part="label">{{ label }}</ChipSegment>
    <ChipSegment v-if="operator != null" part="operator">{{ operator }}</ChipSegment>
    <ChipSegment v-if="value != null" part="value">{{ value }}</ChipSegment>
    <slot />

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
