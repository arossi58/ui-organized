<script setup lang="ts">
import { computed, useAttrs } from "vue";
import { Field } from "@ark-ui/vue";
import { clsx } from "clsx";
import { inputFieldStyles } from "@ui-organized/core";
import { definedOnly } from "../../props.js";
import FieldError from "../FieldError/FieldError.vue";
import type { InputProps } from "./Input.types.js";
import "@ui-organized/core/components/Input/Input.css";

defineOptions({ inheritAttrs: false });
const props = defineProps<InputProps>();
const emit = defineEmits<{ "update:modelValue": [value: string] }>();

const attrs = useAttrs();
const isInvalid = computed(() => !!props.error);
const errorMessage = computed(() =>
  typeof props.error === "string" ? props.error : undefined,
);
const rootClass = computed(() =>
  clsx(inputFieldStyles({ size: props.size }), attrs.class as string),
);
const inputProps = computed(() =>
  definedOnly({
    ...attrs,
    class: undefined,
    required: props.required,
    disabled: props.disabled,
    value: props.modelValue,
  }),
);
</script>

<template>
  <Field.Root :class="rootClass" :invalid="isInvalid">
    <Field.Label v-if="label" class="field__label">
      {{ label }}
      <span v-if="required" class="field__required" aria-hidden="true" />
    </Field.Label>
    <Field.Input
      class="field__control"
      v-bind="inputProps"
      @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
    <Field.HelperText v-if="helperText && !isInvalid" class="field__description">
      {{ helperText }}
    </Field.HelperText>
    <!--
      Ark's ErrorText renders only while the Field is invalid, and `asChild`
      hands its props to whatever replaces it — here the shared FieldError, so
      the message keeps its icon and its aria-describedby wiring.
    -->
    <Field.ErrorText v-if="isInvalid && errorMessage" as-child>
      <FieldError :message="errorMessage" />
    </Field.ErrorText>
  </Field.Root>
</template>
