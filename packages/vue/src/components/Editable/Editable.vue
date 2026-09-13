<script setup lang="ts">
import { computed, useAttrs } from "vue";
import { Editable as ArkEditable } from "@ark-ui/vue";
import { clsx } from "clsx";
import { editableStyles } from "@ui-organized/core";
import { definedOnly } from "../../props.js";
import Button from "../Button/Button.vue";
import FieldError from "../FieldError/FieldError.vue";
import type { EditableProps } from "./Editable.types.js";
import "@ui-organized/core/components/Editable/Editable.css";

defineOptions({ inheritAttrs: false });
// Every boolean forwarded to Ark below must default to `undefined`. Vue casts
// an absent Boolean prop to `false`, and `definedOnly` then forwards that as a
// deliberate choice — see ../../props.ts. `showControls` is not forwarded, so
// the cast to `false` is exactly the default React declares.
const props = withDefaults(defineProps<EditableProps>(), {
  size: "md",
  autoResize: undefined,
  required: undefined,
  disabled: undefined,
  readOnly: undefined,
});
const emit = defineEmits<{
  "update:modelValue": [value: string];
  valueChange: [value: string];
  valueCommit: [value: string];
}>();

const attrs = useAttrs();

const isInvalid = computed(() => !!props.error);
const errorMessage = computed(() => (typeof props.error === "string" ? props.error : undefined));
const rootClass = computed(() =>
  clsx(editableStyles({ size: props.size }), attrs.class as string),
);

const rootProps = computed(() =>
  definedOnly({
    modelValue: props.modelValue,
    defaultValue: props.defaultValue,
    placeholder: props.placeholder,
    activationMode: props.activationMode,
    submitMode: props.submitMode,
    autoResize: props.autoResize,
    maxLength: props.maxLength,
    required: props.required,
    disabled: props.disabled,
    readOnly: props.readOnly,
    name: props.name,
  }),
);

// Written here rather than inline: a Vue template expression cannot carry an
// object type annotation, and the handlers' details argument needs one.
function onValueChange(details: { value: string }) {
  emit("update:modelValue", details.value);
  emit("valueChange", details.value);
}
function onValueCommit(details: { value: string }) {
  emit("valueCommit", details.value);
}
</script>

<template>
  <ArkEditable.Root
    :class="rootClass"
    :invalid="isInvalid"
    v-bind="rootProps"
    @value-change="onValueChange"
    @value-commit="onValueCommit"
  >
    <ArkEditable.Label v-if="label" class="field__label">
      {{ label }}
      <span v-if="required" class="field__required" aria-hidden="true" />
    </ArkEditable.Label>
    <ArkEditable.Area class="editable__area">
      <ArkEditable.Preview class="editable__preview" />
      <ArkEditable.Input class="editable__input" />
    </ArkEditable.Area>
    <!--
      Ark keeps the edit trigger and the submit/cancel pair mounted in opposite
      states, so the row swaps without any local state here.

      Each trigger *is* the library Button, projected through Ark's `as-child`
      so it inherits every interactive token instead of restating them.
    -->
    <ArkEditable.Control v-if="showControls" class="editable__control">
      <ArkEditable.EditTrigger as-child>
        <Button intent="ghost" :size="size" type="button">Edit</Button>
      </ArkEditable.EditTrigger>
      <ArkEditable.SubmitTrigger as-child>
        <Button intent="secondary" :size="size" type="button">Save</Button>
      </ArkEditable.SubmitTrigger>
      <ArkEditable.CancelTrigger as-child>
        <Button intent="ghost" :size="size" type="button">Cancel</Button>
      </ArkEditable.CancelTrigger>
    </ArkEditable.Control>
    <span v-if="helperText && !isInvalid" class="field__description">{{ helperText }}</span>
    <FieldError v-if="isInvalid && errorMessage" :message="errorMessage" />
  </ArkEditable.Root>
</template>
