<script setup lang="ts">
import { computed, useAttrs, useId } from "vue";
import { RadioGroup as ArkRadioGroup } from "@ark-ui/vue";
import { clsx } from "clsx";
import { OMIT_ARIA, radioCardGroupStyles } from "@ui-organized/core";
import { definedOnly } from "../../props.js";
import Icon from "../Icon/Icon.vue";
import { glyph } from "../../icons/glyph.js";
import type { RadioCardGroupProps } from "./RadioCardGroup.types.js";
import "@ui-organized/core/components/Radio/Radio.css";
import "@ui-organized/core/components/SelectionCard/SelectionCard.css";

defineOptions({ inheritAttrs: false });
// Every boolean forwarded to Ark below must default to `undefined`. Vue casts
// an absent Boolean prop to `false`; see ../../props.ts.
const props = withDefaults(defineProps<RadioCardGroupProps>(), {
  indicator: "end",
  disabled: undefined,
  error: undefined,
});
const emit = defineEmits<{
  "update:modelValue": [value: string];
  valueChange: [value: string];
}>();

const attrs = useAttrs();
// React uses useId(); this is Vue's equivalent. The group label sits outside
// Ark's Root, so Ark is handed the id of the heading this renders.
const uid = useId();
const labelId = `${uid}-label`;
const errorId = `${uid}-error`;
const descriptionId = (v: string) => `${uid}-description-${v}`;
const errorMessage = computed(() => (typeof props.error === "string" ? props.error : undefined));

const rootClass = computed(() =>
  clsx(
    radioCardGroupStyles({ size: props.size, columns: props.columns, invalid: !!props.error }),
    attrs.class as string,
  ),
);
const ariaLabel = computed(() => props.ariaLabel ?? (attrs["aria-label"] as string | undefined));
// Spread, not bound: an explicit undefined would strip the machine's own
// aria-labelledby rather than leave it alone.
const groupAria = computed(() => ({
  ...(props.label
    ? { ids: { label: labelId } }
    : definedOnly({ "aria-labelledby": OMIT_ARIA, "aria-label": ariaLabel.value })),
  ...definedOnly({ "aria-describedby": errorMessage.value ? errorId : undefined }),
}));
const rootProps = computed(() =>
  definedOnly({
    value: props.modelValue,
    defaultValue: props.defaultValue,
    disabled: props.disabled,
    name: props.name,
  }),
);
const inputAria = (description?: string, value?: string) =>
  definedOnly({ "aria-describedby": description && value != null ? descriptionId(value) : undefined });
</script>

<template>
  <div :class="rootClass">
    <div v-if="label" class="selection-card-group__label" :id="labelId">{{ label }}</div>
    <ArkRadioGroup.Root
      v-bind="{ ...groupAria, ...rootProps }"
      class="selection-card-group__items"
      @value-change="
        (details) => {
          if (details.value != null) {
            emit('update:modelValue', details.value);
            emit('valueChange', details.value);
          }
        }
      "
    >
      <!-- The Item is the <label>, so the whole card is the hit target. -->
      <ArkRadioGroup.Item
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
          <ArkRadioGroup.ItemText class="selection-card__title">{{ opt.label }}</ArkRadioGroup.ItemText>
          <span v-if="opt.description" class="selection-card__description" :id="descriptionId(opt.value)">{{
            opt.description
          }}</span>
        </span>
        <ArkRadioGroup.ItemControl class="radio-item__control selection-card__control">
          <span class="radio-item__indicator" />
        </ArkRadioGroup.ItemControl>
        <!-- Named by the title alone; the description is read after it. -->
        <ArkRadioGroup.ItemHiddenInput v-bind="inputAria(opt.description, opt.value)" />
      </ArkRadioGroup.Item>
    </ArkRadioGroup.Root>
    <div v-if="errorMessage" class="selection-card-group__error" :id="errorId">
      <Icon :name="glyph('alert-circle')" :size="16" />
      <span>{{ errorMessage }}</span>
    </div>
  </div>
</template>
