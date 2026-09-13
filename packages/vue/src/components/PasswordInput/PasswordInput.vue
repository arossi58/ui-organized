<script setup lang="ts">
import { computed, ref, useAttrs } from "vue";
import { Field } from "@ark-ui/vue";
import { clsx } from "clsx";
import { CONTROL_ICON_SIZE, passwordInputFieldStyles } from "@ui-organized/core";
import { definedOnly } from "../../props.js";
import Icon from "../Icon/Icon.vue";
import FieldError from "../FieldError/FieldError.vue";
import type { PasswordInputProps } from "./PasswordInput.types.js";
// Shares the Input field surface/state styling; InputAffix.css layers on the
// trailing show/hide toggle.
import "@ui-organized/core/components/Input/Input.css";
import "@ui-organized/core/components/Input/InputAffix.css";

defineOptions({ inheritAttrs: false });
// Every boolean forwarded to Ark below must default to `undefined`. Vue casts
// an absent Boolean prop to `false`, and `definedOnly` then forwards that as a
// deliberate choice — see ../../props.ts. `showToggle` is the exception that
// proves the rule: it never reaches Ark, and its documented default is `true`.
const props = withDefaults(defineProps<PasswordInputProps>(), {
  size: "md",
  showToggle: true,
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
  clsx(passwordInputFieldStyles({ size: props.size }), attrs.class as string),
);
const controlClass = computed(() =>
  clsx("field__control", props.showToggle && "field__control--affix-end"),
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

const visible = ref(false);
</script>

<template>
  <Field.Root :class="rootClass" :invalid="isInvalid">
    <Field.Label v-if="label" class="field__label">
      {{ label }}
      <span v-if="required" class="field__required" aria-hidden="true" />
    </Field.Label>
    <div class="input-affix">
      <Field.Input
        :type="visible ? 'text' : 'password'"
        :class="controlClass"
        v-bind="inputProps"
        @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      />
      <!--
        A plain button rather than a Toggle: it reveals the field rather than
        changing its value, so it stays out of the form's tab-and-submit story
        and is named by what it will do next.
      -->
      <button
        v-if="showToggle"
        type="button"
        class="input-affix__adornment input-affix__adornment--end input-affix__action"
        :aria-label="visible ? 'Hide password' : 'Show password'"
        :aria-pressed="visible"
        :disabled="disabled"
        @click="visible = !visible"
      >
        <Icon :name="visible ? 'eye-off' : 'eye'" :size="CONTROL_ICON_SIZE[size]" />
      </button>
    </div>
    <Field.HelperText v-if="helperText && !isInvalid" class="field__description">
      {{ helperText }}
    </Field.HelperText>
    <Field.ErrorText v-if="isInvalid && errorMessage" as-child>
      <FieldError :message="errorMessage" />
    </Field.ErrorText>
  </Field.Root>
</template>
