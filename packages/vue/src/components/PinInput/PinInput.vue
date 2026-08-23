<script setup lang="ts">
import { computed, useAttrs } from "vue";
import { PinInput as ArkPinInput } from "@ark-ui/vue";
import { clsx } from "clsx";
import { pinInputStyles } from "@ui-organized/core";
import { definedOnly } from "../../props.js";
import FieldError from "../FieldError/FieldError.vue";
import type { PinInputProps } from "./PinInput.types.js";
import "@ui-organized/core/components/PinInput/PinInput.css";

const DEFAULT_LENGTH = 4;

defineOptions({ inheritAttrs: false });
// Every boolean forwarded to Ark below must default to `undefined`. Vue casts
// an absent Boolean prop to `false`, and `definedOnly` then forwards that as a
// deliberate choice — see ../../props.ts.
const props = withDefaults(defineProps<PinInputProps>(), {
  length: DEFAULT_LENGTH,
  type: "numeric",
  mask: undefined,
  otp: undefined,
  blurOnComplete: undefined,
  required: undefined,
  disabled: undefined,
  readOnly: undefined,
});
const emit = defineEmits<{
  "update:modelValue": [value: string];
  valueChange: [value: string];
  valueComplete: [value: string];
}>();

const attrs = useAttrs();

/**
 * The machine models the value as one string per cell; the public API is the
 * whole code as a single string. Same boundary coercion `Select` does for
 * `string ↔ string[]`, for the same reason: the array is an implementation
 * detail of the parts, not something a caller should have to assemble.
 */
function toCells(code: string | undefined, count: number): string[] | undefined {
  if (code == null) return undefined;
  return Array.from({ length: count }, (_, i) => code[i] ?? "");
}

const cellIndexes = computed(() => Array.from({ length: props.length }, (_, i) => i));

const isInvalid = computed(() => !!props.error);
const errorMessage = computed(() => (typeof props.error === "string" ? props.error : undefined));
const rootClass = computed(() =>
  clsx(pinInputStyles({ size: props.size, variant: props.variant }), attrs.class as string),
);

// Spread rather than bound one by one: an explicit `undefined` on a declared
// prop takes that prop's declared default, and on an attribute it removes what
// Ark computed. See ../../props.ts.
const rootProps = computed(() =>
  definedOnly({
    modelValue: toCells(props.modelValue, props.length),
    defaultValue: toCells(props.defaultValue, props.length),
    mask: props.mask,
    otp: props.otp,
    placeholder: props.placeholder,
    blurOnComplete: props.blurOnComplete,
    required: props.required,
    disabled: props.disabled,
    readOnly: props.readOnly,
    name: props.name,
  }),
);

// Written here rather than inline: a Vue template expression cannot carry an
// object type annotation, and the handlers' details argument needs one.
function onValueChange(details: { value: string[] }) {
  const next = details.value.join("");
  emit("update:modelValue", next);
  emit("valueChange", next);
}
function onValueComplete(details: { value: string[] }) {
  emit("valueComplete", details.value.join(""));
}
</script>

<template>
  <ArkPinInput.Root
    :class="rootClass"
    :count="length"
    :type="type"
    :invalid="isInvalid"
    v-bind="rootProps"
    @value-change="onValueChange"
    @value-complete="onValueComplete"
  >
    <ArkPinInput.Label v-if="label" class="field__label">
      {{ label }}
      <span v-if="required" class="field__required" aria-hidden="true" />
    </ArkPinInput.Label>
    <ArkPinInput.Control class="pin-input__control">
      <ArkPinInput.Input
        v-for="index in cellIndexes"
        :key="index"
        :index="index"
        class="pin-input__cell"
      />
    </ArkPinInput.Control>
    <span v-if="helperText && !isInvalid" class="field__description">{{ helperText }}</span>
    <FieldError v-if="isInvalid && errorMessage" :message="errorMessage" />
    <ArkPinInput.HiddenInput />
  </ArkPinInput.Root>
</template>
