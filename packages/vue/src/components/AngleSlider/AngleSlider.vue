<script setup lang="ts">
import { computed, useAttrs } from "vue";
import { AngleSlider as ArkAngleSlider } from "@ark-ui/vue";
import { clsx } from "clsx";
import { angleSliderStyles } from "@ui-organized/core";
import { definedOnly } from "../../props.js";
import AngleSliderValue from "./AngleSliderValue.vue";
import FieldError from "../FieldError/FieldError.vue";
import type { AngleSliderProps } from "./AngleSlider.types.js";
import "@ui-organized/core/components/AngleSlider/AngleSlider.css";

defineOptions({ inheritAttrs: false });
// Every boolean forwarded to Ark below must default to `undefined`. Vue casts
// an absent Boolean prop to `false`, and `definedOnly` then forwards that as a
// deliberate choice — see ../../props.ts. `showValue` is not forwarded, so the
// cast to `false` is exactly the default React declares.
const props = withDefaults(defineProps<AngleSliderProps>(), {
  disabled: undefined,
  readOnly: undefined,
});
const emit = defineEmits<{
  "update:modelValue": [value: number];
  valueChange: [value: number];
  valueChangeEnd: [value: number];
}>();

const attrs = useAttrs();

const isInvalid = computed(() => !!props.error);
const errorMessage = computed(() => (typeof props.error === "string" ? props.error : undefined));
const rootClass = computed(() =>
  clsx(angleSliderStyles({ size: props.size }), attrs.class as string),
);

const rootProps = computed(() =>
  definedOnly({
    modelValue: props.modelValue,
    defaultValue: props.defaultValue,
    step: props.step,
    disabled: props.disabled,
    readOnly: props.readOnly,
    name: props.name,
  }),
);

// Written here rather than inline: a Vue template expression cannot carry an
// object type annotation, and the handlers' details argument needs one.
function onValueChange(details: { value: number }) {
  emit("update:modelValue", details.value);
  emit("valueChange", details.value);
}
function onValueChangeEnd(details: { value: number }) {
  emit("valueChangeEnd", details.value);
}
</script>

<template>
  <ArkAngleSlider.Root
    :class="rootClass"
    :invalid="isInvalid"
    v-bind="rootProps"
    @value-change="onValueChange"
    @value-change-end="onValueChangeEnd"
  >
    <!-- The header exists only when there is something to put in it. -->
    <div v-if="label || showValue" class="angle-slider__header">
      <ArkAngleSlider.Label v-if="label" class="field__label">{{ label }}</ArkAngleSlider.Label>
      <AngleSliderValue v-if="showValue" />
    </div>
    <ArkAngleSlider.Control class="angle-slider__control">
      <!--
        Markers are positioned from an inline custom property Ark computes, so
        the value goes to the part rather than to a style of ours.
      -->
      <ArkAngleSlider.MarkerGroup v-if="markers && markers.length > 0" class="angle-slider__markers">
        <ArkAngleSlider.Marker
          v-for="marker in markers"
          :key="marker"
          :value="marker"
          class="angle-slider__marker"
        />
      </ArkAngleSlider.MarkerGroup>
      <ArkAngleSlider.Thumb class="angle-slider__thumb" />
    </ArkAngleSlider.Control>
    <span v-if="helperText && !isInvalid" class="field__description">{{ helperText }}</span>
    <FieldError v-if="isInvalid && errorMessage" :message="errorMessage" />
    <ArkAngleSlider.HiddenInput />
  </ArkAngleSlider.Root>
</template>
