<!--
  A swatch trigger and a teleported picker surface.

  Label / helper / error chrome comes from the shared `.field` layout, so the
  control lines up with every other form field; the trigger and the popup are
  colour-specific.
-->
<script setup lang="ts">
import { computed, useAttrs } from "vue";
import { ColorPicker as ArkColorPicker, parseColor } from "@ark-ui/vue";
import { clsx } from "clsx";
import { CONTROL_ICON_SIZE, colorPickerStyles } from "@ui-organized/core";
import { definedOnly } from "../../props.js";
import Icon from "../Icon/Icon.vue";
import FieldError from "../FieldError/FieldError.vue";
import type { ColorPickerProps } from "./ColorPicker.types.js";
import "@ui-organized/core/components/ColorPicker/ColorPicker.css";

const DEFAULT_COLOR = "#000000";

/**
 * Checkerboard cell size for the alpha grid.
 *
 * Passed explicitly rather than left to Ark's default so the number is visible
 * in the template rather than hidden in the library. It stays a raw value: a
 * checker cell is a perceptual constant for reading transparency, not a brand
 * value that should shift with the spacing scale.
 */
const TRANSPARENCY_CELL = "12px";

defineOptions({ inheritAttrs: false });
// Every boolean forwarded to Ark below must default to `undefined`. Vue casts an
// absent Boolean prop to `false`, and `definedOnly` then forwards that as a
// deliberate choice — `open: false` in particular means "controlled and closed"
// and pins the picker shut forever. See ../../props.ts.
const props = withDefaults(defineProps<ColorPickerProps>(), {
  defaultValue: DEFAULT_COLOR,
  showEyeDropper: true,
  size: "md",
  open: undefined,
  defaultOpen: undefined,
  required: undefined,
  disabled: undefined,
  readOnly: undefined,
});
const emit = defineEmits<{
  "update:modelValue": [value: string];
  valueChange: [value: string];
  valueChangeEnd: [value: string];
  "update:open": [open: boolean];
  openChange: [open: boolean];
}>();

const attrs = useAttrs();
const isInvalid = computed(() => !!props.error);
const errorMessage = computed(() => (typeof props.error === "string" ? props.error : undefined));
const iconSize = computed(() => CONTROL_ICON_SIZE[props.size]);
const rootClass = computed(() =>
  clsx(colorPickerStyles({ size: props.size, variant: props.variant }), attrs.class as string),
);

/* The machine's value is a parsed `Color`, not a string — passing a string
   throws. Coerced in here and back out via `valueAsString`, the same boundary
   conversion `Select` does for `string ↔ string[]`. */
const rootProps = computed(() =>
  definedOnly({
    modelValue: props.modelValue != null ? parseColor(props.modelValue) : undefined,
    defaultValue: parseColor(props.defaultValue),
    format: props.format,
    open: props.open,
    defaultOpen: props.defaultOpen,
    required: props.required,
    disabled: props.disabled,
    readOnly: props.readOnly,
    name: props.name,
  }),
);

function onValueChange(details: { valueAsString: string }) {
  emit("update:modelValue", details.valueAsString);
  emit("valueChange", details.valueAsString);
}
function onValueChangeEnd(details: { valueAsString: string }) {
  emit("valueChangeEnd", details.valueAsString);
}
function onOpenChange(details: { open: boolean }) {
  emit("update:open", details.open);
  emit("openChange", details.open);
}
</script>

<template>
  <ArkColorPicker.Root
    :class="rootClass"
    v-bind="rootProps"
    :invalid="isInvalid"
    :positioning="{ placement: 'bottom-start', gutter: 4 }"
    @value-change="onValueChange"
    @value-change-end="onValueChangeEnd"
    @open-change="onOpenChange"
  >
    <ArkColorPicker.Label v-if="label" class="field__label">
      {{ label }}
      <span v-if="required" class="field__required" aria-hidden="true" />
    </ArkColorPicker.Label>

    <ArkColorPicker.Control class="color-picker__control">
      <ArkColorPicker.Trigger class="color-picker__trigger">
        <span class="color-picker__swatch-well">
          <ArkColorPicker.TransparencyGrid
            :size="TRANSPARENCY_CELL"
            class="color-picker__grid"
          />
          <ArkColorPicker.ValueSwatch class="color-picker__value-swatch" />
        </span>
        <ArkColorPicker.ValueText
          v-if="variant !== 'swatch-only'"
          class="color-picker__value-text"
        />
      </ArkColorPicker.Trigger>
    </ArkColorPicker.Control>

    <!--
      Vue has no Ark Portal component — Teleport is built into the framework,
      and Ark Vue relies on it rather than shipping its own.
    -->
    <Teleport :to="container ?? 'body'">
      <!--
        The positioner class must stay a plain string literal — the
        overlay-stacking test scans for it, and a clsx() call here silently
        unregisters the layer. Conditional classes go on the popup.
      -->
      <ArkColorPicker.Positioner class="color-picker__positioner">
        <ArkColorPicker.Content class="color-picker__popup">
          <ArkColorPicker.Area class="color-picker__area">
            <ArkColorPicker.AreaBackground class="color-picker__area-bg" />
            <ArkColorPicker.AreaThumb class="color-picker__thumb" />
          </ArkColorPicker.Area>

          <div class="color-picker__sliders">
            <div class="color-picker__slider-row">
              <ArkColorPicker.ChannelSlider channel="hue" class="color-picker__channel-slider">
                <ArkColorPicker.ChannelSliderTrack class="color-picker__channel-track" />
                <ArkColorPicker.ChannelSliderThumb class="color-picker__thumb" />
              </ArkColorPicker.ChannelSlider>
              <ArkColorPicker.EyeDropperTrigger
                v-if="showEyeDropper"
                class="color-picker__eyedropper"
              >
                <Icon name="pipette" :size="iconSize" />
              </ArkColorPicker.EyeDropperTrigger>
            </div>

            <ArkColorPicker.ChannelSlider channel="alpha" class="color-picker__channel-slider">
              <ArkColorPicker.TransparencyGrid
                :size="TRANSPARENCY_CELL"
                class="color-picker__grid"
              />
              <ArkColorPicker.ChannelSliderTrack class="color-picker__channel-track" />
              <ArkColorPicker.ChannelSliderThumb class="color-picker__thumb" />
            </ArkColorPicker.ChannelSlider>
          </div>

          <ArkColorPicker.SwatchGroup
            v-if="swatches && swatches.length > 0"
            class="color-picker__swatches"
          >
            <ArkColorPicker.SwatchTrigger
              v-for="swatch in swatches"
              :key="swatch"
              :value="swatch"
              class="color-picker__swatch-trigger"
            >
              <ArkColorPicker.Swatch :value="swatch" class="color-picker__swatch" />
            </ArkColorPicker.SwatchTrigger>
          </ArkColorPicker.SwatchGroup>
        </ArkColorPicker.Content>
      </ArkColorPicker.Positioner>
    </Teleport>

    <span v-if="helperText && !isInvalid" class="field__description">{{ helperText }}</span>
    <FieldError v-if="isInvalid && errorMessage" :message="errorMessage" />
    <ArkColorPicker.HiddenInput />
  </ArkColorPicker.Root>
</template>
