<script setup lang="ts">
import { computed, useAttrs, useId, onMounted } from "vue";
import { Field } from "@ark-ui/vue";
import { clsx } from "clsx";
import { CONTROL_ICON_SIZE, inputFieldStyles } from "@ui-organized/core";
import { definedOnly } from "../../props.js";
import FieldError from "../FieldError/FieldError.vue";
import Icon from "../Icon/Icon.vue";
import type { InputProps } from "./Input.types.js";
// The shared field chrome, ahead of this component's own sheet, which may override it.
import "@ui-organized/core/components/Field/Field.css";
import "@ui-organized/core/components/Input/Input.css";
import "@ui-organized/core/components/Input/InputAffix.css";
import { trackFocusModality } from "@ui-organized/core/focus-modality";

// Text fields read pointer vs keyboard for a quiet focus state on click.
onMounted(() => trackFocusModality());

defineOptions({ inheritAttrs: false });
// Every boolean forwarded to Ark below must default to `undefined`. Vue casts
// an absent Boolean prop to `false`, and `definedOnly` then forwards that as a
// deliberate choice — see ../../props.ts.
const props = withDefaults(defineProps<InputProps>(), {
  required: undefined,
  disabled: undefined,
});
const emit = defineEmits<{ "update:modelValue": [value: string] }>();
const slots = defineSlots<{ "start-addon"?: () => unknown; "end-addon"?: () => unknown }>();

const attrs = useAttrs();
const isInvalid = computed(() => !!props.error);
const errorMessage = computed(() =>
  typeof props.error === "string" ? props.error : undefined,
);
const rootClass = computed(() =>
  clsx(inputFieldStyles({ size: props.size }), attrs.class as string),
);
const iconSize = computed(() => CONTROL_ICON_SIZE[props.size ?? "md"]);
const hasIcons = computed(() => props.startIcon != null || props.endIcon != null);
const hasStart = computed(() => props.startAddon != null || !!slots["start-addon"]);
const hasEnd = computed(() => props.endAddon != null || !!slots["end-addon"]);
const controlClass = computed(() =>
  clsx(
    "field__control",
    props.startIcon != null && "field__control--affix-start",
    props.endIcon != null && "field__control--affix-end",
  ),
);
// React uses useId(); this is Vue's equivalent.
const uid = useId();
const addonId = (side: "start" | "end") => `${uid}-${side}-addon`;
// A text add-on is part of the value (`https://`, `.com`), so it describes the
// control. Ark writes the field's own aria-describedby and an attribute would
// replace it, so the two are joined through Field.Context.
const addonIds = computed(() =>
  [
    props.startAddon != null && !slots["start-addon"] && addonId("start"),
    props.endAddon != null && !slots["end-addon"] && addonId("end"),
  ].filter((v): v is string => !!v),
);
const groupInputProps = (fieldDescribedby: string | undefined) =>
  addonIds.value.length
    ? {
        ...inputProps.value,
        "aria-describedby": [...addonIds.value, fieldDescribedby, attrs["aria-describedby"]]
          .filter(Boolean)
          .join(" "),
      }
    : inputProps.value;
const addonClass = (side: "start" | "end", slotted: boolean) =>
  clsx("field__addon", `field__addon--${side}`, slotted && "field__addon--slot");
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
    <Field.Context v-if="hasStart || hasEnd" v-slot="field">
      <div class="field__group">
        <div
          v-if="hasStart"
          :id="addonIds.includes(addonId('start')) ? addonId('start') : undefined"
          :class="addonClass('start', !!slots['start-addon'])"
        >
          <slot name="start-addon">{{ startAddon }}</slot>
        </div>
        <div v-if="hasIcons" class="input-affix">
          <span v-if="startIcon" class="input-affix__adornment input-affix__adornment--start" aria-hidden="true">
            <Icon :name="startIcon" :size="iconSize" />
          </span>
          <Field.Input :class="controlClass" v-bind="groupInputProps(field.ariaDescribedby)" @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)" />
          <span v-if="endIcon" class="input-affix__adornment input-affix__adornment--end" aria-hidden="true">
            <Icon :name="endIcon" :size="iconSize" />
          </span>
        </div>
        <Field.Input v-else :class="controlClass" v-bind="groupInputProps(field.ariaDescribedby)" @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)" />
        <div
          v-if="hasEnd"
          :id="addonIds.includes(addonId('end')) ? addonId('end') : undefined"
          :class="addonClass('end', !!slots['end-addon'])"
        >
          <slot name="end-addon">{{ endAddon }}</slot>
        </div>
      </div>
    </Field.Context>
    <div v-else-if="hasIcons" class="input-affix">
      <span v-if="startIcon" class="input-affix__adornment input-affix__adornment--start" aria-hidden="true">
        <Icon :name="startIcon" :size="iconSize" />
      </span>
      <Field.Input :class="controlClass" v-bind="inputProps" @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)" />
      <span v-if="endIcon" class="input-affix__adornment input-affix__adornment--end" aria-hidden="true">
        <Icon :name="endIcon" :size="iconSize" />
      </span>
    </div>
    <Field.Input
      v-else
      :class="controlClass"
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
