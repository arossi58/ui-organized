<script setup lang="ts">
import { computed, useAttrs, useId } from "vue";
import { Checkbox as ArkCheckbox } from "@ark-ui/vue";
import { clsx } from "clsx";
import { checkboxCardGroupStyles } from "@ui-organized/core";
import { definedOnly } from "../../props.js";
import Icon from "../Icon/Icon.vue";
import { glyph } from "../../icons/glyph.js";
import type { CheckboxCardGroupProps } from "./CheckboxCardGroup.types.js";
import "@ui-organized/core/components/Checkbox/Checkbox.css";
import "@ui-organized/core/components/SelectionCard/SelectionCard.css";

defineOptions({ inheritAttrs: false });
// Every boolean forwarded to Ark below must default to `undefined`. Vue casts
// an absent Boolean prop to `false`; see ../../props.ts.
const props = withDefaults(defineProps<CheckboxCardGroupProps>(), {
  indicator: "end",
  disabled: undefined,
  error: undefined,
});
const emit = defineEmits<{
  "update:modelValue": [value: string[]];
  valueChange: [value: string[]];
}>();

const attrs = useAttrs();
// React uses useId(); this is Vue's equivalent.
const uid = useId();
const labelId = `${uid}-label`;
const errorId = `${uid}-error`;
const descriptionId = (v: string) => `${uid}-description-${v}`;
const errorMessage = computed(() => (typeof props.error === "string" ? props.error : undefined));

const rootClass = computed(() =>
  clsx(
    checkboxCardGroupStyles({ size: props.size, columns: props.columns, invalid: !!props.error }),
    attrs.class as string,
  ),
);
const ariaLabel = computed(() => props.ariaLabel ?? (attrs["aria-label"] as string | undefined));
const groupProps = computed(() =>
  definedOnly({
    modelValue: props.modelValue,
    defaultValue: props.defaultValue,
    disabled: props.disabled,
    name: props.name,
    invalid: props.error ? true : undefined,
    "aria-labelledby": props.label ? labelId : undefined,
    "aria-label": props.label ? undefined : ariaLabel.value,
    "aria-describedby": errorMessage.value ? errorId : undefined,
  }),
);
const inputAria = (description?: string, value?: string) =>
  definedOnly({ "aria-describedby": description && value != null ? descriptionId(value) : undefined });
</script>

<template>
  <div :class="rootClass">
    <div v-if="label" class="selection-card-group__label" :id="labelId">{{ label }}</div>
    <ArkCheckbox.Group
      v-bind="groupProps"
      class="selection-card-group__items"
      @value-change="
        (next: string[]) => {
          emit('update:modelValue', next);
          emit('valueChange', next);
        }
      "
    >
      <!-- Each Root is the <label>, so the whole card is the hit target. -->
      <ArkCheckbox.Root
        v-for="opt in options"
        :key="opt.value"
        :value="opt.value"
        :disabled="opt.disabled"
        :class="clsx('selection-card', `selection-card--indicator-${indicator}`)"
      >
        <span v-if="opt.icon != null" class="selection-card__icon" aria-hidden="true">
          <Icon :name="opt.icon" :size="20" />
        </span>
        <span class="selection-card__body">
          <ArkCheckbox.Label class="selection-card__title">{{ opt.label }}</ArkCheckbox.Label>
          <span v-if="opt.description" class="selection-card__description" :id="descriptionId(opt.value)">{{
            opt.description
          }}</span>
        </span>
        <ArkCheckbox.Control class="checkbox__control selection-card__control">
          <ArkCheckbox.Indicator class="checkbox__indicator">
            <Icon :name="glyph('check')" :size="16" class="checkbox__check" />
          </ArkCheckbox.Indicator>
        </ArkCheckbox.Control>
        <!-- Named by the title alone; the description is read after it. -->
        <ArkCheckbox.HiddenInput v-bind="inputAria(opt.description, opt.value)" />
      </ArkCheckbox.Root>
    </ArkCheckbox.Group>
    <div v-if="errorMessage" class="selection-card-group__error" :id="errorId">
      <Icon :name="glyph('alert-circle')" :size="16" />
      <span>{{ errorMessage }}</span>
    </div>
  </div>
</template>
