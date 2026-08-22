<script setup lang="ts">
import { computed, useAttrs } from "vue";
import { Field, Select as ArkSelect, createListCollection } from "@ark-ui/vue";
import { clsx } from "clsx";
import { CONTROL_ICON_SIZE, selectFieldStyles, OMIT_ARIA } from "@ui-organized/core";
import { definedOnly } from "../../props.js";
import Icon from "../Icon/Icon.vue";
import FieldError from "../FieldError/FieldError.vue";
import SelectTrigger from "./SelectTrigger.vue";
import type { SelectProps } from "./Select.types.js";
import "@ui-organized/core/components/Select/Select.css";

defineOptions({ inheritAttrs: false });
const props = defineProps<SelectProps>();
const emit = defineEmits<{
  "update:modelValue": [value: string];
  valueChange: [value: string];
  openChange: [open: boolean];
}>();

const attrs = useAttrs();
const isInvalid = computed(() => !!props.error);
const errorMessage = computed(() => (typeof props.error === "string" ? props.error : undefined));
const iconSize = computed(() => CONTROL_ICON_SIZE[props.size ?? "md"]);

// The ghost variant shows no label. It still renders one — visually hidden —
// because Ark names the trigger, the listbox and the hidden <select> after the
// Label part, and an aria-label on the trigger alone can neither replace a
// dangling reference nor reach the other two.
const isGhost = computed(() => props.variant === "ghost");

const rootClass = computed(() =>
  clsx(selectFieldStyles({ size: props.size, variant: props.variant }), attrs.class as string),
);

// Ark drives the dropdown off a collection rather than children; build it from
// the `options` array (label -> display text, value -> form value).
const collection = computed(() =>
  createListCollection({
    items: props.options,
    itemToValue: (item) => item.value,
    itemToString: (item) => item.label,
    isItemDisabled: (item) => !!item.disabled,
  }),
);

// Ark Vue names its controlled value `modelValue`, and takes an array even for a
// single select. See Progress for the same rename.
const rootProps = computed(() =>
  definedOnly({
    modelValue: props.modelValue != null ? [props.modelValue] : undefined,
    defaultValue: props.defaultValue != null ? [props.defaultValue] : undefined,
    open: props.open,
    defaultOpen: props.defaultOpen,
    disabled: props.disabled,
    name: props.name,
    required: props.required,
  }),
);
const contentAria = computed(() =>
  props.label ? {} : definedOnly({ "aria-labelledby": OMIT_ARIA }),
);
</script>

<template>
  <Field.Root :class="rootClass" :invalid="isInvalid" :disabled="disabled">
    <!--
      Ark Select.Root renders a wrapping <div>; `display:contents` keeps the
      label, trigger and helper as direct flex children of the field.
    -->
    <ArkSelect.Root
      class="select-field__control"
      :collection="collection"
      v-bind="rootProps"
      :invalid="isInvalid"
      :positioning="{ placement: 'bottom-start', gutter: 4, strategy: 'fixed' }"
      @value-change="
        (details) => {
          const next = details.value[0];
          if (next != null) {
            emit('update:modelValue', next);
            emit('valueChange', next);
          }
        }
      "
      @open-change="(details) => emit('openChange', details.open)"
    >
      <ArkSelect.Label
        v-if="label"
        :class="isGhost ? 'select-field__label--hidden' : 'field__label'"
      >
        {{ label }}
        <span v-if="required && !isGhost" class="field__required" aria-hidden="true" />
      </ArkSelect.Label>
      <SelectTrigger :has-label="!!label">
        <ArkSelect.ValueText class="select-field__value" :placeholder="placeholder" />
        <ArkSelect.Indicator class="select-field__icon">
          <Icon name="chevron-down" :size="iconSize" />
        </ArkSelect.Indicator>
      </SelectTrigger>
      <!--
        Vue has no Ark Portal component — Teleport is built into the framework,
        and Ark Vue relies on it rather than shipping its own.
      -->
      <Teleport :to="portalContainer ?? 'body'">
        <ArkSelect.Positioner class="select-positioner">
          <ArkSelect.Content
            :class="clsx('select-popup', isGhost && 'select-popup--ghost')"
            v-bind="contentAria"
          >
            <!--
              Items sit directly in Content: with the default composite select,
              Content *is* the listbox, and Select.List is a second labelled
              wrapper meant for the non-composite mode. Between the listbox and
              its options it counts as a child that isn't an option, which a
              listbox may not have.
            -->
            <ArkSelect.Item
              v-for="opt in options"
              :key="opt.value"
              :item="opt"
              class="select-popup__item text-default-body-large"
            >
              <ArkSelect.ItemText>{{ opt.label }}</ArkSelect.ItemText>
              <ArkSelect.ItemIndicator class="select-popup__item-indicator">
                <Icon name="check" :size="iconSize" />
              </ArkSelect.ItemIndicator>
            </ArkSelect.Item>
          </ArkSelect.Content>
        </ArkSelect.Positioner>
      </Teleport>
      <ArkSelect.HiddenSelect v-bind="contentAria" />
    </ArkSelect.Root>
    <Field.HelperText v-if="helperText && !isInvalid" class="field__description">
      {{ helperText }}
    </Field.HelperText>
    <Field.ErrorText v-if="isInvalid && errorMessage" as-child>
      <FieldError :message="errorMessage" />
    </Field.ErrorText>
  </Field.Root>
</template>
