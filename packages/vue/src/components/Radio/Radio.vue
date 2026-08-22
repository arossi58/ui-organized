<script setup lang="ts">
import { computed, useAttrs, useId } from "vue";
import { RadioGroup as ArkRadioGroup } from "@ark-ui/vue";
import { clsx } from "clsx";
import { radioGroupStyles, OMIT_ARIA } from "@ui-organized/core";
import { definedOnly } from "../../props.js";
import Icon from "../Icon/Icon.vue";
import type { RadioGroupProps } from "./Radio.types.js";
import "@ui-organized/core/components/Radio/Radio.css";

defineOptions({ inheritAttrs: false });
const props = withDefaults(defineProps<RadioGroupProps>(), { orientation: "vertical" });
const emit = defineEmits<{
  "update:modelValue": [value: string];
  valueChange: [value: string];
}>();

const attrs = useAttrs();

// The group label sits outside Ark's Root — it's a sibling of the items, not a
// child — so the Label part is never rendered and the radiogroup's
// aria-labelledby would dangle. Handing Ark the id of the heading we do render
// points it at a real element. React uses useId(); this is Vue's equivalent.
const labelId = useId();

const rootClass = computed(() =>
  clsx(radioGroupStyles({ orientation: props.orientation }), attrs.class as string),
);
const ariaLabel = computed(() => props.ariaLabel ?? (attrs["aria-label"] as string | undefined));

// Spread, not bound: an explicit undefined would strip the machine's own
// aria-labelledby rather than leave it alone. See ../../props.ts.
const groupAria = computed(() =>
  props.label
    ? { ids: { label: labelId } }
    : definedOnly({ "aria-labelledby": OMIT_ARIA, "aria-label": ariaLabel.value }),
);
const rootProps = computed(() =>
  definedOnly({
    value: props.modelValue,
    defaultValue: props.defaultValue,
    disabled: props.disabled,
    name: props.name,
  }),
);
</script>

<template>
  <div :class="rootClass">
    <div v-if="label" class="radio-group__label" :id="labelId">{{ label }}</div>
    <ArkRadioGroup.Root
      v-bind="{ ...groupAria, ...rootProps }"
      :orientation="orientation"
      class="radio-group__items"
      @value-change="
        (details) => {
          if (details.value != null) {
            emit('update:modelValue', details.value);
            emit('valueChange', details.value);
          }
        }
      "
    >
      <div v-for="opt in options" :key="opt.value" class="radio-item-wrap">
        <!--
          Ark's RadioGroup.Item *is* the <label>; the dot is a plain child of
          ItemControl, shown via [data-state="checked"] in CSS.
        -->
        <ArkRadioGroup.Item
          :value="opt.value"
          :disabled="opt.disabled"
          :class="
            clsx(
              'radio-item',
              opt.disabled && 'radio-item--disabled',
              opt.error && 'radio-item--error',
            )
          "
        >
          <ArkRadioGroup.ItemControl class="radio-item__control">
            <span class="radio-item__indicator" />
          </ArkRadioGroup.ItemControl>
          <ArkRadioGroup.ItemText class="radio-item__label text-default-body-large">
            {{ opt.label }}
          </ArkRadioGroup.ItemText>
          <ArkRadioGroup.ItemHiddenInput />
        </ArkRadioGroup.Item>
        <div v-if="opt.error" class="radio-item__error-message">
          <Icon name="alert-circle" :size="16" />
          <span class="radio-item__error-text text-emphasis-body-small">{{ opt.error }}</span>
        </div>
      </div>
    </ArkRadioGroup.Root>
  </div>
</template>
