<script setup lang="ts">
import { computed, useAttrs, useId } from "vue";
import { NumberInput, Field } from "@ark-ui/vue";
import { clsx } from "clsx";
import { CONTROL_ICON_SIZE, numberFieldStyles } from "@ui-organized/core";
import { definedOnly } from "../../props.js";
import Icon from "../Icon/Icon.vue";
import FieldError from "../FieldError/FieldError.vue";
import type { NumberFieldProps } from "./NumberField.types.js";
import "@ui-organized/core/components/NumberField/NumberField.css";

defineOptions({ inheritAttrs: false });
// Every boolean forwarded to Ark below must default to `undefined`. Vue casts
// an absent Boolean prop to `false`, and `definedOnly` then forwards that as a
// deliberate choice — see ../../props.ts.
const props = withDefaults(defineProps<NumberFieldProps>(), {
  size: "md",
  disabled: undefined,
  readOnly: undefined,
  required: undefined,
});
const emit = defineEmits<{
  "update:modelValue": [value: number | null];
  valueChange: [value: number | null];
}>();

const attrs = useAttrs();

// The label sits on the Field, the input inside Ark's NumberInput — two machines
// that would otherwise mint unrelated ids, leaving the label pointing at
// nothing. Handing NumberInput the id the label uses is what ties them together.
// React uses useId() here; this is Vue's equivalent.
const generatedId = useId();
const fieldId = computed(() => props.id ?? generatedId);

const isInvalid = computed(() => !!props.error);
const errorMessage = computed(() =>
  typeof props.error === "string" ? props.error : undefined,
);
const rootClass = computed(() =>
  clsx(numberFieldStyles({ size: props.size }), attrs.class as string),
);
const rootProps = computed(() => definedOnly({ disabled: props.disabled }));

/**
 * Ark takes the value as a string and reports it as both, so the numeric facade
 * is translated at the boundary: an empty string is the empty value, which the
 * React package spells `null` and so does this one.
 */
const numberInputProps = computed(() =>
  definedOnly({
    modelValue:
      props.modelValue === undefined ? undefined : props.modelValue === null ? "" : String(props.modelValue),
    defaultValue: props.defaultValue != null ? String(props.defaultValue) : undefined,
    min: props.min,
    max: props.max,
    step: props.step,
    formatOptions: props.format,
    disabled: props.disabled,
    readOnly: props.readOnly,
    required: props.required,
    name: props.name,
  }),
);

// Written here rather than inline: a Vue template expression cannot carry an
// object type annotation, and the handler's details argument needs one.
function onValueChange(details: { value: string; valueAsNumber: number }) {
  const next = details.value === "" ? null : details.valueAsNumber;
  emit("update:modelValue", next);
  emit("valueChange", next);
}
</script>

<template>
  <Field.Root :class="rootClass" :invalid="isInvalid" v-bind="rootProps">
    <Field.Label v-if="label" :for="fieldId" class="field__label">
      {{ label }}
      <span v-if="required" class="field__required" aria-hidden="true" />
    </Field.Label>
    <NumberInput.Root
      :ids="{ input: fieldId }"
      v-bind="numberInputProps"
      @value-change="onValueChange"
    >
      <NumberInput.Control class="number-field__group">
        <NumberInput.DecrementTrigger class="number-field__stepper" aria-label="Decrease">
          <Icon name="minus" :size="CONTROL_ICON_SIZE[size]" />
        </NumberInput.DecrementTrigger>
        <NumberInput.Input
          class="field__control number-field__input"
          :placeholder="placeholder"
        />
        <NumberInput.IncrementTrigger class="number-field__stepper" aria-label="Increase">
          <Icon name="plus" :size="CONTROL_ICON_SIZE[size]" />
        </NumberInput.IncrementTrigger>
      </NumberInput.Control>
    </NumberInput.Root>
    <Field.HelperText v-if="helperText && !isInvalid" class="field__description">
      {{ helperText }}
    </Field.HelperText>
    <!--
      Ark's ErrorText renders only while the Field is invalid, and `as-child`
      hands its props to whatever replaces it — here the shared FieldError, so
      the message keeps its icon and its aria-describedby wiring.
    -->
    <Field.ErrorText v-if="isInvalid && errorMessage" as-child>
      <FieldError :message="errorMessage" />
    </Field.ErrorText>
  </Field.Root>
</template>
