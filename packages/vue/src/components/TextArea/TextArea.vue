<script setup lang="ts">
import { computed, useAttrs } from "vue";
import { Field } from "@ark-ui/vue";
import { clsx } from "clsx";
import { textAreaFieldStyles } from "@ui-organized/core";
import { definedOnly } from "../../props.js";
import FieldError from "../FieldError/FieldError.vue";
import type { TextAreaProps } from "./TextArea.types.js";
// Shares the Input field surface/state styling; TextArea.css layers on the
// multi-line specifics (min-height, resize).
import "@ui-organized/core/components/Input/Input.css";
import "@ui-organized/core/components/TextArea/TextArea.css";

defineOptions({ inheritAttrs: false });
// Every boolean forwarded to Ark below must default to `undefined`. Vue casts
// an absent Boolean prop to `false`, and `definedOnly` then forwards that as a
// deliberate choice — see ../../props.ts.
const props = withDefaults(defineProps<TextAreaProps>(), {
  resize: "both",
  required: undefined,
  disabled: undefined,
});
const emit = defineEmits<{ "update:modelValue": [value: string] }>();

const attrs = useAttrs();
const isInvalid = computed(() => !!props.error);
const errorMessage = computed(() =>
  typeof props.error === "string" ? props.error : undefined,
);
const rootClass = computed(() =>
  clsx(textAreaFieldStyles({ size: props.size }), attrs.class as string),
);
const controlProps = computed(() =>
  definedOnly({
    ...attrs,
    class: undefined,
    required: props.required,
    disabled: props.disabled,
    value: props.modelValue,
    "data-resize": props.resize,
  }),
);
</script>

<template>
  <Field.Root :class="rootClass" :invalid="isInvalid">
    <Field.Label v-if="label" class="field__label">
      {{ label }}
      <span v-if="required" class="field__required" aria-hidden="true" />
    </Field.Label>
    <Field.Textarea
      class="field__control textarea-field__control"
      v-bind="controlProps"
      @input="emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
    />
    <Field.HelperText v-if="helperText && !isInvalid" class="field__description">
      {{ helperText }}
    </Field.HelperText>
    <Field.ErrorText v-if="isInvalid && errorMessage" as-child>
      <FieldError :message="errorMessage" />
    </Field.ErrorText>
  </Field.Root>
</template>
